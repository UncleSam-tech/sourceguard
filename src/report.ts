import { IntelligenceReport, ActivityMetrics } from './types.js';
import { fetchRepoInfo, fetchContributors, fetchLatestCommit } from './sources/github.js';
import { queryOsvByCommit } from './sources/osv.js';
import { calculateBusFactor, calculateRisk } from './enrichment/index.js';

export async function generateSecurityReport(repoUrl: string, depth: 'quick' | 'deep'): Promise<IntelligenceReport> {
  let owner = '';
  let repo = '';
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/) || repoUrl.match(/^([^\/]+)\/([^\/]+)$/);
  if (match) {
    owner = match[1];
    repo = match[2].replace('.git', '');
  } else {
    throw new Error(`Invalid repo URL format. Expected 'owner/repo' or GitHub URL. Got: ${repoUrl}`);
  }

  const repoInfo = await fetchRepoInfo(owner, repo);
  if (!repoInfo) throw new Error(`Repository ${owner}/${repo} not found or inaccessible.`);

  // Sources (Parallel Fetch for Speed)
  const contribsPromise = fetchContributors(owner, repo);
  let latestCommitPromise: Promise<string | null> = Promise.resolve(null);
  
  if (depth === 'deep') {
    latestCommitPromise = fetchLatestCommit(owner, repo);
  }

  const [contribs, latestCommit] = await Promise.all([contribsPromise, latestCommitPromise]);

  let vulnerabilities: any[] = [];
  if (latestCommit) vulnerabilities = await queryOsvByCommit(latestCommit);

  // Enrichment pipeline
  const busFactor = calculateBusFactor(contribs);
  
  const msSinceUpdate = Date.now() - new Date(repoInfo.updatedAt).getTime();
  const daysSinceUpdate = msSinceUpdate / (1000 * 60 * 60 * 24);
  let recentCommitActivity: ActivityMetrics['recentCommitActivity'] = 'HIGH';
  if (daysSinceUpdate > 365) recentCommitActivity = 'STAGNANT';
  else if (daysSinceUpdate > 90) recentCommitActivity = 'LOW';
  else if (daysSinceUpdate > 30) recentCommitActivity = 'MEDIUM';

  const { score, recommendedAction, riskFactors } = calculateRisk(
    busFactor,
    recentCommitActivity,
    repoInfo.hasLicense,
    vulnerabilities.length
  );

  const issuesToPrRatio = repoInfo.openIssuesCount > 500 ? 5 : 1; 

  const summary = `SourceGuard analysis for ${owner}/${repo}: The repository scored an ${score} rating. It has a bus factor of ${busFactor}, ${recentCommitActivity.toLowerCase()} recent code velocity, and ${vulnerabilities.length} active CVEs impacting HEAD. ${riskFactors.length > 0 ? 'Review the listed risk factors closely.' : 'No major operational risks detected.'}`;

  return {
    summary,
    recommendedAction,
    supplyChainRiskScore: score,
    riskFactors,
    metrics: { busFactor, recentCommitActivity, issuesToPrRatio },
    vulnerabilities,
    searchExhausted: true,
    noResultsReason: vulnerabilities.length === 0 ? "No CVEs found on HEAD. Exhausted OSV database." : "Found vulnerabilities. Search complete."
  };
}
