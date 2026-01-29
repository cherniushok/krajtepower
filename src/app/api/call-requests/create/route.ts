import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const MIN_PHONE_LENGTH = 9;
const MAX_PHONE_LENGTH = 12;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const phone = typeof body?.phone === "string" ? body.phone : "";

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < MIN_PHONE_LENGTH || phoneDigits.length > MAX_PHONE_LENGTH) {
    return NextResponse.json({ error: "Ongeldig telefoonnummer." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("call_requests")
    .upsert(
      {
        phone: phoneDigits,
        source: typeof body?.source === "string" ? body.source : "header",
      },
      { onConflict: "phone", ignoreDuplicates: true }
    );

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
