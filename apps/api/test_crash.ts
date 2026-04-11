import { listRolesHandler } from "./src/modules/auth/queries/list-roles.query";
import { roleRepository } from "./src/modules/auth/repository/role.repository";

async function run() {
  roleRepository.listByOrg = async () => {
    return [
      { role: { id: "1", name: "admin" }, permission: { resource: "all", actions: ["read"] } }
    ];
  };

  try {
    // @ts-ignore
    await listRolesHandler('org1', {} as any, { debug: () => {} } as any);
    console.log("Success");
  } catch (e) {
    console.error("Crash!", e);
  }
}
run();
