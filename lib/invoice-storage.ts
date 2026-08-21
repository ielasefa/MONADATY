import path from "path";

function configuredInvoiceRoot(): string {
  const configured = process.env.INVOICE_ROOT?.trim();
  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("Missing required production environment variable: INVOICE_ROOT");
  }
  if (configured && process.env.NODE_ENV === "production" && !path.isAbsolute(configured)) {
    throw new Error("INVOICE_ROOT must be an absolute path in production");
  }
  return path.resolve(configured || path.join(process.cwd(), "public", "invoices"));
}

export const INVOICE_ROOT = configuredInvoiceRoot();

export function invoiceFilePath(publicPath: string): string | null {
  if (!/^\/invoices\/[a-zA-Z0-9.-]+\.pdf$/.test(publicPath)) return null;
  const resolved = path.resolve(INVOICE_ROOT, path.basename(publicPath));
  return resolved.startsWith(`${INVOICE_ROOT}${path.sep}`) ? resolved : null;
}
