/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { StoredOrder } from "@/types";

const colors = {
  bg: "#050505",
  card: "#141413",
  burgundy: "#6E1F2A",
  gold: "#B89B5E",
  muted: "#969087",
  white: "#FFFFFF",
  text: "#1A1917",
  lightBg: "#f8f8f8",
  border: "#e5e5e5",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: colors.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.burgundy,
  },
  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.burgundy,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: 700,
  },
  brandName: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.white,
    letterSpacing: 1.5,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.text,
    textAlign: "right",
  },
  invoiceMeta: {
    fontSize: 8,
    color: colors.muted,
    textAlign: "right",
    marginTop: 2,
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9,
    color: colors.text,
    fontWeight: 600,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.burgundy,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.burgundy,
  },
  addressBlock: {
    marginBottom: 20,
  },
  addressLine: {
    fontSize: 8,
    color: colors.text,
    marginBottom: 1,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.burgundy,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 700,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  colImage: { flex: 1.5 },
  colProduct: { flex: 3 },
  colSku: { flex: 1.5 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  cellText: { fontSize: 8, color: colors.text },
  productImage: { width: 20, height: 20, borderRadius: 4, backgroundColor: colors.lightBg },
  totals: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
  },
  totalLabel: {
    fontSize: 8,
    color: colors.muted,
    width: 100,
    textAlign: "right",
    marginRight: 8,
  },
  totalValue: {
    fontSize: 8,
    color: colors.text,
    fontWeight: 600,
    width: 90,
    textAlign: "right",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: colors.burgundy,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.burgundy,
    width: 100,
    textAlign: "right",
    marginRight: 8,
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.burgundy,
    width: 90,
    textAlign: "right",
  },
  qrSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  qrCode: {
    width: 80,
    height: 80,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: colors.muted,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  termsSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.lightBg,
    borderRadius: 6,
  },
  termsTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  termsText: {
    fontSize: 7,
    color: colors.muted,
    lineHeight: 1.4,
  },
  pageNumber: {
    position: "absolute",
    bottom: 8,
    right: 40,
    fontSize: 7,
    color: colors.muted,
  },
  statusBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

type InvoiceTranslations = {
  credit_note: string;
  invoice_label: string;
  invoice_number: string;
  order_number: string;
  issue_date: string;
  payment_method: string;
  bill_to: string;
  credited_items: string;
  order_items: string;
  image: string;
  product: string;
  sku: string;
  qty: string;
  unit_price: string;
  total: string;
  subtotal: string;
  shipping: string;
  discount: string;
  tax: string;
  grand_total: string;
  credit_amount: string;
  terms_and_conditions: string;
  terms_body: string;
  morocco: string;
  luxury_soda: string;
  company_name: string;
  monadaty: string;
};

type Props = {
  order: StoredOrder;
  invoiceNumber: string;
  invoiceDate: string;
  qrDataUrl?: string;
  isCreditNote?: boolean;
  creditNoteNumber?: string;
  translations?: Partial<InvoiceTranslations>;
};

const DEFAULT_TRANSLATIONS: InvoiceTranslations = {
  credit_note: "Credit Note",
  invoice_label: "Invoice",
  invoice_number: "Invoice Number",
  order_number: "Order Number",
  issue_date: "Issue Date",
  payment_method: "Payment Method",
  bill_to: "Bill To",
  credited_items: "Credited Items",
  order_items: "Order Items",
  image: "Image",
  product: "Product",
  sku: "SKU",
  qty: "Qty",
  unit_price: "Unit Price",
  total: "Total",
  subtotal: "Subtotal",
  shipping: "Shipping",
  discount: "Discount",
  tax: "Tax",
  grand_total: "Grand Total",
  credit_amount: "Credit Amount",
  terms_and_conditions: "Terms & Conditions",
  terms_body: "Thank you for your business. Payment is due within 15 days. Please keep this document for your records.",
  morocco: "Morocco",
  luxury_soda: "Luxury Soda",
  company_name: "Luxury Soda",
  monadaty: "MONADATY",
};

export function InvoiceDocument({ order, invoiceNumber, invoiceDate, qrDataUrl, isCreditNote, creditNoteNumber, translations: tOverrides }: Props) {
  const tStrings = { ...DEFAULT_TRANSLATIONS, ...tOverrides };
  const t = (key: keyof InvoiceTranslations, replacements?: Record<string, string>) => {
    let val = tStrings[key] || key;
    if (replacements) {
      val = val.replace(/\{\{(\w+)\}\}/g, (_, k: string) => replacements[k] ?? `{{${k}}}`);
    }
    return val;
  };
  const subtotalNum = parseFloat(order.subtotal.replace(/[^0-9.]/g, "")) || 0;
  const shippingNum = parseFloat(order.shipping.replace(/[^0-9.]/g, "")) || 0;
  const taxNum = parseFloat(order.tax.replace(/[^0-9.]/g, "")) || 0;
  const totalNum = parseFloat(order.total.replace(/[^0-9.]/g, "")) || 0;
  const discountNum = parseFloat(order.discountAmount.replace(/[^0-9.]/g, "")) || 0;
  const currency = order.currency || "MAD";

  const fmt = (n: number) =>
    `${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

  const docTitle = isCreditNote ? t("credit_note").toUpperCase() : t("invoice_label").toUpperCase();
  const docNumber = isCreditNote ? creditNoteNumber || invoiceNumber : invoiceNumber;
  const statusColor = order.paymentStatus === "paid" ? "#0F8B6F" : "#C1121F";

  const MyPage = ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <Page size="A4" style={styles.page} {...props}>
      {children}
              <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} fixed />
    </Page>
  );

  const itemsPerPage = 12;
  const pageCount = Math.ceil(order.items.length / itemsPerPage);

  const renderItems = (start: number, end: number) => (
    order.items.slice(start, end).map((item, i) => (
      <View key={start + i} style={styles.tableRow} wrap={false}>
        <View style={styles.colImage}>
            {item.image ? (
            <Image source={{ uri: item.image, method: "GET", headers: { Accept: "*/*" } }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, { alignItems: "center", justifyContent: "center" }]}>
              <Text style={{ fontSize: 6, color: colors.muted }}>—</Text>
            </View>
          )}
          
        </View>
        <Text style={[styles.cellText, styles.colProduct]}>{item.name}</Text>
        <Text style={[styles.cellText, styles.colSku]}>{item.slug || "—"}</Text>
        <Text style={[styles.cellText, styles.colQty]}>{item.quantity}</Text>
        <Text style={[styles.cellText, styles.colPrice]}>{item.unitPrice}</Text>
        <Text style={[styles.cellText, styles.colTotal]}>{item.totalPrice}</Text>
      </View>
    ))
  );

  const pages: React.ReactNode[] = [];
  for (let p = 0; p < pageCount; p++) {
    const start = p * itemsPerPage;
    const end = Math.min(start + itemsPerPage, order.items.length);
    const isFirst = p === 0;
    const isLast = p === pageCount - 1;

    pages.push(
      <MyPage key={p}>
        {isFirst && (
          <>
            <View style={styles.header}>
              <View style={styles.logoArea}>
                <View style={styles.logoBox}>
                  <Text style={styles.logoText}>M</Text>
                </View>
                <View>
                  <Text style={styles.brandName}>{t("monadaty")}</Text>
                  <Text style={{ fontSize: 7, color: colors.muted, marginTop: 1 }}>{t("company_name")}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.invoiceTitle}>{docTitle}</Text>
                <Text style={styles.invoiceMeta}>{docNumber}</Text>
              </View>
            </View>

            <View style={styles.metaSection}>
              <View style={styles.metaBlock}>
                  <Text style={styles.metaLabel}>{t("invoice_number")}</Text>
                <Text style={styles.metaValue}>{docNumber}</Text>
                <Text style={styles.metaLabel}></Text>
                <Text style={styles.metaValue}></Text>
              </View>
              <View style={styles.metaBlock}>
                <Text style={styles.metaLabel}>{t("order_number")}</Text>
                <Text style={styles.metaValue}>{order.orderNumber}</Text>
                <Text style={styles.metaLabel}>{t("issue_date")}</Text>
                <Text style={styles.metaValue}>{invoiceDate}</Text>
              </View>
              <View style={[styles.metaBlock, { alignItems: "flex-end" }]}>
                <Text style={styles.metaLabel}>{t("payment_method")}</Text>
                <Text style={styles.metaValue}>{order.paymentMethod.replace(/_/g, " ")}</Text>
                <View style={styles.statusBlock}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>{order.paymentStatus}</Text>
                </View>
              </View>
            </View>

            <View style={styles.addressBlock}>
              <Text style={styles.sectionTitle}>{t("bill_to")}</Text>
              <Text style={styles.addressLine}>{order.customerName}</Text>
              <Text style={styles.addressLine}>{order.customerEmail}</Text>
              {order.phone ? <Text style={styles.addressLine}>{order.phone}</Text> : null}
              {order.address ? <Text style={styles.addressLine}>{order.address}</Text> : null}
              <Text style={styles.addressLine}>
                {[order.city, order.postalCode, order.country].filter(Boolean).join(", ")}
              </Text>
            </View>

              {qrDataUrl && (
              <View style={styles.qrSection}>
                <Image source={{ uri: qrDataUrl }} style={styles.qrCode} />
              </View>
            )}
            
          </>
        )}

        <Text style={styles.sectionTitle}>
          {isCreditNote ? t("credited_items") : t("order_items")}
          {pageCount > 1 ? ` (Page ${p + 1} of ${pageCount})` : ""}
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colImage]}>{t("image")}</Text>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>{t("product")}</Text>
            <Text style={[styles.tableHeaderCell, styles.colSku]}>{t("sku")}</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>{t("qty")}</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>{t("unit_price")}</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>{t("total")}</Text>
          </View>
          {renderItems(start, end)}
        </View>

        {isLast && (
          <>
            {!isCreditNote && discountNum > 0 && (
              <View style={styles.totals}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t("subtotal")}</Text>
                  <Text style={styles.totalValue}>{fmt(subtotalNum)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t("shipping")}</Text>
                  <Text style={styles.totalValue}>{fmt(shippingNum)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t("discount")}</Text>
                  <Text style={[styles.totalValue, { color: colors.burgundy }]}>-{fmt(discountNum)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t("tax")}</Text>
                  <Text style={styles.totalValue}>{fmt(taxNum)}</Text>
                </View>
                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>{t("grand_total")}</Text>
                  <Text style={styles.grandTotalValue}>{fmt(totalNum)}</Text>
                </View>
              </View>
            )}

            {isCreditNote && (
              <View style={styles.totals}>
                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>{t("credit_amount")}</Text>
                  <Text style={styles.grandTotalValue}>{fmt(totalNum)}</Text>
                </View>
              </View>
            )}

            <View style={styles.termsSection}>
              <Text style={styles.termsTitle}>{t("terms_and_conditions")}</Text>
              <Text style={styles.termsText}>
                {t("terms_body", { docType: isCreditNote ? t("credit_note") : t("invoice_label") })}
              </Text>
              <Text style={[styles.termsText, { marginTop: 4 }]}>
                MONADATY — {order.city || t("morocco")} | support@monadaty.ma | monadaty.ma
              </Text>
            </View>
          </>
        )}

        {isFirst && (
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <View style={styles.footerContent}>
              <Text style={styles.footerText}>MONADATY — {t("luxury_soda")}</Text>
              <View style={styles.footerRight}>
                <Text style={styles.footerText}>support@monadaty.ma</Text>
                <Text style={styles.footerText}>monadaty.ma</Text>
              </View>
            </View>
          </View>
        )}
      </MyPage>,
    );
  }

  return <Document>{pages}</Document>;
}
