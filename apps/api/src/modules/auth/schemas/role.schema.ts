import { z } from "zod";

export const RoleValidationErrorCodes = {
  ROLE_NAME_REQUIRED: "ROLE_NAME_REQUIRED",
  ROLE_ID_REQUIRED: "ROLE_ID_REQUIRED",
  PERMISSIONS_REQUIRED: "PERMISSIONS_REQUIRED",
  RESOURCE_REQUIRED: "RESOURCE_REQUIRED",
  ACTIONS_REQUIRED: "ACTIONS_REQUIRED",
} as const;

export const PermissionSchema = z.object({
  resource: z.string().min(1, { message: RoleValidationErrorCodes.RESOURCE_REQUIRED }),
  actions: z.array(z.string()).min(1, { message: RoleValidationErrorCodes.ACTIONS_REQUIRED }),
});

export const CreateRoleInputSchema = z.object({
  name: z.string().min(1, { message: RoleValidationErrorCodes.ROLE_NAME_REQUIRED }),
  description: z.string().optional(),
  permissions: z.array(PermissionSchema).optional(),
});

export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>;

export const UpdateRolePermissionsInputSchema = z.object({
  permissions: z.array(PermissionSchema).min(1, { message: RoleValidationErrorCodes.PERMISSIONS_REQUIRED }),
});

export type UpdateRolePermissionsInput = z.infer<typeof UpdateRolePermissionsInputSchema>;

export const RoleIdParamSchema = z.object({
  roleId: z.string().uuid({ message: RoleValidationErrorCodes.ROLE_ID_REQUIRED }),
});
