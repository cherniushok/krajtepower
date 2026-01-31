import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildAbandonedEmail, sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const header = req.headers.get("x-cron-secret") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const token = header || auth.replace(/^Bearer\s+/i, "");

  return token === secret;
}

async function handler(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - ONE_DAY_MS).toISOString();
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, email, full_name, product_name, created_at, status, abandoned_email_sent_at"
    )
    .lte("created_at", cutoff)
    .is("abandoned_email_sent_at", null)
    .not("status", "eq", "paid")
    .not("email", "is", null)
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://kratjepower.nl";

  let sent = 0;
  let skipped = 0;

  for (const order of orders ?? []) {
    const email = order.email?.toString().trim();
    if (!email) {
      skipped += 1;
      continue;
    }

    const continueUrl = `${origin}/continue?orderId=${order.id}`;
    const emailPayload = buildAbandonedEmail({
      name: order.full_name ?? null,
      email,
      productName: order.product_name ?? null,
      continueUrl,
    });

    try {
      const result = await sendEmail({
        to: email,
        subject: emailPayload.subject,
        text: emailPayload.text,
        html: emailPayload.html,
      });

      if ("ok" in result && result.ok) {
        sent += 1;
        await supabaseAdmin
          .from("orders")
          .update({ abandoned_email_sent_at: new Date().toISOString() })
          .eq("id", order.id);
      } else {
        skipped += 1;
      }
    } catch (err) {
      console.error("Abandoned email send failed", err);
      skipped += 1;
    }
  }

  return NextResponse.json({
    processed: orders?.length ?? 0,
    sent,
    skipped,
    cutoff,
  });
}

export const GET = handler;
export const POST = handler;
