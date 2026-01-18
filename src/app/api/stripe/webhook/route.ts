import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

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
  }

  return NextResponse.json({ received: true });
}