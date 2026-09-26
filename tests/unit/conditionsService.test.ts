import { describe, expect, it } from 'vitest';
import { freshness, observationAgeLabel } from '@/features/conditions/conditionsService';
import type { ConditionsSnapshot } from '@/types';

const snapshot = (observedAt: string): ConditionsSnapshot => ({
  siteId: 'jezero-delta',
  source: {
    mission: 'M2020',
    instrument: 'MEDA',
    product: 'Mars Weather Report',
    sourceUrl: 'https://example.test/conditions',
    processed: false,
    synthetic: false,
    verified: true,
  },
  observedAt,
});

describe('conditions freshness', () => {
  const now = new Date('2026-09-27T00:00:00Z');

  it('classifies snapshots by age', () => {
    expect(freshness(snapshot('2026-09-26T00:00:00Z'), now)).toBe('recent');
    expect(freshness(snapshot('2026-01-01T00:00:00Z'), now)).toBe('stale');
    expect(freshness(snapshot('2021-04-19T12:33:00Z'), now)).toBe('archival');
  });

  it('formats an explicit observation age', () => {
    expect(observationAgeLabel(snapshot('2026-09-26T00:00:00Z'), now)).toBe('1.0 days');
    expect(observationAgeLabel(snapshot('2026-09-26T23:45:00Z'), now)).toBe('15 min');
  });
});
