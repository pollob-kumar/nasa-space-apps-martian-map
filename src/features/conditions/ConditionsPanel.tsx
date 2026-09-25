import { useEffect, useState } from 'react';
import { useApp } from '@/state/store';
import type { ConditionsSnapshot } from '@/types';
import { ProvenanceBadge } from '@/features/provenance/ProvenanceBadge';
import { freshness, loadConditions } from './conditionsService';

export function ConditionsPanel() {
  const siteId = useApp((s) => s.siteId);
  const [c, setC] = useState<ConditionsSnapshot | null>(null);
  useEffect(() => {
    loadConditions(siteId).then(setC);
  }, [siteId]);

  return (
    <section aria-label="Conditions">
      <h2>Latest available conditions</h2>
      {!c ? (
        <div className="notice">No conditions data loaded yet (public/data/{siteId}/conditions.json). Never show made-up values.</div>
      ) : (
        <>
          <ProvenanceBadge p={c.source} />
          <p className="data">
            Observed {c.observedAt} {c.sol !== undefined && `(sol ${c.sol})`} - {freshness(c)}
          </p>
          <ul className="data">
            {c.airTempC !== undefined && <li>Air {c.airTempC} C</li>}
            {c.pressurePa !== undefined && <li>Pressure {c.pressurePa} Pa</li>}
            {c.dustOpacity !== undefined && <li>Dust opacity {c.dustOpacity}</li>}
            {c.radiationUSvDay !== undefined && <li>Radiation {c.radiationUSvDay} uSv/day</li>}
          </ul>
        </>
      )}
    </section>
  );
}
