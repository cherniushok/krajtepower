"use client";
import Header from "@/components/Header";
import Link from "next/link";

export default function OverOnsPage() {
  const baseCard =
    "rounded-3xl border border-black/10 bg-white shadow-sm transition hover:shadow-md";
  const softCard =
    "rounded-3xl border border-black/10 bg-black/5 shadow-sm transition hover:shadow-md";
  const pill =
    "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-black/70 shadow-sm";

  return (
    <>
      <Header />

      <div className="[--page-pad:clamp(20px,6vw,32px)] sm:[--page-pad:clamp(16px,4vw,32px)]">
        <main className="relative overflow-hidden">

          <div className="relative mx-auto max-w-6xl page-pad py-10">
            {/* Title + intro */}
            <header
              className="text-center"
              style={{ backgroundColor: "transparent", boxShadow: "none" }}
            >
            </header>

            {/* Main card */}
            <section className="mt-10">
              <div className="grid gap-10 md:grid-cols-12 md:items-start">
                {/* Left: story */}
                <div className="md:col-span-7">
                  <h2 className="text-2xl font-semibold tracking-tight">Wie zijn wij?</h2>

                  <div className="mt-5 space-y-4 text-black/70 leading-relaxed text-[15px] md:text-base">
                    <p>
                      Bij <span className="font-semibold text-black">Kratje Power</span> geloven we dat het herstel van een
                      moeder na de bevalling net zo belangrijk is als de zorg voor haar baby. Toch wordt dit herstel vaak
                      onderschat. De aandacht gaat vooral uit naar het kind, terwijl het lichaam en de energie van de moeder
                      op de achtergrond raken.
                    </p>

                    <p>Wij willen dat veranderen.</p>

                    <p>
                      Onze missie is om moeders te laten voelen dat hún herstel ertoe doet. Een goed, bewust herstel vraagt
                      tijd, rust en de juiste ondersteuning — met voldoende eiwitten, vitamines en voedingsstoffen die het
                      lichaam helpen weer op kracht te komen.
                    </p>

                    <p>
                      <span className="font-semibold text-black">Kratje Power</span> ondersteunt moeders gedurende het hele
                      herstelproces na de bevalling. Elke week ontvangt de mama een zorgvuldig samengesteld box met verse
                      fruit, vitamines en andere producten die bijdragen aan een sneller en gezonder herstel. Deze box is
                      bedoeld als ondersteuning en aanvulling, niet als hoofdmaaltijd, maar als een liefdevolle extra zorg
                      voor het lichaam dat zoveel heeft gegeven.
                    </p>

                    <p>
                      Wij staan naast de moeder in deze bijzondere, maar ook intensieve periode. Met aandacht, kwaliteit en
                      oprechte zorg helpen we haar stap voor stap terug in balans te komen — fysiek én mentaal.
                    </p>

                    <p className="font-medium text-black">Omdat een sterke moeder begint bij goed herstel.</p>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                    >
                      Bekijk de boxen
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("open-header-menu", { detail: { focus: "phone" } }));
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                    >
                      Contact opnemen
                    </button>
                  </div>
                </div>

                {/* Right: highlight cards */}
                <aside className="md:col-span-5">
                  <div className="grid gap-4">
                    <div className={softCard + " p-6"}>
                      <h3 className="text-sm font-semibold text-black">Onze garanties</h3>
                      <p className="mt-2 text-sm text-black/70 leading-relaxed">
                        Wekelijkse ondersteuning en levering van producten met de nadruk op herstel, energie en evenwicht. Zonder druk, maar met zorg. 
                      </p>
                    </div>

                    <div className={baseCard + " p-6"}>
                      <h3 className="text-sm font-semibold text-black">Wat zit er in de box?</h3>
                      <ul className="mt-3 space-y-2 text-sm text-black/70">
                        <li className="flex gap-2">
                          <span aria-hidden>🍍</span>
                          <span>Verse fruit (wekelijks wisselend)</span>
                        </li>
                        <li className="flex gap-2">
                          <span aria-hidden>💊</span>
                          <span>Vitamines & supplementen (als ondersteuning)</span>
                        </li>
                        <li className="flex gap-2">
                          <span aria-hidden>💪</span>
                          <span>Producten gericht op herstel en energie</span>
                        </li>
                        <li className="flex gap-2">
                          <span aria-hidden>🧡</span>
                          <span>Een liefdevolle reminder: jij telt ook mee</span>
                        </li>
                      </ul>
                      <p className="mt-4 text-xs text-black/50 leading-relaxed">
                        * De box is een aanvulling en ondersteuning, geen vervanging van volledige maaltijden.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>

            
            {/* Footer */}
            <div className="mt-10 h-px w-full bg-black/10" />
            <footer className="mt-10">
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

              <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-black/50">© {new Date().getFullYear()} Kratje Power. Alle rechten voorbehouden.</p>
              </div>
            </footer>
              
          </section>
          </div>
        </main>
      </div>
    </>
  );
}
