import { prisma } from "./prisma";

const DEFAULT_JOBS = [
  { name: "daily-backup", description: "Daily database backup", type: "daily", cronExpression: "0 2 * * *" },
  { name: "weekly-backup", description: "Weekly database backup", type: "weekly", cronExpression: "0 3 * * 0" },
  { name: "monthly-backup", description: "Monthly database backup", type: "monthly", cronExpression: "0 4 1 * *" },
  { name: "inventory-cleanup", description: "Clean up stale inventory reservations", type: "daily", cronExpression: "0 6 * * *" },
  { name: "low-stock-alert", description: "Send low stock email notifications", type: "hourly", cronExpression: "0 * * * *" },
  { name: "order-reminder", description: "Send order status reminders", type: "daily", cronExpression: "0 8 * * *" },
  { name: "abandoned-cart", description: "Send abandoned cart reminders", type: "hourly", cronExpression: "0 * * * *" },
  { name: "invoice-reminder", description: "Send invoice payment reminders", type: "daily", cronExpression: "0 9 * * *" },
  { name: "analytics-refresh", description: "Refresh analytics data", type: "hourly", cronExpression: "0 * * * *" },
  { name: "notification-cleanup", description: "Clean up old notifications", type: "weekly", cronExpression: "0 6 * * 0" },
  { name: "db-optimization", description: "Optimize database tables", type: "weekly", cronExpression: "0 5 * * 0" },
  { name: "report-email", description: "Send scheduled report emails", type: "daily", cronExpression: "0 7 * * *" },
  { name: "scheduled-discount", description: "Activate/deactivate scheduled discounts", type: "hourly", cronExpression: "0 * * * *" },
  { name: "auto-archive", description: "Auto-archive old orders and data", type: "monthly", cronExpression: "0 4 1 * *" },
  { name: "review-reminder", description: "Send product review reminders", type: "daily", cronExpression: "0 10 * * *" },
  { name: "customer-birthday", description: "Send birthday emails to customers", type: "daily", cronExpression: "0 8 * * *" },
];

export async function initializeDefaultJobs() {
  for (const job of DEFAULT_JOBS) {
    await prisma.scheduledJob.upsert({
      where: { name: job.name },
      update: { description: job.description, type: job.type, cronExpression: job.cronExpression },
      create: { name: job.name, description: job.description, type: job.type, cronExpression: job.cronExpression },
    });
  }
}

export async function getJobs() {
  return prisma.scheduledJob.findMany({ orderBy: { name: "asc" } });
}

export async function getJob(id: string) {
  return prisma.scheduledJob.findUnique({ where: { id } });
}

export async function updateJob(id: string, data: {
  enabled?: boolean;
  cronExpression?: string;
  config?: string;
}) {
  await prisma.scheduledJob.update({ where: { id }, data });
}

export async function runJob(jobId: string, triggeredBy = "manual") {
  const job = await prisma.scheduledJob.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");

  const startedAt = new Date();
  let status = "success";
  let output = "";
  let error = "";

  try {
    const result = await executeJob(job.name);
    output = result;
  } catch (e: unknown) {
    status = "failed";
    error = e instanceof Error ? e.message : "Unknown error";
  }

  const finishedAt = new Date();
  const duration = Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000);

  await prisma.jobLog.create({
    data: {
      jobId,
      status,
      startedAt,
      finishedAt,
      duration,
      output,
      error,
      triggeredBy,
    },
  });

  await prisma.scheduledJob.update({
    where: { id: jobId },
    data: {
      lastRunAt: finishedAt,
      lastStatus: status,
      lastDuration: duration,
      totalRuns: { increment: 1 },
      failureCount: status === "failed" ? { increment: 1 } : undefined,
    },
  });

  return { status, duration, output, error };
}

async function executeJob(jobName: string): Promise<string> {
  switch (jobName) {
    case "low-stock-alert":
      const { ensureLowStockNotifications } = await import("./admin-notifications");
      await ensureLowStockNotifications();
      return "Low stock notifications checked";
    default:
      return `Job ${jobName} executed (simulated)`;
  }
}

export async function getJobLogs(jobId: string, limit = 50) {
  return prisma.jobLog.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAllJobLogs(limit = 100) {
  return prisma.jobLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  }) as unknown as (Awaited<ReturnType<typeof prisma.jobLog.findMany>>[0] & { job?: unknown })[];
}
