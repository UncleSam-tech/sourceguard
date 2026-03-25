import { z } from 'zod';

export const analyzeSourceRepoSchema = z.object({
  repoUrl: z.string().describe("The full URL or 'owner/repo' string representing the GitHub repository"),
  depth: z.enum(['quick', 'deep']).optional().default('quick').describe("Analysis depth: 'quick' checks basic health & dependencies, 'deep' checks full contributor attribution.")
});

export type AnalyzeSourceRepoInput = z.infer<typeof analyzeSourceRepoSchema>;

export const vulnerabilitySchema = z.object({
  id: z.string().describe("The OSV vulnerability ID"),
  summary: z.string().describe("Short summary of the vulnerability"),
  severity: z.string().describe("Severity exactly as reported (e.g. HIGH, MODERATE, LOW)")
});
export type Vulnerability = z.infer<typeof vulnerabilitySchema>;

export const activityMetricsSchema = z.object({
  busFactor: z.number().describe("Minimum number of developers making up >50% of commits (lower is higher risk)"),
  recentCommitActivity: z.enum(['HIGH', 'MEDIUM', 'LOW', 'STAGNANT']).describe("Categorized velocity of recent code changes"),
  issuesToPrRatio: z.number().describe("Number of open issues vs open PRs roughly indicating maintenance burden")
});
export type ActivityMetrics = z.infer<typeof activityMetricsSchema>;

export const intelligenceReportSchema = z.object({
  summary: z.string().describe("Human-readable executive summary of the repository's health and security posture"),
  recommendedAction: z.string().describe("Clear, actionable recommendation for an AI coding agent (e.g. 'Safe to use', 'High risk, abandon')"),
  supplyChainRiskScore: z.enum(['A', 'B', 'C', 'D', 'F']).describe("Curated overall security and maintenance risk score where A is excellent and F is critical risk"),
  riskFactors: z.array(z.string()).describe("List of exact warnings discovered during analysis"),
  metrics: activityMetricsSchema.describe("Raw empirical metrics collected from repository (for context)"),
  vulnerabilities: z.array(vulnerabilitySchema).describe("Known vulnerabilities affecting the codebase HEAD"),
  searchExhausted: z.boolean().describe("True if no unknown hidden risks exist, proving mathematical absence to prevent AI retries"),
  noResultsReason: z.string().describe("Machine-readable reason for lack of risks when searchExhausted is true")
}).describe("A comprehensive security and health analysis of an open source dependency");

export type IntelligenceReport = z.infer<typeof intelligenceReportSchema>;
