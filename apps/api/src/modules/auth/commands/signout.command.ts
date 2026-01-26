import { auth } from "@repo/auth";
// removed unused imports
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type SignOutResult = ServiceResult<{ success: boolean }> & {
  responseHeaders?: Headers;
};

export async function signOutHandler(
  headers: Headers,
  logger: LoggerHelpers,
): Promise<SignOutResult> {
  logger.debug("SignOutCommand received");

  const session = await auth.api.getSession({ headers });

  if (!session) {
    return {
      isSuccess: false,
      errors: [{ code: "UNAUTHORIZED", message: "Authentication required" }],
    };
  }

  const signOutResponse = await auth.api.signOut({
    headers,
    asResponse: true,
  });

  const responseHeaders = signOutResponse.headers;

  logger.info("User signed out successfully", { userId: session.user.id });

  return {
    isSuccess: true,
    data: { success: true },
    responseHeaders,
  };
}
