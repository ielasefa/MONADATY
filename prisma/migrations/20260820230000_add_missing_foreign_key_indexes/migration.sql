-- Index foreign keys used by joins and parent-row deletes. CONCURRENTLY avoids
-- blocking normal writes while this forward-only migration is applied.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "product_history_adminId_idx"
ON "product_history"("adminId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "credit_notes_orderId_idx"
ON "credit_notes"("orderId");
