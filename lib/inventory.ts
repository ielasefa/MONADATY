import { prisma } from "@/lib/prisma";

// ─── Types ───────────────────────────────────────────────

export type MovementType =
  | "IN"
  | "OUT"
  | "SALE"
  | "RETURN"
  | "ADJUSTMENT"
  | "TRANSFER"
  | "PURCHASE"
  | "REFUND"
  | "DAMAGED";

export type POStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Ordered"
  | "Received"
  | "Cancelled";

export type RiskLevel = "Healthy" | "Warning" | "Critical" | "OutOfStock";

export type StockMovementResult = {
  success: boolean;
  newStock: number;
  movement: {
    id: string;
    productId: string;
    variantId: string;
    warehouseId: string;
    movementType: MovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason: string;
    reference: string;
  };
};

// ─── Stock Operations ────────────────────────────────────

async function getCurrentStock(
  warehouseId: string,
  productId: string,
  variantId = "",
): Promise<number> {
  const record = await prisma.productWarehouseStock.findUnique({
    where: {
      warehouseId_productId_variantId: { warehouseId, productId, variantId },
    },
    select: { stock: true },
  });
  return record?.stock ?? 0;
}

function generateRef(): string {
  return `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * Record a stock movement. Transaction-safe, immutable.
 * Adjusts ProductWarehouseStock.stock accordingly.
 */
export async function recordMovement(params: {
  productId: string;
  variantId?: string;
  warehouseId: string;
  movementType: MovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  adminId?: string;
}): Promise<StockMovementResult> {
  const {
    productId,
    variantId = "",
    warehouseId,
    movementType,
    quantity,
    reason = "",
    reference = "",
    adminId = "",
  } = params;

  if (quantity <= 0) {
    throw new Error("Quantity must be positive");
  }

  return prisma.$transaction(async (tx) => {
    const currentStock = await getCurrentStock(warehouseId, productId, variantId);

    const isOutMovement =
      movementType === "OUT" ||
      movementType === "SALE" ||
      movementType === "TRANSFER" ||
      movementType === "DAMAGED" ||
      movementType === "REFUND";

    const delta = isOutMovement ? -quantity : quantity;
    const newStock = Math.max(0, currentStock + delta);

    if (newStock < 0) {
      throw new Error(`Insufficient stock. Available: ${currentStock}, requested: ${quantity}`);
    }

    // Upsert stock record
    await tx.productWarehouseStock.upsert({
      where: {
        warehouseId_productId_variantId: { warehouseId, productId, variantId },
      },
      create: {
        warehouseId,
        productId,
        variantId,
        stock: newStock,
        reservedStock: 0,
      },
      update: { stock: newStock },
    });

    // Create movement record (immutable)
    const movement = await tx.inventoryMovement.create({
      data: {
        productId,
        variantId,
        warehouseId,
        movementType,
        quantity: delta,
        previousStock: currentStock,
        newStock,
        reason,
        reference: reference || generateRef(),
        adminId,
      },
    });

    return {
      success: true,
      newStock,
      movement: {
        id: movement.id,
        productId: movement.productId,
        variantId: movement.variantId,
        warehouseId: movement.warehouseId,
        movementType: movement.movementType as MovementType,
        quantity: movement.quantity,
        previousStock: movement.previousStock,
        newStock: movement.newStock,
        reason: movement.reason,
        reference: movement.reference,
      },
    };
  });
}

// ─── Warehouse Transfer ──────────────────────────────────

export async function transferStock(params: {
  productId: string;
  variantId?: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reason?: string;
  adminId?: string;
}): Promise<{ success: boolean; outMovement: StockMovementResult; inMovement: StockMovementResult }> {
  const { productId, variantId = "", fromWarehouseId, toWarehouseId, quantity, reason = "", adminId = "" } = params;

  if (fromWarehouseId === toWarehouseId) {
    throw new Error("Source and destination warehouses are the same");
  }

  const currentStock = await getCurrentStock(fromWarehouseId, productId, variantId);

  if (currentStock < quantity) {
    throw new Error(`Insufficient stock in source warehouse. Available: ${currentStock}, requested: ${quantity}`);
  }

  // OUT from source
  const outResult = await recordMovement({
    productId,
    variantId,
    warehouseId: fromWarehouseId,
    movementType: "TRANSFER",
    quantity,
    reason: reason || `Transfer to warehouse ${toWarehouseId}`,
    reference: `XFER-${fromWarehouseId.slice(0, 6)}-TO-${toWarehouseId.slice(0, 6)}`,
    adminId,
  });

  // IN to destination
  const inResult = await recordMovement({
    productId,
    variantId,
    warehouseId: toWarehouseId,
    movementType: "IN",
    quantity,
    reason: reason || `Transfer from warehouse ${fromWarehouseId}`,
    reference: outResult.movement.reference,
    adminId,
  });

  return { success: true, outMovement: outResult, inMovement: inResult };
}

// ─── Stock Adjustment ────────────────────────────────────

export async function adjustStock(params: {
  productId: string;
  variantId?: string;
  warehouseId: string;
  newStock: number;
  reason: string;
  adminId?: string;
}): Promise<StockMovementResult> {
  const { productId, variantId = "", warehouseId, newStock, reason, adminId = "" } = params;

  const currentStock = await getCurrentStock(warehouseId, productId, variantId);
  const difference = newStock - currentStock;

  if (difference === 0) {
    throw new Error("Stock is already at the target value");
  }

  return recordMovement({
    productId,
    variantId,
    warehouseId,
    movementType: "ADJUSTMENT",
    quantity: Math.abs(difference),
    reason: `Adjustment: ${reason}`,
    reference: generateRef(),
    adminId,
  });
}

// ─── Reservation System ──────────────────────────────────

export async function reserveStock(params: {
  orderId: string;
  productId: string;
  variantId?: string;
  warehouseId: string;
  quantity: number;
}): Promise<{ success: boolean; reserved: number }> {
  const { orderId, productId, variantId = "", warehouseId, quantity } = params;

  return prisma.$transaction(async (tx) => {
    const stock = await tx.productWarehouseStock.findUnique({
      where: {
        warehouseId_productId_variantId: { warehouseId, productId, variantId },
      },
      select: { stock: true, reservedStock: true },
    });

    if (!stock) {
      throw new Error("No stock record found for this product/warehouse");
    }

    const available = stock.stock - stock.reservedStock;
    if (available < quantity) {
      throw new Error(`Insufficient available stock. Available: ${available}, requested: ${quantity}`);
    }

    await tx.productWarehouseStock.update({
      where: {
        warehouseId_productId_variantId: { warehouseId, productId, variantId },
      },
      data: { reservedStock: { increment: quantity } },
    });

    await tx.inventoryReservation.create({
      data: {
        orderId,
        productId,
        variantId,
        warehouseId,
        quantity,
        status: "reserved",
      },
    });

    return { success: true, reserved: quantity };
  });
}

export async function releaseReservation(params: {
  orderId: string;
  productId: string;
  variantId?: string;
  warehouseId: string;
  quantity: number;
}): Promise<{ success: boolean }> {
  const { orderId, productId, variantId = "", warehouseId, quantity } = params;

  return prisma.$transaction(async (tx) => {
    await tx.productWarehouseStock.update({
      where: {
        warehouseId_productId_variantId: { warehouseId, productId, variantId },
      },
      data: { reservedStock: { decrement: quantity } },
    });

    await tx.inventoryReservation.updateMany({
      where: { orderId, productId, variantId, warehouseId, status: "reserved" },
      data: { status: "cancelled" },
    });

    return { success: true };
  });
}

export async function fulfillReservation(params: {
  orderId: string;
  productId: string;
  variantId?: string;
  warehouseId: string;
  quantity: number;
}): Promise<{ success: boolean }> {
  const { orderId, productId, variantId = "", warehouseId, quantity } = params;

  return prisma.$transaction(async (tx) => {
    await tx.productWarehouseStock.update({
      where: {
        warehouseId_productId_variantId: { warehouseId, productId, variantId },
      },
      data: {
        reservedStock: { decrement: quantity },
        stock: { decrement: quantity },
      },
    });

    await tx.inventoryReservation.updateMany({
      where: { orderId, productId, variantId, warehouseId, status: "reserved" },
      data: { status: "fulfilled" },
    });

    // Record SALE movement
    await tx.inventoryMovement.create({
      data: {
        productId,
        variantId,
        warehouseId,
        movementType: "SALE",
        quantity: -quantity,
        previousStock: 0,
        newStock: 0,
        reason: "Order fulfilled",
        reference: orderId,
        adminId: "",
      },
    });

    return { success: true };
  });
}

// ─── Low Stock Forecast ──────────────────────────────────

export async function getLowStockForecast(productId: string, variantId = "", warehouseId?: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const salesMovements = await prisma.inventoryMovement.findMany({
    where: {
      productId,
      variantId: variantId || undefined,
      movementType: "SALE",
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { quantity: true },
  });

  const totalSold = salesMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  const avgDailySales = totalSold / 30;

  // Get current stock
  const warehouseFilter = warehouseId
    ? { warehouseId }
    : undefined;

  const stockRecords = warehouseFilter
    ? await prisma.productWarehouseStock.findMany({
        where: { productId, variantId, ...warehouseFilter },
        select: { stock: true },
      })
    : await prisma.productWarehouseStock.findMany({
        where: { productId, variantId },
        select: { stock: true },
      });

  const totalStock = stockRecords.reduce((sum, r) => sum + r.stock, 0);

  let riskLevel: RiskLevel = "OutOfStock";
  let daysRemaining = 0;

  if (totalStock > 0) {
    if (avgDailySales > 0) {
      daysRemaining = Math.round(totalStock / avgDailySales);
    } else {
      daysRemaining = 999;
    }

    if (totalStock <= 0) riskLevel = "OutOfStock";
    else if (totalStock <= 5) riskLevel = "Critical";
    else if (daysRemaining <= 7) riskLevel = "Critical";
    else if (daysRemaining <= 14) riskLevel = "Warning";
    else riskLevel = "Healthy";
  }

  return {
    currentStock: totalStock,
    avgDailySales: parseFloat(avgDailySales.toFixed(2)),
    daysRemaining,
    riskLevel,
  };
}

// ─── Purchase Order Flow ─────────────────────────────────

export async function createPurchaseOrder(params: {
  supplierId: string;
  warehouseId: string;
  items: { productId: string; variantId?: string; quantity: number; cost: string }[];
  notes?: string;
  adminId?: string;
}): Promise<{ purchaseOrder: Record<string, unknown> }> {
  const { supplierId, warehouseId, items, notes = "", adminId = "" } = params;

  return prisma.$transaction(async (tx) => {
    const count = await tx.purchaseOrder.count();
    const orderNumber = `PO-${String(count + 1).padStart(5, "0")}`;

    let subtotal = 0;
    const parsedItems = items.map((item) => {
      const costVal = parseFloat(item.cost.replace(/[^0-9.]/g, "")) || 0;
      subtotal += costVal * item.quantity;
      return {
        productId: item.productId,
        variantId: item.variantId || "",
        quantity: item.quantity,
        cost: item.cost,
        receivedQuantity: 0,
        remainingQuantity: item.quantity,
      };
    });

    const po = await tx.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        warehouseId,
        status: "Draft",
        notes,
        subtotal: `${subtotal.toFixed(2)} DH`,
        tax: "0.00 DH",
        total: `${subtotal.toFixed(2)} DH`,
        adminId,
        items: {
          create: parsedItems,
        },
      },
      include: { items: true },
    });

    return { purchaseOrder: po as unknown as Record<string, unknown> };
  });
}

export async function receivePurchaseOrder(
  poId: string,
  receivedItems: { itemId: string; receivedQuantity: number }[],
  adminId = "",
) {
  return prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true },
    });

    if (!po) throw new Error("Purchase order not found");
    if (po.status !== "Ordered") throw new Error("PO must be in Ordered status to receive");

    for (const received of receivedItems) {
      const item = po.items.find((i) => i.id === received.itemId);
      if (!item) throw new Error(`Item ${received.itemId} not found`);

      const newReceived = item.receivedQuantity + received.receivedQuantity;
      const newRemaining = item.quantity - newReceived;

      await tx.purchaseOrderItem.update({
        where: { id: item.id },
        data: {
          receivedQuantity: newReceived,
          remainingQuantity: Math.max(0, newRemaining),
        },
      });

      if (received.receivedQuantity > 0) {
        // Record PURCHASE movement
        await recordMovement({
          productId: item.productId,
          variantId: item.variantId,
          warehouseId: po.warehouseId,
          movementType: "PURCHASE",
          quantity: received.receivedQuantity,
          reason: `Purchase order ${po.orderNumber}`,
          reference: po.orderNumber,
          adminId,
        });
      }
    }

    // Check if all items are fully received
    const updatedItems = await tx.purchaseOrderItem.findMany({
      where: { purchaseOrderId: poId },
    });
    const allReceived = updatedItems.every((i) => i.remainingQuantity === 0);

    if (allReceived) {
      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { status: "Received" },
      });
    }

    return { success: true };
  });
}

export async function updatePurchaseOrderStatus(
  poId: string,
  status: POStatus,
) {
  return prisma.purchaseOrder.update({
    where: { id: poId },
    data: { status },
  });
}

// ─── Permissions ─────────────────────────────────────────

export async function getAdminPermissions(adminId: string) {
  const perms = await prisma.adminPermission.findUnique({
    where: { adminId },
  });

  return {
    inventory: perms?.inventory ?? false,
    warehouse: perms?.warehouse ?? false,
    purchasing: perms?.purchasing ?? false,
  };
}

export async function setAdminPermissions(
  adminId: string,
  permissions: { inventory?: boolean; warehouse?: boolean; purchasing?: boolean },
) {
  return prisma.adminPermission.upsert({
    where: { adminId },
    update: permissions,
    create: { adminId, ...permissions },
  });
}

// ─── Barcode Generation ──────────────────────────────────

export function generateBarcode(prefix: string, id: string): string {
  const clean = id.replace(/-/g, "").slice(0, 10).toUpperCase();
  const raw = `${prefix}${clean}`;
  const checkDigit = raw
    .split("")
    .reduce((sum, char, i) => sum + char.charCodeAt(0) * (i + 1), 0) % 10;
  return `${raw}${checkDigit}`;
}

export function generateQRData(type: string, id: string, sku: string): string {
  return JSON.stringify({ t: type, i: id, s: sku });
}

// ─── Dashboard Stats ─────────────────────────────────────

export async function getInventoryDashboard() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalProducts,
    warehouseCount,
    supplierCount,
    poCount,
    totalStockRecords,
    outOfStock,
    lowStock,
    movementsToday,
    latestMovements,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.warehouse.count({ where: { isActive: true } }),
    prisma.supplier.count({ where: { active: true } }),
    prisma.purchaseOrder.count(),
    prisma.productWarehouseStock.findMany({ select: { stock: true, productId: true } }),
    prisma.productWarehouseStock.count({ where: { stock: { lte: 0 } } }),
    prisma.productWarehouseStock.count({ where: { stock: { gt: 0, lte: 5 } } }),
    prisma.inventoryMovement.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.inventoryMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { warehouse: { select: { name: true } } },
    }),
  ]);

  const totalStockValue = totalStockRecords.reduce(
    (sum, r) => sum + r.stock,
    0,
  );

  // 30-day movement chart
  const movements30d = await prisma.inventoryMovement.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, movementType: true, quantity: true },
    orderBy: { createdAt: "asc" },
  });

  const movementByDay: Record<string, Record<string, number>> = {};
  for (const m of movements30d) {
    const day = m.createdAt.toISOString().slice(0, 10);
    if (!movementByDay[day]) movementByDay[day] = {};
    const type = m.movementType;
    movementByDay[day][type] = (movementByDay[day][type] || 0) + Math.abs(m.quantity);
  }

  const isHealthy = outOfStock === 0 && lowStock === 0;

  return {
    totalProducts,
    totalStockValue,
    outOfStock,
    lowStock,
    warehouseCount,
    supplierCount,
    purchaseOrderCount: poCount,
    movementsToday,
    isHealthy,
    latestMovements: latestMovements.map((m) => ({
      id: m.id,
      productId: m.productId,
      variantId: m.variantId,
      warehouseName: m.warehouse.name,
      movementType: m.movementType,
      quantity: m.quantity,
      createdAt: m.createdAt.toISOString(),
    })),
    movementChartData: Object.entries(movementByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, types]) => ({ date, ...types })),
  };
}

// ─── Product Inventory Timeline ──────────────────────────

export async function getProductInventoryTimeline(productId: string) {
  const movements = await prisma.inventoryMovement.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      warehouse: { select: { name: true } },
    },
  });

  return movements.map((m) => ({
    id: m.id,
    date: m.createdAt.toISOString(),
    type: m.movementType,
    warehouse: m.warehouse.name,
    quantity: m.quantity,
    previousStock: m.previousStock,
    newStock: m.newStock,
    reason: m.reason,
    reference: m.reference,
  }));
}

// ─── Audit Query ─────────────────────────────────────────

export async function queryInventoryAudit(params: {
  warehouseId?: string;
  productId?: string;
  variantId?: string;
  movementType?: string;
  adminId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const {
    warehouseId,
    productId,
    variantId,
    movementType,
    adminId,
    startDate,
    endDate,
    page = 1,
    pageSize = 50,
  } = params;

  const whereClause = {
    warehouseId: warehouseId || undefined,
    productId: productId || undefined,
    variantId: variantId || undefined,
    adminId: adminId || undefined,
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          } as Record<string, Date>,
        }
      : {}),
  } as Record<string, unknown>;

  if (movementType) {
    whereClause.movementType = movementType;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const total = await prisma.inventoryMovement.count({ where: whereClause as any });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await prisma.inventoryMovement.findMany({ where: whereClause as any, orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      warehouse: { select: { name: true } },
    },
  });

  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    rows: rows.map((r) => {
      const w = r as unknown as { warehouse: { name: string } };
      return {
        id: r.id,
        date: r.createdAt.toISOString(),
        productId: r.productId,
        variantId: r.variantId,
        warehouse: w.warehouse.name,
        movementType: r.movementType,
        quantity: r.quantity,
        previousStock: r.previousStock,
        newStock: r.newStock,
        reason: r.reason,
        reference: r.reference,
      };
    }),
  };
}

// ─── Warehouse Stock for Product ─────────────────────────

export async function getProductWarehouseStocks(productId: string, variantId = "") {
  const records = await prisma.productWarehouseStock.findMany({
    where: { productId, variantId },
    include: {
      warehouse: { select: { id: true, name: true, code: true } },
    },
    orderBy: { warehouse: { name: "asc" } },
  });

  return records.map((r) => ({
    warehouseId: r.warehouseId,
    warehouseName: r.warehouse.name,
    warehouseCode: r.warehouse.code,
    stock: r.stock,
    reservedStock: r.reservedStock,
    availableStock: r.stock - r.reservedStock,
  }));
}
