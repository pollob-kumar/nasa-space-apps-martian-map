import { MinHeap } from '@/lib/math/heap';
import { cellSizeM, type Grid } from '@/lib/geo/grid';
import { speedMs, stepCostFactor, type RouteProfile } from './costModel';

export interface PlannerInput {
  elevation: Grid;
  slopeDeg: Float32Array;
  hazard: Float32Array; // 0..1
  science: Float32Array; // 0..1
  start: { x: number; y: number };
  goal: { x: number; y: number };
  profile: RouteProfile;
}

export interface PlannerOutput {
  cells: { x: number; y: number }[];
  distanceM: number;
  timeMin: number;
  maxSlopeDeg: number;
}

const NEIGHBOURS = [
  [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1],
] as const;

/** 8-connected A* over the grid. Returns null if the goal is unreachable under the profile limits. */
export function planRoute(inp: PlannerInput): PlannerOutput | null {
  const { elevation: g, slopeDeg, hazard, science, profile } = inp;
  const { width: w, height: h } = g;
  const { dx, dy } = cellSizeM(g);
  const idx = (x: number, y: number) => y * w + x;
  const startI = idx(inp.start.x, inp.start.y);
  const goalI = idx(inp.goal.x, inp.goal.y);
  const heuristic = (x: number, y: number) => 0.2 * Math.hypot((x - inp.goal.x) * dx, (y - inp.goal.y) * dy);

  const gScore = new Float64Array(w * h).fill(Infinity);
  const prev = new Int32Array(w * h).fill(-1);
  const open = new MinHeap<number>();
  gScore[startI] = 0;
  open.push(heuristic(inp.start.x, inp.start.y), startI);

  while (open.size) {
    const cur = open.pop()!;
    if (cur === goalI) break;
    const cx = cur % w;
    const cy = (cur - cx) / w;
    for (const [ox, oy] of NEIGHBOURS) {
      const nx = cx + ox;
      const ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const ni = idx(nx, ny);
      const factor = stepCostFactor(profile, slopeDeg[ni]!, hazard[ni]!, science[ni]!);
      if (!Number.isFinite(factor)) continue;
      const step = Math.hypot(ox * dx, oy * dy) * factor;
      const tentative = gScore[cur]! + step;
      if (tentative < gScore[ni]!) {
        gScore[ni] = tentative;
        prev[ni] = cur;
        open.push(tentative + heuristic(nx, ny), ni);
      }
    }
  }
  if (!Number.isFinite(gScore[goalI]!)) return null;

  const cells: { x: number; y: number }[] = [];
  for (let c = goalI; c !== -1; c = prev[c]!) cells.push({ x: c % w, y: Math.floor(c / w) });
  cells.reverse();

  let distanceM = 0;
  let timeS = 0;
  let maxSlope = 0;
  for (let i = 1; i < cells.length; i++) {
    const a = cells[i - 1]!;
    const b = cells[i]!;
    const horiz = Math.hypot((b.x - a.x) * dx, (b.y - a.y) * dy);
    const dz = g.data[idx(b.x, b.y)]! - g.data[idx(a.x, a.y)]!;
    const seg = Math.hypot(horiz, dz);
    const slope = slopeDeg[idx(b.x, b.y)]!;
    distanceM += seg;
    timeS += seg / speedMs(profile, slope);
    maxSlope = Math.max(maxSlope, slope);
  }
  return { cells, distanceM, timeMin: timeS / 60, maxSlopeDeg: maxSlope };
}
