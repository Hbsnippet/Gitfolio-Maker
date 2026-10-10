import type { GithubLanguageShare, GithubProfile } from "@/lib/github";

function joinedYear(createdAt: string | null) {
  const year = createdAt?.slice(0, 4);
  return year && /^\d{4}$/.test(year) ? year : null;
}

export function AboutSection({
  profile,
  languages,
}: {
  profile: GithubProfile;
  languages: GithubLanguageShare[];
}) {
  const year = joinedYear(profile.created_at);
  const highlights = [
    profile.location ? { label: "Location", value: profile.location } : null,
    profile.company ? { label: "Company", value: profile.company } : null,
    year ? { label: "GitHub since", value: year } : null,
    profile.hireable ? { label: "GitHub status", value: "Marked hireable" } : null,
  ].filter((item) => item !== null);

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-12">
      <div className="md:col-span-4">
        <h2 className="font-serif text-4xl tracking-tight">About</h2>
      </div>
      <div className="md:col-span-7 md:col-start-6">
        {profile.bio?.trim() && (
          <p className="max-w-xl text-lg leading-8">{profile.bio}</p>
        )}

        {highlights.length > 0 && (
          <dl
            className={`divide-y divide-[#E4DDD0] border-y border-[#E4DDD0] ${
              profile.bio?.trim() ? "mt-8" : ""
            }`}
          >
            {highlights.map((item) => (
              <div
                key={item.label}
                className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]"
              >
                <dt className="text-xs uppercase tracking-[0.16em] text-[#A6AD91]">
                  {item.label}
                </dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {languages.length > 0 && (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#A6AD91]">
              Inferred skills
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#8A7B6E]">
              Taken from the primary language of each public repository. GitHub
              does not list these as profile skills.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {languages.map((language) => (
                <li
                  key={language.name}
                  className="rounded-full border border-[#D9D3C6] bg-[#FBF8F2] px-3 py-1 text-sm"
                >
                  {language.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
