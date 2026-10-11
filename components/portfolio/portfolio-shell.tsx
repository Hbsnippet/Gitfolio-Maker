import Link from "next/link";
import { PortfolioControls } from "@/components/portfolio/portfolio-controls";
import { PF_MODE_KEY, PF_THEME_KEY } from "@/lib/portfolio-theme";

// Runs before paint so a returning visitor's saved preset/mode applies with no flash.
const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("${PF_THEME_KEY}");var m=localStorage.getItem("${PF_MODE_KEY}");var r=document.documentElement;if(t)r.setAttribute("data-pf-theme",t);if(m)r.setAttribute("data-pf-mode",m);}catch(e){}})();`;

export function PortfolioShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="pf-body min-h-screen bg-pf-bg text-pf-fg [background-image:var(--pf-aura)] transition-colors duration-300 motion-reduce:transition-none">
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
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
