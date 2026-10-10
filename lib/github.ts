export type GithubProfile = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  created_at: string | null;
  hireable: boolean | null;
};

export type GithubRepository = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number | null;
  owner: string | null;
  language: string | null;
  fork: boolean;
  updated_at: string;
};

export type GithubLanguageShare = {
  name: string;
  repositories: number;
};

export type ContributionDay = {
  date: string;
  count: number;
};

export type ContributionWeek = ContributionDay[];

type GithubFailure = {
  ok: false;
  status: number;
  error: string;
};

type GithubSuccess<T> = {
  ok: true;
  data: T;
};

type GithubResult<T> = GithubSuccess<T> | GithubFailure;

const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

type GithubProfilePayload = GithubProfile;

type GithubRepoPayload = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count?: number;
  owner?: { login?: string };
  language: string | null;
  fork: boolean;
  updated_at: string;
};

type ContributionCalendarPayload = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: Array<{
            contributionDays?: Array<{
              date?: string;
              contributionCount?: number;
            }>;
          }>;
        };
      };
    } | null;
  };
  errors?: unknown[];
};

export function normalizeGithubUsername(rawUsername: string) {
  let decoded = rawUsername;

  try {
    decoded = decodeURIComponent(rawUsername);
  } catch {
    return null;
  }

  const username = decoded.trim().replace(/^@/, "");

  if (!USERNAME_PATTERN.test(username)) return null;

  return username;
}

async function githubRequest(path: string): Promise<Response | GithubFailure> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      ok: false,
      status: 500,
      error: "GitHub integration is not configured.",
    };
  }

  try {
    return await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 502,
      error: "Unable to reach GitHub.",
    };
  }
}

function failureFromResponse(response: Response): GithubFailure | null {
  if (response.ok) return null;

  if (response.status === 404) {
    return { ok: false, status: 404, error: "GitHub user not found." };
  }

  const rateLimited =
    response.status === 429 ||
    (response.status === 403 &&
      response.headers.get("x-ratelimit-remaining") === "0");

  if (rateLimited) {
    return { ok: false, status: 429, error: "GitHub rate limit exceeded." };
  }

  return {
    ok: false,
    status: response.status === 401 ? 401 : 502,
    error: "GitHub request failed.",
  };
}

export async function getGithubProfile(
  rawUsername: string
): Promise<GithubResult<GithubProfile>> {
  const username = normalizeGithubUsername(rawUsername);

  if (!username) {
    return { ok: false, status: 400, error: "Invalid GitHub username." };
  }

  const response = await githubRequest(
    `/users/${encodeURIComponent(username)}`
  );

  if (!(response instanceof Response)) return response;

  const failure = failureFromResponse(response);

  if (failure) return failure;

  const data: GithubProfilePayload = await response.json();

  if (!data?.login || !data?.avatar_url) {
    return { ok: false, status: 502, error: "GitHub request failed." };
  }

  return {
    ok: true,
    data: {
      login: data.login,
      name: data.name ?? null,
      avatar_url: data.avatar_url,
      bio: data.bio ?? null,
      html_url: data.html_url,
      public_repos: data.public_repos ?? 0,
      followers: data.followers ?? 0,
      following: data.following ?? 0,
      location: data.location?.trim() || null,
      company: data.company?.trim() || null,
      blog: data.blog?.trim() || null,
      twitter_username: data.twitter_username?.trim() || null,
      created_at: data.created_at ?? null,
      hireable: data.hireable ?? null,
    },
  };
}

function mapRepository(repo: GithubRepoPayload): GithubRepository | null {
  if (!repo?.name || !repo?.html_url) return null;

  return {
    id: repo.id,
    name: repo.name,
    description: repo.description ?? null,
    html_url: repo.html_url,
    homepage: repo.homepage?.trim() || null,
    stargazers_count: repo.stargazers_count ?? 0,
    forks_count: repo.forks_count ?? 0,
    open_issues_count:
      typeof repo.open_issues_count === "number" ? repo.open_issues_count : null,
    owner: repo.owner?.login?.trim() || null,
    language: repo.language ?? null,
    fork: Boolean(repo.fork),
    updated_at: repo.updated_at,
  };
}

async function fetchPublicRepositories(
  rawUsername: string
): Promise<GithubResult<GithubRepository[]>> {
  const username = normalizeGithubUsername(rawUsername);

  if (!username) {
    return { ok: false, status: 400, error: "Invalid GitHub username." };
  }

  const response = await githubRequest(
    `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`
  );

  if (!(response instanceof Response)) return response;

  const failure = failureFromResponse(response);

  if (failure) return failure;

  const data: GithubRepoPayload[] = await response.json();

  if (!Array.isArray(data)) {
    return { ok: false, status: 502, error: "GitHub request failed." };
  }

  return {
    ok: true,
    data: data.flatMap((repo) => {
      const mapped = mapRepository(repo);
      return mapped ? [mapped] : [];
    }),
  };
}

export async function listPublicRepositories(rawUsername: string) {
  return fetchPublicRepositories(rawUsername);
}

export function selectProjects(
  repositories: GithubRepository[],
  limit = 6
) {
  const originals = repositories.filter((repo) => !repo.fork);
  const source = originals.length > 0 ? originals : repositories;

  return [...source]
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        b.updated_at.localeCompare(a.updated_at)
    )
    .slice(0, limit);
}

export function inferLanguages(
  repositories: GithubRepository[]
): GithubLanguageShare[] {
  const counts = new Map<string, number>();

  for (const repository of repositories) {
    if (repository.fork || !repository.language) continue;
    counts.set(repository.language, (counts.get(repository.language) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, repositoryCount]) => ({
      name,
      repositories: repositoryCount,
    }))
    .sort((a, b) => b.repositories - a.repositories || a.name.localeCompare(b.name));
}

export async function getGithubRepositories(
  rawUsername: string
): Promise<GithubResult<GithubRepository[]>> {
  const result = await fetchPublicRepositories(rawUsername);

  if (!result.ok) return result;

  const originals = result.data.filter((repo) => !repo.fork);
  const projects = (originals.length > 0 ? originals : result.data).slice(0, 9);

  return { ok: true, data: projects };
}

export async function getGithubContributions(
  rawUsername: string
): Promise<ContributionWeek[] | null> {
  const username = normalizeGithubUsername(rawUsername);
  const token = process.env.GITHUB_TOKEN;

  if (!username || !token) return null;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }`,
        variables: { login: username },
      }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload: ContributionCalendarPayload = await response.json();
    const weeks =
      payload.data?.user?.contributionsCollection?.contributionCalendar?.weeks;

    if (payload.errors || !Array.isArray(weeks) || weeks.length === 0) {
      return null;
    }

    const calendar = weeks.flatMap((week) => {
      const days = (week.contributionDays ?? []).flatMap((day) => {
        if (!day.date || typeof day.contributionCount !== "number") return [];
        return [{ date: day.date, count: day.contributionCount }];
      });

      return days.length > 0 ? [days] : [];
    });

    return calendar.length > 0 ? calendar : null;
  } catch {
    return null;
  }
}
