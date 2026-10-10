"use client";

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
        <h2 className="font-serif text-4xl tracking-tight">Featured work</h2>
        <p className="mt-3 text-sm leading-6 text-[#8A7B6E]">
          Public repositories, ordered by stars.
        </p>
      </div>

      {visibleProjects.length > 0 ? (
        <>
          <div className="mt-8 grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {visibleCount < projects.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + INITIAL_COUNT)}
              className="mt-6 rounded-full border border-[#C78368] px-5 py-2 text-sm text-[#C78368] transition hover:bg-[#C78368] hover:text-[#F5F0E6]"
            >
              View more
            </button>
          )}
        </>
      ) : (
        <p className="mt-8 rounded-2xl border border-[#E4DDD0] bg-[#FBF8F2] px-6 py-8 text-sm text-[#8A7B6E]">
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
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4DDD0] bg-[#FBF8F2] transition duration-200 hover:-translate-y-0.5 hover:border-[#C78368]/50">
      <div className="bg-[#FFFcf8] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {project.owner && (
              <p className="truncate text-xs text-[#8A7B6E]">{project.owner}</p>
            )}
            <p className="truncate text-sm font-medium text-[#40362E]">
              {project.name}
            </p>
          </div>
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-[#40362E]"
            style={{ backgroundColor: `${accent}33` }}
          >
            {initials(project.name)}
          </span>
        </div>
        <dl className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#8A7B6E]">
          {project.open_issues_count !== null && (
            <Stat label="Open issues" value={project.open_issues_count} />
          )}
          <Stat label="Stars" value={project.stargazers_count} />
          <Stat label="Forks" value={project.forks_count} />
        </dl>
      </div>
      <div className="h-1" style={{ backgroundColor: accent }} />
      <div className="flex flex-1 flex-col px-4 py-4">
        <h3 className="truncate font-serif text-xl text-[#40362E]">{project.name}</h3>
        {project.description?.trim() && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5C5148]">
            {project.description}
          </p>
        )}
        {project.language && (
          <div className="mt-3">
            <span className="rounded-full border border-[#E4DDD0] bg-[#F5F0E6] px-2.5 py-1 text-xs text-[#6E7564]">
              {project.language}
            </span>
          </div>
        )}
        <p className="mt-3 text-xs text-[#8A7B6E]">
          {project.stargazers_count.toLocaleString()} stars
          <span className="px-1.5 text-[#D9D3C6]">/</span>
          {project.forks_count.toLocaleString()} forks
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <a
            href={project.html_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#E4DDD0] px-3 py-1.5 text-sm transition hover:border-[#40362E]"
          >
            Code
          </a>
          {demo && (
            <a
              href={demo}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#C78368] px-3 py-1.5 text-sm text-[#F5F0E6] transition hover:bg-[#B57258]"
            >
              Live Demo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="font-medium text-[#40362E]">{value.toLocaleString()}</span>{" "}
        {label}
      </dd>
    </div>
  );
}
