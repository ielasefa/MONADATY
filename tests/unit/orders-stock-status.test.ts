import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ transaction: vi.fn(), lock: vi.fn(), order: vi.fn(), orderUpdate: vi.fn(), productUpdate: vi.fn(), productUpdateMany: vi.fn(), product: vi.fn(), allocate: vi.fn(), restore: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: mocks.transaction } }));
vi.mock("@/lib/stock-allocation", () => ({ allocateStockChange: mocks.allocate, restoreOrderAllocations: mocks.restore }));
import { updateOrderStatus } from "@/lib/orders";
describe("stock across order status transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks(); mocks.order.mockResolvedValue({ orderStatus: "pending", couponCode: null, items: [{ productId: "p1", name: "Drink", quantity: 2 }] });
    mocks.productUpdateMany.mockResolvedValue({ count: 1 }); mocks.product.mockResolvedValue({ stock: 8 });
    mocks.transaction.mockImplementation(callback => callback({ $queryRaw: mocks.lock, order: { findUnique: mocks.order, update: mocks.orderUpdate }, product: { update: mocks.productUpdate, updateMany: mocks.productUpdateMany, findUniqueOrThrow: mocks.product } }));
  });
  it("restocks on cancellation while serializing access to the order", async () => {
    await updateOrderStatus("o1", { orderStatus: "cancelled" });
    expect(mocks.lock).toHaveBeenCalledOnce(); expect(mocks.productUpdate).toHaveBeenCalledWith({ where: { id: "p1" }, data: { stock: { increment: 2 } } });
    expect(mocks.restore).toHaveBeenCalledWith(expect.anything(), "o1", "p1");
  });
  it("does not restock a cancelled order again when marking it refunded", async () => {
    mocks.order.mockResolvedValue({ orderStatus: "cancelled", couponCode: null, items: [{ productId: "p1", quantity: 2 }] });
    await updateOrderStatus("o1", { orderStatus: "refunded" }); expect(mocks.productUpdate).not.toHaveBeenCalled(); expect(mocks.restore).not.toHaveBeenCalled();
  });
  it("deducts stock again when reopening a cancelled order", async () => {
    mocks.order.mockResolvedValue({ orderStatus: "cancelled", couponCode: null, items: [{ productId: "p1", quantity: 2 }] });
    await updateOrderStatus("o1", { orderStatus: "processing" }); expect(mocks.productUpdateMany.mock.calls[0][0].data).toEqual({ stock: { decrement: 2 } });
  });
  it("rejects reopening if the stock has since sold out", async () => {
    mocks.order.mockResolvedValue({ orderStatus: "cancelled", couponCode: null, items: [{ productId: "p1", quantity: 2 }] }); mocks.productUpdateMany.mockResolvedValue({ count: 0 });
    await expect(updateOrderStatus("o1", { orderStatus: "pending" })).rejects.toMatchObject({ code: "OUT_OF_STOCK" }); expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });
  it("does not deduct a second time during fulfillment", async () => {
    await updateOrderStatus("o1", { orderStatus: "completed" }); expect(mocks.productUpdateMany).not.toHaveBeenCalled(); expect(mocks.productUpdate).not.toHaveBeenCalled();
  });
});
