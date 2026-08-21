type EnvVar = {
  name: string;
  required: boolean;
  description: string;
};

const REQUIRED_VARS: EnvVar[] = [
  { name: "DATABASE_URL", required: true, description: "PostgreSQL connection string" },
  { name: "SESSION_SECRET", required: true, description: "HMAC signing key for session tokens (min 32 chars)" },
];

const OPTIONAL_VARS: EnvVar[] = [
  { name: "APP_URL", required: false, description: "Public base URL for metadataBase, sitemap, CSRF" },
  { name: "APP_NAME", required: false, description: "Brand name shown in title, navbar, footer" },
  { name: "APP_DESCRIPTION", required: false, description: "Default meta description for the site" },
  { name: "ADMIN_EMAIL", required: false, description: "Admin email for seeding (only needed for npm run db:seed)" },
  { name: "ADMIN_PASSWORD", required: false, description: "Admin password for seeding (only needed for npm run db:seed)" },
  { name: "RESEND_API_KEY", required: false, description: "Resend API key for transactional emails" },
  { name: "EMAIL_FROM", required: false, description: "Sender email address for transactional emails" },
  { name: "BACKUP_DIR", required: false, description: "Database backup directory" },
  { name: "GOOGLE_DRIVE_ID", required: false, description: "Google Drive folder ID for backup uploads" },
  { name: "ALLOWED_ORIGINS", required: false, description: "Comma-separated list of allowed CORS origins" },
  { name: "DATABASE_CA_CERT_BASE64", required: false, description: "Base64-encoded CA certificate for verified PostgreSQL TLS" },
  { name: "DATABASE_CA_CERT_PATH", required: false, description: "Local path to a CA certificate for verified PostgreSQL TLS" },
  { name: "UPLOAD_ROOT", required: false, description: "Persistent filesystem directory for runtime uploads" },
  { name: "INVOICE_ROOT", required: false, description: "Persistent filesystem directory for generated invoice PDFs" },
];

let validated = false;

export function validateEnv(): string[] {
  const warnings: string[] = [];

  for (const envVar of REQUIRED_VARS) {
    if (!process.env[envVar.name]) {
      throw new Error(
        `Missing required environment variable: ${envVar.name}\n` +
        `  Description: ${envVar.description}\n` +
        `  See .env.example for configuration.`,
      );
    }
  }

  for (const envVar of OPTIONAL_VARS) {
    if (!process.env[envVar.name]) {
      warnings.push(`Optional environment variable ${envVar.name} is not set. ${envVar.description}.`);
    }
  }

  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    throw new Error(
      `SESSION_SECRET must be at least 32 characters long. ` +
      `Current length: ${process.env.SESSION_SECRET.length}`,
    );
  }

  if (process.env.DATABASE_URL) {
    try {
      new URL(process.env.DATABASE_URL);
    } catch {
      throw new Error("DATABASE_URL is not a valid URL.");
    }
  }

  if (process.env.NODE_ENV === "production") {
    for (const name of ["APP_URL", "ALLOWED_ORIGINS", "UPLOAD_ROOT", "INVOICE_ROOT"]) {
      if (!process.env[name]) {
        throw new Error(`Missing required production environment variable: ${name}`);
      }
    }
  }

  validated = true;
  return warnings;
}

export function ensureEnv(): void {
  if (!validated) {
    validateEnv();
  }
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Missing required environment variable: SESSION_SECRET\n" +
      "  Description: HMAC signing key for session tokens (min 32 chars)\n" +
      "  See .env.example for configuration.",
    );
  }
  if (secret.length < 32) {
    throw new Error(
      `SESSION_SECRET must be at least 32 characters long. ` +
      `Current length: ${secret.length}`,
    );
  }
  return secret;
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Missing required environment variable: DATABASE_URL\n" +
      "  Description: PostgreSQL connection string\n" +
      "  See .env.example for configuration.",
    );
  }
  return url;
}

export function getAppUrl(): string {
  const raw = process.env.APP_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");
  if (!raw) {
    throw new Error("Missing required production environment variable: APP_URL");
  }
  const parsed = new URL(raw);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("APP_URL must use http: or https:.");
  }
  return parsed.origin;
}
