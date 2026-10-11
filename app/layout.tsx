import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif for the portfolio's Editorial + Sketchbook presets. The SOFT/WONK
// axes let both presets share one performant family while looking distinct.
// Italic is loaded for Sketchbook's journal-style headings and annotations.
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
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
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
