"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type GithubProfile = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
  location: string | null;
  company: string | null;
};

type GithubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
};

function cleanGithubUsername(value: string) {
  return value.trim().replace(/^@/, "");
}

function errorMessageForStatus(status: number) {
  switch (status) {
    case 400:
      return "That doesn't look like a valid GitHub username. Use letters, numbers, and hyphens (up to 39 characters).";
    case 404:
      return "GitHub user not found. Check the username and try again.";
    case 429:
      return "GitHub rate limit exceeded. Please try again in a little while.";
    default:
      return "Something went wrong contacting GitHub. Please try again.";
  }
}

// Compact star counts the way GitHub shows them: 4200 -> "4.2k", 168000 -> "168k".
function formatStars(count: number) {
  if (count < 1000) return String(count);

  const thousands = count / 1000;
  const rounded = thousands >= 10 ? Math.round(thousands) : Math.round(thousands * 10) / 10;

  return `${rounded}k`;
}

// Content for the marketing sections. Keeping the copy in small arrays lets the
// JSX below stay a plain, readable map instead of three near-identical blocks.
const EXAMPLE_USERNAMES = ["torvalds", "gaearon", "sindresorhus"];

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
];

const STEPS = [
  {
    index: "01",
    title: "Enter your username",
    body: "Type your GitHub handle and Gitfolio fetches your public profile instantly — no signup and no private data.",
  },
  {
    index: "02",
    title: "Preview your portfolio",
    body: "Your profile is laid out as a shareable portfolio in the preview, ready for you to look through.",
  },
  {
    index: "03",
    title: "Share your link",
    body: "Open your portfolio at its own address and share it in a résumé, a DM, or your GitHub bio.",
  },
];

const FEATURES = [
  {
    index: "01",
    title: "Profile & stats",
    body: "Your avatar, bio, followers, and repository count, pulled straight from the GitHub API and kept current.",
  },
  {
    index: "02",
    title: "Featured projects",
    body: "Your most relevant repositories, ranked by stars and recent activity, presented as a clean project list.",
  },
  {
    index: "03",
    title: "Languages & activity",
    body: "A breakdown of the languages you actually ship in, plus a heatmap of your contributions over the last year.",
  },
];

const ABOUT_FACTS = ["No signup", "Public data only", "Open source"];

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<GithubProfile | null>(null);
  // Repos are stored next to the login they belong to, so a stale response can
  // never be shown against a newer profile.
  const [repoPreview, setRepoPreview] = useState<{
    login: string;
    repos: GithubRepo[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleUsernameChange(value: string) {
    const cleanUsername = cleanGithubUsername(value);

    setError(null);

    setUsername(value);
    setProfile((current) =>
      current &&
      cleanUsername &&
      current.login.toLowerCase() === cleanUsername.toLowerCase()
        ? current
        : null
    );
  }

  useEffect(() => {
    const cleanUsername = cleanGithubUsername(username);

    if (!cleanUsername) return;

    // Already previewing this exact profile - skip a duplicate request.
    if (profile && profile.login.toLowerCase() === cleanUsername.toLowerCase()) {
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/github/${encodeURIComponent(cleanUsername)}`,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;

        if (!response.ok) {
          setError(errorMessageForStatus(response.status));
          return;
        }

        const data: GithubProfile = await response.json();

        if (data?.login && data?.avatar_url) {
          setError(null);
          setProfile(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setError("Unable to connect. Please try again.");
        console.error("GitHub profile preview failed", error);
      }
    }, 500);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [username, profile]);

  // A second, independent request that fills the preview with the three most
  // relevant repositories. It reuses the existing /repos route and the same
  // abort pattern, and failures are ignored because repos are optional here.
  useEffect(() => {
    if (!profile) return;

    const login = profile.login;
    const controller = new AbortController();

    const loadRepos = async () => {
      try {
        const response = await fetch(
          `/api/github/${encodeURIComponent(login)}/repos`,
          { signal: controller.signal }
        );

        if (!response.ok) return;

        const data: GithubRepo[] = await response.json();

        if (controller.signal.aborted || !Array.isArray(data)) return;

        setRepoPreview({ login, repos: data.slice(0, 3) });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        // Repos are a nice-to-have for the preview, so we stay quiet on failure.
      }
    };

    void loadRepos();

    return () => controller.abort();
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading || error) return;

    const cleanUsername = cleanGithubUsername(username);

    if (!cleanUsername) {
      setError("Please enter a GitHub username.");
      return;
    }

    if (
      profile &&
      profile.login.toLowerCase() === cleanUsername.toLowerCase()
    ) {
      router.push(`/${encodeURIComponent(cleanUsername)}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/${encodeURIComponent(cleanUsername)}`
      );

      if (!response.ok) {
        setError(errorMessageForStatus(response.status));
        return;
      }

      const data: GithubProfile = await response.json();

      if (!data?.login || !data?.avatar_url) {
        setError("GitHub returned an invalid profile.");
        return;
      }

      router.push(`/${encodeURIComponent(cleanUsername)}`);
    } catch (error) {
      console.error("GitHub profile request failed", error);
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Only trust the repo list when it was fetched for the profile we're showing.
  const previewRepos =
    profile && repoPreview?.login === profile.login ? repoPreview.repos : [];

  return (
    <>
      {/* ---------- Navbar ---------- */}
      <header className="sticky top-0 z-40 border-b border-home-line bg-home-bg/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
          <Link
            href="/"
            className="font-mono text-lg font-medium tracking-tight text-home-ink"
          >
            gitfolio
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-8 font-mono text-xs uppercase tracking-[0.18em] text-home-muted md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-home-ink"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <a
              href="https://github.com/Hbsnippet/Gitfolio-Maker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-full bg-home-ink px-3.5 font-mono text-xs uppercase tracking-[0.12em] text-home-bg transition-colors hover:bg-home-accent"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.69 2.6 1.2 3.23.92.1-.72.39-1.2.7-1.47-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.12-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.12 2.96.71.78 1.14 1.78 1.14 3 0 4.29-2.6 5.23-5.09 5.51.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
              <span aria-hidden="true" className="text-sm leading-none">
                ★
              </span>
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-1 overflow-x-clip bg-home-bg font-sans text-home-ink">
        {/* ---------- Hero ---------- */}
        <section className="mx-auto grid min-h-[calc(100svh_-_4rem)] max-w-6xl items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-2 lg:gap-20 lg:pb-32 lg:pt-24">
          {/* Left: pitch + generator */}
          <div id="generator" className="scroll-mt-28">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-home-accent">
              GitHub → portfolio
            </p>

            <h1 className="mt-7 font-mono text-4xl font-medium leading-[1.08] tracking-tight text-home-ink sm:text-5xl lg:text-6xl">
              Your GitHub,
              <br />
              presented properly.
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-home-muted">
              Gitfolio reads your public GitHub profile and repositories, then
              lays them out as a clean, shareable developer portfolio. No signup,
              no build step.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 flex w-full max-w-md items-center gap-2 rounded-2xl border border-home-line bg-home-surface p-2 shadow-sm transition duration-200 focus-within:border-home-accent/60 focus-within:shadow-md focus-within:ring-4 focus-within:ring-home-accent/10"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-2 h-5 w-5 shrink-0 text-home-muted"
              >
                <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.69 2.6 1.2 3.23.92.1-.72.39-1.2.7-1.47-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.12-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.12 2.96.71.78 1.14 1.78 1.14 3 0 4.29-2.6 5.23-5.09 5.51.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
              </svg>

              <input
                type="text"
                value={username}
                onChange={(event) => handleUsernameChange(event.target.value)}
                placeholder="Your GitHub username"
                aria-label="GitHub username"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-home-ink outline-none placeholder:text-home-muted/60 sm:text-base"
              />

              <button
                type="submit"
                disabled={loading || Boolean(error)}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-home-accent px-5 py-3 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-home-accent/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              >
                {loading && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-30"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {loading ? "Loading" : "Generate"}
              </button>
            </form>

            {error && (
              <div
                role="alert"
                className="mt-3 w-full max-w-md rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-home-muted">
              <span>Try:</span>
              {EXAMPLE_USERNAMES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleUsernameChange(example)}
                  className="transition-colors hover:text-home-accent"
                >
                  {example}
                </button>
              ))}
            </p>
          </div>

          {/* Right: live preview */}
          <div className="w-full lg:justify-self-end">
            <div className="rounded-2xl border border-home-line bg-home-surface p-6 shadow-[0_30px_70px_-45px_rgba(33,29,24,0.5)] sm:p-7">
              <div className="flex items-center justify-between gap-3 border-b border-home-line pb-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-home-muted">
                  Live preview
                </span>
                <span className="font-mono text-[11px] text-home-muted">
                  {profile ? `@${profile.login}` : "waiting…"}
                </span>
              </div>

              {profile ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
                  <div className="flex items-center gap-4 pt-6">
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.login}'s GitHub avatar`}
                      className="h-16 w-16 shrink-0 rounded-full border border-home-line object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-mono text-lg font-medium text-home-ink">
                        {profile.name || profile.login}
                      </p>
                      <p className="truncate font-mono text-xs text-home-muted">
                        @{profile.login}
                      </p>
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="mt-4 text-sm leading-6 text-home-muted">
                      {profile.bio}
                    </p>
                  )}

                  <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-home-muted">followers</dt>
                      <dd className="font-mono text-base font-medium text-home-ink">
                        {profile.followers}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-home-muted">repositories</dt>
                      <dd className="font-mono text-base font-medium text-home-ink">
                        {profile.public_repos}
                      </dd>
                    </div>
                    {profile.location && (
                      <div>
                        <dt className="text-xs text-home-muted">location</dt>
                        <dd className="truncate font-mono text-base font-medium text-home-ink">
                          {profile.location}
                        </dd>
                      </div>
                    )}
                    {profile.company && (
                      <div>
                        <dt className="text-xs text-home-muted">company</dt>
                        <dd className="truncate font-mono text-base font-medium text-home-ink">
                          {profile.company}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {previewRepos.length > 0 && (
                    <ul className="mt-6 divide-y divide-home-line border-t border-home-line">
                      {previewRepos.map((repo) => (
                        <li
                          key={repo.id}
                          className="flex items-start justify-between gap-4 py-3.5"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-home-accent"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-mono text-sm text-home-ink">
                                {repo.name}
                              </p>
                              {repo.description && (
                                <p className="truncate text-xs text-home-muted">
                                  {repo.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-4 font-mono text-xs text-home-muted">
                            {repo.language && <span>{repo.language}</span>}
                            <span className="inline-flex items-center gap-1">
                              <span aria-hidden="true">★</span>
                              {formatStars(repo.stargazers_count)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href={`/${encodeURIComponent(profile.login)}`}
                    className="mt-7 inline-flex h-10 items-center rounded-full bg-home-ink px-5 font-mono text-xs uppercase tracking-[0.14em] text-home-bg transition-colors hover:bg-home-accent"
                  >
                    Open portfolio →
                  </Link>
                </div>
              ) : (
                <div className="pt-6">
                  <div aria-hidden="true">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-full bg-home-line" />
                      <div className="space-y-2">
                        <div className="h-3 w-32 rounded-full bg-home-line" />
                        <div className="h-3 w-20 rounded-full bg-home-line/70" />
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="h-8 rounded-full bg-home-line/60" />
                      <div className="h-8 rounded-full bg-home-line/60" />
                      <div className="h-8 rounded-full bg-home-line/50" />
                      <div className="h-8 rounded-full bg-home-line/50" />
                    </div>
                    <div className="mt-6 space-y-3">
                      <div className="h-3 w-full rounded-full bg-home-line/60" />
                      <div className="h-3 w-4/5 rounded-full bg-home-line/60" />
                      <div className="h-3 w-2/3 rounded-full bg-home-line/60" />
                    </div>
                  </div>
                  <p className="mt-7 font-mono text-xs text-home-muted">
                    Enter a username and your portfolio appears here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-t border-home-line"
        >
          <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-home-accent">
              How it works
            </p>
            <h2 className="mt-6 max-w-2xl font-mono text-3xl font-medium tracking-tight text-home-ink sm:text-4xl">
              Three steps. No configuration.
            </h2>

            <ol className="mt-16 grid gap-12 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li
                  key={step.index}
                  className="relative border-t border-home-ink/15 pt-7"
                >
                  <span className="font-mono text-3xl text-home-accent">
                    {step.index}
                  </span>
                  <h3 className="mt-5 font-mono text-lg font-medium text-home-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-home-muted">
                    {step.body}
                  </p>

                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-7 top-6 hidden text-lg text-home-muted/70 sm:block"
                    >
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Features ---------- */}
        <section id="features" className="scroll-mt-20 border-t border-home-line">
          <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-home-accent">
              What you get
            </p>
            <h2 className="mt-6 max-w-2xl font-mono text-3xl font-medium tracking-tight text-home-ink sm:text-4xl">
              Everything a developer portfolio needs, generated from GitHub.
            </h2>

            <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-home-line bg-home-line sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.index} className="bg-home-surface p-10">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-home-accent">
                    {feature.index}
                  </span>
                  <h3 className="mt-7 font-mono text-lg font-medium text-home-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-home-muted">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- About ---------- */}
        <section id="about" className="scroll-mt-20 border-t border-home-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-32">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-home-accent">
                About
              </p>
              <h2 className="mt-6 font-mono text-3xl font-medium tracking-tight text-home-ink sm:text-4xl">
                A portfolio that stays in sync with your GitHub.
              </h2>
            </div>

            <div className="max-w-xl">
              <p className="text-base leading-7 text-home-muted">
                Gitfolio is a small, open-source project that turns a public
                GitHub account into a clean, shareable portfolio. Point it at a
                username and it reads your profile, your most relevant
                repositories, and the languages you work in — then lays them out
                in something you can actually scan.
              </p>
              <p className="mt-6 text-base leading-7 text-home-muted">
                It only ever reads public GitHub data, and it never asks you to
                sign up or connect an account. The result lives at its own
                address, so you can drop the link into a résumé, a DM, or your
                GitHub bio.
              </p>

              <ul className="mt-10 grid gap-4 border-t border-home-line pt-6 font-mono text-xs uppercase tracking-[0.16em] text-home-ink sm:grid-cols-3">
                {ABOUT_FACTS.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-home-line bg-home-bg">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-base font-medium text-home-ink">
              gitfolio
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-home-muted">
              Turn your GitHub into a portfolio you can share anywhere.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.18em] text-home-muted">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-home-ink"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/Hbsnippet/Gitfolio-Maker"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-home-ink"
            >
              GitHub
            </a>
          </nav>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-12">
          <p className="font-mono text-xs text-home-muted">
            Gitfolio — built on the GitHub API. Not affiliated with GitHub.
          </p>
        </div>
      </footer>
    </>
  );
}
