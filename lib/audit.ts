import { prisma } from "./prisma";
import { logError } from "./logger";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "archive"
  | "restore"
  | "login"
  | "logout"
  | "password_change"
  | "order_update"
  | "settings_update"
  | "permission_change"
  | "image_delete"
  | "automation_run"
  | "report_export"
  | "security_change";

export async function createAuditLog(params: {
  adminId: string;
  adminName?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  ip?: string;
  browser?: string;
  duration?: number;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        adminName: params.adminName ?? "",
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? "",
        oldValue: params.oldValue ?? "",
        newValue: params.newValue ?? "",
        ip: params.ip ?? "",
        browser: params.browser ?? "",
        duration: params.duration ?? 0,
      },
    });
  } catch (e) {
    logError(e, "AUDIT_LOG");
  }
}

export async function getAuditLogs(limit = 50, offset = 0, filters?: {
  action?: string;
  entity?: string;
  adminId?: string;
  from?: Date;
  to?: Date;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.action) where.action = filters.action;
  if (filters?.entity) where.entity = filters.entity;
  if (filters?.adminId) where.adminId = filters.adminId;
  if (filters?.from || filters?.to) {
    (where as Record<string, unknown>).createdAt = {};
    if (filters?.from) (where.createdAt as Record<string, unknown>).gte = filters.from;
    if (filters?.to) (where.createdAt as Record<string, unknown>).lte = filters.to;
  }
  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function countAuditLogs(filters?: {
  action?: string;
  entity?: string;
  adminId?: string;
  from?: Date;
  to?: Date;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.action) where.action = filters.action;
  if (filters?.entity) where.entity = filters.entity;
  if (filters?.adminId) where.adminId = filters.adminId;
  if (filters?.from || filters?.to) {
    (where as Record<string, unknown>).createdAt = {};
    if (filters?.from) (where.createdAt as Record<string, unknown>).gte = filters.from;
    if (filters?.to) (where.createdAt as Record<string, unknown>).lte = filters.to;
  }
  return prisma.auditLog.count({ where });
}
