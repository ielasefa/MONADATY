export const ORDER_STATUSES = ["pending", "processing", "shipped", "out_for_delivery", "delivered", "completed", "cancelled", "refunded"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "refunded"] as const;
export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  paid: "bg-[rgba(15,118,110,0.15)] text-teal-400",
  processing: "bg-blue-500/15 text-blue-400",
  shipped: "bg-[rgba(15,118,110,0.15)] text-teal-400",
  out_for_delivery: "bg-purple-500/15 text-purple-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
  refunded: "bg-red-500/15 text-red-400",
};
export const TIMELINE_STEPS = [
  { status: "pending", label: "Order Placed" },
  { status: "processing", label: "Processing" },
  { status: "shipped", label: "Shipped" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
  { status: "completed", label: "Completed" },
] as const;
export const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};
export const CURRENCY_SYMBOL = "DH";
export const CURRENCY_CODE = "MAD";
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: "Cash on Delivery",
  card: "Card Payment",
  bank_transfer: "Bank Transfer",
};
export function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}
export const statusColors = STATUS_COLORS;
export const timelineSteps = TIMELINE_STEPS;

// ── Single source of truth: enriched status workflow ──────────────────────

export type StatusStepMeta = {
  status: string;
  label: string;
  description: string;
  dotColor: string;
  glowColor: string;
  badgeColor: string;
  iconBg: string;
  lineColor: string;
};

export const ORDER_STATUS_WORKFLOW: StatusStepMeta[] = [
  {
    status: "pending",
    label: "Order Placed",
    description: "Your order has been placed and is awaiting confirmation.",
    dotColor: "bg-amber-400",
    glowColor: "shadow-amber-500/30",
    badgeColor: "bg-amber-500/15 text-amber-400",
    iconBg: "bg-amber-500/20",
    lineColor: "bg-amber-500/30",
  },
  {
    status: "processing",
    label: "Processing",
    description: "Your order is being processed and prepared.",
    dotColor: "bg-blue-400",
    glowColor: "shadow-blue-500/30",
    badgeColor: "bg-blue-500/15 text-blue-400",
    iconBg: "bg-blue-500/20",
    lineColor: "bg-blue-500/30",
  },
  {
    status: "shipped",
    label: "Shipped",
    description: "Your package has been shipped and is on its way.",
    dotColor: "bg-teal-400",
    glowColor: "shadow-teal-500/30",
    badgeColor: "bg-teal-500/15 text-teal-400",
    iconBg: "bg-teal-500/20",
    lineColor: "bg-teal-500/30",
  },
  {
    status: "out_for_delivery",
    label: "Out for Delivery",
    description: "Your package is out for delivery today.",
    dotColor: "bg-purple-400",
    glowColor: "shadow-purple-500/30",
    badgeColor: "bg-purple-500/15 text-purple-400",
    iconBg: "bg-purple-500/20",
    lineColor: "bg-purple-500/30",
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Your package has been delivered successfully.",
    dotColor: "bg-emerald-400",
    glowColor: "shadow-emerald-500/30",
    badgeColor: "bg-emerald-500/15 text-emerald-400",
    iconBg: "bg-emerald-500/20",
    lineColor: "bg-emerald-500/30",
  },
  {
    status: "completed",
    label: "Completed",
    description: "Order completed. Thank you for your purchase!",
    dotColor: "bg-emerald-400",
    glowColor: "shadow-emerald-500/30",
    badgeColor: "bg-emerald-500/15 text-emerald-400",
    iconBg: "bg-emerald-500/20",
    lineColor: "bg-emerald-500/30",
  },
];

export type TerminalStatusMeta = {
  status: string;
  label: string;
  description: string;
  dotColor: string;
  glowColor: string;
  badgeColor: string;
  iconBg: string;
};

export const TERMINAL_STATUSES: Record<string, TerminalStatusMeta> = {
  cancelled: {
    status: "cancelled",
    label: "Cancelled",
    description: "This order has been cancelled.",
    dotColor: "bg-red-400",
    glowColor: "shadow-red-500/30",
    badgeColor: "bg-red-500/15 text-red-400",
    iconBg: "bg-red-500/20",
  },
  refunded: {
    status: "refunded",
    label: "Refunded",
    description: "This order has been refunded.",
    dotColor: "bg-orange-400",
    glowColor: "shadow-orange-500/30",
    badgeColor: "bg-orange-500/15 text-orange-400",
    iconBg: "bg-orange-500/20",
  },
};

export function getStatusMeta(status: string): StatusStepMeta | TerminalStatusMeta | undefined {
  const workflow = ORDER_STATUS_WORKFLOW.find((s) => s.status === status);
  if (workflow) return workflow;
  return TERMINAL_STATUSES[status];
}

export function isTerminalStatus(status: string): boolean {
  return status === "cancelled" || status === "refunded";
}

export function getWorkflowIndex(status: string): number {
  return ORDER_STATUS_WORKFLOW.findIndex((s) => s.status === status);
}
