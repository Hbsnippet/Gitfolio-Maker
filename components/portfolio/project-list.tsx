"use client";

import { CircleDot, Code, ExternalLink, GitFork, Star } from "lucide-react";
import { useState } from "react";
import type { GithubRepository } from "@/lib/github";

const INITIAL_COUNT = 6;

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#C78368",
  TypeScript: "#8E9A84",
  Python: "#6E8B74",
  Go: "#7F93A6",
  Rust: "#A68462",
  Ruby: "#B56B62",
  Java: "#8C7358",
  Kotlin: "#A68462",
  Swift: "#C4956A",
  "C++": "#6E7564",
  C: "#6E7564",
  "C#": "#7E6B8A",
  PHP: "#8A7494",
  HTML: "#C78368",
  CSS: "#7E8C9A",
  Shell: "#8A7B6E",
  Dart: "#6E8B9A",
  Vue: "#7E9478",
};

const NAME_COLORS = ["#C78368", "#A6AD91", "#8C7358", "#7E8C78", "#B08968", "#8A7B6E"];

function liveDemoUrl(homepage: string | null) {
  if (!homepage) return null;

  try {
    const url = new URL(homepage);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function accentColor(language: string | null, name: string) {
  if (language && LANGUAGE_COLORS[language]) return LANGUAGE_COLORS[language];

  const source = language || name;
  const index = [...source].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return NAME_COLORS[index % NAME_COLORS.length];
}

function initials(name: string) {
  const letters = name
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");

  return letters.join("") || name.slice(0, 2).toUpperCase();
}

export function ProjectList({ projects }: { projects: GithubRepository[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const visibleProjects = projects.slice(0, visibleCount);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-md">
        <h2 className="pf-display text-4xl tracking-tight" data-pf-marker="02 / projects">
          Featured work
        </h2>
        <p className="mt-3 text-sm leading-6 text-pf-muted">
          Public repositories, ordered by stars.
        </p>
      </div>

      {visibleProjects.length > 0 ? (
        <>
          <div className="pf-projects-grid mt-8 grid grid-cols-1 items-stretch gap-[var(--pf-grid-gap)] md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {visibleCount < projects.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + INITIAL_COUNT)}
              className="pf-btn pf-btn-secondary mt-6"
            >
              View more
            </button>
          )}
        </>
      ) : (
        <p className="pf-card mt-8 px-6 py-8 text-sm text-pf-muted">
          No public repositories to show.
        </p>
      )}
    </section>
  );
}

function ProjectCard({ project }: { project: GithubRepository }) {
  const demo = liveDemoUrl(project.homepage);
  const accent = accentColor(project.language, project.name);

  return (
    <article className="pf-card pf-card-interactive pf-project-card flex h-full flex-col p-[var(--pf-card-pad)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {project.owner && (
            <p className="pf-meta truncate text-[11px] uppercase tracking-[0.14em] text-pf-faint">
              {project.owner}
            </p>
          )}
          <h3
            className="pf-display mt-1 truncate text-lg leading-snug text-pf-fg"
            title={project.name}
          >
            {project.name}
          </h3>
        </div>
        <span
          aria-hidden
          className="pf-meta flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--pf-badge-radius)] text-[11px] font-medium text-pf-fg"
          style={{ backgroundColor: `${accent}2e` }}
        >
          {initials(project.name)}
        </span>
      </div>

      {project.description?.trim() ? (
        <p className="mt-3 line-clamp-3 wrap-anywhere text-sm leading-6 text-pf-muted">
          {project.description}
        </p>
      ) : (
        <p className="mt-3 text-sm italic text-pf-faint">No description provided.</p>
      )}

      <div className="pf-meta mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-pf-muted">
        {project.language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            {project.language}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Star aria-hidden className="h-3.5 w-3.5" />
          {project.stargazers_count.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <GitFork aria-hidden className="h-3.5 w-3.5" />
          {project.forks_count.toLocaleString()}
        </span>
        {project.open_issues_count !== null && (
          <span className="inline-flex items-center gap-1.5">
            <CircleDot aria-hidden className="h-3.5 w-3.5" />
            {project.open_issues_count.toLocaleString()}
          </span>
        )}
      </div>

      <div className="mt-auto flex gap-2 pt-5">
        <a
          href={project.html_url}
          target="_blank"
          rel="noreferrer"
          className="pf-btn pf-btn-secondary flex-1"
        >
          <Code aria-hidden className="h-4 w-4" />
          Code
        </a>
        {demo && (
          <a
            href={demo}
            target="_blank"
            rel="noreferrer"
            className="pf-btn pf-btn-primary flex-1"
          >
            Live Demo
            <ExternalLink aria-hidden className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
