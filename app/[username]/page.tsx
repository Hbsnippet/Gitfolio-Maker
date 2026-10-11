import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AboutSection } from "@/components/portfolio/about-section";
import { ContributionHeatmap } from "@/components/portfolio/contribution-heatmap";
import { LanguageList } from "@/components/portfolio/language-list";
import { PortfolioFooter } from "@/components/portfolio/portfolio-footer";
import { PortfolioShell } from "@/components/portfolio/portfolio-shell";
import { ProfileHero } from "@/components/portfolio/profile-hero";
import { ProjectList } from "@/components/portfolio/project-list";
import {
  getGithubContributions,
  getGithubProfile,
  inferLanguages,
  listPublicRepositories,
  selectProjects,
} from "@/lib/github";

type PortfolioPageProps = {
  params: Promise<{ username: string }>;
};

function displayUsername(rawUsername: string) {
  try {
    return decodeURIComponent(rawUsername).replace(/^@/, "");
  } catch {
    return rawUsername.replace(/^@/, "");
  }
}

export async function generateMetadata({
  params,
}: PortfolioPageProps): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `${displayUsername(username)} · gitfolio`,
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  await connection();

  const { username: rawUsername } = await params;
  const username = displayUsername(rawUsername);
  const profileResult = await getGithubProfile(username);

  if (!profileResult.ok) {
    const missing = profileResult.status === 404 || profileResult.status === 400;

    return (
      <PortfolioShell>
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
          <p className="pf-meta text-xs uppercase tracking-[0.22em] text-pf-faint">
            gitfolio
          </p>
          <h1 className="pf-display mt-4 text-4xl tracking-tight">
            {missing ? "Profile not found" : "Portfolio unavailable"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-pf-muted">
            {missing
              ? `No public GitHub profile matched @${username.replace(/^@/, "")}.`
              : "GitHub did not return a portfolio for this username."}
          </p>
          <Link href="/" className="pf-btn pf-btn-primary mt-8">
            Back to generator
          </Link>
        </div>
        <PortfolioFooter />
      </PortfolioShell>
    );
  }

  const profile = profileResult.data;
  const [repositoryResult, contributions] = await Promise.all([
    listPublicRepositories(profile.login),
    getGithubContributions(profile.login),
  ]);
  const repositories = repositoryResult.ok ? repositoryResult.data : [];
  const projects = selectProjects(repositories, 24);
  const languages = inferLanguages(repositories);

  return (
    <PortfolioShell>
      <ProfileHero profile={profile} />
      <AboutSection profile={profile} languages={languages} />
      <ProjectList projects={projects} />
      <LanguageList languages={languages} />
      {contributions && <ContributionHeatmap weeks={contributions} />}
      <PortfolioFooter githubUrl={profile.html_url} />
    </PortfolioShell>
  );
}
