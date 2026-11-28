#!/usr/bin/env -S tsx

import { spawnSync } from "child_process";
import path from "path";
import { postgresCliConfig } from "./postgres-cli-config";

type Snapshot = {
  adminCount: number;
  adminLogCount: number;
  productHistoryCount: number;
  adminLogFk: { name: string; action: string }[];
  productHistoryFk: { name: string; action: string }[];
  adminIdNullable: { adminLogs: boolean; productHistory: boolean };
  adminNameExists: { adminLogs: boolean; productHistory: boolean };
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const db = postgresCliConfig(databaseUrl);
if (db.local) {
  db.cleanup();
  throw new Error("This workflow is intended for the remote production database.");
}

const psqlBaseArgs = [
  "--no-psqlrc",
  "--tuples-only",
  "--no-align",
  "--set=ON_ERROR_STOP=1",
  `--host=${db.host}`,
  `--port=${db.port}`,
  `--username=${db.user}`,
  `--dbname=${db.database}`,
];

function runPsql(args: string[], input?: string): string {
  const result = spawnSync("psql", [...psqlBaseArgs, ...args], {
    env: db.env,
    input,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`psql failed (${result.status}): ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

function snapshot(): Snapshot {
  const query = `
    SELECT json_build_object(
      'adminCount', (SELECT count(*) FROM admins),
      'adminLogCount', (SELECT count(*) FROM admin_logs),
      'productHistoryCount', (SELECT count(*) FROM product_history),
      'adminLogFk', (
        SELECT coalesce(json_agg(json_build_object('name', conname, 'action', confdeltype::text) ORDER BY conname), '[]'::json)
        FROM pg_constraint
        WHERE contype = 'f' AND conrelid = to_regclass('public.admin_logs')
          AND confrelid = to_regclass('public.admins')
      ),
      'productHistoryFk', (
        SELECT coalesce(json_agg(json_build_object('name', conname, 'action', confdeltype::text) ORDER BY conname), '[]'::json)
        FROM pg_constraint
        WHERE contype = 'f' AND conrelid = to_regclass('public.product_history')
          AND confrelid = to_regclass('public.admins')
      ),
      'adminIdNullable', json_build_object(
        'adminLogs', (SELECT is_nullable = 'YES' FROM information_schema.columns WHERE table_schema='public' AND table_name='admin_logs' AND column_name='adminId'),
        'productHistory', (SELECT is_nullable = 'YES' FROM information_schema.columns WHERE table_schema='public' AND table_name='product_history' AND column_name='adminId')
      ),
      'adminNameExists', json_build_object(
        'adminLogs', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admin_logs' AND column_name='adminName'),
        'productHistory', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='product_history' AND column_name='adminName')
      )
    )::text;
  `;
  const raw = runPsql([`--command=${query}`]);
  return JSON.parse(raw) as Snapshot;
}

function assertBaseTables(current: Snapshot) {
  if (!current.adminCount || !current.adminIdNullable || !current.adminNameExists) {
    throw new Error("Production schema is missing expected administrator or history tables/columns; no changes applied.");
  }
  if (!current.adminNameExists.adminLogs || !current.adminNameExists.productHistory) {
    throw new Error("Expected history-name columns are missing; no changes applied.");
  }
  if (current.adminLogFk.length !== 1 || current.productHistoryFk.length !== 1) {
    throw new Error("Expected exactly one admin foreign key in each history table; no changes applied.");
  }
  const logFk = current.adminLogFk[0];
  const historyFk = current.productHistoryFk[0];
  if (logFk.name !== "admin_logs_adminId_fkey" || historyFk.name !== "product_history_adminId_fkey") {
    throw new Error("Production foreign-key names differ from this migration; no changes applied.");
  }
}

try {
  const before = snapshot();
  assertBaseTables(before);

  const logAlreadySetNull = before.adminLogFk[0].action === "n" && before.adminIdNullable.adminLogs;
  const historyAlreadySetNull = before.productHistoryFk[0].action === "n" && before.adminIdNullable.productHistory;
  if (logAlreadySetNull && historyAlreadySetNull) {
    console.log("Admin history foreign keys already use ON DELETE SET NULL; no database changes needed.");
    process.exitCode = 0;
  } else {
    const oldActions = before.adminLogFk[0].action === "r" && before.productHistoryFk[0].action === "r";
    if (!oldActions) {
      throw new Error("Production foreign-key actions are not the expected pre-migration state; no changes applied.");
    }

    const migrationPath = path.join(
      process.cwd(),
      "prisma/migrations/20261127190000_preserve_history_on_admin_delete/migration.sql",
    );
    runPsql([`--file=${migrationPath}`]);

    const after = snapshot();
    assertBaseTables(after);
    if (after.adminLogFk[0].action !== "n" || after.productHistoryFk[0].action !== "n") {
      throw new Error("Post-migration verification failed: foreign keys are not ON DELETE SET NULL.");
    }
    if (!after.adminIdNullable.adminLogs || !after.adminIdNullable.productHistory) {
      throw new Error("Post-migration verification failed: history adminId columns are not nullable.");
    }
    if (
      after.adminCount !== before.adminCount ||
      after.adminLogCount !== before.adminLogCount ||
      after.productHistoryCount !== before.productHistoryCount
    ) {
      throw new Error("Post-migration row counts changed unexpectedly; restore from the uploaded database backup before further writes.");
    }
    console.log("Admin deletion migration applied. Admin, admin-log, and product-history row counts are unchanged.");
  }
} finally {
  db.cleanup();
}
