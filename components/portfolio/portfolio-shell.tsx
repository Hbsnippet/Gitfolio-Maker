import Link from "next/link";
import { PortfolioControls } from "@/components/portfolio/portfolio-controls";

// The saved preset/mode is applied before paint by /public/portfolio-theme-boot.js,
// loaded with strategy="beforeInteractive" in the root layout.

export function PortfolioShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="pf-body min-h-screen bg-pf-bg text-pf-fg [background-image:var(--pf-aura)] transition-colors duration-300 motion-reduce:transition-none">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <Link href="/" className="pf-display text-xl tracking-tight">
          gitfolio
        </Link>
        <PortfolioControls />
      </nav>
      {children}
    </main>
  );
}
