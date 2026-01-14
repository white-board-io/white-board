import { z } from "zod";
import { auth } from "@repo/auth";
import { SignInInputSchema, type SignInInput } from "../schemas/auth.schema";
import { createValidationError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type SignInResult = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  session: {
    token: string;
  };
};

export async function signInHandler(
  input: unknown,
  headers: Headers,
  logger: LoggerHelpers
): Promise<SignInResult> {
  logger.debug("SignInCommand received");

  const parseResult = SignInInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for SignInCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: SignInInput = parseResult.data;

  const result = await auth.api.signInEmail({
    body: {
      email: validatedInput.email,
      password: validatedInput.password,
    },
    headers,
  });

  if (!result.user) {
    logger.warn("Sign in failed - invalid credentials", { email: validatedInput.email });
    throw createValidationError({ auth: ["INVALID_CREDENTIALS"] });
  }

  logger.info("User signed in successfully", { userId: result.user.id });

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName ?? null,
      lastName: result.user.lastName ?? null,
    },
    session: {
      token: result.token || "",
    },
  };
}
