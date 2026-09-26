import { useEffect, useState } from 'react';
import { useApp } from '@/state/store';
import type { ConditionsSnapshot } from '@/types';
import { loadConditions } from '@/features/conditions/conditionsService';
import { buildPlan } from './marswalkPlan';

export function MarswalkPanel() {
  const siteId = useApp((s) => s.siteId);
  const route = useApp((s) => s.route);
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
  const plan = buildPlan(route, [], 20, undefined, conditions);
  return (
    <section aria-label="Marswalk plan">
      <h2>Marswalk plan</h2>
      <p className="data">
        {plan.totalMinutes.toFixed(0)} / {plan.budgetMinutes.toFixed(0)} min usable EVA -{' '}
        {plan.withinBudget ? 'within budget' : 'OVER BUDGET'}
      </p>
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
      <ul className="data">
        {plan.assumptions.map((assumption) => (
          <li key={assumption}>{assumption}</li>
        ))}
      </ul>
    </section>
  );
}
