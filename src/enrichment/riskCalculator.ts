import { IntelligenceReport } from '../types.js';

export function calculateRisk(
  busFactor: number,
  recentCommitActivity: 'HIGH' | 'MEDIUM' | 'LOW' | 'STAGNANT',
  hasLicense: boolean,
  vulnerabilitiesCount: number
): { score: IntelligenceReport['supplyChainRiskScore'], recommendedAction: string, riskFactors: string[] } {
  let scoreValue = 100;
  const riskFactors: string[] = [];

  if (busFactor === 1) {
    scoreValue -= 20;
    riskFactors.push("High Bus Factor: 1 developer controls >50% of recent code contributions.");
  } else if (busFactor <= 2) {
    riskFactors.push("Moderate Bus Factor: Only 2 developers control >50% of the codebase.");
  }

  if (recentCommitActivity === 'STAGNANT') {
    scoreValue -= 40;
    riskFactors.push(`Project is stagnant. The repository has not been updated in over a year.`);
  } else if (recentCommitActivity === 'LOW') {
    scoreValue -= 15;
    riskFactors.push(`Low velocity. The repository has not been updated in > 90 days.`);
  }

  if (!hasLicense) {
    scoreValue -= 30;
    riskFactors.push("No explicit open-source license detected. Operationally unsafe for commercial deployment.");
  }

  if (vulnerabilitiesCount > 0) {
    scoreValue -= (vulnerabilitiesCount * 15);
    riskFactors.push(`Contains ${vulnerabilitiesCount} known unpatched zero-day/CVE vulnerabilities on HEAD commit.`);
  }

  let score: IntelligenceReport['supplyChainRiskScore'] = 'A';
  if (scoreValue >= 90) score = 'A';
  else if (scoreValue >= 70) score = 'B';
  else if (scoreValue >= 50) score = 'C';
  else if (scoreValue >= 30) score = 'D';
  else score = 'F';

  let recommendedAction = "Green light for commercial AI production use. Repository is healthy, actively maintained, and architecturally secure.";
  if (score === 'F') {
    recommendedAction = "DO NOT INSTALL. Critical vulnerabilities or abandoned maintenance status detected. Please search for an alternative library immediately.";
  } else if (score === 'D' || score === 'C') {
    recommendedAction = "Use with extreme caution. Requires manual human audit of outstanding vulnerabilities, or consider forking if it's abandoned.";
  } else if (score === 'B') {
    recommendedAction = "Safe to use for AI coding tasks, but monitor for future stagnation or unpatched minor vulnerabilities.";
  }

  return { score, recommendedAction, riskFactors };
}
