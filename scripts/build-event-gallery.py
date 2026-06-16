#!/usr/bin/env python3
"""Create web-sized event gallery images + manifest for MUYSA Connect hosting."""

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "media" / "events" / "MUYSA"
OUTPUT = ROOT / "frontend" / "public" / "images" / "events" / "gallery"
MANIFEST = OUTPUT / "manifest.json"
MAX_WIDTH = 1200
QUALITY = 82


def main():
    if not SOURCE.is_dir():
        print(f"Source not found: {SOURCE}")
        print("Put extracted photos in media/events/MUYSA/")
        sys.exit(1)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    photos = []
    files = sorted(SOURCE.glob("*.jpg")) + sorted(SOURCE.glob("*.jpeg")) + sorted(SOURCE.glob("*.JPG"))

    if not files:
        print("No JPG files found in source folder.")
        sys.exit(1)

    print(f"Processing {len(files)} photos...")
    for i, src in enumerate(files, 1):
        dest = OUTPUT / src.name
        try:
            with Image.open(src) as img:
                img = img.convert("RGB")
                w, h = img.size
                if w > MAX_WIDTH:
                    ratio = MAX_WIDTH / w
                    img = img.resize((MAX_WIDTH, int(h * ratio)), Image.Resampling.LANCZOS)
                img.save(dest, "JPEG", quality=QUALITY, optimize=True)
            photos.append({"src": f"/images/events/gallery/{src.name}", "name": src.stem})
            if i % 25 == 0 or i == len(files):
                print(f"  {i}/{len(files)}")
        except Exception as e:
            print(f"  skip {src.name}: {e}")

    manifest = {
        "album": "MUYSA Events",
        "description": "Photo gallery from Makerere University Yumbe Students Association events",
        "photos": photos,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Done: {len(photos)} photos → {OUTPUT}")
    print(f"Manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
