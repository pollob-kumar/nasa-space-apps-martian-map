import { create } from 'zustand';
import { LAYERS } from '@/config/layers.config';
import { DEFAULT_SITE_ID } from '@/config/sites.config';
import type { RouteProfile } from '@/features/routing/costModel';
import type { LonLat, RouteResult } from '@/types';

interface LayerState {
  visible: boolean;
  opacity: number;
}

interface AppState {
  siteId: string;
  view: '2d' | '3d';
  layerState: Record<string, LayerState>;
  profile: RouteProfile['id'];
  route: RouteResult | null;
  routeStart: LonLat | null;
  routeGoal: LonLat | null;
  routePickMode: 'start' | 'goal' | null;
  selectedTargetId: string | null;
  /** ordered science stops for the Marswalk plan (FR-08); ids must match loaded science targets */
  planStops: string[];
  /** point last clicked on the 2D map (FR-06 inspector); null = none */
  inspectedPoint: LonLat | null;
  setSite: (id: string) => void;
  setView: (v: '2d' | '3d') => void;
  toggleLayer: (id: string) => void;
  setOpacity: (id: string, o: number) => void;
  setProfile: (p: RouteProfile['id']) => void;
  setRoute: (r: RouteResult | null) => void;
  setRouteStart: (p: LonLat | null) => void;
  setRouteGoal: (p: LonLat | null) => void;
  setRoutePickMode: (mode: 'start' | 'goal' | null) => void;
  selectTarget: (id: string | null) => void;
  setPlanStops: (ids: string[]) => void;
  inspect: (p: LonLat | null) => void;
}

const initialLayers = Object.fromEntries(
  LAYERS.map((l) => [l.id, { visible: l.defaultVisible, opacity: l.defaultOpacity }]),
);

export const useApp = create<AppState>((set) => ({
  siteId: DEFAULT_SITE_ID,
  view: '2d',
  layerState: initialLayers,
  profile: 'science',
  route: null,
  routeStart: null,
  routeGoal: null,
  routePickMode: null,
  selectedTargetId: null,
  planStops: [],
  inspectedPoint: null,
  setSite: (siteId) => set({ siteId, route: null, routeStart: null, routeGoal: null, routePickMode: null, selectedTargetId: null, planStops: [], inspectedPoint: null }),
  setView: (view) => set({ view }),
  toggleLayer: (id) =>
    set((s) => ({ layerState: { ...s.layerState, [id]: { ...s.layerState[id]!, visible: !s.layerState[id]!.visible } } })),
  setOpacity: (id, opacity) =>
    set((s) => ({ layerState: { ...s.layerState, [id]: { ...s.layerState[id]!, opacity } } })),
  setProfile: (profile) => set({ profile }),
  setRoute: (route) => set({ route }),
  setRouteStart: (routeStart) => set({ routeStart, route: null }),
  setRouteGoal: (routeGoal) => set({ routeGoal, route: null }),
  setRoutePickMode: (routePickMode) => set({ routePickMode }),
  selectTarget: (selectedTargetId) => set({ selectedTargetId }),
  setPlanStops: (planStops) => set({ planStops }),
  inspect: (inspectedPoint) => set({ inspectedPoint }),
}));
