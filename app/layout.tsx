import type { Metadata } from "next";
import Script from "next/script";
import { Caveat, Fraunces, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

// The marketing homepage's type: Inter for prose, Caveat for the handwritten
// notes, step numbers and section labels. Kept separate from the portfolio
// presets' Geist/Fraunces so neither theme can drift into the other.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif for the portfolio's Sketchbook preset. The SOFT/WONK axes let
// one performant family cover every heading it needs, and italic is loaded for
// its journal-style headings and annotations.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "Gitfolio — Turn GitHub into a Portfolio",
  description:
    "Turn your GitHub profile into a beautiful, shareable developer portfolio with Gitfolio.",
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${caveat.variable} ${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Applies saved portfolio theme/mode before paint; must live in the root
            layout for strategy="beforeInteractive" to run on client navigations. */}
        <Script src="/portfolio-theme-boot.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
