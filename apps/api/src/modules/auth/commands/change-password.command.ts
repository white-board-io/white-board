import { mapZodErrors } from "../../../utils/mapZodErrors";
import {
  ChangePasswordInputSchema,
  type ChangePasswordInput,
} from "../schemas/auth.schema";
import { db, eq, and } from "@repo/database";
import { account } from "@repo/database/schema/auth";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";
import crypto from "crypto";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type ChangePasswordResult = ServiceResult<{ success: boolean }>;

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
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
  logger: LoggerHelpers,
): Promise<ChangePasswordResult> {
  logger.debug("ChangePasswordCommand received");

  if (!request.user) {
    return {
      isSuccess: false,
      errors: [{ code: "UNAUTHORIZED", message: "Authentication required" }],
    };
  }

  const parseResult = ChangePasswordInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);
    logger.warn("Validation failed for ChangePasswordCommand", { errors });
    return {
      isSuccess: false,
      errors,
    };
  }

  const validatedInput: ChangePasswordInput = parseResult.data;

  const [accountRecord] = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.userId, request.user.id),
        eq(account.providerId, "credential"),
      ),
    )
    .limit(1);

  if (!accountRecord || !accountRecord.password) {
    return {
      isSuccess: false,
      errors: [
        { code: "FORBIDDEN", message: "No password set for this account" },
      ],
    };
  }

  const isCurrentPasswordValid = await verifyPassword(
    validatedInput.currentPassword,
    accountRecord.password,
  );

  if (!isCurrentPasswordValid) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "VALIDATION_ERROR",
          message: "Invalid current password",
          value: "currentPassword",
        },
      ],
    };
  }

  const hashedPassword = await hashPassword(validatedInput.newPassword);

  await db
    .update(account)
    .set({ password: hashedPassword })
    .where(eq(account.id, accountRecord.id));

  logger.info("Password changed successfully", { userId: request.user.id });

  return { isSuccess: true, data: { success: true } };
}
