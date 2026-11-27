import { prisma } from "@/lib/prisma";

export class AdminDeletionError extends Error {
  constructor(public readonly code: "ADMIN_NOT_FOUND" | "CANNOT_DELETE_LAST_ADMIN" | "CANNOT_DELETE_LAST_SUPER_ADMIN" | "CANNOT_DELETE_CURRENT_ADMIN" | "FORBIDDEN", public readonly status = 400) {
    super(code);
  }
}

/** Delete credentials atomically while retaining product and administrative history. */
export async function deleteAdminAccount(id: string, actorId: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async tx => {
        const actor = await tx.admin.findUnique({ where: { id: actorId }, select: { id: true, role: true } });
        if (!actor || actor.role !== "SUPER_ADMIN") throw new AdminDeletionError("FORBIDDEN", 403);
        const target = await tx.admin.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true } });
        if (!target) throw new AdminDeletionError("ADMIN_NOT_FOUND", 404);
        if (await tx.admin.count() <= 1) throw new AdminDeletionError("CANNOT_DELETE_LAST_ADMIN");
        if (target.role === "SUPER_ADMIN" && await tx.admin.count({ where: { role: "SUPER_ADMIN" } }) <= 1) {
          throw new AdminDeletionError("CANNOT_DELETE_LAST_SUPER_ADMIN");
        }
        if (id === actorId) throw new AdminDeletionError("CANNOT_DELETE_CURRENT_ADMIN");

        // Names remain readable after the nullable foreign keys are cleared by PostgreSQL.
        await tx.adminLog.updateMany({ where: { adminId: id, adminName: "" }, data: { adminName: target.name } });
        await tx.productHistory.updateMany({ where: { adminId: id, adminName: "" }, data: { adminName: target.name } });
        await tx.deviceSession.deleteMany({ where: { adminId: id } });
        await tx.twoFactor.deleteMany({ where: { adminId: id } });
        await tx.recoveryCode.deleteMany({ where: { adminId: id } });
        await tx.adminPermission.deleteMany({ where: { adminId: id } });
        await tx.apiKey.updateMany({ where: { adminId: id }, data: { isActive: false } });
        await tx.admin.delete({ where: { id } });
        return target;
      }, { isolationLevel: "Serializable", maxWait: 5000, timeout: 10000 });
    } catch (error) {
      const conflict = error && typeof error === "object" && "code" in error && error.code === "P2034";
      if (!conflict || attempt === 2) throw error;
    }
  }
  throw new Error("Admin deletion could not finish");
}
