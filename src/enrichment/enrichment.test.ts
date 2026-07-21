// sourceguard — unit tests for enrichment logic
// Requires: npm i -D vitest   then add "test:unit": "vitest run" to package.json scripts
import { describe, it, expect } from 'vitest';
import { calculateBusFactor } from './busFactor.js';
import { calculateRisk } from './riskCalculator.js';

describe('calculateBusFactor', () => {
  it('returns 1 for an empty contributor list', () => {
    expect(calculateBusFactor([])).toBe(1);
  });

  it('returns 1 when a single contributor holds all commits', () => {
    expect(calculateBusFactor([10])).toBe(1);
  });

  it('returns 1 when the top contributor alone exceeds half', () => {
    expect(calculateBusFactor([6, 4])).toBe(1);
  });

  it('returns 2 for an even 50/50 split (neither alone exceeds half)', () => {
    expect(calculateBusFactor([5, 5])).toBe(2);
  });

  it('returns 2 when two of three equal contributors exceed half', () => {
    expect(calculateBusFactor([3, 3, 3])).toBe(2);
  });

  it('returns 3 for four equal contributors', () => {
    expect(calculateBusFactor([1, 1, 1, 1])).toBe(3);
  });
});

describe('calculateRisk', () => {
  it('grades A for a healthy multi-maintainer repo', () => {
    const r = calculateRisk(3, 'HIGH', true, 0);
    expect(r.score).toBe('A');
    expect(r.riskFactors).toHaveLength(0);
  });

  it('grades B and flags bus factor for a solo-maintainer repo', () => {
    const r = calculateRisk(1, 'HIGH', true, 0); // 100 - 20 = 80
    expect(r.score).toBe('B');
    expect(r.riskFactors.some(f => f.includes('Bus Factor'))).toBe(true);
  });

  it('flags moderate bus factor at 2 without deducting score', () => {
    const r = calculateRisk(2, 'HIGH', true, 0); // no deduction
    expect(r.score).toBe('A');
    expect(r.riskFactors.some(f => f.includes('Moderate Bus Factor'))).toBe(true);
  });

  it('grades F for a stagnant, solo, unlicensed repo', () => {
    const r = calculateRisk(1, 'STAGNANT', false, 0); // 100 - 20 - 40 - 30 = 10
    expect(r.score).toBe('F');
    expect(r.recommendedAction).toMatch(/DO NOT INSTALL/);
  });

  it('deducts 15 per vulnerability', () => {
    const r = calculateRisk(3, 'HIGH', true, 2); // 100 - 30 = 70
    expect(r.score).toBe('B');
    expect(r.riskFactors.some(f => f.includes('2 known'))).toBe(true);
  });

  it('grades C for low-velocity solo repo with one vulnerability', () => {
    const r = calculateRisk(1, 'LOW', true, 1); // 100 - 20 - 15 - 15 = 50
    expect(r.score).toBe('C');
    expect(r.recommendedAction).toMatch(/extreme caution/);
  });

  it('never grades above F when many vulnerabilities push score negative', () => {
    const r = calculateRisk(1, 'STAGNANT', false, 10); // deep negative
    expect(r.score).toBe('F');
  });
});
