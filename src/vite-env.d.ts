/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_NASA_API_KEY?: string;
  readonly VITE_TILE_BASEMAP_URL?: string;
  readonly VITE_TILE_ELEVATION_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
