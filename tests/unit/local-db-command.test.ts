import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const temporaryDirectories: string[] = [];
const localUrl = "postgresql://local_user@127.0.0.1:5432/monadaty?sslmode=disable";

function runLocalCommand(files: Record<string, string>, overrides: Partial<NodeJS.ProcessEnv> = {}) {
  const directory = mkdtempSync(path.join(tmpdir(), "monadaty-local-env-"));
  temporaryDirectories.push(directory);
  for (const [filename, content] of Object.entries(files)) {
    writeFileSync(path.join(directory, filename), content, { mode: 0o600 });
  }

  return spawnSync("bash", [
    path.join(projectRoot, "scripts/run-local-db-command.sh"),
    process.execPath,
    "-e",
    "process.stdout.write(process.env.DATABASE_URL)",
  ], {
    cwd: directory,
    env: {
      ...process.env,
      NODE_ENV: "development",
      NODE_PATH: path.join(projectRoot, "node_modules"),
      __NEXT_PROCESSED_ENV: undefined,
      LOCAL_DATABASE_URL: undefined,
      DATABASE_URL: undefined,
      ...overrides,
    },
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("local database command environment", () => {
  it("uses the configured local role from .env.local instead of defaulting to postgres", () => {
    const result = runLocalCommand({ ".env.local": `LOCAL_DATABASE_URL=${localUrl}\n` });

    expect(result.status).toBe(0);
    expect(result.stdout).toBe(localUrl);
  });

  it("gives an explicit terminal configuration precedence over the file", () => {
    const terminalUrl = "postgresql://terminal_user@localhost:5432/monadaty?sslmode=disable";
    const result = runLocalCommand({ ".env.local": `LOCAL_DATABASE_URL=${localUrl}\n` }, {
      LOCAL_DATABASE_URL: terminalUrl,
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toBe(terminalUrl);
  });

  it("reads the local override independently of the ordinary database configuration", () => {
    const result = runLocalCommand({
      ".env": "DATABASE_URL=postgresql://production@database.example/monadaty\n",
      ".env.local": `LOCAL_DATABASE_URL=${localUrl}\n`,
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toBe(localUrl);
  });

  it("rejects a remote host loaded from .env.local before executing the command", () => {
    const result = runLocalCommand({
      ".env.local": "LOCAL_DATABASE_URL=postgresql://user@database.example/monadaty\n",
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Refusing local database command for non-loopback host");
  });
});
