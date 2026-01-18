"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const phoneId = useId();

  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);

  const phoneDigits = useMemo(() => phone.replace(/\D/g, ""), [phone]);
  const isPhoneValid = useMemo(() => {
    // Simple validation: E.164-ish length without country code
    // Accept 9–12 digits (covers common NL mobile 9 digits, and other local formats).
    return phoneDigits.length >= 9 && phoneDigits.length <= 12;
  }, [phoneDigits]);

  useEffect(() => {
    const handler = () => {
      setMenuOpen(true);

      // focus phone input after drawer animation starts
      window.setTimeout(() => {
        const input =
          (document.querySelector('input[type="tel"]') as HTMLInputElement | null) ||
          (document.querySelector('input[autocomplete="tel"]') as HTMLInputElement | null);

        input?.focus();
      }, 150);
    };

    window.addEventListener("kp:open-menu", handler as EventListener);
    window.addEventListener("open-header-menu", handler as EventListener);
    return () => {
      window.removeEventListener("kp:open-menu", handler as EventListener);
      window.removeEventListener("open-header-menu", handler as EventListener);
    };
  }, []);

  return (
    <header className="w-full bg-white shadow-sm">
      {/* Backdrop */}
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-black/30"
        />
      ) : null}

      {/* Drawer */}
      <aside
        aria-hidden={!menuOpen}
        className={
          "fixed left-0 top-0 z-50 h-screen w-[320px] max-w-[85vw] bg-[var(--bg-1)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out " +
          (menuOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex h-full flex-col">
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Kratje Power logo"
                width={38}
                height={38}
                sizes="38px"
                className="h-9 w-9"
              />
              <span className="text-sm font-semibold tracking-wide text-black/70">
                Met liefde van Kratje Power
              </span>
            </div>
            <button
              type="button"
              aria-label="Sluit menu"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white hover:bg-black/5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="px-6 pt-6">
            <ul className="space-y-3">
              {[
                { label: "Over ons", href: "/over-ons" },
                { label: "Kratje box", href: "/shop" },
                // Scroll to the section with the 3 photos (support multiple ids to be safe)
                { label: "Hoe het werkt", href: "#hoe-het-werkt", scrollTargets: ["hoe-het-werkt", "inhoud", "steps", "how-it-works"] },
                { label: "Vragen/antwoorden", href: "/vragen-antwoorden" },
                { label: "Instagram", href: "https://www.instagram.com/kratjepower.nl?igsh=eW15aGplM2phdWVq" },
                { label: "TikTok", href: "https://www.tiktok.com/@kratjepower7" },
              ].map((item) => (
                <li key={item.href}>
                  {item.href.startsWith("/") ? (
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center justify-between rounded-2xl border border-black/10 bg-white px-5 py-4 font-semibold text-black transition hover:-translate-y-[1px] hover:bg-black/5"
                    >
                      <span className="text-lg">{item.label}</span>
                      <span className="text-black/40 transition group-hover:translate-x-0.5">→</span>
                    </Link>
                  ) : item.href.startsWith("#") ? (
                    <a
                      href={item.href}
                      onClick={(e) => {
                        setMenuOpen(false);
                        window.dispatchEvent(new CustomEvent("kp:go-slide", { detail: { index: 0 } }));

                        // Smooth scroll to the first existing target id (useful if sections were renamed)
                        const targets = (item as any).scrollTargets as string[] | undefined;
                        if (targets?.length) {
                          e.preventDefault();
                          window.setTimeout(() => {
                            for (const id of targets) {
                              const el = document.getElementById(id);
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth", block: "start" });
                                break;
                              }
                            }
                          }, 50);
                        }
                      }}
                      className="group flex items-center justify-between rounded-2xl border border-black/10 bg-white px-5 py-4 font-semibold text-black transition hover:-translate-y-[1px] hover:bg-black/5"
                    >
                      <span className="text-lg">{item.label}</span>
                      <span className="text-black/40 transition group-hover:translate-x-0.5">→</span>
                    </a>
                  ) : (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center justify-between rounded-2xl border border-black/10 bg-white px-5 py-4 font-semibold text-black transition hover:-translate-y-[1px] hover:bg-black/5"
                    >
                      <span className="text-lg">{item.label}</span>
                      <span className="text-black/40 transition group-hover:translate-x-0.5">→</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Call me block */}
          <div className="mt-auto border-t border-black/10 px-6 py-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-black/70">
              <span>
                {phoneSubmitted
                  ? "Bedankt! We bellen je binnen een werkdag"
                  : "Laat je nummer achter"}
              </span>

              <span
                aria-hidden
                className={
                  "inline-flex h-5 w-5 aspect-square items-center justify-center rounded-full bg-emerald-500 text-white transition-all duration-300 ease-out " +
                  (phoneSubmitted ? "opacity-100 scale-100" : "opacity-0 scale-95")
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </p>

            <label htmlFor={phoneId} className="sr-only">
              Telefoonnummer
            </label>

            <div className="flex flex-col gap-2">
              <input
                id={phoneId}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel"
                placeholder="Telefoonnummer (alleen cijfers)"
                value={phoneDigits}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  setPhone(digitsOnly);
                  setPhoneSubmitted(false);
                }}
                onBlur={() => setPhoneTouched(true)}
                aria-invalid={phoneTouched && !isPhoneValid}
                className={
                  "h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none focus:border-black/30 " +
                  (phoneTouched && !isPhoneValid ? "border-red-400" : "border-black/15")
                }
              />

              {phoneTouched && !isPhoneValid ? (
                <p className="text-xs text-red-600">
                  Vul een geldig telefoonnummer in (9–12 cijfers).
                </p>
              ) : null}
            </div>

            <button
              type="button"
              disabled={!isPhoneValid}
              onClick={() => {
                setPhoneTouched(true);
                if (!isPhoneValid) return;
                setPhoneSubmitted(true);
              }}
              className={
                "mt-3 w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white transition " +
                (isPhoneValid ? "bg-black hover:opacity-90" : "bg-black/30 cursor-not-allowed")
              }
            >
              Bel me
            </button>

            <p className="mt-3 text-xs text-black/50">
              Wijk en Aalburg Te. 0651294322{" "}
              <a className="underline" href="mailto:info@kratjepower.nl">
                info@kratjepower.nl
              </a>
            </p>
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between page-pad">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 hover:bg-black/5 active:scale-[0.98]"
          >
            <div className="flex flex-col gap-1">
              <span className="h-0.5 w-6 bg-black" />
              <span className="h-0.5 w-6 bg-black" />
              <span className="h-0.5 w-6 bg-black" />
            </div>
          </button>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl"
          style={{ fontFamily: "ui-serif, Georgia, serif" }}
        >
          <span>KRATJE POWER</span>
          <Image
            src="/logo.png"
            alt="Kratje Power logo"
            width={38}
            height={38}
            sizes="38px"
            className="h-9 w-9"
          />
        </Link>
        <Link href="/shop" className="font-semibold tracking-wide hover:opacity-70">
          <span className="hidden sm:inline">BESTEL NU →</span>
          <span className="sm:hidden">→</span>
        </Link>
      </div>
    </header>
  );
}
