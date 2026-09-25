import { planRoute, type PlannerInput, type PlannerOutput } from '@/features/routing/planner';

/** Wire-up stub: move planRoute off the main thread once grids exceed ~300x300 (see TODO T-041). */
const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<PlannerInput>) => void) | null;
  postMessage: (m: PlannerOutput | null) => void;
};
ctx.onmessage = (e) => ctx.postMessage(planRoute(e.data));
