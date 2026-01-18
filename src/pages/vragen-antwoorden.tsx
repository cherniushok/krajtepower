import React from "react";
import Header from "@/components/Header";

const FAQ = [
  {
    q: "Hoe werkt de bestelling?",
    a: "Je kiest de box die bij je past, laat je gegevens achter via de website en wij nemen persoonlijk contact met je op om alles af te stemmen.",
  },
  {
    q: "In welke regio’s leveren jullie?",
    a: "Op dit moment leveren wij binnen Nederland. De exacte levergebieden worden tijdens het contactmoment bevestigd.",
  },
  {
    q: "Kan ik mijn bestelling aanpassen?",
    a: "Ja, kleine aanpassingen zijn mogelijk. Neem zo snel mogelijk contact met ons op, dan kijken we samen naar de mogelijkheden.",
  },
  {
    q: "Kan ik mijn bestelling annuleren?",
    a: "Annuleren is mogelijk. Neem hiervoor contact met ons op. Afhankelijk van het moment van annulering bekijken we de voorwaarden.",
  },
  {
    q: "Hoe vaak ontvang ik een box?",
    a: "Je ontvangt wekelijks een box, afgestemd op jouw gekozen traject en persoonlijke behoeften.",
  },
  {
    q: "Wat zit er in de Kratje Power box?",
    a: "De box bevat verse producten, voedzame ingrediënten en zorgvuldig geselecteerde vitamines ter ondersteuning van het herstel na de bevalling.",
  },
  {
    q: "Zijn de producten geschikt voor borstvoeding?",
    a: "Ja, de inhoud is samengesteld met aandacht voor mama’s die borstvoeding geven. Heb je specifieke vragen of twijfels, dan bespreken we dit persoonlijk.",
  },
  {
    q: "Kan ik allergieën of dieetwensen doorgeven?",
    a: "Zeker. Tijdens het contactmoment kun je allergieën, intoleranties of dieetwensen doorgeven, zodat we hier rekening mee kunnen houden.",
  },
  {
    q: "Is Kratje Power een vervanging van medische zorg?",
    a: "Nee. Kratje Power ondersteunt het herstel, maar vervangt geen medische begeleiding. Bij klachten raden we altijd aan contact op te nemen met een zorgprofessional.",
  },
  {
    q: "Hoe lang duurt een traject?",
    a: "De duur van een traject verschilt per mama en wordt afgestemd op jouw situatie en wensen.",
  },
  {
    q: "Hoe kan ik contact opnemen?",
    a: "Je kunt contact met ons opnemen via de website. We reageren zo snel mogelijk en nemen graag persoonlijk de tijd voor je.",
  },
  {
    q: "Is Kratje Power alleen voor net bevallen mama’s?",
    a: "Kratje Power is speciaal ontwikkeld voor mama’s in de herstelperiode na de bevalling, maar kan ook ondersteunend zijn in latere fases.",
  },
];

export default function VragenAntwoordenPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-6xl page-pad py-16">

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
          <div className="space-y-4">
            {FAQ.map((item, idx) => (
              <details key={`${item.q}-${idx}`} className="rounded-2xl border border-black/10 bg-black/5 p-5">
                <summary className="cursor-pointer select-none font-normal">
                  {item.q}
                </summary>
                <p className="mt-3 text-black/70 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
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
