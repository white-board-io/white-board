import { z } from "zod";
import { auth } from "@repo/auth";
import { db } from "@repo/database";
import { organization, member } from "@repo/database/schema/auth";
import {
  SignUpWithOrgInputSchema,
  type SignUpWithOrgInput,
} from "../schemas/auth.schema";
import { createValidationError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type SignUpWithOrgResult = {
  user: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string | null;
    organizationType: string;
  };
  session: {
    token: string;
  };
};

export async function signUpWithOrgHandler(
  input: unknown,
  headers: Headers,
  logger: LoggerHelpers
): Promise<SignUpWithOrgResult> {
  logger.debug("SignUpWithOrgCommand received", { input });

  const parseResult = SignUpWithOrgInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for SignUpWithOrgCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: SignUpWithOrgInput = parseResult.data;
  const { firstName, lastName, email, password, organizationName, organizationType } =
    validatedInput;

  const signUpResult = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
    },
    headers,
  });

  if (!signUpResult.user) {
    logger.error("Failed to create user");
    throw new Error("Failed to create user");
  }

  const userId = signUpResult.user.id;

  logger.info("User created successfully", { userId, email });

  const slug = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const [newOrg] = await db
    .insert(organization)
    .values({
      name: organizationName,
      slug: `${slug}-${Date.now()}`,
      organizationType: organizationType,
    })
    .returning();

  if (!newOrg) {
    logger.error("Failed to create organization");
    throw new Error("Failed to create organization");
  }

  logger.info("Organization created successfully", {
    organizationId: newOrg.id,
    organizationName: newOrg.name,
  });

  await db.insert(member).values({
    organizationId: newOrg.id,
    userId: userId,
    role: "owner",
  });

  logger.info("User added as owner of organization", {
    userId,
    organizationId: newOrg.id,
  });

  return {
    user: {
      id: signUpResult.user.id,
      email: signUpResult.user.email,
      name: signUpResult.user.name,
      firstName: firstName,
      lastName: lastName,
    },
    organization: {
      id: newOrg.id,
      name: newOrg.name,
      slug: newOrg.slug,
      organizationType: newOrg.organizationType,
    },
    session: {
      token: signUpResult.token || "",
    },
  };
}
