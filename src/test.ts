import 'dotenv/config';
import { generateSecurityReport } from './report.js';

async function main() {
  // Test a massive monorepo that would normally take a long time
  const repo = 'facebook/react';
  console.log(`[SourceGuard] Starting intelligence scan on ${repo}...`);
  
  const start = Date.now();
  
  try {
    const report = await generateSecurityReport(repo, 'deep');
    const end = Date.now();
    
    console.log('\n--- INTELLIGENCE REPORT ---');
    console.log(JSON.stringify(report, null, 2));
    
    const latency = ((end - start) / 1000).toFixed(2);
    console.log(`\n✅ SignalBrief-grade Analysis completed in ${latency} seconds!`);
  } catch (err) {
    console.error('[Error during test]:', err);
  }
}

main();
