import { describe, expect, it } from 'vitest';
import { PROFILES } from '@/features/routing/costModel';
import { planRoute } from '@/features/routing/planner';
import type { Grid } from '@/lib/geo/grid';

const N = 21;
const grid = (): Grid => ({ width: N, height: N, bbox: { west: 0, east: 0.05, south: 0, north: 0.05 }, data: new Float32Array(N * N) });

describe('planRoute', () => {
  it('routes around an impassable wall through the only gap', () => {
    const slope = new Float32Array(N * N);
    for (let y = 0; y < N; y++) if (y !== 18) slope[y * N + 10] = 60; // wall at x=10, gap at y=18
    const out = planRoute({
      elevation: grid(), slopeDeg: slope, hazard: new Float32Array(N * N), science: new Float32Array(N * N),
      start: { x: 1, y: 1 }, goal: { x: 19, y: 1 }, profile: PROFILES.fastest,
    });
    expect(out).not.toBeNull();
    expect(out!.cells.some((c) => c.x === 10 && c.y === 18)).toBe(true);
  });
  it('returns null when the goal is fully walled off', () => {
    const slope = new Float32Array(N * N);
    for (let y = 0; y < N; y++) slope[y * N + 10] = 60;
    const out = planRoute({
      elevation: grid(), slopeDeg: slope, hazard: new Float32Array(N * N), science: new Float32Array(N * N),
      start: { x: 1, y: 1 }, goal: { x: 19, y: 1 }, profile: PROFILES.fastest,
    });
    expect(out).toBeNull();
  });
});
