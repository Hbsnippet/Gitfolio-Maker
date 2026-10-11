import type { GithubLanguageShare } from "@/lib/github";

export function LanguageList({ languages }: { languages: GithubLanguageShare[] }) {
  if (languages.length === 0) return null;

  const largest = languages[0]?.repositories ?? 1;

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-12">
      <div className="md:col-span-4">
        <h2 className="pf-display text-4xl tracking-tight">Languages</h2>
        <p className="mt-3 max-w-xs text-sm leading-6 text-pf-muted">
          Counted from the primary language on public repositories that are not
          forks.
        </p>
      </div>
      <ul className="space-y-4 md:col-span-7 md:col-start-6">
        {languages.map((language) => (
          <li key={language.name}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="pf-meta">{language.name}</span>
              <span className="text-pf-muted">
                {language.repositories}{" "}
                {language.repositories === 1 ? "repository" : "repositories"}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-pf-track">
              <div
                className="h-1.5 rounded-full bg-pf-bar"
                style={{
                  width: `${Math.max(8, (language.repositories / largest) * 100)}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
