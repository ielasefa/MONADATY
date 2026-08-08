-- CreateTable
CREATE TABLE "collection_showcase_products" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_showcase_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_showcase_products_collectionId_productId_key" ON "collection_showcase_products"("collectionId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "collection_showcase_products_collectionId_position_key" ON "collection_showcase_products"("collectionId", "position");

-- CreateIndex
CREATE INDEX "collection_showcase_products_collectionId_position_idx" ON "collection_showcase_products"("collectionId", "position");

-- AddForeignKey
ALTER TABLE "collection_showcase_products" ADD CONSTRAINT "collection_showcase_products_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_showcase_products" ADD CONSTRAINT "collection_showcase_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
