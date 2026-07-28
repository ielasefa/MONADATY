import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { logInfo, logError } from "./logger";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM ?? "";

export async function sendInvoiceEmail(params: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  invoicePath: string;
  orderNumber: string;
}): Promise<void> {
  if (!resend || !FROM_EMAIL) {
    logInfo("Email: RESEND_API_KEY or EMAIL_FROM not set, skipping invoice email");
    return;
  }

  try {
    const absolutePath = path.join(process.cwd(), "public", params.invoicePath);
    let pdfBuffer: Buffer | null = null;
    if (fs.existsSync(absolutePath)) {
      pdfBuffer = fs.readFileSync(absolutePath);
    }

    const attachments: { filename: string; content: string }[] = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `${params.invoiceNumber}.pdf`,
        content: pdfBuffer.toString("base64"),
      });
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Your MONADATY Invoice — ${params.invoiceNumber}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 48px; height: 48px; background: #C1121F; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
              <span style="color: white; font-size: 24px; font-weight: 700;">M</span>
            </div>
            <h1 style="color: #D4B06A; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: 1px;">MONADATY</h1>
          </div>

          <h2 style="color: #fff; font-size: 20px; margin-bottom: 8px;">Invoice Ready</h2>
          <p style="color: #9B9B9B; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Dear ${params.customerName},
          </p>
          <p style="color: #9B9B9B; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Your invoice <strong style="color: #D4B06A;">${params.invoiceNumber}</strong> for order <strong style="color: #fff;">${params.orderNumber}</strong> is ready.
          </p>

          <div style="background: #161616; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #9B9B9B; font-size: 12px; margin: 0 0 4px;">Invoice Number</p>
            <p style="color: #fff; font-size: 16px; font-weight: 600; margin: 0;">${params.invoiceNumber}</p>
          </div>

          <p style="color: #9B9B9B; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            The PDF is attached to this email. You can also download it from your account.
          </p>

          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; text-align: center;">
            <p style="color: #9B9B9B; font-size: 12px; margin: 0;">
              MONADATY &mdash; Luxury Soda
            </p>
            <p style="color: #666; font-size: 11px; margin: 4px 0 0;">
              Thank you for your business
            </p>
          </div>
        </div>
      `,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  } catch (e) {
    logError(e, "Failed to send invoice email");
  }
}
