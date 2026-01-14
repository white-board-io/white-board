import { auth } from "@repo/auth";
import { createUnauthorizedError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type SignOutResult = {
  success: boolean;
};

export async function signOutHandler(
  headers: Headers,
  logger: LoggerHelpers
): Promise<SignOutResult> {
  logger.debug("SignOutCommand received");

  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw createUnauthorizedError();
  }

  await auth.api.signOut({ headers });

  logger.info("User signed out successfully", { userId: session.user.id });

  return { success: true };
}
