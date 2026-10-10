import Link from "next/link";

export function PortfolioFooter({
  githubUrl,
}: {
  githubUrl?: string | null;
}) {
  return (
    <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-sm text-[#8A7B6E]">
      <p>gitfolio</p>
      <div className="flex gap-5">
        <Link href="/" className="hover:text-[#40362E]">
          Generator
        </Link>
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#40362E]"
          >
            GitHub
          </a>
        )}
      </div>
    </footer>
  );
}
