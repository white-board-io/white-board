import { mapZodErrors } from "../../../utils/mapZodErrors";
import { auth } from "@repo/auth";
import { db, eq } from "@repo/database";
import { user } from "@repo/database/schema/auth";
import {
  UpdateProfileInputSchema,
  type UpdateProfileInput,
} from "../schemas/auth.schema";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type UpdateProfileResult = ServiceResult<{
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  };
}>;

export async function updateProfileHandler(
  input: unknown,
  headers: Headers,
  logger: LoggerHelpers,
): Promise<UpdateProfileResult> {
  logger.debug("UpdateProfileCommand received");

  const session = await auth.api.getSession({ headers });
  if (!session) {
    return {
      isSuccess: false,
      errors: [{ code: "UNAUTHORIZED", message: "Authentication required" }],
    };
  }

  const parseResult = UpdateProfileInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);
    logger.warn("Validation failed for UpdateProfileCommand", { errors });
    return {
      isSuccess: false,
      errors,
    };
  }

  const validatedInput: UpdateProfileInput = parseResult.data;

  const updateData: Record<string, unknown> = {};
  if (validatedInput.firstName !== undefined)
    updateData.firstName = validatedInput.firstName;
  if (validatedInput.lastName !== undefined)
    updateData.lastName = validatedInput.lastName;
  if (validatedInput.image !== undefined)
    updateData.image = validatedInput.image;

  await db.update(user).set(updateData).where(eq(user.id, session.user.id));

  const [updatedUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  logger.info("Profile updated successfully", { userId: session.user.id });

  return {
    isSuccess: true,
    data: {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        image: updatedUser.image,
      },
    },
  };
}
