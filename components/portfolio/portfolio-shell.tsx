import Link from "next/link";

export function PortfolioShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#40362E]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-serif text-xl tracking-tight">
          gitfolio
        </Link>
        <Link
          href="/"
          className="text-sm text-[#C78368] transition hover:text-[#40362E]"
        >
          Generate another
        </Link>
      </nav>
      {children}
    </main>
  );
}
