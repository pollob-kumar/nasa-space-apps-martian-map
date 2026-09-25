import type { Provenance } from '@/types';

/** Shows where data came from. Required next to every layer/value (AGENTS.md: Data honesty). */
export function ProvenanceBadge({ p }: { p: Provenance }) {
  return (
    <div>
      <span className="badge">{p.mission}</span>
      <span className="badge">{p.instrument}</span>
      {p.resolution && <span className="badge">{p.resolution}</span>}
      {p.processed && <span className="badge">derived</span>}
      {p.synthetic && <span className="badge warn">SYNTHETIC</span>}
      {!p.verified && <span className="badge warn">unverified</span>}
    </div>
  );
}
