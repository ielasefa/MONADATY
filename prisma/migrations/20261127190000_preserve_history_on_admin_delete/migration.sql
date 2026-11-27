-- Retain historical actor names while allowing an administrator account to be removed.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE "admin_logs" ADD COLUMN IF NOT EXISTS "adminName" TEXT NOT NULL DEFAULT '';
UPDATE "admin_logs" AS history SET "adminName" = actor."name"
FROM "admins" AS actor WHERE history."adminId" = actor."id" AND history."adminName" = '';
UPDATE "product_history" AS history SET "adminName" = actor."name"
FROM "admins" AS actor WHERE history."adminId" = actor."id" AND history."adminName" = '';

ALTER TABLE "admin_logs" ALTER COLUMN "adminId" DROP NOT NULL;
ALTER TABLE "product_history" ALTER COLUMN "adminId" DROP NOT NULL;
ALTER TABLE "admin_logs" DROP CONSTRAINT "admin_logs_adminId_fkey";
ALTER TABLE "product_history" DROP CONSTRAINT "product_history_adminId_fkey";
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;
