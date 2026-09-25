"""Shared helpers for the data pipeline. Keep site definitions in sync with src/config/sites.config.ts."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
INTERIM = ROOT / "data" / "interim"
PUBLIC_DATA = ROOT / "public" / "data"

# APPROXIMATE bboxes (west, south, east, north), lon east-positive planetocentric. Verify (task T-002).
SITES = {
    "jezero-delta": (77.30, 18.35, 77.55, 18.55),
    "gale-mount-sharp": (137.30, -4.90, 137.60, -4.50),
}

MARS_RADIUS_M = 3_389_500.0


def site_dir(site: str) -> Path:
    d = PUBLIC_DATA / site
    d.mkdir(parents=True, exist_ok=True)
    return d
