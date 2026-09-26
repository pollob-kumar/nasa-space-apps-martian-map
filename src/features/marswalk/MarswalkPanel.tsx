import { useEffect, useState } from 'react';
import { useApp } from '@/state/store';
import type { ConditionsSnapshot, ScienceTarget } from '@/types';
import { loadConditions } from '@/features/conditions/conditionsService';
import { buildPlan } from './marswalkPlan';

/** Order comes from the stored ids; a stop whose data disappeared is dropped (missing data is a state, ADR-008). */
function orderedStops(ids: string[], targets: ScienceTarget[]): ScienceTarget[] {
  return ids
    .map((id) => targets.find((t) => t.id === id))
    .filter((t): t is ScienceTarget => t !== undefined);
}

export function MarswalkPanel({ targets }: { targets: ScienceTarget[] }) {
  const siteId = useApp((s) => s.siteId);
  const route = useApp((s) => s.route);
  const planStops = useApp((s) => s.planStops);
  const setPlanStops = useApp((s) => s.setPlanStops);
  const [conditions, setConditions] = useState<ConditionsSnapshot | null>(null);
  useEffect(() => {
    let active = true;
    loadConditions(siteId).then((snapshot) => {
      if (active) setConditions(snapshot);
    });
    return () => {
      active = false;
    };
  }, [siteId]);
  if (!route)
    return (
      <section aria-label="Marswalk plan">
        <h2>Marswalk plan</h2>
        <div className="notice">Plan a route first.</div>
      </section>
    );
  const stops = orderedStops(planStops, targets);
  const plan = buildPlan(route, stops, undefined, undefined, conditions);
  const verdictLabel =
    plan.verdict === 'pass' ? 'GO' : plan.verdict === 'warning' ? 'GO WITH REVIEW' : 'NO-GO';
  return (
    <section aria-label="Marswalk plan">
      <h2>Marswalk plan</h2>
      <p className="data">
        {plan.totalMinutes.toFixed(0)} / {plan.budgetMinutes.toFixed(0)} min usable EVA -{' '}
        {plan.withinBudget ? 'within budget' : 'OVER BUDGET'}
      </p>
      <p className="data marswalk-verdict">
        Overall: {verdictLabel}
        {plan.verdict === 'warning' ? ' - review the flagged items below before going' : ''}
      </p>
      {stops.length === 0 ? (
        <div className="notice">
          No stops added. Select a science target on the map and add it as a stop, otherwise the plan
          covers walking time only.
        </div>
      ) : (
        <>
          <h3>Stops ({stops.length})</h3>
          <ol className="data marswalk-stops">
            {stops.map((stop, i) => (
              <li key={stop.id}>
                {i + 1}. {stop.name} ({stop.position.lat.toFixed(4)} N, {stop.position.lon.toFixed(4)} E)
                - science value {stop.scienceValue.toFixed(2)}{' '}
                <button onClick={() => setPlanStops(planStops.filter((id) => id !== stop.id))}>
                  Remove
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
      <h3>Checklist</h3>
      <ul className="data marswalk-checklist">
        {plan.checklist.map((item) => (
          <li key={item.label}>
            <strong>
              {item.status === 'pass' ? 'PASS' : item.status === 'warning' ? 'REVIEW' : 'NO-GO'}:
            </strong>{' '}
            {item.label} - {item.detail}
          </li>
        ))}
      </ul>
      <h3>Assumptions</h3>
      <p className="notice">
        These are planning assumptions, not NASA-validated limits. Each one names its source file or ADR.
      </p>
      <ul className="data">
        {plan.assumptions.map((assumption) => (
          <li key={assumption}>{assumption}</li>
        ))}
      </ul>
    </section>
  );
}
