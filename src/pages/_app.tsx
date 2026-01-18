// IMPORTANT: For Next.js Pages Router, this file must be named `src/pages/_app.tsx`
// so global styles apply to all pages (including /shop).
import "../app/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
