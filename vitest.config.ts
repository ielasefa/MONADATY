import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["node_modules", ".next", "e2e", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: [
        "lib/**/*.ts",
        "components/**/*.tsx",
      ],
      exclude: [
        "lib/**/*.d.ts",
        "lib/cloudinary.ts",
        "lib/email*.ts",
        "lib/storage.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
