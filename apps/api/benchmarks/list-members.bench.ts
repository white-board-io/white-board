
import { db, eq } from "@repo/database";
import {
  user,
  organization,
  member,
  session,
  organizationTypeEnum
} from "@repo/database/schema/auth";
import { role, permission } from "@repo/database/schema/roles";
import { listMembersHandler } from "../src/modules/auth/queries/list-members.query";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  console.log("Seeding data...");
  const orgId = uuidv4();
  const adminId = uuidv4();
  const sessionId = uuidv4();
  const roleId = uuidv4();

  // 1. Create Organization
  await db.insert(organization).values({
    id: orgId,
    name: "Benchmark Org " + Date.now(),
    organizationType: "other",
    slug: "benchmark-org-" + Date.now(),
  });

  // 2. Create Admin User
  await db.insert(user).values({
    id: adminId,
    email: `admin-${Date.now()}@example.com`,
    firstName: "Admin",
    lastName: "User",
  });

  // 3. Create Session
  await db.insert(session).values({
    id: sessionId,
    userId: adminId,
    token: uuidv4(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
  });

  // 4. Create Role (Owner)
  await db.insert(role).values({
    id: roleId,
    organizationId: orgId,
    name: "owner",
    type: "system",
  });

  // 5. Create Permission (member.read)
  await db.insert(permission).values({
    roleId: roleId,
    resource: "member",
    actions: ["read"],
  });

  // 6. Add Admin to Org as Owner
  await db.insert(member).values({
    userId: adminId,
    organizationId: orgId,
    role: "owner",
  });

  // 7. Create 1000 Members
  const usersToInsert: typeof user.$inferInsert[] = [];
  const membersToInsert: typeof member.$inferInsert[] = [];

  for (let i = 0; i < 1000; i++) {
    const uId = uuidv4();
    usersToInsert.push({
      id: uId,
      email: `user-${i}-${Date.now()}@example.com`,
      firstName: `User${i}`,
      lastName: `Last${i}`,
      // Mark some as deleted to test filtering performance later
      isDeleted: i % 10 === 0, // 10% deleted
    });
    membersToInsert.push({
      userId: uId,
      organizationId: orgId,
      role: "member",
    });
  }

  // Batch insert users (Drizzle might have limits, doing chunks of 100)
  for (let i = 0; i < usersToInsert.length; i += 100) {
    await db.insert(user).values(usersToInsert.slice(i, i + 100));
  }

  // Batch insert members
  for (let i = 0; i < membersToInsert.length; i += 100) {
    await db.insert(member).values(membersToInsert.slice(i, i + 100));
  }

  console.log("Seeding complete.");
  return { orgId, adminId, sessionId };
}

async function runBenchmark() {
  const { orgId, adminId, sessionId } = await seed();

  const mockRequest = {
    user: { id: adminId },
    session: { id: sessionId },
    query: {},
    headers: {},
    log: console,
  } as any;

  const mockLogger = {
    debug: () => {},
    info: () => {},
    error: () => {},
    warn: () => {},
    child: () => mockLogger,
  } as any;

  console.log("Running listMembersHandler...");
  const start = performance.now();
  const result = await listMembersHandler(orgId, mockRequest, mockLogger);
  const end = performance.now();

  console.log(`Execution time: ${(end - start).toFixed(2)}ms`);
  console.log(`Members returned: ${result.members.length}`);
  // @ts-ignore
  if (result.meta) {
    // @ts-ignore
    console.log(`Meta:`, result.meta);
  }

  // Cleanup
  await db.delete(organization).where(eq(organization.id, orgId));
  // Users are not cascade deleted from organization delete usually, but members are.
  // We should clean up users too, but for local benchmark it might be okay.
  // To be clean:
  // await db.delete(user).where(inArray(user.email, [list of emails created]));
  // But that's complicated.
}

runBenchmark().catch(console.error).then(() => process.exit(0));
