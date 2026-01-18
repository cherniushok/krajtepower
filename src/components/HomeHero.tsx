"use client";

import { useMemo, useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import HomeSlider from "./HomeSlider";

type Slide = {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  body: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  imageSrc: string;
};

export default function HomeHero() {
  const slides: Slide[] = useMemo(
    () => [
      {
        id: "s1",
        name: "KratjePower",
        title: "Welcome bij",
        subtitle: "Kratje Power",
        body: "Mama Edition",
        description:
          "Zorg voor jezelf, zodat jij voor je baby kunt zorgen. Jouw herstel verdient de beste voeding — wekelijks geleverd gedurende de cruciale eerste 8 weken post partum.\n\n" +
          "Mama Krat is bedacht om jou te ondersteunen in deze cruciale periode.",
        primaryCta: "Bekijk pakketten",
        secondaryCta: "Lees meer",
        imageSrc: "/home.png",
      },
      {
        id: "s2",
        name: "Mama Kratje",
        title: "Herstel begint bij de juiste voeding",
        subtitle: "",
        body: "",
        description:
          "De eerste weken na een bevalling zijn intens: je herstelt, terwijl je dag en nacht klaarstaat voor je kindje. Juist dan kan er snel een voedingstekort ontstaan.\n\n" +
          "Veel moeders bouwen in de eerste 8 weken tekorten op (zoals ijzer, magnesium en B‑vitamines). Dit kan zorgen voor vermoeidheid, sombere gevoelens en een trager herstel — terwijl je lichaam juist méér nodig heeft, zeker bij borstvoeding.\n\n" +
          "Mama Krat ondersteunt je in deze cruciale periode met gerichte, voedzame extra’s: praktisch, en wetenschappelijk onderbouwd — zonder dat jij hoeft uit te zoeken wat je nodig hebt.",
        primaryCta: "Kies jouw pakket",
        secondaryCta: "Contact",
        imageSrc: "/collage.png",
      },
      {
        id: "s3",
        name: "Fresh start",
        title: "Wist jij dat?",
        subtitle: "",
        body: "",
        description:
          "1 op de 5 moeders krijgt serieuze fysieke of mentale klachten na de bevalling.\n\n" +
          "Meer dan 60% bouwt voeding niet goed op.\n\n" +
          "Bijna 40% blijft langdurig moe of mentaal uit balans.\n\n" +
          "1 op de 3 moeders ervaart burn‑outsymptomen.\n\n" +
          "En dat allemaal… omdat er geen aandacht is voor jóuw herstel.\n" +
          "Je krijgt kraamzorg en advies over de baby, maar je eigen lichaam wordt vergeten.",
        primaryCta: "Bekijk pakketten",
        secondaryCta: "Meer info",
        imageSrc: "",
      },
      {
        id: "s4",
        name: "Relaxmoment",
        title: "Relaxmoment",
        subtitle: "voor mama",
        body: "",
        description:
          "Na een drukke dag vol zorgen en regelen verdien jij een moment helemaal voor jezelf. Daarom bevat het Mama Kratje ook een speciaal relaxpakketje.\n\n" +
          "Overdag ondersteunen fruit en powerfoods je energie en herstel. ’s Avonds is het tijd om te ontspannen en te genieten.\n\n" +
          "Want het Mama Kratje draait niet alleen om gezond eten, maar om goed zorgen voor jezelf. En dat betekent óók genieten.",
        primaryCta: "Start nu",
        secondaryCta: "→",
        imageSrc: "",
      },
      {
        id: "s5",
        name: "Startmoment",
        title: "Start op het juiste moment",
        subtitle: "",
        body: "",
        description:
          "De eerste week staat vooral in het teken van rust en wennen. Je lichaam past zich aan aan alle veranderingen en nieuwe routines.\n\n" +
          "Vanaf week 2 tot en met week 9 start het echte herstel. In deze periode zijn voeding en ondersteuning het meest effectief.\n\n" +
          "Wij staan klaar om je hierin te ondersteunen.\n\n" +
          "Ben jij klaar om voor jezelf te zorgen?",
        primaryCta: "Hoe werkt het?",
        secondaryCta: "Contact",
        imageSrc: "/logo1.png",
      },
    ],
    []
  );

  const [active, setActive] = useState(0);
  const current = slides[active];
  const totalSlides = slides.length;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goNext = () => setActive((prev) => (prev + 1) % totalSlides);
  const goPrev = () => setActive((prev) => (prev - 1 + totalSlides) % totalSlides);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    if (event.touches.length !== 1) return;
    touchStart.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (!touchStart.current || event.changedTouches.length === 0) return;
    const start = touchStart.current;
    touchStart.current = null;

    const end = event.changedTouches[0];
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 50 || absX < absY) return;
    if (dx < 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  const openHeaderMenu = () => {
    if (typeof window === "undefined") return;

    // Tell Header to open its menu (if it listens)
    window.dispatchEvent(new CustomEvent("kp:open-menu"));
    document.dispatchEvent(new CustomEvent("kp:open-menu"));

    // Fallback: try to open the header/menu via DOM click
    const candidates = [
      'button[aria-label="Open menu"]',
      'button[aria-label*="menu" i]',
      'button[aria-label*="open" i]',
      'button[aria-expanded="false"]',
      '[data-menu-button]',
    ];

    for (const sel of candidates) {
      const btn = document.querySelector(sel) as HTMLButtonElement | null;
      if (btn) {
        btn.click();
        break;
      }
    }
  };

  const scrollToHowItWorks = () => {
    if (typeof window === "undefined") return;

    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSecondaryClick = () => {
    // Slide 1: goes to slide 2
    if (current.id === "s1") return setActive(1);

    // Slide 2: open Header menu
    if (current.id === "s2") return openHeaderMenu();

    // Slide 3: goes to slide 4
    if (current.id === "s3") return setActive(3);

    // Slide 4: goes to slide 5
    if (current.id === "s4") return setActive(4);

    // Slide 5: open Header menu (Contact)
    if (current.id === "s5") return openHeaderMenu();
  };

  return (
    <>
      <section
        className="relative overflow-hidden bg-[var(--bg-1)] pt-[56px] sm:pt-[64px] md:pt-[72px] md:h-[calc(100vh-72px)] md:max-h-[720px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative mx-auto max-w-6xl page-pad py-10 md:h-full">
          <div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-[88px_1fr_1fr] md:items-stretch md:h-full md:overflow-hidden">
            {/* Slider */}
            <div className="sticky top-[72px] z-20 hidden justify-center md:static md:flex">
              <HomeSlider slides={slides} activeIndex={active} onChange={setActive} />
            </div>

            {/* Text */}
            <div key={current.id} className="relative min-w-0 w-full hero-fade-up">
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between md:hidden">
                <button
                  type="button"
                  aria-label="Vorige slide"
                  onClick={goPrev}
                  className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition active:scale-95"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Volgende slide"
                  onClick={goNext}
                  className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition active:scale-95"
                >
                  →
                </button>
              </div>

              <div className="flex flex-col h-full min-h-0 pb-6 px-14 sm:px-16 md:px-0 lg:pr-10">
                <h1 className="font-title text-4xl font-black leading-[1.02] sm:text-5xl lg:text-6xl">
                  {current.id === "s1" ? (
                    <>
                      <span className="whitespace-nowrap">{current.title}</span>
                      <br />
                      <span className="whitespace-nowrap">{current.subtitle}</span>
                      <br />
                      <span className="whitespace-nowrap">{current.body}</span>
                    </>
                  ) : (
                    <>
                      {current.title}
                      {current.subtitle && (
                        <>
                          <br />
                          {current.subtitle}
                        </>
                      )}
                      {current.body && (
                        <>
                          <br />
                          {current.body}
                        </>
                      )}
                    </>
                  )}
                </h1>

                <div className="font-body mt-4 max-w-2xl text-base leading-relaxed text-black/70 sm:text-lg space-y-3 flex-1 min-h-0 overflow-y-auto pr-2">
                  {current.description
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-4">
                  {current.id === "s5" ? (
                    <button
                      type="button"
                      onClick={scrollToHowItWorks}
                      className="rounded-full bg-black px-10 py-4 font-semibold text-white hover:opacity-90"
                    >
                      {current.primaryCta}
                    </button>
                  ) : (
                    <Link href="/shop">
                      <button className="rounded-full bg-black px-10 py-4 font-semibold text-white hover:opacity-90">
                        {current.primaryCta}
                      </button>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleSecondaryClick}
                    className="rounded-full border border-black/20 bg-white px-10 py-4 font-semibold hover:bg-black/5"
                  >
                    {current.secondaryCta}
                  </button>
                </div>
              </div>
            </div>

            {/* Image */}
            {current.imageSrc ? (
              <div className="relative hidden md:block h-full">
                <div
                  key={current.id}
                  className="relative ml-auto h-full w-full md:-mr-[calc((100vw-100%)/2)] hero-fade-right"
                >
                  <Image
                    src={current.imageSrc}
                    alt={current.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 50vw"
                    className={
                      "object-contain object-right object-center" +
                      (current.id === "s5" ? " md:scale-125" : " md:scale-110")
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <style jsx>{`
          .hero-fade-up {
            animation: heroFadeUp 320ms ease-out both;
            will-change: transform, opacity;
          }
          .hero-fade-right {
            animation: heroFadeRight 360ms ease-out both;
            will-change: transform, opacity;
          }

          @keyframes heroFadeUp {
            from {
              opacity: 0;
              transform: translate3d(0, 10px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          @keyframes heroFadeRight {
            from {
              opacity: 0;
              transform: translate3d(14px, 0, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
        `}</style>
      </section>

      {/* 3 images section */}
      <section id="how-it-works" className="bg-[var(--bg-1)] py-16">
        <div className="mx-auto max-w-6xl page-pad">
          <h2 className="mb-10 text-center text-3xl font-black tracking-tight md:text-4xl" style={{ fontFamily: "ui-serif, Georgia, serif" }}>
            Hoe het werkt?
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Item 1 */}
            <div className="text-center">
              <h3 className="mb-4 text-lg font-normal">Elke week verse voeding, zonder dat jij iets hoeft te doen.</h3>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="/section1_first.png"
                  alt="Verse voeding"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Item 2 */}
            <div className="text-center">
              <h3 className="mb-4 text-lg font-normal">Kies het pakket dat past bij jouw herstel na de bevalling.</h3>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="/section1_second.png"
                  alt="Bewust herstel"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Item 3 */}
            <div className="text-center">
              <h3 className="mb-4 text-lg font-normal">Wij regelen het eten, jij richt je op herstel en rust.</h3>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="/section1_thirty.png"
                  alt="Rust voor mama"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
