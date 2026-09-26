import type { Grid } from '@/lib/geo/grid';
import type { BBox } from '@/types';

/** Grid file format: see docs/DATABASE.md section "Grid files". JSON meta + base64 Float32 (little-endian). */
interface GridFile {
  width: number;
  height: number;
  bbox: BBox;
  encoding: 'float32-base64';
  data: string;
}

export async function loadGrid(path: string): Promise<Grid | null> {
  try {
    const res = await fetch(`/data/${path}`);
    if (!res.ok) return null;
    const f = (await res.json()) as GridFile;
    if (
      f.encoding !== 'float32-base64' ||
      !Number.isInteger(f.width) ||
      !Number.isInteger(f.height) ||
      f.width <= 0 ||
      f.height <= 0 ||
      typeof f.data !== 'string' ||
      f.data.length === 0
    ) return null;
    const bin = atob(f.data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (bytes.byteLength !== f.width * f.height * Float32Array.BYTES_PER_ELEMENT) return null;
    return { width: f.width, height: f.height, bbox: f.bbox, data: new Float32Array(bytes.buffer) };
  } catch {
    return null;
  }
}

/** DEV ONLY: smooth synthetic terrain so the UI works before real DEMs exist. Always label it in the UI. */
export function syntheticGrid(bbox: BBox, n = 96): Grid {
  const data = new Float32Array(n * n);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      data[y * n + x] = 40 * Math.sin(x / 11) * Math.cos(y / 14) + 0.6 * x + 12 * Math.sin((x + y) / 5);
  return { width: n, height: n, bbox, data };
}
