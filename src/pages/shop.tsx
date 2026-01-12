import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";

type Product = {
  id: string;
  badge?: string;
  name: string;
  desc: string;
  price: string;
  per?: string;
  highlights: string[];
  status: "active" | "soon";
};

export default function ShopPage() {
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);

  // 2 products total (only active)
  const products: Product[] = [
    {
      id: "mama-kratje",
      badge: "8 weken",
      name: "Mama Kratje zonder borstvoeding",
      desc: "Inhoud van de box voor één week, samengesteld om jouw herstel te ondersteunen.",
      price: "€289",
      per: "per 8 weken",
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
      highlights: ["50 gram eiwit per dag", "Power‑shake met 36 soorten groenten (1 portie per dag)", "", ],
      status: "active",
    },
  ];

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

  const closeCheckout = () => {
    setCheckoutProductId(null);
    setCheckoutStep("details");
  };

  const startCheckout = (productId: string) => {
    setCheckoutProductId(productId);
    setCheckoutStep("details");
  };

  const proceedToPay = async () => {
    // In the next step we wire this to Stripe Checkout / Payment Element.
    // For now we just move to the “pay” screen.
    setCheckoutStep("pay");
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
          <div className="mx-auto max-w-6xl px-5 sm:px-6">

            <div className="grid gap-8 md:grid-cols-2">
              {active.map((p) => (
                <article
                  key={p.id}
                  className="group relative overflow-hidden rounded-[32px] border border-black/10 bg-white p-8 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.07)]"
                >
                  {/* subtle decorative corner */}
                  <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-black/5" />
                  <div className="absolute top-8 right-8 z-10 flex flex-col items-end text-right">
                    <div className="flex items-center justify-end whitespace-nowrap text-3xl font-black tabular-nums">
                      {p.price}
                    </div>
                    {p.per ? <div className="text-xs text-black/50">{p.per}</div> : null}
                  </div>

                  <div className="relative flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {p.badge ? (
                          <div className="inline-flex rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
                            {p.badge}
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
                      Na aankoop ontvangt u een telefoontje van de manager.
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
              ))}
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
                            className="rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white hover:opacity-90"
                          >
                            Ga door naar betalen →
                          </button>
                        </div>
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
                        <div className="text-xl font-black tabular-nums">{selectedProduct.price}</div>
                      </div>
                      {selectedProduct.per ? (
                        <div className="mt-1 text-right text-xs text-black/50">{selectedProduct.per}</div>
                      ) : null}

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
        <div className="mx-auto max-w-6xl px-6">
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