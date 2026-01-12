// IMPORTANT: For Next.js Pages Router, this file must be named `src/pages/_app.tsx`
// so global styles apply to all pages (including /shop).
import "../app/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}