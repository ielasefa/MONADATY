import { prisma } from "./prisma";
import crypto from "crypto";

function generateKey(): string {
  return `mk_${crypto.randomBytes(32).toString("hex")}`;
}

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function createApiKey(params: {
  name: string;
  permissions: string[];
  adminId: string;
  expiresAt?: Date;
}) {
  const key = generateKey();
  const hashed = hashKey(key);
  await prisma.apiKey.create({
    data: {
      name: params.name,
      key: hashed,
      hash: hashed,
      permissions: JSON.stringify(params.permissions),
      adminId: params.adminId,
      expiresAt: params.expiresAt,
    },
  });
  return { key, hashed };
}

export async function validateApiKey(key: string): Promise<{ valid: boolean; permissions: string[]; adminId: string } | null> {
  const hashed = hashKey(key);
  const record = await prisma.apiKey.findUnique({ where: { key: hashed } });
  if (!record || !record.isActive) return null;
  if (record.expiresAt && record.expiresAt < new Date()) return null;
  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
  });
  return { valid: true, permissions: JSON.parse(record.permissions), adminId: record.adminId };
}

export async function getApiKeys(adminId: string) {
  return prisma.apiKey.findMany({
    where: { adminId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllApiKeys() {
  return prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function regenerateApiKey(keyId: string, adminId?: string) {
  const newKey = generateKey();
  const hashed = hashKey(newKey);
  const updated = await prisma.apiKey.updateMany({
    where: { id: keyId, ...(adminId ? { adminId } : {}) },
    data: { key: hashed, hash: hashed, lastUsedAt: null, usageCount: 0 },
  });
  return updated.count === 1 ? newKey : null;
}

export async function deleteApiKey(keyId: string, adminId?: string): Promise<boolean> {
  const deleted = await prisma.apiKey.deleteMany({
    where: { id: keyId, ...(adminId ? { adminId } : {}) },
  });
  return deleted.count === 1;
}

export async function logApiKeyUsage(params: {
  apiKeyId: string;
  action: string;
  ip: string;
  endpoint: string;
  status: number;
}) {
  await prisma.apiKeyLog.create({ data: params });
}
