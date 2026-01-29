import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const amountCents = Number(order.amount_cents);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const currency = (order.currency || "eur").toLowerCase();

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://kratjepower.nl";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.email || undefined,
    billing_address_collection: "auto",

    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amountCents,
          product_data: { name: order.product_name },
        },
      },
    ],

    metadata: { orderId: order.id },

    success_url: `${origin}/betaling-gelukt?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop?canceled=1`,
  });

  await supabaseAdmin
    .from("orders")
    .update({
      status: "checkout_created",
      stripe_checkout_session_id: session.id,
    })
    .eq("id", order.id);

  if (!session.url) {
    return NextResponse.json({ error: "Stripe session missing URL" }, { status: 500 });
  }

  return NextResponse.json({ checkoutUrl: session.url });
}
