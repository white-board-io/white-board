import { mapZodErrors } from "../../../utils/mapZodErrors";
import { auth } from "@repo/auth";
import { db, eq } from "@repo/database";
import { organization, member, session } from "@repo/database/schema/auth";
import {
  SignUpWithOrgInputSchema,
  type SignUpWithOrgInput,
} from "../schemas/auth.schema";
import { seedOrganizationRoles } from "../utils/seed-roles";
// removed createValidationError
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type SignUpWithOrgData = {
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
};

export type SignUpWithOrgResult = ServiceResult<SignUpWithOrgData> & {
  responseHeaders?: Headers;
};

export async function signUpWithOrgHandler(
  input: unknown,
  headers: Headers,
  logger: LoggerHelpers,
): Promise<SignUpWithOrgResult> {
  logger.debug("SignUpWithOrgCommand received", { input });

  const parseResult = SignUpWithOrgInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);
    logger.warn("Validation failed for SignUpWithOrgCommand", { errors });
    return {
      isSuccess: false,
      errors,
    };
  }

  const validatedInput: SignUpWithOrgInput = parseResult.data;
  const {
    email,
    lastName,
    password,
    firstName,
    organizationName,
    organizationType,
  } = validatedInput;

  const signUpResponse = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
    },
    headers,
    asResponse: true,
  });

  const responseHeaders = signUpResponse.headers;
  const signUpData = (await signUpResponse.json()) as {
    user?: { id: string; email: string; name: string };
    token?: string;
  };

  if (!signUpData.user) {
    logger.error("Failed to create user");
    return {
      isSuccess: false,
      errors: [{ code: "INTERNAL_ERROR", message: "Failed to create user" }],
    };
  }

  const userId = signUpData.user.id;
  logger.info("User created successfully", { userId, email });

  const slug = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let result;
  try {
    result = await db.transaction(async (tx) => {
      const [newOrg] = await tx
        .insert(organization)
        .values({
          name: organizationName,
          slug: `${slug}-${Date.now()}`,
          organizationType: organizationType,
        })
        .returning();

      if (!newOrg) {
        throw new Error("Failed to create organization");
      }

      logger.info("Organization created successfully", {
        organizationId: newOrg.id,
        organizationName: newOrg.name,
      });

      await seedOrganizationRoles(newOrg.id, logger, tx);

      await tx.insert(member).values({
        organizationId: newOrg.id,
        userId: userId,
        role: "owner",
      });

      logger.info("User added as owner of organization", {
        userId,
        organizationId: newOrg.id,
      });

      return newOrg;
    });
  } catch (error) {
    logger.error("Failed to create organization transaction", error as Error);
    return {
      isSuccess: false,
      errors: [
        { code: "INTERNAL_ERROR", message: "Failed to create organization" },
      ],
    };
  }

  await db
    .update(session)
    .set({ activeOrganizationId: result.id })
    .where(eq(session.userId, userId));

  logger.info("Active organization set for new user", {
    userId,
    organizationId: result.id,
  });

  return {
    isSuccess: true,
    data: {
      user: {
        id: signUpData.user.id,
        email: signUpData.user.email,
        name: signUpData.user.name,
        firstName: firstName,
        lastName: lastName,
      },
      organization: {
        id: result.id,
        name: result.name,
        slug: result.slug,
        organizationType: result.organizationType,
      },
    },
    responseHeaders,
  };
}
