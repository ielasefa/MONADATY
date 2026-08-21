import { readFileSync } from "fs";
import type { PoolConfig } from "pg";
import { getDatabaseUrl } from "./env-validator";

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function loadDatabaseCa(): string | undefined {
  const encoded = process.env.DATABASE_CA_CERT_BASE64?.trim();
  const path = process.env.DATABASE_CA_CERT_PATH?.trim();

  if (encoded && path) {
    throw new Error("Set only one of DATABASE_CA_CERT_BASE64 or DATABASE_CA_CERT_PATH.");
  }

  const certificate = encoded
    ? Buffer.from(encoded, "base64").toString("utf8")
    : path
      ? readFileSync(path, "utf8")
      : undefined;

  if (certificate && !certificate.includes("-----BEGIN CERTIFICATE-----")) {
    throw new Error("The configured database CA certificate is not valid PEM data.");
  }

  return certificate;
}

export function buildPoolConfig(overrides: PoolConfig = {}): PoolConfig {
  const rawUrl = getDatabaseUrl();
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL URL.");
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must use the postgres: or postgresql: protocol.");
  }

  const sslMode = url.searchParams.get("sslmode")?.toLowerCase();
  const local = isLoopbackHost(url.hostname);
  const ca = loadDatabaseCa();

  // node-postgres replaces an explicit ssl object when ssl parameters remain in
  // the connection URL. Remove them and configure verified TLS in one place.
  for (const parameter of ["sslmode", "sslrootcert", "sslcert", "sslkey"]) {
    url.searchParams.delete(parameter);
  }

  if (!local && sslMode === "disable") {
    throw new Error("Remote database connections cannot disable TLS.");
  }

  const tlsRequested = !local || Boolean(sslMode && sslMode !== "disable") || Boolean(ca);
  if (tlsRequested && !ca) {
    throw new Error(
      "Verified database TLS requires DATABASE_CA_CERT_BASE64 or DATABASE_CA_CERT_PATH.",
    );
  }

  const { connectionString: _connectionString, ssl: _ssl, ...safeOverrides } = overrides;

  return {
    ...safeOverrides,
    connectionString: url.toString(),
    max: overrides.max ?? 2,
    min: overrides.min ?? 0,
    idleTimeoutMillis: overrides.idleTimeoutMillis ?? 30_000,
    connectionTimeoutMillis: overrides.connectionTimeoutMillis ?? 15_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    ...(tlsRequested ? { ssl: { ca, rejectUnauthorized: true } } : {}),
  };
}
