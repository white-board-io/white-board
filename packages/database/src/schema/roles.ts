import {
  pgTable,
  text,
  uuid,
  index,
  unique,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";

export const role = pgTable(
  "role",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull().default("custom"), // 'system' | 'custom'
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("role_organization_id_idx").on(table.organizationId),
    unique("role_organization_name_unique").on(table.organizationId, table.name),
  ]
);

export type RoleEntity = typeof role.$inferSelect;
export type NewRoleEntity = typeof role.$inferInsert;

export const permission = pgTable(
  "permission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    resource: text("resource").notNull(),
    actions: jsonb("actions").$type<string[]>().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("permission_role_id_idx").on(table.roleId),
    unique("permission_role_resource_unique").on(table.roleId, table.resource),
  ]
);

export type PermissionEntity = typeof permission.$inferSelect;
export type NewPermissionEntity = typeof permission.$inferInsert;
