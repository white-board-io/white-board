import { roleRepository } from "../repository/role.repository";
import { createDuplicateError, createValidationError, createForbiddenError } from "../../../shared/errors/app-error";

export const roleValidator = {
  validateRoleUniqueness: async (organizationId: string, name: string) => {
    const existingRole = await roleRepository.findByName(organizationId, name);
    if (existingRole) {
      throw createDuplicateError("Role", "name", name);
    }
  },

  validateRoleExists: async (organizationId: string, name: string) => {
    const existingRole = await roleRepository.findByName(organizationId, name);
    if (!existingRole) {
      throw createValidationError({ fieldErrors: { role: ["ERR_ROLE_NOT_FOUND"] } });
    }
    return existingRole;
  },

  validateSystemRoleDeletion: (roleType: string) => {
    if (roleType === "system") {
        throw createForbiddenError("ERR_SYSTEM_ROLE_DELETE");
    }
  }
};
