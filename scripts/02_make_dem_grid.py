"""Crop + resample a DEM GeoTIFF to an N x N float32 grid and write public/data/<site>/dem.json (format: docs/DATABASE.md).

SKELETON, untested against real data (T-011). Assumes the input GeoTIFF is in a lon/lat (equirectangular) CRS.
"""
import argparse, base64, json
import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.windows import from_bounds
from common import RAW, SITES, site_dir

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", required=True, choices=SITES)
    ap.add_argument("--dem", required=True, help="path to DEM GeoTIFF inside data/raw/")
    ap.add_argument("--size", type=int, default=512)
    a = ap.parse_args()
    west, south, east, north = SITES[a.site]
    with rasterio.open(RAW / a.dem) as src:
        win = from_bounds(west, south, east, north, src.transform)
        arr = src.read(1, window=win, out_shape=(a.size, a.size), resampling=Resampling.bilinear).astype("<f4")
    out = {
        "schemaVersion": 1, "width": a.size, "height": a.size,
        "bbox": {"west": west, "south": south, "east": east, "north": north},
        "encoding": "float32-base64", "unit": "m",
        "data": base64.b64encode(arr.tobytes()).decode("ascii"),
        "provenance": {"source_file": a.dem, "note": "fill mission/instrument/product/url (T-011)"},
    }
    (site_dir(a.site) / "dem.json").write_text(json.dumps(out))

if __name__ == "__main__":
    main()
