import { mapZodErrors } from "../../../utils/mapZodErrors";
import {
  ForgotPasswordInputSchema,
  type ForgotPasswordInput,
} from "../schemas/auth.schema";
import { db, eq } from "@repo/database";
import { user, verification } from "@repo/database/schema/auth";
import type { LoggerHelpers } from "../../../plugins/logger";
import crypto from "crypto";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type ForgetPasswordResult = ServiceResult<{ success: boolean }>;

export async function forgetPasswordHandler(
  input: unknown,
  logger: LoggerHelpers,
): Promise<ForgetPasswordResult> {
  logger.debug("ForgetPasswordCommand received");

  const parseResult = ForgotPasswordInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);
    logger.warn("Validation failed for ForgetPasswordCommand", { errors });
    return {
      isSuccess: false,
      errors,
    };
  }

  const validatedInput: ForgotPasswordInput = parseResult.data;

  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, validatedInput.email))
    .limit(1);

  if (!existingUser) {
    logger.info("Password reset requested for non-existent email", {
      email: validatedInput.email,
    });
    return { isSuccess: true, data: { success: true } };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await db.insert(verification).values({
    id: crypto.randomUUID(),
    identifier: `password-reset:${validatedInput.email}`,
    value: token,
    expiresAt,
  });

  const resetUrl = `${process.env.CLIENT_ORIGIN || "http://localhost:3000"}/reset-password?token=${token}`;

  console.log("=".repeat(60));
  console.log("📧 PASSWORD RESET EMAIL");
  console.log("=".repeat(60));
  console.log(`To: ${validatedInput.email}`);
  console.log(`Subject: Reset your password`);
  console.log("-".repeat(60));
  console.log(`Click the link to reset your password: ${resetUrl}`);
  console.log(`This link expires in 1 hour.`);
  console.log("=".repeat(60));

  logger.info("Password reset email sent", { email: validatedInput.email });

  return { isSuccess: true, data: { success: true } };
}
