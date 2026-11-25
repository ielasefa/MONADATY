import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ history: vi.fn(), product: vi.fn(), update: vi.fn(), create: vi.fn(), transaction: vi.fn(), allocation: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { productHistory: { findUnique: mocks.history }, product: { findUnique: mocks.product }, $transaction: mocks.transaction } }));
vi.mock("@/lib/stock-allocation", () => ({ allocateStockChange: mocks.allocation }));
import { adjustProductStock } from "@/lib/product-stock";
const input = { productId: "legacy-product", delta: -1, operationId: "12345678-1234-4234-8234-123456789012", adminId: "admin", adminName: "Admin" };
const history = { productId: input.productId, adminId: "admin", action: "Stock Adjustment", oldValue: "10", newValue: "9" };
describe("canonical product stock adjustments", () => {
  beforeEach(() => {
    vi.clearAllMocks(); mocks.history.mockReset(); mocks.history.mockResolvedValue(null);
    mocks.update.mockResolvedValue({ count: 1 }); mocks.product.mockResolvedValue({ id: input.productId, stock: 9 }); mocks.create.mockResolvedValue({});
    mocks.transaction.mockImplementation(callback => callback({ product: { updateMany: mocks.update, findUnique: mocks.product }, productHistory: { create: mocks.create } }));
  });
  it("deducts atomically and records the exact previous and new quantity with the operation ID", async () => {
    expect(await adjustProductStock(input)).toMatchObject({ product: { stock: 9 }, replayed: false });
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: input.productId, stock: { gte: 1 } }, data: { stock: { increment: -1 } } });
    expect(mocks.create.mock.calls[0][0].data).toMatchObject({ id: input.operationId, oldValue: "10", newValue: "9" });
  });
  it("returns current stock on a retry without deducting again", async () => {
    mocks.history.mockResolvedValue(history); mocks.product.mockResolvedValue({ id: input.productId, stock: 3 });
    expect(await adjustProductStock(input)).toMatchObject({ product: { stock: 3 }, replayed: true }); expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("rejects reusing a key for a different adjustment", async () => {
    mocks.history.mockResolvedValue(history);
    await expect(adjustProductStock({ ...input, delta: 1 })).rejects.toMatchObject({ code: "OPERATION_CONFLICT" });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it.each([0, -0.5, Number.NaN, 1_000_001])("rejects invalid delta %s without writing", async delta => {
    await expect(adjustProductStock({ ...input, delta })).rejects.toMatchObject({ code: "INVALID_ADJUSTMENT" }); expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("refuses insufficient stock without recording a successful change", async () => {
    mocks.update.mockResolvedValue({ count: 0 }); mocks.product.mockResolvedValue({ id: input.productId, stock: 0 });
    await expect(adjustProductStock(input)).rejects.toMatchObject({ code: "OUT_OF_STOCK" }); expect(mocks.create).not.toHaveBeenCalled();
  });
  it("recovers the winner of simultaneous retries of one operation", async () => {
    mocks.transaction.mockRejectedValue({ code: "P2002" }); mocks.history.mockResolvedValueOnce(null).mockResolvedValueOnce(history);
    expect(await adjustProductStock(input)).toMatchObject({ replayed: true });
  });
});
