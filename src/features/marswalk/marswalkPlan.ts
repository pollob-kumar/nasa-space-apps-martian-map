import type { ConditionsSnapshot, RouteResult, ScienceTarget } from '@/types';
import { PROFILES } from '@/features/routing/costModel';
import { freshness, observationAgeLabel } from '@/features/conditions/conditionsService';

export interface EvaBudget {
  maxEvaMinutes: number; // suit consumables limit - ASSUMPTION, configurable
  safetyMarginPct: number; // reserve kept unused
}

export const DEFAULT_EVA: EvaBudget = { maxEvaMinutes: 480, safetyMarginPct: 25 };

/** Minutes spent working at one science stop. Planning assumption, shown in the UI (FR-08, ADR-007). */
export const DEFAULT_MINUTES_PER_STOP = 20;

/** Hazard exposure at/above which the plan is flagged for review. Planning flag, not an engineering limit (ADR-018). */
export const HAZARD_REVIEW_THRESHOLD01 = 0.8;

export interface ChecklistItem {
  label: string;
  detail: string;
  status: 'pass' | 'warning' | 'no-go';
}

export interface MarswalkPlan {
  route: RouteResult;
  stops: ScienceTarget[];
  walkMinutes: number;
  scienceMinutes: number;
  totalMinutes: number;
  budgetMinutes: number;
  withinBudget: boolean;
  /** single go/no-go verdict for the whole plan; 'warning' = go only after reviewing the flagged items */
  verdict: 'pass' | 'warning' | 'no-go';
  checklist: ChecklistItem[];
  assumptions: string[];
}

export function buildPlan(
  route: RouteResult,
  stops: ScienceTarget[],
  minutesPerStop = DEFAULT_MINUTES_PER_STOP,
  eva: EvaBudget = DEFAULT_EVA,
  conditions: ConditionsSnapshot | null = null,
): MarswalkPlan {
  const budgetMinutes = eva.maxEvaMinutes * (1 - eva.safetyMarginPct / 100);
  const scienceMinutes = stops.length * minutesPerStop;
  const totalMinutes = route.estTimeMin * 2 + scienceMinutes; // out-and-back assumption
  const withinBudget = totalMinutes <= budgetMinutes;
  const checklist: ChecklistItem[] = [
    {
      label: 'EVA time budget',
      detail: withinBudgetText(totalMinutes, budgetMinutes),
      status: withinBudget ? 'pass' : 'no-go',
    },
    {
      label: 'Route slope limit',
      detail: `Maximum planned slope ${route.maxSlopeDeg.toFixed(1)} deg; the ${route.profile} profile limit is enforced during routing.`,
      status: 'pass',
    },
    {
      label: 'Hazard exposure',
      detail: `${(route.averageHazard01 * 100).toFixed(0)}% average model score; ${(route.maxHazard01 * 100).toFixed(0)}% maximum across ${route.hazardSegments} route segments.${
        route.calibrated
          ? ''
          : ' Computed from the slope-based placeholder hazard, not the derived hazard layer (T-040).'
      }`,
      status: route.maxHazard01 >= HAZARD_REVIEW_THRESHOLD01 ? 'warning' : 'pass',
    },
    {
      label: 'Latest available conditions',
      detail: conditions
        ? `Observed ${conditions.observedAt}; age ${observationAgeLabel(conditions)} (${freshness(conditions)}).`
        : 'No conditions snapshot is available.',
      status: conditions
        ? freshness(conditions) === 'recent'
          ? 'pass'
          : freshness(conditions) === 'stale'
            ? 'warning'
            : 'no-go'
        : 'no-go',
    },
  ];
  return {
    route,
    stops,
    walkMinutes: route.estTimeMin,
    scienceMinutes,
    totalMinutes,
    budgetMinutes,
    withinBudget,
    verdict: verdictFor(checklist),
    checklist,
    assumptions: [
      `Walking speed: ${PROFILES[route.profile].baseSpeedMs.toFixed(1)} m/s flat-ground base speed; slope-adjusted by the cost model (ADR-007, costModel.ts).`,
      `Slope limit: ${PROFILES[route.profile].maxSlopeDeg} deg for the ${route.profile} profile (ADR-007, costModel.ts).`,
      `EVA duration: ${eva.maxEvaMinutes} min maximum with ${eva.safetyMarginPct}% reserve; usable budget ${budgetMinutes.toFixed(0)} min (ADR-007, marswalkPlan.ts).`,
      `Hazard review threshold: ${HAZARD_REVIEW_THRESHOLD01} on the derived 0..1 model scale; this is a planning flag, not a validated engineering limit (ADR-018).`,
      `Walk duration is doubled for an out-and-back plan; science stops use ${minutesPerStop} min each (planning assumptions, marswalkPlan.ts).`,
      route.calibrated
        ? 'Routing inputs: derived hazard and science layers.'
        : 'Routing inputs are not fully derived: the hazard field is a slope-based placeholder, and the derived hazard grid is synthetic where THEMIS thermal inertia is missing (ADR-018, T-040).',
    ],
  };
}

/** One overall verdict so the checklist cannot be read item-by-item and mistaken for a green light. */
function verdictFor(checklist: ChecklistItem[]): MarswalkPlan['verdict'] {
  if (checklist.some((item) => item.status === 'no-go')) return 'no-go';
  return checklist.some((item) => item.status === 'warning') ? 'warning' : 'pass';
}

function withinBudgetText(totalMinutes: number, budgetMinutes: number): string {
  return totalMinutes <= budgetMinutes
    ? `${totalMinutes.toFixed(0)} min planned of ${budgetMinutes.toFixed(0)} min usable.`
    : `${totalMinutes.toFixed(0)} min planned exceeds ${budgetMinutes.toFixed(0)} min usable.`;
}
