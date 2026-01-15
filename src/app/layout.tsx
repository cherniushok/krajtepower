import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import "./globals.css";
import { Alfa_Slab_One, DM_Sans } from "next/font/google";
import logo from "app/1.svg";

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
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className={`${alfa.variable} ${dmSans.variable}`}>
      <body className="font-body">
        <div className="flex items-center justify-center py-4">
          <Image
            src={logo}
            alt="Kratje Power logo"
            className="h-10 w-auto"
            priority
          />
        </div>
        {children}
      </body>
    </html>
  );
}
