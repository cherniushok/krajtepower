import type { GetServerSideProps } from "next";
import Head from "next/head";
import Header from "@/components/Header";
import { stripe } from "@/lib/stripe";
import Image from "next/image";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const sessionId = typeof query.session_id === "string" ? query.session_id : "";

  if (!sessionId) {
    return {
      redirect: { destination: "/shop", permanent: false },
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return {
        redirect: { destination: "/shop", permanent: false },
      };
    }
  } catch {
    return {
      redirect: { destination: "/shop", permanent: false },
    };
  }

  return { props: {} };
};

export default function BetalingGeluktPage() {
  return (
    <>
      <Head>
        <title>Betaling geslaagd • Kratje Power</title>
      </Head>
      <Header />
      <main className="relative min-h-screen bg-[var(--bg-1)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-8 page-pad py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.2)]">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
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
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
              Betaling geslaagd
            </h1>
            <p className="text-base font-semibold text-black/80 sm:text-lg">
              De betaling is geslaagd! Onze manager zal u binnenkort bellen om de leveringsdatum
              van uw bestelling te bevestigen. Bedankt voor je vertrouwen.
            </p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white/70 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <Image
              src="/logo.png"
              alt="Kratje Power logo"
              width={260}
              height={260}
              sizes="(max-width: 640px) 200px, 260px"
              className="h-44 w-44 sm:h-52 sm:w-52"
            />
          </div>
        </div>
      </main>
    </>
  );
}
