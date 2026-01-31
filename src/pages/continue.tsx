import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "@/components/Header";

export default function ContinueOrderPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const orderId =
      typeof router.query.orderId === "string" ? router.query.orderId : "";

    if (!orderId) {
      setError("Missing orderId");
      return;
    }

    const run = async () => {
      try {
        const res = await fetch("/api/checkout/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "Checkout create failed");
        }

        if (!data?.checkoutUrl) {
          throw new Error("Missing checkoutUrl");
        }

        window.location.href = data.checkoutUrl;
      } catch (err: any) {
        setError(err?.message || "Something went wrong");
      }
    };

    void run();
  }, [router.isReady, router.query.orderId]);

  return (
    <>
      <Head>
        <title>Continue order • Kratje Power</title>
      </Head>
      <Header />
      <main className="min-h-screen bg-[var(--bg-1)]">
        <div className="mx-auto max-w-xl page-pad py-20 text-center">
          <h1 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
            {error ? "Cannot continue" : "Redirecting to checkout"}
          </h1>
          <p className="mt-4 text-base font-semibold text-black/70">
            {error
              ? error
              : "We are preparing your checkout session. Please wait..."}
          </p>
        </div>
      </main>
    </>
  );
}
