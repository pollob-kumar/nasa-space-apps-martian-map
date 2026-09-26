import { LAYERS } from '@/config/layers.config';
import { ProvenanceBadge } from '@/features/provenance/ProvenanceBadge';
import { useApp } from '@/state/store';

type LegendKind = 'raster' | 'line' | 'point' | 'gradient' | 'pending';

interface LayerLegend {
  kind: LegendKind;
  label: string;
  detail: string;
}

const LEGENDS: Record<string, LayerLegend> = {
  'basemap-imagery': { kind: 'raster', label: 'Raster imagery', detail: 'Surface context' },
  elevation: { kind: 'raster', label: 'Shaded relief', detail: 'Higher to lower terrain' },
  slope: { kind: 'pending', label: 'Slope raster', detail: 'Grid renderer pending (T-023)' },
  mineralogy: { kind: 'point', label: 'Mineral detections', detail: 'CRISM geology points' },
  'thermal-inertia': { kind: 'pending', label: 'Thermal-inertia raster', detail: 'Grid renderer pending (T-023)' },
  'rover-traverse': { kind: 'line', label: 'Traverse line', detail: 'Perseverance path' },
  'science-targets': { kind: 'point', label: 'Science target', detail: 'Curated stop' },
  hazards: { kind: 'pending', label: 'Hazard raster', detail: 'Grid renderer pending (T-023)' },
};

function LayerLegendView({ legend }: { legend: LayerLegend }) {
  return (
    <div className={`layer-legend layer-legend-${legend.kind}`} aria-label={`${legend.label}: ${legend.detail}`}>
      <span className="layer-legend-symbol" aria-hidden="true" />
      <span>
        <span className="layer-legend-label">{legend.label}</span>
        <span className="layer-legend-detail">{legend.detail}</span>
      </span>
    </div>
  );
}

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
            <LayerLegendView legend={LEGENDS[l.id] ?? { kind: 'pending', label: 'No legend', detail: 'Rendering not defined' }} />
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
