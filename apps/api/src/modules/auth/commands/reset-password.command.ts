import { mapZodErrors } from "../../../utils/mapZodErrors";
import {
  ResetPasswordInputSchema,
  type ResetPasswordInput,
} from "../schemas/auth.schema";
import { db, eq, and } from "@repo/database";
import { user, account, verification } from "@repo/database/schema/auth";
import type { LoggerHelpers } from "../../../plugins/logger";
import crypto from "crypto";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type ResetPasswordResult = ServiceResult<{ success: boolean }>;

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

export async function resetPasswordHandler(
  input: unknown,
  logger: LoggerHelpers,
): Promise<ResetPasswordResult> {
  logger.debug("ResetPasswordCommand received");

  const parseResult = ResetPasswordInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);
    logger.warn("Validation failed for ResetPasswordCommand", { errors });
    return {
      isSuccess: false,
      errors,
    };
  }

  const validatedInput: ResetPasswordInput = parseResult.data;

  const [verificationRecord] = await db
    .select()
    .from(verification)
    .where(eq(verification.value, validatedInput.token))
    .limit(1);

  if (!verificationRecord) {
    return {
      isSuccess: false,
      errors: [{ code: "FORBIDDEN", message: "Invalid or expired token" }],
    };
  }

  if (new Date() > verificationRecord.expiresAt) {
    await db
      .delete(verification)
      .where(eq(verification.id, verificationRecord.id));
    return {
      isSuccess: false,
      errors: [{ code: "FORBIDDEN", message: "Token has expired" }],
    };
  }

  const email = verificationRecord.identifier.replace("password-reset:", "");

  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!existingUser) {
    return {
      isSuccess: false,
      errors: [{ code: "FORBIDDEN", message: "Invalid token" }],
    };
  }

  const hashedPassword = await hashPassword(validatedInput.newPassword);

  await db
    .update(account)
    .set({ password: hashedPassword })
    .where(
      and(
        eq(account.userId, existingUser.id),
        eq(account.providerId, "credential"),
      ),
    );

  await db
    .delete(verification)
    .where(eq(verification.id, verificationRecord.id));

  logger.info("Password reset successfully", { userId: existingUser.id });

  return { isSuccess: true, data: { success: true } };
}
