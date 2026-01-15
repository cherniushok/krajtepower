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
  description: "Kratje Power landing",
  icons: {
    icon: "/logo-v2.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className={`${alfa.variable} ${dmSans.variable}`}>
      <body className="font-body">
        {children}
      </body>
    </html>
  );
}
