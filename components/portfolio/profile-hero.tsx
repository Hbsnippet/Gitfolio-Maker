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
        <p className="pf-meta text-xs uppercase tracking-[0.22em] text-pf-faint">
          Public record
        </p>
        <h1 className="pf-display mt-4 text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          {profile.name || profile.login}
        </h1>
        <p className="pf-meta mt-4 text-lg text-pf-muted">@{profile.login}</p>
        {profile.bio && (
          <p className="mt-6 max-w-xl text-lg leading-8">{profile.bio}</p>
        )}
        {profile.location && (
          <p className="mt-4 text-sm text-pf-muted">{profile.location}</p>
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
                className="pf-btn pf-btn-secondary"
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
          className="pf-avatar aspect-square w-full max-w-xs border border-pf-border object-cover shadow-[var(--pf-card-shadow)] md:max-w-none"
        />
        {year && (
          <p className="mt-4 text-sm text-pf-muted">On GitHub since {year}</p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="pf-meta text-xs uppercase tracking-[0.16em] text-pf-faint">
        {label}
      </dt>
      <dd className="pf-display mt-1 text-3xl">{value.toLocaleString()}</dd>
    </div>
  );
}
