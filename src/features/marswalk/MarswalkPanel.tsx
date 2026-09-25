import { useApp } from '@/state/store';
import { buildPlan } from './marswalkPlan';

export function MarswalkPanel() {
  const route = useApp((s) => s.route);
  if (!route)
    return (
      <section aria-label="Marswalk plan">
        <h2>Marswalk plan</h2>
        <div className="notice">Plan a route first.</div>
      </section>
    );
  const plan = buildPlan(route, []);
  return (
    <section aria-label="Marswalk plan">
      <h2>Marswalk plan</h2>
      <p className="data">
        {plan.totalMinutes.toFixed(0)} / {plan.budgetMinutes.toFixed(0)} min usable EVA - {plan.withinBudget ? 'within budget' : 'OVER BUDGET'}
      </p>
      <p>EVA limits here are assumptions (DECISIONS ADR-007).</p>
    </section>
  );
}
