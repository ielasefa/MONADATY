type LogLevel = "error" | "info" | "warning";

function formatLog(level: LogLevel, message: string, context?: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : "";
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} [${level.toUpperCase()}] ${prefix} ${message}${metaStr}`;
}

export function logError(error: unknown, context?: string, meta?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const fullMeta = { ...meta };
  if (stack) fullMeta.stack = stack;
  console.error(formatLog("error", message, context, fullMeta));
}

export function logInfo(message: string, context?: string, meta?: Record<string, unknown>): void {
  console.log(formatLog("info", message, context, meta));
}

export function logWarning(message: string, context?: string, meta?: Record<string, unknown>): void {
  console.warn(formatLog("warning", message, context, meta));
}
