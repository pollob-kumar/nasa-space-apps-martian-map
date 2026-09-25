import type { RouteResult, ScienceTarget } from '@/types';

export interface EvaBudget {
  maxEvaMinutes: number; // suit consumables limit - ASSUMPTION, configurable
  safetyMarginPct: number; // reserve kept unused
}

export const DEFAULT_EVA: EvaBudget = { maxEvaMinutes: 480, safetyMarginPct: 25 };

export interface MarswalkPlan {
  route: RouteResult;
  stops: ScienceTarget[];
  walkMinutes: number;
  scienceMinutes: number;
  totalMinutes: number;
  budgetMinutes: number;
  withinBudget: boolean;
}

export function buildPlan(
  route: RouteResult,
  stops: ScienceTarget[],
  minutesPerStop = 20,
  eva: EvaBudget = DEFAULT_EVA,
): MarswalkPlan {
  const budgetMinutes = eva.maxEvaMinutes * (1 - eva.safetyMarginPct / 100);
  const scienceMinutes = stops.length * minutesPerStop;
  const totalMinutes = route.estTimeMin * 2 + scienceMinutes; // out-and-back assumption
  return { route, stops, walkMinutes: route.estTimeMin, scienceMinutes, totalMinutes, budgetMinutes, withinBudget: totalMinutes <= budgetMinutes };
}
