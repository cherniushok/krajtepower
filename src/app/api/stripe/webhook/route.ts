import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function formatAddress(address?: {
  city?: string | null;
  postal_code?: string | null;
  line1?: string | null;
  line2?: string | null;
}) {
  if (!address) return "";
  const line = [address.line1, address.line2].filter(Boolean).join(" ");
  return [address.city, address.postal_code, line].filter(Boolean).join(", ");
}

async function sendTelegramNotification(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { skipped: true, reason: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID" };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_web_page_preview: true,
    }),
  });

  return { ok: res.ok, status: res.status };
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;
    const orderId = session?.metadata?.orderId;
    const paymentStatus = session?.payment_status;

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    let receiptUrl: string | null = null;

    if (paymentIntentId) {
      const charges = await stripe.charges.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });

      receiptUrl = charges.data?.[0]?.receipt_url ?? null;
    }

    if (orderId) {
      await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id: paymentIntentId ?? null,
          stripe_receipt_url: receiptUrl,
        })
        .eq("id", orderId);
    }

    if (paymentStatus === "paid") {
      let orderDetails:
        | {
            full_name?: string | null;
            email?: string | null;
            phone?: string | null;
            address1?: string | null;
            postcode?: string | null;
            city?: string | null;
          }
        | null = null;

      if (orderId) {
        const { data, error } = await supabaseAdmin
          .from("orders")
          .select("full_name, email, phone, address1, postcode, city")
          .eq("id", orderId)
          .single();

        if (!error) {
          orderDetails = data ?? null;
        }
      }

      const name =
        orderDetails?.full_name ?? session?.customer_details?.name ?? null;
      const phone =
        orderDetails?.phone ?? session?.customer_details?.phone ?? null;
      const email =
        orderDetails?.email ?? session?.customer_details?.email ?? null;

      const addressLine =
        orderDetails
          ? [orderDetails.city, orderDetails.postcode, orderDetails.address1]
              .filter(Boolean)
              .join(", ")
          : formatAddress(session?.customer_details?.address);

      const message = [
        "Status: Paid ☑️",
        `Name: ${name || "-"}`,
        `Phone number: ${phone || "-"}`,
        `Email: ${email || "-"}`,
        `City, postal code, address: ${addressLine || "-"}`,
      ].join("\n");

      try {
        await sendTelegramNotification(message);
      } catch (err) {
        console.error("Telegram notify failed", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
