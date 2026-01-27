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
      name: "Mama Kratje – zónder borstvoeding",
      desc: "Herstel, energie en overzicht in een periode waarin alles nieuw is.",
      price: "€289",
      per: "per 8 weken",
      planOptions: [
        { id: "6", label: "6 weken", price: "€220", per: "per 6 weken" },
        { id: "8", label: "8 weken", price: "€289", per: "per 8 weken" },
      ],
      defaultPlanId: "8",
      highlights: [
        "21 porties fruit, zaden en noten voor natuurlijke energie, vezels en gezonde vetten",
        "Een dagelijkse power-shake met 36 soorten groenten, ter aanvulling van je voeding",
        "30 gram eiwit per dag, ter ondersteuning van spierherstel en kracht",
      ],
      status: "active",
    },
    {
      id: "mama-kratje-bv",
      badge: "8-9 weken",
      name: "Mama Kratje – mét borstvoeding",
      desc: "Extra voeding voor een lichaam dat meer geeft dan ooit.",
      price: "€385",
      per: "per 8 weken",
      planOptions: [
        { id: "6", label: "6 weken", price: "€295", per: "per 6 weken" },
        { id: "8", label: "8 weken", price: "€385", per: "per 8 weken" },
      ],
      defaultPlanId: "8",
      highlights: [
        "Een dagelijkse power-shake met 36 soorten groenten",
        "50 gram eiwit per dag, afgestemd op de verhoogde behoefte tijdens borstvoeding",
        "Voeding die helpt om je energie op peil te houden en tekorten te voorkomen",
      ],
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
                      <div className="flex items-center justify-end gap-6 whitespace-nowrap text-3xl font-black tabular-nums">
                        <Image
                          src="/logo.png"
                          alt="Kratje Power logo"
                          width={38}
                          height={38}
                          sizes="38px"
                          className="h-9 w-9 -ml-2.5"
                        />
                        {displayPrice}
                      </div>
                    </div>

                    <div className="relative flex flex-col gap-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-full">
                          {plan ? (
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => togglePlanForProduct(p)}
                                role="switch"
                                aria-checked={isEightWeeks}
                                aria-label={`Kies ${isEightWeeks ? "8" : "6"} weken`}
                                className={
                                  "relative inline-flex h-12 w-56 items-center overflow-hidden rounded-full border border-black/15 bg-white p-1 text-sm font-semibold tracking-[0.12em] text-black/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                                }
                              >
                                <span
                                  className={
                                    "absolute inset-0 left-0 z-0 w-1/2 shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-transform duration-300 " +
                                    (isEightWeeks
                                      ? "translate-x-full bg-emerald-200/70 rounded-r-full rounded-l-none"
                                      : "translate-x-0 bg-amber-200/80 rounded-l-full rounded-r-none")
                                  }
                                />
                                <span
                                  aria-hidden
                                  className="absolute left-1/2 top-0 bottom-0 z-10 w-px -translate-x-1/2 bg-black/10"
                                />
                                <span
                                  className={
                                    "relative z-10 flex-1 text-center " +
                                    (isEightWeeks ? "text-black/60" : "text-black")
                                  }
                                >
                                  6 weken
                                </span>
                                <span
                                  className={
                                    "relative z-10 flex-1 text-center " +
                                    (isEightWeeks ? "text-black" : "text-black/60")
                                  }
                                >
                                  8 weken
                                </span>
                              </button>
                              <div className="flex items-center gap-2">
                              </div>
                            </div>
                          ) : null}
                          {p.id === "mama-kratje" ? (
                            <div className="mt-4 space-y-5">
                              <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
                                Mama Kratje – zónder borstvoeding
                              </h3>
                              <div className="space-y-3 text-sm leading-relaxed text-black/70">
                                <p>Herstel, energie en overzicht in een periode waarin alles nieuw is.</p>
                                <p>
                                  Na de bevalling is je lichaam aan het herstellen. Ook zonder borstvoeding vraagt dat
                                  veel van je energie, reserves en focus. Dit Mama Kratje is samengesteld om je
                                  dagelijks te ondersteunen met voedzame basis, zonder dat je hoeft na te denken over
                                  wat je nodig hebt.
                                </p>
                              </div>

                              <div className="space-y-3">
                                <p className="text-sm font-semibold text-black">De box bevat onder andere:</p>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-black/70">
                                  <li>
                                    21 porties fruit, zaden en noten voor natuurlijke energie, vezels en gezonde vetten
                                  </li>
                                  <li>Een dagelijkse power-shake met 36 soorten groenten, ter aanvulling van je voeding</li>
                                  <li>30 gram eiwit per dag, ter ondersteuning van spierherstel en kracht</li>
                                </ul>
                              </div>

                              <div className="space-y-3 text-sm leading-relaxed text-black/70">
                                <p>Alles is vooraf afgestemd en in porties verdeeld.</p>
                                <p>
                                  Niet om perfect te eten, maar om elke dag genoeg binnen te krijgen, ook als je hoofd
                                  vol zit en je tijd tekortkomt.
                                </p>
                                <p>Dit kratje geeft structuur, rust en ondersteuning in je herstel — op een haalbare manier.</p>
                              </div>
                            </div>
                          ) : p.id === "mama-kratje-bv" ? (
                            <div className="mt-4 space-y-5">
                              <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
                                Mama Kratje – mét
                                <span className="block">borstvoeding</span>
                              </h3>
                              <div className="space-y-3 text-sm leading-relaxed text-black/70">
                                <p>Extra voeding voor een lichaam dat meer geeft dan ooit.</p>
                                <p>
                                  Borstvoeding geven betekent dat je lichaam dagelijks extra energie en voedingsstoffen
                                  verbruikt. Dit Mama Kratje is speciaal samengesteld voor mama’s die borstvoeding geven
                                  en daarom meer nodig hebben dan alleen basisvoeding.
                                </p>
                              </div>

                              <div className="space-y-3">
                                <p className="text-sm font-semibold text-black">De box ondersteunt je met:</p>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-black/70">
                                  <li>Een dagelijkse power-shake met 36 soorten groenten</li>
                                  <li>
                                    50 gram eiwit per dag, afgestemd op de verhoogde behoefte tijdens borstvoeding
                                  </li>
                                  <li>Voeding die helpt om je energie op peil te houden en tekorten te voorkomen</li>
                                </ul>
                              </div>

                              <div className="space-y-3 text-sm leading-relaxed text-black/70">
                                <p>Je hoeft niets te berekenen of zelf samen te stellen.</p>
                                <p>
                                  De hoeveelheden zijn afgestemd op deze fase, zodat je lichaam krijgt wat het vraagt —
                                  zonder overbelasting.
                                </p>
                                <p>
                                  Dit kratje ondersteunt niet alleen je herstel, maar ook je draagkracht in een
                                  intensieve periode.
                                </p>
                              </div>
                            </div>
                          ) : p.id === "mama-kratje-bv" ? (
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-white">Mama Kratje – mét borstvoeding</h3>
                                <div className="space-y-3 text-base leading-relaxed text-white/85">
                                  <p>Extra voeding voor een lichaam dat meer geeft dan ooit.</p>
                                  <p>
                                    Borstvoeding geven betekent dat je lichaam dagelijks extra energie en
                                    voedingsstoffen verbruikt. Dit Mama Kratje is speciaal samengesteld voor mama’s die
                                    borstvoeding geven en daarom meer nodig hebben dan alleen basisvoeding.
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">De box ondersteunt je met:</h3>
                                <ul className="list-disc space-y-1 pl-5 text-base text-white/85">
                                  <li>Een dagelijkse power-shake met 36 soorten groenten</li>
                                  <li>
                                    50 gram eiwit per dag, afgestemd op de verhoogde behoefte tijdens borstvoeding
                                  </li>
                                  <li>Voeding die helpt om je energie op peil te houden en tekorten te voorkomen</li>
                                </ul>
                              </div>

                              <div className="space-y-3 text-base leading-relaxed text-white/85">
                                <p>Je hoeft niets te berekenen of zelf samen te stellen.</p>
                                <p>
                                  De hoeveelheden zijn afgestemd op deze fase, zodat je lichaam krijgt wat het vraagt —
                                  zonder overbelasting.
                                </p>
                                <p>
                                  Dit kratje ondersteunt niet alleen je herstel, maar ook je draagkracht in een
                                  intensieve periode.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">{p.name}</h3>
                              <p className="mt-2 max-w-xl text-sm text-black/60 sm:text-base">{p.desc}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {p.id === "mama-kratje" || p.id === "mama-kratje-bv" ? null : (
                        <ul className="space-y-2 text-sm text-black/70">
                          {p.highlights.map((h) => (
                            <li key={h} className="flex gap-2">
                              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-black/40" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="w-full overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                        <Image
                          src="/product.jpg"
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
                          {p.id === "mama-kratje" ? (
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-white">
                                  Mama Kratje – zónder borstvoeding
                                </h3>
                                <div className="space-y-3 text-base leading-relaxed text-white/85">
                                  <p>Herstel, energie en overzicht in een periode waarin alles nieuw is.</p>
                                  <p>
                                    Na de bevalling is je lichaam aan het herstellen. Ook zonder borstvoeding vraagt dat
                                    veel van je energie, reserves en focus. Dit Mama Kratje is samengesteld om je
                                    dagelijks te ondersteunen met voedzame basis, zonder dat je hoeft na te denken over
                                    wat je nodig hebt.
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">De box bevat onder andere:</h3>
                                <ul className="list-disc space-y-1 pl-5 text-base text-white/85">
                                  <li>
                                    21 porties fruit, zaden en noten voor natuurlijke energie, vezels en gezonde vetten
                                  </li>
                                  <li>Een dagelijkse power-shake met 36 soorten groenten, ter aanvulling van je voeding</li>
                                  <li>30 gram eiwit per dag, ter ondersteuning van spierherstel en kracht</li>
                                </ul>
                              </div>

                              <div className="space-y-3 text-base leading-relaxed text-white/85">
                                <p>Alles is vooraf afgestemd en in porties verdeeld.</p>
                                <p>
                                  Niet om perfect te eten, maar om elke dag genoeg binnen te krijgen, ook als je hoofd
                                  vol zit en je tijd tekortkomt.
                                </p>
                                <p>Dit kratje geeft structuur, rust en ondersteuning in je herstel — op een haalbare manier.</p>
                              </div>
                            </div>
                          ) : p.id === "mama-kratje-bv" ? (
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-white">Mama Kratje – mét borstvoeding</h3>
                                <div className="space-y-3 text-base leading-relaxed text-white/85">
                                  <p>Extra voeding voor een lichaam dat meer geeft dan ooit.</p>
                                  <p>
                                    Borstvoeding geven betekent dat je lichaam dagelijks extra energie en
                                    voedingsstoffen verbruikt. Dit Mama Kratje is speciaal samengesteld voor mama’s die
                                    borstvoeding geven en daarom meer nodig hebben dan alleen basisvoeding.
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">De box ondersteunt je met:</h3>
                                <ul className="list-disc space-y-1 pl-5 text-base text-white/85">
                                  <li>Een dagelijkse power-shake met 36 soorten groenten</li>
                                  <li>
                                    50 gram eiwit per dag, afgestemd op de verhoogde behoefte tijdens borstvoeding
                                  </li>
                                  <li>Voeding die helpt om je energie op peil te houden en tekorten te voorkomen</li>
                                </ul>
                              </div>

                              <div className="space-y-3 text-base leading-relaxed text-white/85">
                                <p>Je hoeft niets te berekenen of zelf samen te stellen.</p>
                                <p>
                                  De hoeveelheden zijn afgestemd op deze fase, zodat je lichaam krijgt wat het vraagt —
                                  zonder overbelasting.
                                </p>
                                <p>
                                  Dit kratje ondersteunt niet alleen je herstel, maar ook je draagkracht in een
                                  intensieve periode.
                                </p>
                              </div>
                            </div>
                          ) : (
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
                                  Losse supplementen uitzoeken? Dat kost je niet alleen het dubbele, maar ook eindeloos
                                  veel tijd en twijfel. Weet je wel zeker dat je de juiste keuzes maakt?
                                </p>
                                <p className="mt-3 text-base leading-relaxed text-white/85">
                                   Met dit programma heb je alles in één pakket. Voor minder dan wat je uitgeeft aan een
                                  dagelijkse koffie to-go, investeer je in iets dat echt verschil maakt: jouw welzijn
                                  en herstel.
                                </p>
                              </div>
                            </div>
                          )}
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
                  </article >
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

            <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
              <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.22)] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]">
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

                <div className="min-h-0 flex-1 overflow-y-auto">
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
