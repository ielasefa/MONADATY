import { prisma } from "@/lib/prisma";
import { allocateStockChange } from "@/lib/stock-allocation";

export const MAX_PRODUCT_STOCK = 2_147_483_647;
export class ProductStockError extends Error {
  constructor(readonly code: "INVALID_ADJUSTMENT" | "NOT_FOUND" | "OUT_OF_STOCK" | "STOCK_LIMIT" | "OPERATION_CONFLICT", message: string, readonly status = 409) { super(message); }
}

type Adjustment = { productId: string; delta: number; operationId: string; adminId: string; adminName: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The history primary key makes retrying an acknowledged-or-lost request safe. */
export async function adjustProductStock(input: Adjustment) {
  const { productId, delta, operationId, adminId, adminName } = input;
  if (!productId || !Number.isSafeInteger(delta) || delta === 0 || Math.abs(delta) > 1_000_000 || !UUID.test(operationId)) {
    throw new ProductStockError("INVALID_ADJUSTMENT", "A valid nonzero quantity and operation ID are required", 400);
  }
  const replay = async () => {
    const history = await prisma.productHistory.findUnique({ where: { id: operationId } });
    if (!history) return null;
    if (history.productId !== productId || history.adminId !== adminId || history.action !== "Stock Adjustment" || Number(history.newValue) - Number(history.oldValue) !== delta) {
      throw new ProductStockError("OPERATION_CONFLICT", "This operation ID was already used for another adjustment");
    }
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, stock: true } });
    if (!product) throw new ProductStockError("NOT_FOUND", "Product not found", 404);
    return { product, replayed: true };
  };
  const previous = await replay();
  if (previous) return previous;
  try {
    return await prisma.$transaction(async tx => {
      const updated = await tx.product.updateMany({
        where: { id: productId, stock: delta < 0 ? { gte: -delta } : { lte: MAX_PRODUCT_STOCK - delta } },
        data: { stock: { increment: delta } },
      });
      const product = await tx.product.findUnique({ where: { id: productId }, select: { id: true, stock: true } });
      if (!product) throw new ProductStockError("NOT_FOUND", "Product not found", 404);
      if (updated.count !== 1) throw new ProductStockError(delta < 0 ? "OUT_OF_STOCK" : "STOCK_LIMIT", delta < 0 ? "Insufficient stock" : "Stock limit exceeded");
      await allocateStockChange(tx, { productId, previousStock: product.stock - delta, delta, reference: operationId, adminId });
      await tx.productHistory.create({ data: { id: operationId, productId, adminId, adminName, action: "Stock Adjustment", field: "stock", oldValue: String(product.stock - delta), newValue: String(product.stock) } });
      return { product, replayed: false };
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      const result = await replay();
      if (result) return result;
    }
    throw error;
  }
}
