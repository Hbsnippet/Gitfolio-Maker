
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type GithubProfile = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
};

function cleanGithubUsername(value: string) {
  return value.trim().replace(/^@/, "");
}

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<GithubProfile | null>(null);
  const [loading, setLoading] = useState(false);

  function handleUsernameChange(value: string) {
    const cleanUsername = cleanGithubUsername(value);

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

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/github/${encodeURIComponent(cleanUsername)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          console.error("GitHub profile preview failed", {
            username: cleanUsername,
            status: response.status,
          });
          return;
        }

        const data: GithubProfile = await response.json();

        if (controller.signal.aborted) return;

        if (!data?.login || !data?.avatar_url) {
          console.error("GitHub profile preview was incomplete", data);
          return;
        }

        setProfile(data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("GitHub profile preview failed", {
          username: cleanUsername,
          error,
        });
      }
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [username]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    const cleanUsername = cleanGithubUsername(username);

    if (!cleanUsername) return;

    if (
      profile &&
      profile.login.toLowerCase() === cleanUsername.toLowerCase()
    ) {
      router.push(`/${encodeURIComponent(cleanUsername)}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/github/${encodeURIComponent(cleanUsername)}`
      );

      if (!response.ok) {
        console.error("GitHub profile request failed", {
          username: cleanUsername,
          status: response.status,
        });
        return;
      }

      const data: GithubProfile = await response.json();

      if (!data?.login || !data?.avatar_url) {
        console.error("GitHub profile response was incomplete", data);
        return;
      }

      router.push(`/${encodeURIComponent(cleanUsername)}`);
    } catch (error) {
      console.error("GitHub profile request failed", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          gitfolio<span className="text-emerald-400">.</span>
        </Link>

        <Link
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
        >
          GitHub ↗
        </Link>
      </nav>

      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-24 text-center sm:pt-32">
        <div className="mb-8 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm text-emerald-300">
          ✳ Your code deserves to be seen
        </div>

        <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-7xl">
          Your GitHub.
          <br />
          <span className="text-zinc-500">
            Your next opportunity.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
          Turn your GitHub repositories into a developer portfolio
          that makes your work speak for itself.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#111111] px-3 transition-colors focus-within:border-white/25">
            <span className="text-zinc-500">@</span>

            <input
              type="text"
              value={username}
              onChange={(event) => handleUsernameChange(event.target.value)}
              placeholder="Your GitHub username"
              aria-label="GitHub username"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-transparent py-3 text-sm text-white outline-none ring-0 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-400 px-6 py-3 font-medium text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Generate portfolio →
          </button>
        </form>

        <p className="mt-4 text-xs text-zinc-600">
          Free to use · No account required to preview
        </p>

        {profile && (
          <div className="mt-8 flex w-full max-w-xl items-center gap-4 rounded-2xl border border-white/10 bg-[#111111] p-4 text-left">
            <img
              src={profile.avatar_url}
              alt={`${profile.login}'s GitHub avatar`}
              className="h-12 w-12 shrink-0 rounded-xl object-cover"
            />

            <div className="min-w-0">
              <p className="truncate text-base font-semibold">
                {profile.name || profile.login}
              </p>
              <p className="mt-1 truncate text-sm text-zinc-400">
                @{profile.login}
              </p>
              {profile.bio?.trim() && (
                <p className="mt-1 truncate text-sm text-zinc-400">
                  {profile.bio}
                </p>
              )}
              <p className="mt-1 truncate text-sm text-zinc-400">
                {profile.public_repos} repositories
              </p>
              <p className="mt-1 truncate text-sm text-zinc-400">
                {profile.followers} followers
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
