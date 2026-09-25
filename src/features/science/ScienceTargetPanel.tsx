import { ProvenanceBadge } from '@/features/provenance/ProvenanceBadge';
import { useApp } from '@/state/store';
import type { ScienceTarget } from '@/types';

/** Integrated view: everything we know about ONE clicked target in one place. */
export function ScienceTargetPanel({ targets }: { targets: ScienceTarget[] }) {
  const id = useApp((s) => s.selectedTargetId);
  const t = targets.find((x) => x.id === id);
  return (
    <section aria-label="Selected target">
      <h2>Selected target</h2>
      {!t ? (
        <div className="notice">Click a science target on the map to see elevation, slope, nearby rover data and why it matters.</div>
      ) : (
        <>
          <strong>{t.name}</strong>
          <p>{t.rationale}</p>
          <p className="data">
            {t.position.lat.toFixed(4)} N, {t.position.lon.toFixed(4)} E - value {t.scienceValue.toFixed(2)}
          </p>
          {t.provenance.map((p) => (
            <ProvenanceBadge key={p.product} p={p} />
          ))}
        </>
      )}
    </section>
  );
}
