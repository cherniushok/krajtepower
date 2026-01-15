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
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className={`${alfa.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/logo.png?v=3" type="image/png" />
        <link rel="shortcut icon" href="/logo.png?v=3" type="image/png" />
      </head>
      <body className="font-body">
        <header className="w-full bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
            <img src="/logo.png" alt="Kratje Power logo" className="h-8 w-auto" />
            <span className="text-lg font-medium text-gray-800">Kratje Power</span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
