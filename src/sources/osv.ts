import axios from 'axios';
import { Vulnerability } from '../types.js';

export async function queryOsvByCommit(commitHash: string): Promise<Vulnerability[]> {
  try {
    const response = await axios.post('https://api.osv.dev/v1/query', {
      commit: commitHash
    });
    
    if (!response.data.vulns) return [];
    
    return response.data.vulns.map((v: any) => ({
      id: v.id,
      summary: v.summary || 'No summary provided',
      severity: v.database_specific?.severity || 'UNKNOWN'
    }));
  } catch (err) {
    console.warn("OSV API error:", err);
    return [];
  }
}
