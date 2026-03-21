import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { to, propertyAddress, pdfBase64 } = await req.json();

    if (!to || !pdfBase64) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Extract the base64 data from the data URI
    const base64Data = pdfBase64.replace(/^data:application\/pdf;filename=.*?;base64,/, "");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const address = propertyAddress || "Property";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aussie-flip-calc.vercel.app";

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `New Property Deal - ${address}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Aussie Flip Calc</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0;">Property Renovation Feasibility Report</p>
          </div>

          <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">
            We have just completed a preliminary feasibility on <strong>${address}</strong>,
            please see the report for more details.
          </p>

          <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
            The full feasibility report is attached as a PDF.
          </p>

          <div style="margin-top: 32px; text-align: center;">
            <a href="${siteUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Check out another property
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">
            This report is for informational purposes only and does not constitute financial advice.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Flip-Report-${address.split(",")[0].trim().replace(/\s+/g, "-")}.pdf`,
          content: base64Data,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
