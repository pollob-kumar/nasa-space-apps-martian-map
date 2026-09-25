import { describe, expect, it } from 'vitest';
import { cellSizeM, slopeDegrees, type Grid } from '@/lib/geo/grid';

describe('slopeDegrees', () => {
  it('a 45 degree ramp in x reads ~45 degrees in the interior', () => {
    const g: Grid = { width: 10, height: 10, bbox: { west: 0, east: 0.1, south: 0, north: 0.1 }, data: new Float32Array(100) };
    const { dx } = cellSizeM(g);
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) g.data[y * 10 + x] = x * dx;
    const s = slopeDegrees(g);
    expect(s[5 * 10 + 5]!).toBeGreaterThan(44.5);
    expect(s[5 * 10 + 5]!).toBeLessThan(45.5);
  });
});
