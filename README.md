# SourceGuard (Context MCP Server)

An **enterprise-grade supply chain security and dependency risk scanner** built for AI Coding Agents. 
Designed to strictly follow Context Protocol's Tier S Architecture Principles, it is seamlessly integrated with the Context SDK and Security middlewares.

SourceGuard mathematically calculates a repository's **"Bus Factor"** (maintainer concentration risk) and instantly scans the HEAD commit against the **OSV.dev (Open Source Vulnerabilities)** database, serving deep intelligence to AI Agents in under 5 seconds.

## Unbundling Enterprise Security 
SourceGuard provides exactly the curated safety logic that enterprise tools like Snyk and Sonatype Nexus Lifecycle place behind aggressive `$5,000/yr` B2B paywalls. By synthesizing free, high-availability data sources (GitHub REST + OSV), this MCP provides mathematical guarantees on the safety of an open-source package for just `$0.10` per scan.

---

## 🏗 Architecture & Curation 

Instead of just dumping raw vulnerability lists, SourceGuard acts as an AI Intelligence Brief:
1. **GitHub API:** Fetches the last 100 deep commits to identify the top contributors and calculates the exact `busFactor`.
2. **OSV API:** Cross-references the commit SHA against the global Common Vulnerabilities and Exposures (CVE) index.
3. **Curation Engine:** Processes stagnation velocity, license status, and zero-day counts to generate a strict `A-F` Actionable Risk Score.

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js 18+
- A classic GitHub Personal Access Token (PAT) to prevent rate limits.

### 2. Environment Variables
Create a `.env` file in the root directory:
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
PORT=3000
```

### 3. Build & Run
```bash
npm install
npm run build
npm start
```

### 4. Testing Locally (Velocity Check)
To verify the sub-15s execution requirement:
```bash
npm test
```

## 🔌 Using with Context Protocol (Agents)

The server exposes Context-compliant endpoints for SSE and standard HTTP:
- **SSE:** `GET /sse`
- **HTTP Streaming:** `POST /mcp`

### Tool Definition: `analyze_source_repo`
**Target:** Any AI agent tasked with installing a new package.
**Input:** `{"repoUrl": "facebook/react", "depth": "quick"}`
**Output Capability (`searchExhausted`):** Explicitly enforces Completeness Evaluation to prevent LLM retry hallucinations when zero active CVEs are found.
