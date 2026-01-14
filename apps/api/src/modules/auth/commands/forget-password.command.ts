import { z } from "zod";
import { ForgotPasswordInputSchema, type ForgotPasswordInput } from "../schemas/auth.schema";
import { createValidationError } from "../../../shared/errors/app-error";
import { db, eq } from "@repo/database";
import { user, verification } from "@repo/database/schema/auth";
import type { LoggerHelpers } from "../../../plugins/logger";
import crypto from "crypto";

export type ForgetPasswordResult = {
  success: boolean;
};

export async function forgetPasswordHandler(
  input: unknown,
  logger: LoggerHelpers
): Promise<ForgetPasswordResult> {
  logger.debug("ForgetPasswordCommand received");

  const parseResult = ForgotPasswordInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for ForgetPasswordCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
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
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await db.insert(verification).values({
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

  return { success: true };
}
