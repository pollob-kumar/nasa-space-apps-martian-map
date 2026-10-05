import { describe, expect, it } from 'vitest';
import { summarizeRoute } from '@/features/routing/routeStats';

describe('summarizeRoute', () => {
  it('builds cumulative distance and elevation gain/loss', () => {
    const stats = summarizeRoute(
      [
        { lon: 0, lat: 0 },
        { lon: 0.01, lat: 0 },
        { lon: 0.02, lat: 0 },
      ],
      [100, 110, 105],
    );

    expect(stats.profile).toHaveLength(3);
    expect(stats.profile[0]!.distanceM).toBe(0);
    expect(stats.profile[2]!.distanceM).toBeGreaterThan(stats.profile[1]!.distanceM);
    expect(stats.elevationGainM).toBe(10);
    expect(stats.elevationLossM).toBe(5);
    expect(stats.averageSlopeDeg).toBeGreaterThan(0);
  });

  it('returns empty stats for an empty route', () => {
    expect(summarizeRoute([], []).profile).toEqual([]);
    expect(summarizeRoute([], []).averageSlopeDeg).toBe(0);
  });
});
