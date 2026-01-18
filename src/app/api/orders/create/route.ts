import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const { productId, productName, amountCents, customer } = body ?? {};

  if (!productId || !productName || !amountCents || !customer) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { fullName, email, phone, address1, postcode, city, country } = customer;

  if (!fullName || !email || !phone || !address1 || !postcode || !city) {
    return NextResponse.json({ error: "Fill all fields" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      status: "draft",
      product_id: productId,
      product_name: productName,
      amount_cents: amountCents,
      currency: "eur",
      full_name: fullName,
      email,
      phone,
      address1,
      postcode,
      city,
      country: country || "NL",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ orderId: data.id });
}