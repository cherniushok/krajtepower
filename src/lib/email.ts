import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

const smtpHost = process.env.SMTP_HOST ?? "";
const smtpPort = Number(process.env.SMTP_PORT ?? "");
const smtpUser = process.env.SMTP_USER ?? "";
const smtpPass = process.env.SMTP_PASS ?? "";
const mailFrom = process.env.MAIL_FROM ?? "";
const mailReplyTo = process.env.MAIL_REPLY_TO ?? "";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) return null;
  if (!transporter) {
    const secure =
      String(process.env.SMTP_SECURE ?? "").toLowerCase() === "true" ||
      smtpPort === 465;

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return transporter;
}

export async function sendEmail(payload: EmailPayload) {
  const transport = getTransporter();
  if (!transport || !mailFrom) {
    return {
      skipped: true,
      reason: "Missing SMTP config or MAIL_FROM",
    } as const;
  }

  const info = await transport.sendMail({
    from: mailFrom,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    replyTo: payload.replyTo ?? mailReplyTo ?? undefined,
  });

  return { ok: true, messageId: info.messageId } as const;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(amountCents?: number | null, currency?: string | null) {
  if (!amountCents || !currency) return "";
  const amount = amountCents / 100;
  const normalized = currency.toUpperCase();

  try {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: normalized,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${normalized}`;
  }
}

type PaidEmailInput = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  addressLine?: string | null;
  productName?: string | null;
  amountCents?: number | null;
  currency?: string | null;
  receiptUrl?: string | null;
};

export function buildPaidEmail(input: PaidEmailInput) {
  const amount = formatMoney(input.amountCents ?? null, input.currency ?? null);
  const lines = [
    "Дякуємо за оплату!",
    "",
    `Товар: ${input.productName || "-"}`,
    amount ? `Сума: ${amount}` : null,
    `Ім'я: ${input.name || "-"}`,
    `Телефон: ${input.phone || "-"}`,
    `Email: ${input.email || "-"}`,
    `Адреса: ${input.addressLine || "-"}`,
    input.receiptUrl ? `Чек: ${input.receiptUrl}` : null,
    "",
    "Якщо у вас є питання, відповідайте на цей лист.",
  ].filter(Boolean) as string[];

  const safe = {
    name: escapeHtml(input.name || "-"),
    phone: escapeHtml(input.phone || "-"),
    email: escapeHtml(input.email || "-"),
    addressLine: escapeHtml(input.addressLine || "-"),
    productName: escapeHtml(input.productName || "-"),
    amount: escapeHtml(amount || "-"),
    receiptUrl: input.receiptUrl ? escapeHtml(input.receiptUrl) : "",
  };

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      <h2 style="margin:0 0 12px;">Дякуємо за оплату!</h2>
      <p style="margin:0 0 12px;">Нижче деталі вашого замовлення:</p>
      <ul style="padding-left:18px;margin:0 0 12px;">
        <li><strong>Товар:</strong> ${safe.productName}</li>
        ${amount ? `<li><strong>Сума:</strong> ${safe.amount}</li>` : ""}
        <li><strong>Ім'я:</strong> ${safe.name}</li>
        <li><strong>Телефон:</strong> ${safe.phone}</li>
        <li><strong>Email:</strong> ${safe.email}</li>
        <li><strong>Адреса:</strong> ${safe.addressLine}</li>
        ${safe.receiptUrl ? `<li><strong>Чек:</strong> <a href="${safe.receiptUrl}">Переглянути</a></li>` : ""}
      </ul>
      <p style="margin:0;">Якщо у вас є питання, відповідайте на цей лист.</p>
    </div>
  `
    .replace(/\n\s+/g, "\n")
    .trim();

  return {
    subject: "Ваш чек та деталі замовлення",
    text: lines.join("\n"),
    html,
  };
}

type AbandonedEmailInput = {
  name?: string | null;
  email?: string | null;
  productName?: string | null;
  continueUrl: string;
};

export function buildAbandonedEmail(input: AbandonedEmailInput) {
  const lines = [
    "Ваше замовлення ще не завершено.",
    "",
    `Товар: ${input.productName || "-"}`,
    `Посилання для продовження: ${input.continueUrl}`,
    "",
    "Якщо ви не робили це замовлення, просто проігноруйте лист.",
  ];

  const safe = {
    name: escapeHtml(input.name || ""),
    productName: escapeHtml(input.productName || "-"),
    continueUrl: escapeHtml(input.continueUrl),
  };

  const greeting = safe.name ? `<p style="margin:0 0 12px;">Привіт, ${safe.name}!</p>` : "";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      ${greeting}
      <p style="margin:0 0 12px;">Ваше замовлення ще не завершено.</p>
      <p style="margin:0 0 12px;"><strong>Товар:</strong> ${safe.productName}</p>
      <p style="margin:0 0 16px;">Щоб продовжити, перейдіть за посиланням:</p>
      <p style="margin:0 0 16px;"><a href="${safe.continueUrl}">${safe.continueUrl}</a></p>
      <p style="margin:0;">Якщо ви не робили це замовлення, просто проігноруйте лист.</p>
    </div>
  `
    .replace(/\n\s+/g, "\n")
    .trim();

  return {
    subject: "Незавершене замовлення",
    text: lines.join("\n"),
    html,
  };
}
