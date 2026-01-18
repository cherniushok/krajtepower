import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Alfa_Slab_One, DM_Sans } from "next/font/google";

const alfa = Alfa_Slab_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-alfa",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
});

export const metadata: Metadata = {
  title: "Kratje Power",
  description:
    "Kratje Power – wekelijkse boxen met verse producten en vitamines voor mama’s herstel.",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/1.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Kratje Power",
    description:
      "Wij ondersteunen mama’s herstel met wekelijkse boxen vol verse producten en vitamines.",
    url: "https://kratjepower.nl",
    siteName: "Kratje Power",
    images: [
      {
        url: "https://kratjepower.nl/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kratje Power",
      },
    ],
    locale: "nl_NL",
    type: "website",
  },
};
