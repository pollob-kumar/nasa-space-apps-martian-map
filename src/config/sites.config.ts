import type { Site } from '@/types';

/**
 * Coordinates below are APPROXIMATE (from memory of public sources) and marked verified:false.
 * TODO(T-002): check against the USGS Gazetteer of Planetary Nomenclature / NASA landing-site pages.
 */
export const SITES: Site[] = [
  {
    id: 'jezero-delta',
    name: 'Jezero Crater - Western Delta',
    center: { lon: 77.42, lat: 18.45 },
    bbox: { west: 77.3, south: 18.35, east: 77.55, north: 18.55 },
    verified: false,
    note: 'Perseverance (Mars 2020) operating area. Default scope, see ADR-001.',
  },
  {
    id: 'gale-mount-sharp',
    name: 'Gale Crater - Mount Sharp foothills',
    center: { lon: 137.4, lat: -4.7 },
    bbox: { west: 137.3, south: -4.9, east: 137.6, north: -4.5 },
    verified: false,
    note: 'Curiosity (MSL) area. Backup scope only.',
  },
];

export const DEFAULT_SITE_ID = 'jezero-delta';
