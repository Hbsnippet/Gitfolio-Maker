import type { GithubProfile } from "@/lib/github";

function safeUrl(value: string | null) {
  if (!value) return null;

  const trimmed = value.trim();

  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
}

function joinedYear(createdAt: string | null) {
  const year = createdAt?.slice(0, 4);
  return year && /^\d{4}$/.test(year) ? year : null;
}

export function ProfileHero({ profile }: { profile: GithubProfile }) {
  const blog = safeUrl(profile.blog);
  const twitter = profile.twitter_username
    ? `https://x.com/${encodeURIComponent(profile.twitter_username)}`
    : null;
  const year = joinedYear(profile.created_at);
  const links = [
    { label: "GitHub", href: profile.html_url },
    blog ? { label: "Website", href: blog } : null,
    twitter ? { label: "X", href: twitter } : null,
  ].filter((link) => link !== null);

  return (
    <section className="mx-auto grid max-w-6xl items-start gap-10 px-6 pb-16 pt-6 md:grid-cols-12 md:pt-10">
      <div className="md:col-span-7 md:pt-6">
        <p className="text-xs uppercase tracking-[0.22em] text-[#A6AD91]">
          Public record
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-none tracking-tight sm:text-7xl">
          {profile.name || profile.login}
        </h1>
        <p className="mt-4 text-lg text-[#8A7B6E]">@{profile.login}</p>
        {profile.bio && (
          <p className="mt-6 max-w-xl text-lg leading-8">{profile.bio}</p>
        )}
        {profile.location && (
          <p className="mt-4 text-sm text-[#8A7B6E]">{profile.location}</p>
        )}

        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
          <Stat label="Followers" value={profile.followers} />
          <Stat label="Following" value={profile.following} />
          <Stat label="Repositories" value={profile.public_repos} />
        </dl>

        {links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#C78368] px-4 py-2 text-sm text-[#F5F0E6] transition hover:bg-[#B57258]"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-4 md:col-start-9 md:mt-16">
        <img
          src={profile.avatar_url}
          alt={`${profile.login}'s GitHub avatar`}
          className="aspect-square w-full max-w-xs rounded-[2rem] object-cover shadow-[0_20px_50px_rgba(64,54,46,0.12)] md:max-w-none"
        />
        {year && (
          <p className="mt-4 text-sm text-[#8A7B6E]">On GitHub since {year}</p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-[#A6AD91]">
        {label}
      </dt>
      <dd className="mt-1 font-serif text-3xl">{value.toLocaleString()}</dd>
    </div>
  );
}
