import { LAYERS } from '@/config/layers.config';
import { ProvenanceBadge } from '@/features/provenance/ProvenanceBadge';
import { useApp } from '@/state/store';

export function LayerPanel() {
  const { layerState, toggleLayer, setOpacity } = useApp();
  return (
    <section aria-label="Map layers">
      <h2>Layers</h2>
      {LAYERS.map((l) => {
        const s = layerState[l.id]!;
        return (
          <div className="layer-row" key={l.id}>
            <label>
              <input type="checkbox" checked={s.visible} onChange={() => toggleLayer(l.id)} /> {l.title}
            </label>
            <ProvenanceBadge p={l.provenance} />
            <input
              type="range" min={0} max={1} step={0.05} value={s.opacity}
              aria-label={`${l.title} opacity`} onChange={(e) => setOpacity(l.id, Number(e.target.value))}
            />
          </div>
        );
      })}
    </section>
  );
}
