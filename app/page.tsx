
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
// import { CloudShader } from "@/components/ui/cloud-shader";

// import Prism from "@/components/backgrounds/prism";

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
          console.error("GitHub profile preview failed", response.status);
          return;
        }

        const data: GithubProfile = await response.json();

        if (controller.signal.aborted) return;

        if (data?.login && data?.avatar_url) {
          setProfile(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Gi1tHub profile preview failed", error);
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
        console.error("GitHub profile request failed", response.status);
        return;
      }

      const data: GithubProfile = await response.json();

      if (!data?.login || !data?.avatar_url) return;

      router.push(`/${encodeURIComponent(cleanUsername)}`);
    } catch (error) {
      console.error("GitHub profile request failed", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#080910] text-white">
      <link rel="preload" as="image" href="/home-bg.jpg" fetchPriority="high" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* <Prism
          animationType="rotate"
          timeScale={0.2}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        /> */}

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/home-bg.jpg')",
          }}
        />

          {/* <CloudShader
    className="absolute inset-0 h-full w-full"
    speed={0.25}
    count={5}
    cloudColor="#fff8f3"
    skyTopColor="#3876ba"
    skyBottomColor="#8cbfe8"
  /> */}
      </div>

      {/* Floating glass navbar */}
      <header className="relative z-10 px-4 pt-5 sm:px-6 sm:pt-7">
        <nav className="mx-auto flex max-w-3xl items-center justify-between rounded-full border border-white/25 bg-white/[0.07] px-5 py-3.5 shadow-lg shadow-black/5 backdrop-blur-xl sm:px-6">
          <Link
            href="/"
            className="text-xl font-semibold italic tracking-tight text-white"
          >
            gitfolio
          </Link>

          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#101116]/80 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#24252d]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.69 2.6 1.2 3.23.92.1-.72.39-1.2.7-1.47-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.12-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.12 2.96.71.78 1.14 1.78 1.14 3 0 4.29-2.6 5.23-5.09 5.51.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
            </svg>
            GitHub <span className="text-amber-300">★</span>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      

<section className="relative z-10 mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center px-5 pb-16 pt-40 text-center sm:px-6 sm:pt-60">

  <h1 className="text-5xl font-medium italic tracking-tight text-white sm:text-6xl md:text-7xl">
    gitfolio
  </h1>

  <p className="mt-6 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
    Turn your GitHub into a stunning portfolio.
    <br className="hidden sm:block" />
    Your work, beautifully presented.
  </p>

  <form
    onSubmit={handleSubmit}
    className="mt-10 flex w-full max-w-lg items-center gap-2 rounded-xl border border-white/25 bg-white/[0.10] p-2 shadow-lg backdrop-blur-xl"
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="ml-2 h-5 w-5 shrink-0 text-white/80"
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
      className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-white/70"
    />

    <button
      type="submit"
      disabled={loading}
      className="shrink-0 rounded-lg bg-[#111318] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
    >
      {loading ? "..." : "Generate"}
    </button>
  </form>

  {profile && (
    <div className="mt-8 flex w-full max-w-lg items-center gap-3 rounded-xl border border-white/25 bg-white/10 p-4 text-left shadow-lg shadow-black/10 backdrop-blur-xl">
      <img
        src={profile.avatar_url}
        alt={`${profile.login}'s GitHub avatar`}
        className="h-12 w-12 shrink-0 rounded-full border border-white/40 object-cover"
      />

      <div className="min-w-0 flex-1 [text-shadow:0_1px_2px_rgba(2,6,23,0.45)]">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate text-sm font-semibold text-white">
            {profile.name || profile.login}
          </span>
          <span className="truncate text-xs text-white/85">@{profile.login}</span>
        </p>

        {profile.bio && (
          <p className="mt-1 truncate text-xs text-white/90">
            {profile.bio}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/85">
          {profile.location && (
            <span className="flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-3.5 w-3.5 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <span className="truncate">{profile.location}</span>
            </span>
          )}
          {profile.company && (
            <span className="flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-3.5 w-3.5 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                />
              </svg>
              <span className="truncate">{profile.company}</span>
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/85">
          <span className="flex items-center gap-1.5">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-3.5 w-3.5 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.104a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
            <span>{profile.followers} followers</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-3.5 w-3.5 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
              />
            </svg>
            <span>{profile.public_repos} repos</span>
          </span>
        </div>
      </div>
    </div>
  )}

  <p className="mt-8 text-xs text-white/80">
    Try example:{" "}
    <button
      type="button"
      onClick={() => handleUsernameChange("torvalds")}
      className="underline underline-offset-4 transition hover:text-white"
    >
      torvalds
    </button>
  </p>
</section>

    </main>
  );
}
