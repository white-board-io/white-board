import { z } from "zod";
import { ChangePasswordInputSchema, type ChangePasswordInput } from "../schemas/auth.schema";
import { createValidationError, createUnauthorizedError, createForbiddenError } from "../../../shared/errors/app-error";
import { db, eq, and } from "@repo/database";
import { account } from "@repo/database/schema/auth";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";
import crypto from "crypto";

export type ChangePasswordResult = {
  success: boolean;
};

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString("hex"));
    });
  });
}

export async function changePasswordHandler(
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
): Promise<ChangePasswordResult> {
  logger.debug("ChangePasswordCommand received");

  if (!request.user) {
    throw createUnauthorizedError();
  }

  const parseResult = ChangePasswordInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for ChangePasswordCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: ChangePasswordInput = parseResult.data;

  const [accountRecord] = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.userId, request.user.id),
        eq(account.providerId, "credential")
      )
    )
    .limit(1);

  if (!accountRecord || !accountRecord.password) {
    throw createForbiddenError("No password set for this account");
  }

  const isCurrentPasswordValid = await verifyPassword(
    validatedInput.currentPassword,
    accountRecord.password
  );

  if (!isCurrentPasswordValid) {
    throw createValidationError({ currentPassword: ["INVALID_CURRENT_PASSWORD"] });
  }

  const hashedPassword = await hashPassword(validatedInput.newPassword);

  await db
    .update(account)
    .set({ password: hashedPassword })
    .where(eq(account.id, accountRecord.id));

  logger.info("Password changed successfully", { userId: request.user.id });

  return { success: true };
}
