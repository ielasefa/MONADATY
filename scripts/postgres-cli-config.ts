import { randomUUID } from "crypto";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import os from "os";
import path from "path";

export type PostgresCliConfig = {
  host: string;
  port: string;
  user: string;
  database: string;
  local: boolean;
  env: NodeJS.ProcessEnv;
  cleanup: () => void;
};

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function readConfiguredCa(): string | null {
  const encoded = process.env.DATABASE_CA_CERT_BASE64?.trim();
  const configuredPath = process.env.DATABASE_CA_CERT_PATH?.trim();
  if (encoded && configuredPath) {
    throw new Error("Set only one of DATABASE_CA_CERT_BASE64 or DATABASE_CA_CERT_PATH.");
  }

  const certificate = encoded
    ? Buffer.from(encoded, "base64").toString("utf8")
    : configuredPath
      ? readFileSync(configuredPath, "utf8")
      : null;
  if (certificate && (!certificate.includes("-----BEGIN CERTIFICATE-----") || !certificate.includes("-----END CERTIFICATE-----"))) {
    throw new Error("The configured database CA certificate is not valid PEM data.");
  }
  return certificate;
}

export function postgresCliConfig(rawUrl: string): PostgresCliConfig {
  const url = new URL(rawUrl);
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must use the postgres: or postgresql: protocol.");
  }
  if (!url.hostname || !url.username || !url.pathname.replace(/^\//, "")) {
    throw new Error("DATABASE_URL must include a host, user, and database name.");
  }

  const local = isLoopbackHost(url.hostname);
  const sslMode = url.searchParams.get("sslmode")?.toLowerCase();
  if (!local && sslMode === "disable") {
    throw new Error("Remote database commands cannot disable TLS.");
  }

  let temporaryCaPath: string | null = null;
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PGPASSWORD: decodeURIComponent(url.password),
  };

  if (local) {
    if (sslMode === "disable") env.PGSSLMODE = "disable";
  } else {
    const certificate = readConfiguredCa();
    if (!certificate) {
      throw new Error("Remote database commands require a trusted database CA certificate.");
    }
    temporaryCaPath = path.join(os.tmpdir(), `monadaty-pg-ca-${process.pid}-${randomUUID()}.crt`);
    writeFileSync(temporaryCaPath, certificate, { mode: 0o600 });
    env.PGSSLMODE = "verify-full";
    env.PGSSLROOTCERT = temporaryCaPath;
  }

  return {
    host: url.hostname,
    port: url.port || "5432",
    user: decodeURIComponent(url.username),
    database: url.pathname.replace(/^\//, ""),
    local,
    env,
    cleanup: () => {
      if (!temporaryCaPath) return;
      try {
        unlinkSync(temporaryCaPath);
      } catch {
        // Best-effort cleanup after the database tool exits.
      }
    },
  };
}
