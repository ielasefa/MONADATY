// Run against an empty, disposable database prepared with the current Prisma schema.
import assert from "node:assert/strict";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const database = process.env.ADMIN_DELETE_QA_DATABASE ?? "";
assert.match(database, /^monadaty_admin_delete_qa_\d+$/);
const url = new URL(process.env.LOCAL_DATABASE_URL!);
assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(url.hostname));
assert.notEqual(url.pathname, `/${database}`);
url.pathname = `/${database}`;
process.env.DATABASE_URL = url.href;
process.env.DIRECT_URL = url.href;

const { prisma } = await import("../../lib/prisma");
const { deleteAdminAccount } = await import("../../lib/admin-deletion");
let passed = 0;
const check = async (label: string, run: () => Promise<void>) => {
  await run();
  console.log(`PASS ${label}`);
  passed++;
};
const rejects = (run: Promise<unknown>, code: string) => assert.rejects(run, (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === code);
const makeAdmin = (name: string, role: "ADMIN" | "SUPER_ADMIN" = "SUPER_ADMIN") =>
  prisma.admin.create({ data: { name, email: `${name}@example.test`, role, passwordHash: "qa-unusable-hash" } });

try {
  assert.equal(await prisma.admin.count(), 0, "Refusing to alter a nonempty database");
  const actor = await makeAdmin("owner");
  await check("The only administrator cannot be deleted", () => rejects(deleteAdminAccount(actor.id, actor.id), "CANNOT_DELETE_LAST_ADMIN"));
  const retained = await makeAdmin("retained", "ADMIN");
  await check("The last super administrator is protected", () => rejects(deleteAdminAccount(actor.id, actor.id), "CANNOT_DELETE_LAST_SUPER_ADMIN"));
  const target = await makeAdmin("target");
  const secondTarget = await makeAdmin("second-target", "ADMIN");
  await check("The currently authenticated account is protected", () => rejects(deleteAdminAccount(actor.id, actor.id), "CANNOT_DELETE_CURRENT_ADMIN"));
  await check("An ordinary administrator cannot delete accounts", () => rejects(deleteAdminAccount(target.id, retained.id), "FORBIDDEN"));
  await check("An expired actor cannot delete accounts", () => rejects(deleteAdminAccount(target.id, "missing"), "FORBIDDEN"));
  await check("A missing target returns a clear error", () => rejects(deleteAdminAccount("missing", actor.id), "ADMIN_NOT_FOUND"));

  const product = await prisma.product.create({ data: { name: "QA", slug: "qa" } });
  const history = await prisma.productHistory.create({ data: { productId: product.id, adminId: target.id, action: "update" } });
  const log = await prisma.adminLog.create({ data: { adminId: target.id, action: "update", entity: "Product" } });
  await prisma.productHistory.create({ data: { productId: product.id, adminId: target.id, adminName: "Historical name", action: "update" } });
  const retainedHistory = await prisma.productHistory.create({ data: { productId: product.id, adminId: retained.id, adminName: retained.name, action: "update" } });
  for (const admin of [target, retained]) {
    await prisma.deviceSession.create({ data: { adminId: admin.id, token: `${admin.id}-qa-token` } });
    await prisma.twoFactor.create({ data: { adminId: admin.id, secret: "qa-secret" } });
    await prisma.recoveryCode.create({ data: { adminId: admin.id, code: "qa-code" } });
    await prisma.adminPermission.create({ data: { adminId: admin.id } });
    await prisma.apiKey.create({ data: { adminId: admin.id, key: `${admin.id}-qa-key`, hash: "qa-hash" } });
  }
  await check("Deleting both targets keeps exactly the other two accounts", async () => {
    await deleteAdminAccount(target.id, actor.id);
    await deleteAdminAccount(secondTarget.id, actor.id);
    assert.deepEqual((await prisma.admin.findMany({ select: { id: true } })).map(a => a.id).sort(), [actor.id, retained.id].sort());
  });
  await check("Product and administrator history survive with actor names", async () => {
    const row = await prisma.productHistory.findUniqueOrThrow({ where: { id: history.id }, include: { admin: true } });
    assert.equal(row.adminId, null);
    assert.equal(row.admin, null);
    assert.equal(row.adminName, target.name);
    const event = await prisma.adminLog.findUniqueOrThrow({ where: { id: log.id } });
    assert.equal(event.adminId, null);
    assert.equal(event.adminName, target.name);
    assert.equal(await prisma.productHistory.count({ where: { adminName: "Historical name" } }), 1);
    assert.equal((await prisma.productHistory.findUniqueOrThrow({ where: { id: retainedHistory.id } })).adminId, retained.id);
  });
  await check("All deleted-account credentials are revoked; retained credentials stay intact", async () => {
    for (const model of [prisma.deviceSession, prisma.twoFactor, prisma.recoveryCode, prisma.adminPermission]) {
      // These models have different delegates but share this count signature.
      const count = model.count.bind(model) as (input: { where: { adminId: string } }) => Promise<number>;
      assert.equal(await count({ where: { adminId: target.id } }), 0);
      assert.equal(await count({ where: { adminId: retained.id } }), 1);
    }
    assert.equal(await prisma.apiKey.count({ where: { adminId: target.id, isActive: true } }), 0);
    assert.equal(await prisma.apiKey.count({ where: { adminId: retained.id, isActive: true } }), 1);
  });
  await check("Repeated deletion leaves other accounts intact", async () => {
    await rejects(deleteAdminAccount(target.id, actor.id), "ADMIN_NOT_FOUND");
    assert.equal(await prisma.admin.count(), 2);
  });
  await check("Concurrent owners cannot delete each other and remove all super administrators", async () => {
    const rival = await makeAdmin("rival");
    const results = await Promise.allSettled([deleteAdminAccount(rival.id, actor.id), deleteAdminAccount(actor.id, rival.id)]);
    assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
    assert.equal(await prisma.admin.count({ where: { role: "SUPER_ADMIN" } }), 1);
    assert.equal(await prisma.admin.count(), 2);
  });
  console.log(`${passed} database checks passed`);
} finally {
  await prisma.$disconnect();
  await (globalThis as unknown as { pool?: { end(): Promise<void> } }).pool?.end();
}
