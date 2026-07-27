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
];

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

  return warnings;
}
