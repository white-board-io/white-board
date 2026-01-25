import { auth } from "@repo/auth";
import { createUnauthorizedError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type SignOutResult = {
  data: {
    success: boolean;
  };
  responseHeaders: Headers;
};

export async function signOutHandler(
  headers: Headers,
  logger: LoggerHelpers,
): Promise<SignOutResult> {
  logger.debug("SignOutCommand received");

  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw createUnauthorizedError();
  }

  const signOutResponse = await auth.api.signOut({
    headers,
    asResponse: true,
  });

  const responseHeaders = signOutResponse.headers;

  logger.info("User signed out successfully", { userId: session.user.id });

  return {
    data: { success: true },
    responseHeaders,
  };
}
