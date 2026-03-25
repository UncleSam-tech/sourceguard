import axios from 'axios';

const headers: Record<string, string> = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'SourceGuard-MCP-Server-Tier-S'
};

if (process.env.GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const github = axios.create({
  baseURL: 'https://api.github.com/',
  headers
});

export interface GithubRepoInfo {
  name: string;
  owner: string;
  stargazersCount: number;
  openIssuesCount: number;
  hasLicense: boolean;
  updatedAt: string;
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<GithubRepoInfo | null> {
  try {
    const response = await github.get(`/repos/${owner}/${repo}`);
    return {
      name: response.data.name,
      owner: response.data.owner.login,
      stargazersCount: response.data.stargazers_count,
      openIssuesCount: response.data.open_issues_count,
      hasLicense: !!response.data.license,
      updatedAt: response.data.updated_at
    };
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) return null;
      if (err.response?.status === 401) {
        throw new Error(`Your GITHUB_TOKEN is invalid (401 Unauthorized). Please check your .env file and ensure you are using a valid Personal Access Token.`);
      }
      if (err.response?.status === 403) {
        throw new Error(`GitHub API rate limit exceeded (403 Forbidden). Please add a valid GITHUB_TOKEN to your .env file.`);
      }
    }
    throw new Error(`Failed to fetch repo info: ${err.message}`);
  }
}

export async function fetchContributors(owner: string, repo: string): Promise<number[]> {
  try {
    const response = await github.get(`/repos/${owner}/${repo}/contributors?per_page=100`);
    return response.data.map((c: any) => c.contributions as number);
  } catch (err) {
    console.warn(`Could not fetch contributors, might be rate limited: ${err}`);
    return [];
  }
}

export async function fetchLatestCommit(owner: string, repo: string): Promise<string | null> {
  try {
    const response = await github.get(`/repos/${owner}/${repo}/commits?per_page=1`);
    if (response.data && response.data.length > 0) {
      return response.data[0].sha;
    }
    return null;
  } catch (err) {
    console.warn(`Could not fetch latest commit: ${err}`);
    return null;
  }
}
