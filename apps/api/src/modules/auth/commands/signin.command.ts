import { z } from "zod";
import { auth } from "@repo/auth";
import { SignInInputSchema, type SignInInput } from "../schemas/auth.schema";
import { createValidationError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type SignInResult = {
  data: {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
  };
  responseHeaders: Headers;
};

export async function signInHandler(
  input: unknown,
  headers: Headers,
  logger: LoggerHelpers,
): Promise<SignInResult> {
  logger.debug("SignInCommand received");

  const parseResult = SignInInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for SignInCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: SignInInput = parseResult.data;

  const signInResponse = await auth.api.signInEmail({
    body: {
      email: validatedInput.email,
      password: validatedInput.password,
    },
    headers,
    asResponse: true,
  });

  const responseHeaders = signInResponse.headers;
  const signInData = (await signInResponse.json()) as {
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
    token?: string;
  };

  if (!signInData.user) {
    logger.warn("Sign in failed - invalid credentials", {
      email: validatedInput.email,
    });
    throw createValidationError({ auth: ["INVALID_CREDENTIALS"] });
  }

  logger.info("User signed in successfully", { userId: signInData.user.id });

  return {
    data: {
      user: {
        id: signInData.user.id,
        email: signInData.user.email,
        firstName: signInData.user.firstName ?? null,
        lastName: signInData.user.lastName ?? null,
      },
    },
    responseHeaders,
  };
}
