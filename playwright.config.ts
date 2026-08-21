import { defineConfig } from "@playwright/test";

const localBaseURL = "http://localhost:3458";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || localBaseURL;
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  workers: 1,
  webServer: skipWebServer ? undefined : {
    command: "npm run db:start && env ALLOWED_ORIGINS=http://localhost:3458,http://127.0.0.1:3458 bash scripts/run-local-db-command.sh npx next dev -p 3458",
    port: 3458,
    timeout: 60000,
    reuseExistingServer: true,
  },
});
