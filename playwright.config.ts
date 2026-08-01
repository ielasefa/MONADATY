import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3458",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  workers: 1,
  webServer: {
    command: "npx next dev -p 3458",
    port: 3458,
    timeout: 60000,
    reuseExistingServer: true,
  },
});
