import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Alfa_Slab_One, DM_Sans } from "next/font/google";
import logo from "./1.svg";

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

const logoSrc =
  typeof logo === "string" ? logo : (logo as { src: string }).src;

export const metadata: Metadata = {
  title: "Kratje Power",
  description: "Kratje Power landing",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className={`${alfa.variable} ${dmSans.variable}`}>
      <body className="font-body">
        <div className="flex items-center justify-center py-4">
          <img src={logoSrc} alt="Kratje Power logo" className="h-10 w-auto" />
        </div>
        {children}
      </body>
    </html>
  );
}
