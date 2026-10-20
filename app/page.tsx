"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, Building2, MapPin } from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

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

// Content for the marketing sections. Keeping the copy in small arrays lets the
// JSX below stay a plain, readable map instead of three near-identical blocks.
const EXAMPLE_USERNAMES = ["torvalds", "Sarthak-sama", "sindresorhus"];

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
];

const STEPS = [
  {
    title: "Enter your username",
    body: "Type your GitHub handle and Gitfolio fetches your public profile instantly — no signup and no private data.",
  },
  {
    title: "Preview your portfolio",
    body: "Your profile is laid out as a shareable portfolio in the preview, ready for you to look through.",
  },
  {
    title: "Share your link",
    body: "Open your portfolio at its own address and share it in a résumé, a DM, or your GitHub bio.",
  },
];

const FEATURES = [
  {
    title: "Your profile",
    body: "Avatar, name, bio and follower count, pulled straight from GitHub.",
  },
  {
    title: "Relevant repositories",
    body: "Your most relevant repos, laid out so people can scan them quickly.",
  },
  {
    title: "Languages",
    body: "The languages you actually work in, shown at a glance.",
  },
];

const ABOUT_CHIPS = ["no signup", "public data only", "open source"];


const SAMPLE_STICKER = {
  login: "ada-codes",
  bio: "Builds small useful things",
  stats: [
    { value: "128", label: "followers" },
    { value: "24", label: "repositories" },
  ],
};

// The design's stat labels are plural; a real account can have exactly one.
function statLabel(count: number | null, one: string, many: string) {
  return count === 1 ? one : many;
}

// How far down the page (px) before the floating "back to top" control appears.
const BACK_TO_TOP_THRESHOLD = 600;

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<GithubProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  // Reveal the floating "back to top" control once the visitor has scrolled a
  // screenful. The first check is deferred with requestAnimationFrame so we can
  // pick up a restored scroll position without setting state during the effect.
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > BACK_TO_TOP_THRESHOLD);
    };

    const frame = window.requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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

  return (
    <div className="home flex flex-1 flex-col">
      {/* ---------- Navbar ---------- */}
      {/* Zero-height anchor for "back to top" / logo clicks. It can't live on
          the sticky header: a stuck element is already in view, so jumping to
          it would be a no-op. */}
      <div id="top" />

      <header className="home-nav">
        <div className="home-wrap">
          <a className="home-logo" href="#top">
            gitfolio
            {/* Hand-drawn underline. Decorative, and it stretches with the
                word at every breakpoint. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 100 8"
              preserveAspectRatio="none"
            >
              <path
                d="M1 5 C20 1,35 8,55 4 S85 2,99 5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </svg>
          </a>

          <nav className="home-links">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}

            <a
              className="home-gh"
              href="https://github.com/Hbsnippet/Gitfolio-Maker"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ★
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-x-clip">
        {/* ---------- Hero ---------- */}
        <div className="home-wrap">
          <section id="generator" className="home-hero">
            {/* Left: pitch + generator */}
            <div>
              <p className="home-eyebrow home-hand">github → portfolio</p>

              <h1 className="home-h1">
                Your GitHub, presented{" "}
                <span className="home-mark">
                  properly.
                  {/* Hand-drawn underline under "properly." */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 200 16"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 9 C30 2,50 14,90 8 S160 4,198 9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <form className="home-form" onSubmit={handleSubmit}>
                {/* Handwritten note pointing at the input. Decorative, so it
                    stays out of the way of pointer events. */}
                <span aria-hidden="true" className="home-note home-hand">
                  type it here!
                  <svg viewBox="0 0 44 36">
                    <path
                      d="M40 2 C40 18,26 28,6 30 M14 22 L5 30 L16 33"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <input
                  type="text"
                  value={username}
                  onChange={(event) => handleUsernameChange(event.target.value)}
                  placeholder="Your GitHub username"
                  aria-label="GitHub username"
                  autoComplete="off"
                  spellCheck={false}
                />

                <button type="submit" disabled={loading || Boolean(error)}>
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
                <p role="alert" className="home-error">
                  {error}
                </p>
              )}

              <div className="home-try">
                <span>Try:</span>
                {EXAMPLE_USERNAMES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleUsernameChange(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: the live preview sticker — a small taped-on card that
                shows either the sample or the profile we just fetched. Once a
                real profile is in, the whole card links to its portfolio. */}
            <div className="home-stage">
              {profile ? (
                <PreviewSticker
                  href={`/${encodeURIComponent(profile.login)}`}
                  label={`Open ${profile.login}'s portfolio`}
                >
                  <div className="home-who">
                    <img
                      className="home-av object-cover"
                      src={profile.avatar_url}
                      alt=""
                    />
                    <div className="min-w-0">
                      <b className="truncate">{profile.login}</b>
                      {profile.bio && (
                        <span className="line-clamp-2">{profile.bio}</span>
                      )}
                    </div>
                  </div>

                  <div className="home-stats">
                    <div>
                      <strong>{profile.followers}</strong>{" "}
                      {statLabel(profile.followers, "follower", "followers")}
                    </div>
                    <div>
                      <strong>{profile.public_repos}</strong>{" "}
                      {statLabel(
                        profile.public_repos,
                        "repository",
                        "repositories"
                      )}
                    </div>
                  </div>

                  {(profile.location || profile.company) && (
                    <div className="home-meta">
                      {profile.location && (
                        <span>
                          <MapPin aria-hidden="true" />
                          <span>{profile.location}</span>
                        </span>
                      )}
                      {profile.company && (
                        <span>
                          <Building2 aria-hidden="true" />
                          <span>{profile.company}</span>
                        </span>
                      )}
                    </div>
                  )}
                </PreviewSticker>
              ) : (
                <PreviewSticker sample>
                  <div className="home-who">
                    <div className="home-av">🐙</div>
                    <div className="min-w-0">
                      <b className="truncate">{SAMPLE_STICKER.login}</b>
                      <span className="truncate">{SAMPLE_STICKER.bio}</span>
                    </div>
                  </div>

                  <div className="home-stats">
                    {SAMPLE_STICKER.stats.map((stat) => (
                      <div key={stat.label}>
                        <strong>{stat.value}</strong> {stat.label}
                      </div>
                    ))}
                  </div>
                </PreviewSticker>
              )}
            </div>
          </section>
        </div>

        {/* ---------- How it works ---------- */}
        <section id="how-it-works" className="home-section home-alt">
          <div className="home-wrap">
            <div className="home-sec-label home-hand">how it works</div>
            <h2 className="home-h2">
              Three steps. <span className="home-hl">No configuration.</span>
            </h2>

            <ol className="home-cols">
              {STEPS.map((step, index) => (
                <li key={step.title} className="home-col">
                  <div className="home-num home-hand">{index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>

                  {index < STEPS.length - 1 && (
                    <svg
                      aria-hidden="true"
                      className="home-arr"
                      viewBox="0 0 46 26"
                    >
                      <path
                        d="M2 14 C16 4,28 22,42 12 M34 6 L43 12 L33 19"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Features ---------- */}
        <section id="features" className="home-section">
          <div className="home-wrap">
            <div className="home-sec-label home-hand">features</div>
            <h2 className="home-h2">
              Just what a <span className="home-hl">portfolio needs.</span>
            </h2>

            <div className="home-cols">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="home-col">
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- About ---------- */}
        <section
          id="about"
          className="home-section home-section-about"
        >
          <div className="home-wrap">
            <div className="home-about">
              <div>
                <div className="home-sec-label home-hand">about</div>
                <h2 className="home-h2">
                  A portfolio that stays in{" "}
                  <span className="home-hl">sync</span> with your GitHub.
                </h2>
              </div>

              <div>
                <p>
                  Gitfolio turns a public GitHub profile into a clean, shareable
                  portfolio — no signup and no build step. It reads only public
                  data, and the result lives at its own address, ready to drop
                  into a résumé, a DM, or your GitHub bio.
                </p>

                <hr />

                <div className="home-chips home-hand">
                  {ABOUT_CHIPS.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="home-footer">
        <div className="home-wrap">
          <div className="home-footer-top">
            <div>
              <a className="home-logo" href="#top">
                gitfolio
              </a>
              <p>Turn your GitHub into a portfolio you can share anywhere.</p>
            </div>

            <nav className="home-links">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
              <a
                href="https://github.com/Hbsnippet/Gitfolio-Maker"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </nav>
          </div>

          <div className="home-fine">
            Gitfolio — built on the GitHub API. Not affiliated with GitHub.
          </div>
        </div>
      </footer>

      {/* ---------- Floating "back to top" ---------- */}
      {showBackToTop && (
        <a href="#top" aria-label="Back to top" className="home-top">
          <ArrowUp aria-hidden="true" className="h-[18px] w-[18px]" />
        </a>
      )}
    </div>
  );
}

// The taped-on card that both previews share. With an `href` the whole card is
// one link, so the portfolio is reachable by click, keyboard or assistive tech.
// The sample variant stays inert and is exposed as a single image with a
// describing label, so the placeholder profile is announced as a sample rather
// than read out as if it were a real account.
function PreviewSticker({
  href,
  label,
  sample = false,
  children,
}: {
  href?: string;
  label?: string;
  sample?: boolean;
  children: ReactNode;
}) {
  const content = (
    <>
      <span aria-hidden="true" className="home-tape" />
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className="home-sticker">
        {content}
      </Link>
    );
  }

  return (
    <div
      className="home-sticker"
      role={sample ? "img" : undefined}
      aria-label={
        sample
          ? "Sample portfolio preview — example data, not a real account"
          : undefined
      }
    >
      {content}
    </div>
  );
}
