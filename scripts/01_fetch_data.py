"""Download raw products for a site into data/raw/. SKELETON - fill in real URLs from docs/DATA_SOURCES.md (task T-010).

Do NOT commit raw files. Record every download (URL, date, checksum) in data/raw/SOURCES.log.
"""
import argparse
from common import RAW, SITES

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", required=True, choices=SITES)
    args = ap.parse_args()
    RAW.mkdir(parents=True, exist_ok=True)
    # TODO(T-010): download DEM (MOLA/HRSC blend or CTX/HiRISE DTM), CRISM mineral maps, THEMIS thermal inertia,
    #              rover traverse, MEDA/REMS tables. One function per product; log URL + checksum.
    raise NotImplementedError("Add verified source URLs first (docs/DATA_SOURCES.md).")

if __name__ == "__main__":
    main()
