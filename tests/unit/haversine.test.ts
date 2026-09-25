import { describe, expect, it } from 'vitest';
import { haversineM } from '@/lib/geo/haversine';

describe('haversineM', () => {
  it('one degree of latitude on Mars is ~59.16 km', () => {
    const d = haversineM({ lon: 0, lat: 0 }, { lon: 0, lat: 1 });
    expect(d).toBeGreaterThan(59_100);
    expect(d).toBeLessThan(59_220);
  });
  it('is zero for identical points', () => {
    expect(haversineM({ lon: 77, lat: 18 }, { lon: 77, lat: 18 })).toBe(0);
  });
});
