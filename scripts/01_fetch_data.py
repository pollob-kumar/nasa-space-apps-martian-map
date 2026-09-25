"""Download raw products for a site into data/raw/.

Implements T-010. One function per source.
If a source isn't verified yet (see docs/DATA_SOURCES.md), raises NotImplementedError.
"""
import argparse
from pathlib import Path
from common import RAW, SITES

def fetch_dem(site: str, out_dir: Path) -> None:
    raise NotImplementedError("DEM source not yet verified (see docs/DATA_SOURCES.md).")

def fetch_imagery(site: str, out_dir: Path) -> None:
    raise NotImplementedError("CTX/HiRISE imagery source not yet verified (see docs/DATA_SOURCES.md).")

def fetch_mineralogy(site: str, out_dir: Path) -> None:
    raise NotImplementedError("CRISM mineralogy source not yet verified (see docs/DATA_SOURCES.md).")

def fetch_thermal_inertia(site: str, out_dir: Path) -> None:
    raise NotImplementedError("THEMIS thermal inertia source not yet verified (see docs/DATA_SOURCES.md).")

def fetch_traverse(site: str, out_dir: Path) -> None:
    raise NotImplementedError("Mars 2020 traverse source not yet verified (see docs/DATA_SOURCES.md).")

def fetch_conditions(site: str, out_dir: Path) -> None:
    raise NotImplementedError("MEDA conditions snapshot source not yet verified (see docs/DATA_SOURCES.md).")

def main() -> None:
    ap = argparse.ArgumentParser(description="Download raw products for a site.")
    ap.add_argument("--site", required=True, choices=SITES)
    args = ap.parse_args()
    
    out_dir = RAW / args.site
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Run fetchers. They will raise NotImplementedError until sources are verified.
    fetch_dem(args.site, out_dir)
    fetch_imagery(args.site, out_dir)
    fetch_mineralogy(args.site, out_dir)
    fetch_thermal_inertia(args.site, out_dir)
    fetch_traverse(args.site, out_dir)
    fetch_conditions(args.site, out_dir)

if __name__ == "__main__":
    main()
