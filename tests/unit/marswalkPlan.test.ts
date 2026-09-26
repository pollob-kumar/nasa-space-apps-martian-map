import { describe, expect, it } from 'vitest';
import { buildPlan } from '@/features/marswalk/marswalkPlan';
import type { ConditionsSnapshot, Provenance, RouteResult, ScienceTarget } from '@/types';

const provenance: Provenance = {
  mission: 'M2020',
  instrument: 'Multiple',
  product: 'Curated targets',
  sourceUrl: 'https://example.test/targets',
  processed: true,
  synthetic: false,
  verified: true,
};

const conditionsSource: Provenance = {
  mission: 'M2020',
  instrument: 'MEDA',
  product: 'Mars Weather Report',
  sourceUrl: 'https://example.test/conditions',
  processed: false,
  synthetic: false,
  verified: true,
};

/** Recent = observed within the last 7 days (freshness(), conditionsService.ts). */
const conditions = (observedAt: string): ConditionsSnapshot => ({
  siteId: 'jezero-delta',
  source: conditionsSource,
  observedAt,
});

const target = (id: string, scienceValue: number): ScienceTarget => ({
  id,
  name: `Target ${id}`,
  position: { lon: 0.005, lat: 0 },
  kind: 'carbonate',
  scienceValue,
  rationale: 'Test fixture.',
  provenance: [provenance],
});

const route = (estTimeMin: number, maxHazard01 = 0.2, calibrated = true): RouteResult => ({
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
  calibrated,
});

describe('buildPlan', () => {
  it('builds a passing checklist with visible assumptions', () => {
    const plan = buildPlan(route(60), [], undefined, undefined, conditions('2026-09-25T00:00:00Z'));
    expect(plan.withinBudget).toBe(true);
    expect(plan.verdict).toBe('pass');
    expect(plan.checklist.find((item) => item.label === 'EVA time budget')?.status).toBe('pass');
    expect(plan.assumptions.some((item) => item.includes('Walking speed'))).toBe(true);
    expect(plan.assumptions.some((item) => item.includes('Slope limit'))).toBe(true);
    expect(plan.assumptions.some((item) => item.includes('EVA duration'))).toBe(true);
  });

  it('flags over-budget routes and elevated hazard for review', () => {
    const plan = buildPlan(route(200, 0.9), []);
    expect(plan.withinBudget).toBe(false);
    expect(plan.verdict).toBe('no-go');
    expect(plan.checklist.find((item) => item.label === 'EVA time budget')?.status).toBe('no-go');
    expect(plan.checklist.find((item) => item.label === 'Hazard exposure')?.status).toBe('warning');
  });

  it('turns review flags into an overall go-with-review verdict', () => {
    // 60 min walk x2 = 120 min of the 360 min budget: within budget, but hazard is high.
    const plan = buildPlan(route(60, 0.9), [], undefined, undefined, conditions('2026-09-25T00:00:00Z'));
    expect(plan.withinBudget).toBe(true);
    expect(plan.verdict).toBe('warning');
  });

  it('counts science stops into the budget in the given order', () => {
    const stops = [target('a', 0.9), target('b', 0.5)];
    const plan = buildPlan(route(60), stops);
    expect(plan.stops.map((s) => s.id)).toEqual(['a', 'b']);
    expect(plan.scienceMinutes).toBe(40);
    expect(plan.totalMinutes).toBe(160);
  });

  it('says out loud when routing inputs are not the derived layers', () => {
    const plan = buildPlan(route(60, 0.2, false), []);
    expect(
      plan.checklist.find((item) => item.label === 'Hazard exposure')?.detail,
    ).toContain('placeholder hazard');
    expect(plan.assumptions.some((item) => item.includes('not fully derived'))).toBe(true);
  });

  it('marks the science-stop duration as a named assumption, not a magic number', () => {
    const plan = buildPlan(route(60), []);
    expect(plan.assumptions.some((item) => item.includes('marswalkPlan.ts'))).toBe(true);
  });

  it('blocks the plan when no conditions snapshot is available', () => {
    const plan = buildPlan(route(60, 0.2), []);
    expect(plan.verdict).toBe('no-go');
    expect(
      plan.checklist.find((item) => item.label === 'Latest available conditions')?.detail,
    ).toBe('No conditions snapshot is available.');
  });

  it('requires review for stale conditions and blocks archival conditions', () => {
    const stale = buildPlan(route(60), [], undefined, undefined, conditions('2026-01-01T00:00:00Z'));
    const archival = buildPlan(route(60), [], undefined, undefined, conditions('2021-04-19T12:33:00Z'));
    expect(
      stale.checklist.find((item) => item.label === 'Latest available conditions')?.status,
    ).toBe('warning');
    expect(
      archival.checklist.find((item) => item.label === 'Latest available conditions')?.status,
    ).toBe('no-go');
  });
});