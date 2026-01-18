import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";

type PlanOption = {
  id: "6" | "8";
  label: string;
  price: string;
  per: string;
};

type Product = {
  id: string;
  badge?: string;
  name: string;
  desc: string;
  price: string;
  per?: string;
  highlights: string[];
  planOptions?: PlanOption[];
  defaultPlanId?: PlanOption["id"];
  status: "active" | "soon";
};

export default function ShopPage() {
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // 2 products total (only active)
  const products: Product[] = [
    {
      id: "mama-kratje",
      badge: "8 weken",
      name: "Mama Kratje zonder borstvoeding",
      desc: "Inhoud van de box voor één week, samengesteld om jouw herstel te ondersteunen.",
      price: "€289",
      per: "per 8 weken",
      planOptions: [
        { id: "6", label: "6 weken", price: "€220", per: "per 6 weken" },
        { id: "8", label: "8 weken", price: "€289", per: "per 8 weken" },
      ],
      defaultPlanId: "8",
      highlights: [
        "21 porties fruit, zaden en noten",
        "30 gram eiwit per dag",
        "Power‑shake met 36 soorten groenten (1 portie per dag)",
        "",
      ],
      status: "active",
    },
    {
      id: "mama-kratje-bv",
      badge: "8-9 weken",
      name: "Mama Kratje borstvoeding",
      desc: "",
      price: "€385",
      per: "per 8 weken",
      planOptions: [
        { id: "6", label: "6 weken", price: "€295", per: "per 6 weken" },
        { id: "8", label: "8 weken", price: "€385", per: "per 8 weken" },
      ],
      defaultPlanId: "8",
      highlights: ["50 gram eiwit per dag", "Power‑shake met 36 soorten groenten (1 portie per dag)", "", ],
      status: "active",
    },
  ];

  const [planByProductId, setPlanByProductId] = useState<Record<string, PlanOption["id"]>>(() => {
    const initial: Record<string, PlanOption["id"]> = {};
    products.forEach((p) => {
      if (p.planOptions?.length) {
        const defaultId = p.defaultPlanId ?? p.planOptions[p.planOptions.length - 1]?.id;
        if (defaultId) {
          initial[p.id] = defaultId;
        }
      }
    });
    return initial;
  });

  const active = products.filter((p) => p.status === "active");

  const [checkoutProductId, setCheckoutProductId] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "pay">("details");

  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    postcode: "",
    city: "",
    country: "NL",
  });

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === checkoutProductId) ?? null,
    [checkoutProductId]
  );

  const selectedPlan = useMemo(() => {
    const options = selectedProduct?.planOptions;
    if (!options?.length) {
      return null;
    }
    const fallbackId = selectedProduct?.defaultPlanId ?? options[options.length - 1]?.id ?? options[0]?.id;
    const selectedId = (selectedProduct ? planByProductId[selectedProduct.id] : undefined) ?? fallbackId;
    return options.find((option) => option.id === selectedId) ?? options[0];
  }, [planByProductId, selectedProduct]);

  const summaryPrice = selectedPlan?.price ?? selectedProduct?.price;

  const getPlanForProduct = (product: Product) => {
    const options = product.planOptions;
    if (!options?.length) {
      return null;
    }
    const fallbackId = product.defaultPlanId ?? options[options.length - 1]?.id ?? options[0]?.id;
    const selectedId = planByProductId[product.id] ?? fallbackId;
    return options.find((option) => option.id === selectedId) ?? options[0];
  };

  const togglePlanForProduct = (product: Product) => {
    const options = product.planOptions;
    if (!options?.length) {
      return;
    }
    setPlanByProductId((prev) => {
      const currentId =
        prev[product.id] ??
        product.defaultPlanId ??
        options[options.length - 1]?.id ??
        options[0]?.id;
      const nextId = options.find((option) => option.id !== currentId)?.id ?? currentId;
      return { ...prev, [product.id]: nextId };
    });
  };

  const closeCheckout = () => {
    setCheckoutProductId(null);
    setCheckoutStep("details");
  };

  const startCheckout = (productId: string) => {
    setCheckoutProductId(productId);
    setCheckoutStep("details");
  };

  const priceToCents = (price: string) => {
  // "€289" -> 28900
  const num = Number(price.replace(/[^\d.,]/g, "").replace(",", "."));
  return Math.round(num * 100);
};

const proceedToPay = async () => {
  setPayError(null);
  setIsPaying(true);

  try {
    if (!selectedProduct) throw new Error("Selecteer een product.");

    // 1) price -> cents (ВАЖЛИВО: щоб не було NaN)
    const priceStr = String(selectedProduct.price ?? "");
    const parsed = Number(priceStr.replace(/[^\d.,]/g, "").replace(",", "."));
    const amountCents = Math.round(parsed * 100);

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      throw new Error(`Price parsing failed: "${priceStr}" -> ${amountCents}`);
    }

    // 2) мінімальна валідація
    if (
      !customer.fullName?.trim() ||
      !customer.email?.trim() ||
      !customer.phone?.trim() ||
      !customer.address1?.trim() ||
      !customer.postcode?.trim() ||
      !customer.city?.trim()
    ) {
      throw new Error("Vul alle velden in.");
    }

    // 3) Create order
    const orderPayload = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      amountCents,
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address1: customer.address1,
        postcode: customer.postcode,
        city: customer.city,
        country: customer.country || "NL",
      },
    };

    console.log("ORDER payload", orderPayload);

    const orderRes = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderRes.json().catch(() => ({}));
    console.log("ORDER response", orderRes.status, orderData);

    if (!orderRes.ok) {
      throw new Error(
        `Orders API error (${orderRes.status}): ${orderData?.error || "Unknown"}`
      );
}

    const orderId = orderData?.orderId;
    if (!orderId) throw new Error("Missing orderId from /api/orders/create");

    // 4) Create checkout
    const checkoutRes = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const checkoutData = await checkoutRes.json().catch(() => ({}));
    console.log("CHECKOUT response", checkoutRes.status, checkoutData);

    if (!checkoutRes.ok) {
      throw new Error(checkoutData?.error || "Checkout create failed");
    }

    const checkoutUrl = checkoutData?.checkoutUrl;
    if (!checkoutUrl) throw new Error("Missing checkoutUrl");

    // 5) Redirect
    window.location.href = checkoutUrl;
  } catch (e: any) {
    console.error(e);
    setPayError(e?.message || "Er is iets misgegaan.");
    alert(e?.message || "Er is iets misgegaan.");
    setIsPaying(false);
  }
  {payError ? (
  <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700">
    {payError}
  </div>
) : null}
};
  return (
    <>
      <Head>
        <title>Shop • Kratje Power</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-[var(--bg-1)] pt-24 sm:pt-14">

        {/* Active products */}
        <section className="pb-10">
          <div className="mx-auto max-w-6xl page-pad">

            <div className="grid gap-8 md:grid-cols-2">
              {active.map((p) => {
                const plan = getPlanForProduct(p);
                const displayPrice = plan?.price ?? p.price;
                const isEightWeeks = plan?.id === "8";

                return (
                  <article
                    key={p.id}
                    className="group relative overflow-hidden rounded-[32px] border border-black/10 bg-white p-8 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.07)]"
                  >
                    {/* subtle decorative corner */}
                    <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-black/5" />
                    <div className="absolute top-9 right-4 z-10 flex flex-col items-end text-right sm:right-6">
                      <div className="flex items-center justify-end whitespace-nowrap text-3xl font-black tabular-nums">
                        {displayPrice}
                      </div>
                    </div>

                    <div className="relative flex flex-col gap-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {plan ? (
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => togglePlanForProduct(p)}
                                role="switch"
                                aria-checked={isEightWeeks}
                                aria-label={`Kies ${isEightWeeks ? "8" : "6"} weken`}
                                className={
                                  "relative inline-flex h-8 w-16 items-center rounded-full border border-black/10 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 " +
                                  (isEightWeeks ? "bg-emerald-500/20" : "bg-amber-500/20")
                                }
                              >
                                <span
                                  className={
                                    "relative z-10 h-6 w-6 rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-transform duration-300 " +
                                    (isEightWeeks ? "translate-x-8" : "translate-x-0")
                                  }
                                />
                              </button>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/80">
                                {plan.id} weken
                              </span>
                            </div>
                          ) : null}
                          <h3 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">{p.name}</h3>
                          <p className="mt-2 max-w-xl text-sm text-black/60 sm:text-base">{p.desc}</p>
                        </div>
                      </div>

                      <ul className="space-y-2 text-sm text-black/70">
                        {p.highlights.map((h) => (
                          <li key={h} className="flex gap-2">
                            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-black/40" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="w-full overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                        <Image
                          src="/unknown4.jpeg"
                          alt="Product foto"
                          width={1600}
                          height={900}
                          className="h-auto w-full object-contain"
                          sizes="(min-width: 768px) 50vw, 100vw"
                          priority={false}
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startCheckout(p.id)}
                          className="rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white hover:opacity-90"
                        >
                          Abonneren
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenDetailsId(p.id)}
                          className="rounded-full border border-black/15 bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-black/5"
                        >
                          Bekijk details
                        </button>
                      </div>

                    <p className="text-xs text-black/50">
                      Na aankoop ontvangt u een telefoontje van de manager.{" "}
                      <a
                        href="mailto:info@kratjepower.nl"
                        className="font-semibold text-black/70 underline underline-offset-2 hover:text-black"
                      >
                        info@kratjepower.nl
                      </a>
                    </p>
                    </div>

                    {/* Details overlay (slides in from right) */}
                    <div
                      className={
                        "absolute inset-0 z-[60] rounded-[32px] bg-gradient-to-br from-emerald-500 via-emerald-500 to-emerald-600 p-7 transition-transform duration-500 ease-out shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] text-white " +
                        (openDetailsId === p.id
                          ? "translate-x-0"
                          : "translate-x-full pointer-events-none")
                      }
                    >
                      <div className="flex h-full flex-col">
                        {/* Top bar (always visible) */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold tracking-wide text-white/70">WAT KRIJG JE?</div>
                          <button
                            type="button"
                            onClick={() => setOpenDetailsId(null)}
                            className="text-white/80 hover:text-white"
                            aria-label="Sluit details"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Scrollable content (prevents cut-off on smaller heights) */}
                        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                          <div className="space-y-6">
                            <div>
                              <ul className="mt-3 space-y-2 text-base text-white/90">
                                <li>• Compleet voedingsprogramma op maat</li>
                                <li>• Meer energie en sneller herstel</li>
                                <li>• Tijd besparen door een duidelijk plan</li>
                                <li>• Een sterke basis voor jouw gezondheid</li>
                              </ul>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-white">Waarom dit de slimme keuze is:</h3>
                              <p className="mt-3 text-base leading-relaxed text-white/85">
                                Losse supplementen uitzoeken? Dat kost je niet alleen het dubbele, maar ook eindeloos veel tijd en twijfel.
                                Weet je wel zeker dat je de juiste keuzes maakt?
                              </p>
                              <p className="mt-3 text-base leading-relaxed text-white/85">
                                Met dit programma heb je alles in één pakket. Voor minder dan wat je uitgeeft aan een dagelijkse koffie to-go,
                                investeer je in iets dat echt verschil maakt: jouw welzijn en herstel.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom CTA (always visible) */}
                        <div className="pt-5">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDetailsId(null);
                              startCheckout(p.id);
                            }}
                            className="w-full rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white hover:opacity-90"
                          >
                            Abonneren
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>


        {/* Checkout modal */}
        {selectedProduct ? (
          <>
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Sluit checkout"
              onClick={closeCheckout}
              className="fixed inset-0 z-[80] cursor-default bg-black/40"
            />

            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.22)]">
                <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
                  <div>
                    <div className="text-xs font-semibold tracking-wide text-black/60">CHECKOUT</div>
                    <div className="mt-1 text-xl font-black">{selectedProduct.name}</div>
                  </div>

                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black/5"
                    aria-label="Sluiten"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-0 md:grid-cols-[1fr_320px]">
                  {/* Left: steps */}
                  <div className="min-h-0 px-6 py-6">
                    {checkoutStep === "details" ? (
                      <>
                        <h3 className="text-lg font-bold">Jouw gegevens</h3>
                        <p className="mt-2 text-sm text-black/60">
                          Vul je gegevens in. Daarna ga je door naar betalen (kaart, Apple Pay, Google Pay).
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <input
                            className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none focus:border-black/30"
                            placeholder="Naam en achternaam"
                            value={customer.fullName}
                            onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                          />
                          <input
                            className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none focus:border-black/30"
                            placeholder="E-mail"
                            type="email"
                            value={customer.email}
                            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                          />
                          <input
                            className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none focus:border-black/30"
                            placeholder="Telefoonnummer"
                            type="tel"
                            autoComplete="tel"
                            value={customer.phone}
                            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                          />
                          <input
                            className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none focus:border-black/30"
                            placeholder="Adres"
                            value={customer.address1}
                            onChange={(e) => setCustomer({ ...customer, address1: e.target.value })}
                          />
                          <input
                            className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none focus:border-black/30"
                            placeholder="Postcode"
                            value={customer.postcode}
                            onChange={(e) => setCustomer({ ...customer, postcode: e.target.value })}
                          />
                          <input
                            className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none focus:border-black/30"
                            placeholder="Plaats"
                            value={customer.city}
                            onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                          />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={closeCheckout}
                            className="rounded-full border border-black/15 bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-black/5"
                          >
                            Terug
                          </button>
                          <button
                            type="button"
                            onClick={proceedToPay}
                            disabled={isPaying}
                            className={
                              "rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white hover:opacity-90 " +
                              (isPaying ? "opacity-60 cursor-not-allowed" : "")
                            }
                          >
                            {isPaying ? "Even wachten..." : "Ga door naar betalen →"}
                          </button>
                        </div>
                        {payError ? (
                          <div className="mt-3 text-sm font-medium text-red-600">
                            {payError}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold">Betalen</h3>
                        <p className="mt-2 text-sm text-black/60">
                          Volgende stap: we koppelen dit aan Stripe zodat je kunt betalen met kaart, Apple Pay en Google Pay.
                        </p>

                        <div className="mt-5 rounded-3xl border border-black/10 bg-[var(--bg-1)] p-5">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70">
                              Card
                            </span>
                            <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70">
                              Apple Pay
                            </span>
                            <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70">
                              Google Pay
                            </span>
                          </div>

                          <div className="mt-4 rounded-2xl border border-dashed border-black/20 bg-white p-5 text-sm text-black/60">
                            Payment form komt hier (Stripe Payment Element / Express Checkout).
                          </div>

                          <button
                            type="button"
                            className="mt-4 w-full rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white hover:opacity-90"
                            onClick={() => alert('Stripe koppelen in de volgende stap')}
                          >
                            Betaal veilig
                          </button>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setCheckoutStep("details")}
                            className="rounded-full border border-black/15 bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-black/5"
                          >
                            ← Terug
                          </button>
                          <button
                            type="button"
                            onClick={closeCheckout}
                            className="rounded-full border border-black/15 bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-black/5"
                          >
                            Sluit
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: summary */}
                  <div className="border-t border-black/10 bg-white/60 px-6 py-6 md:border-l md:border-t-0">
                    <h4 className="text-sm font-semibold tracking-wide text-black/60">OVERZICHT</h4>

                    <div className="mt-4 rounded-3xl border border-black/10 bg-white p-5">
                      <div className="text-base font-bold">{selectedProduct.name}</div>
                      <div className="mt-1 text-sm text-black/60">{selectedProduct.desc}</div>

                      <div className="mt-4 flex items-baseline justify-between">
                        <div className="text-sm text-black/60">Prijs</div>
                        <div className="text-xl font-black tabular-nums">{summaryPrice}</div>
                      </div>

                      <div className="mt-4 border-t border-black/10 pt-4">
                        <div className="text-xs font-semibold tracking-wide text-black/60">INCLUSIEF</div>
                        <ul className="mt-2 space-y-2 text-sm text-black/70">
                          {selectedProduct.highlights.slice(0, 4).map((h) => (
                            <li key={h} className="flex gap-2">
                              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-black/40" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-black/50">
                      Let op: Apple Pay/Google Pay vereisen HTTPS en (bij Stripe Elements/Express) domeinregistratie. 
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
      {/* Footer */}
      <footer className="bg-[var(--bg-1)] pb-6">
        <div className="mx-auto max-w-6xl page-pad">
          <div className="mt-10 border-t border-black/10 pt-8">
            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <div
                  className="text-2xl font-black tracking-tight"
                  style={{ fontFamily: "ui-serif, Georgia, serif" }}
                >
                  KRATJE POWER
                </div>
                <p className="mt-2 max-w-md text-sm text-black/60 leading-relaxed">
                  We ondersteunen mama’s herstel met wekelijkse boxen vol verse producten en vitamines.
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-black/10 pt-6 pb-4">
              <p className="text-xs text-black/50">
                © {new Date().getFullYear()} Kratje Power. Alle rechten voorbehouden.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
