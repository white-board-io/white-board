import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  organization: ["update", "delete"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "delete"],
  course: ["create", "read", "update", "delete"],
  grade: ["create", "read", "update"],
  attendance: ["create", "read", "update"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "delete"],
  course: ["create", "read", "update", "delete"],
  grade: ["create", "read", "update"],
  attendance: ["create", "read", "update"],
});

export const admin = ac.newRole({
  organization: ["update"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "delete"],
  course: ["create", "read", "update", "delete"],
  grade: ["create", "read", "update"],
  attendance: ["create", "read", "update"],
});

export const teacher = ac.newRole({
  member: ["read"],
  course: ["create", "read", "update"],
  grade: ["create", "read", "update"],
  attendance: ["create", "read", "update"],
});

export const student = ac.newRole({
  member: ["read"],
  course: ["read"],
  grade: ["read"],
  attendance: ["read"],
});

export const parent = ac.newRole({
  member: ["read"],
  course: ["read"],
  grade: ["read"],
  attendance: ["read"],
});

export const staff = ac.newRole({
  member: ["create", "read", "update"],
  invitation: ["create", "read", "delete"],
  course: ["read"],
  attendance: ["create", "read", "update"],
});

export const roles = {
  owner,
  admin,
  teacher,
  student,
  parent,
  staff,
};

export type RoleName = keyof typeof roles;
