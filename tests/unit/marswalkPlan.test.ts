import { describe, expect, it } from 'vitest';
import { buildPlan } from '@/features/marswalk/marswalkPlan';
import type { RouteResult } from '@/types';

const route = (estTimeMin: number, maxHazard01 = 0.2): RouteResult => ({
  path: [
    { lon: 0, lat: 0 },
    { lon: 0.01, lat: 0 },
  ],
  distanceM: 1000,
  elevationsM: [100, 100],
  maxSlopeDeg: 5,
  averageHazard01: 0.1,
  maxHazard01,
  hazardSegments: 1,
  estTimeMin,
  profile: 'science',
});

describe('buildPlan', () => {
  it('builds a passing checklist with visible assumptions', () => {
    const plan = buildPlan(route(60), []);
    expect(plan.withinBudget).toBe(true);
    expect(plan.checklist.find((item) => item.label === 'EVA time budget')?.status).toBe('pass');
    expect(plan.assumptions.some((item) => item.includes('Walking speed'))).toBe(true);
    expect(plan.assumptions.some((item) => item.includes('Slope limit'))).toBe(true);
    expect(plan.assumptions.some((item) => item.includes('EVA duration'))).toBe(true);
  });

  it('flags over-budget routes and elevated hazard for review', () => {
    const plan = buildPlan(route(200, 0.9), []);
    expect(plan.withinBudget).toBe(false);
    expect(plan.checklist.find((item) => item.label === 'EVA time budget')?.status).toBe('no-go');
    expect(plan.checklist.find((item) => item.label === 'Hazard exposure')?.status).toBe('warning');
  });

  it('requires review for stale conditions and blocks archival conditions', () => {
    const source = {
      mission: 'M2020' as const,
      instrument: 'MEDA',
      product: 'Mars Weather Report',
      sourceUrl: 'https://example.test/conditions',
      processed: false,
      synthetic: false,
      verified: true,
    };
    const stale = buildPlan(route(60), [], 20, undefined, {
      siteId: 'jezero-delta',
      source,
      observedAt: '2026-01-01T00:00:00Z',
    });
    const archival = buildPlan(route(60), [], 20, undefined, {
      siteId: 'jezero-delta',
      source,
      observedAt: '2021-04-19T12:33:00Z',
    });
    expect(
      stale.checklist.find((item) => item.label === 'Latest available conditions')?.status,
    ).toBe('warning');
    expect(
      archival.checklist.find((item) => item.label === 'Latest available conditions')?.status,
    ).toBe('no-go');
  });
});
