import type { GetServerSideProps } from "next";
import Head from "next/head";
import Header from "@/components/Header";
import { stripe } from "@/lib/stripe";

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
      <main className="min-h-screen bg-[var(--bg-1)]">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center page-pad py-10 text-center">
          <p className="text-lg font-semibold text-black/80 sm:text-xl">
            De betaling is geslaagd! Onze manager zal u binnenkort bellen om de leveringsdatum van
            uw bestelling te bevestigen. Bedankt voor je vertrouwen.
          </p>
        </div>
      </main>
    </>
  );
}
