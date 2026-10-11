import Link from "next/link";

export function PortfolioFooter({
  githubUrl,
}: {
  githubUrl?: string | null;
}) {
  return (
    <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-sm text-pf-muted">
      <p className="pf-display text-base">gitfolio</p>
      <div className="flex gap-5">
        <Link href="/" className="hover:text-pf-fg">
          Generator
        </Link>
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-pf-fg"
          >
            GitHub
          </a>
        )}
      </div>
    </footer>
  );
}
