
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import Prism from "@/components/backgrounds/prism";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    <main className="relative isolate min-h-screen overflow-hidden bg-[#05060f] text-white">
      {/* Official React Bits Prism background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        />
      </div>

      {/* Keep all existing Gitfolio content above Prism */}
      <div className="relative z-10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            gitfolio<span className="text-emerald-400">.</span>
          </Link>

          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-200 backdrop-blur-md transition hover:border-white/25 hover:bg-white/10"
          >
            GitHub ↗
          </Link>
        </nav>

        <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-24 text-center sm:pt-32">
          <div className="mb-8 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm text-emerald-300 backdrop-blur-sm">
            ✳ Your code deserves to be seen
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-7xl">
            Your GitHub.
            <br />
            <span className="text-zinc-300">
              Your next opportunity.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
            Turn your GitHub repositories into a developer portfolio
            that makes your work speak for itself.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/20 bg-white/[0.08] px-3 backdrop-blur-xl transition-colors focus-within:border-white/40 focus-within:bg-white/[0.12]">
              <span className="text-zinc-300">@</span>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  handleUsernameChange(event.target.value)
                }
                placeholder="Your GitHub username"
                aria-label="GitHub username"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-400 px-6 py-3 font-medium text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate portfolio →"}
            </button>
          </form>

          <p className="mt-4 text-xs text-zinc-300">
            Free to use · No account required to preview
          </p>

          {profile && (
            <div className="mt-8 flex w-full max-w-xl items-center gap-4 rounded-2xl border border-white/20 bg-white/[0.09] p-4 text-left backdrop-blur-xl">
              <img
                src={profile.avatar_url}
                alt={`${profile.login}'s GitHub avatar`}
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />

              <div className="min-w-0">
                <p className="truncate text-base font-semibold">
                  {profile.name || profile.login}
                </p>

                <p className="mt-1 truncate text-sm text-zinc-300">
                  @{profile.login}
                </p>

                {profile.bio && (
                  <p className="mt-1 truncate text-sm text-zinc-300">
                    {profile.bio}
                  </p>
                )}

                <p className="mt-1 truncate text-sm text-zinc-300">
                  {profile.public_repos} repositories
                </p>

                <p className="mt-1 truncate text-sm text-zinc-300">
                  {profile.followers} followers
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
