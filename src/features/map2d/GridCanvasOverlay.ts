import L from 'leaflet';
import type { Grid } from '@/lib/geo/grid';

export type GridOverlayKind = 'slope' | 'hazard';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface GridCanvasOptions extends L.LayerOptions {
  opacity?: number;
}

function parseCssColor(value: string): Rgb {
  const hex = value.trim();
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`Expected a six-digit CSS token color, received "${value}".`);
  const encoded = match[1]!;
  return {
    r: Number.parseInt(encoded.slice(0, 2), 16),
    g: Number.parseInt(encoded.slice(2, 4), 16),
    b: Number.parseInt(encoded.slice(4, 6), 16),
  };
}

function tokenColor(name: string): Rgb {
  return parseCssColor(getComputedStyle(document.documentElement).getPropertyValue(name));
}

function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  return {
    r: Math.round(a.r + (b.r - a.r) * amount),
    g: Math.round(a.g + (b.g - a.g) * amount),
    b: Math.round(a.b + (b.b - a.b) * amount),
  };
}

function rgba(color: Rgb, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function colorForValue(kind: GridOverlayKind, value: number, opacity: number, low: Rgb, mid: Rgb, high: Rgb): string | null {
  if (!Number.isFinite(value)) return null;
  const normalized = Math.max(0, Math.min(1, kind === 'slope' ? value / 20 : value));
  return rgba(normalized < 0.5 ? mix(low, mid, normalized * 2) : mix(mid, high, (normalized - 0.5) * 2), opacity);
}

function buildRaster(grid: Grid, kind: GridOverlayKind, opacity: number): HTMLCanvasElement {
  const raster = document.createElement('canvas');
  raster.width = grid.width;
  raster.height = grid.height;
  const context = raster.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable for the grid overlay.');
  const low = tokenColor('--basalt-500');
  const mid = tokenColor('--science');
  const high = tokenColor('--hazard');

  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      const color = colorForValue(kind, grid.data[y * grid.width + x]!, opacity, low, mid, high);
      if (color) {
        context.fillStyle = color;
        context.fillRect(x, y, 1, 1);
      }
    }
  }
  return raster;
}

export class GridCanvasOverlay extends L.Layer {
  private readonly grid: Grid;
  private readonly kind: GridOverlayKind;
  private readonly opacity: number;
  private canvas: HTMLCanvasElement | null = null;
  private raster: HTMLCanvasElement | null = null;
  private map: L.Map | null = null;

  constructor(grid: Grid, kind: GridOverlayKind, options: GridCanvasOptions = {}) {
    super(options);
    this.grid = grid;
    this.kind = kind;
    this.opacity = options.opacity ?? 1;
  }

  onAdd(map: L.Map): this {
    this.map = map;
    this.canvas = L.DomUtil.create('canvas', 'grid-canvas-overlay', map.getPanes().overlayPane);
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.opacity = `${this.opacity}`;
    this.raster = buildRaster(this.grid, this.kind, 1);
    map.on('moveend zoomend resize', this.redraw, this);
    this.redraw();
    return this;
  }

  onRemove(map: L.Map): this {
    map.off('moveend zoomend resize', this.redraw, this);
    this.canvas?.remove();
    this.canvas = null;
    this.raster = null;
    this.map = null;
    return this;
  }

  private redraw = (): void => {
    if (!this.map || !this.canvas || !this.raster) return;
    const size = this.map.getSize();
    this.canvas.width = size.x;
    this.canvas.height = size.y;
    this.canvas.style.width = `${size.x}px`;
    this.canvas.style.height = `${size.y}px`;

    const northWest = this.map.latLngToContainerPoint([this.grid.bbox.north, this.grid.bbox.west]);
    const southEast = this.map.latLngToContainerPoint([this.grid.bbox.south, this.grid.bbox.east]);
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context is unavailable while drawing the grid overlay.');
    context.clearRect(0, 0, size.x, size.y);
    context.imageSmoothingEnabled = false;
    context.drawImage(this.raster, northWest.x, northWest.y, southEast.x - northWest.x, southEast.y - northWest.y);
  };
}
