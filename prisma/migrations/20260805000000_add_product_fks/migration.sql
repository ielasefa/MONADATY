-- Delete orphaned rows before adding foreign key constraints
DELETE FROM "product_warehouse_stocks" WHERE "productId" NOT IN (SELECT "id" FROM "products");
DELETE FROM "inventory_movements" WHERE "productId" NOT IN (SELECT "id" FROM "products");
DELETE FROM "product_suppliers" WHERE "productId" NOT IN (SELECT "id" FROM "products");
DELETE FROM "purchase_order_items" WHERE "productId" NOT IN (SELECT "id" FROM "products");
DELETE FROM "inventory_reservations" WHERE "productId" NOT IN (SELECT "id" FROM "products");

-- Add foreign key constraints to products
ALTER TABLE "product_warehouse_stocks" ADD CONSTRAINT "product_warehouse_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
