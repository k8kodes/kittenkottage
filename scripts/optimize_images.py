#!/usr/bin/env python3
"""Optimizes images in images/ for the web: caps resolution, recompresses
JPEGs, and strips all metadata (EXIF/GPS/thumbnails). Stripping matters here
beyond file size -- these photos are taken at home and published on a public
site, and phone photos carry exact GPS coordinates in their EXIF data.

Usage: python3 scripts/optimize_images.py [path ...]
  With no args, scans every jpeg/jpg/png under images/.
  Paths may be individual files or directories (scanned recursively).

Requires Pillow: pip3 install --user Pillow

Safe to re-run: already-optimized images shrink very little on a second
pass, so this can run on the whole tree repeatedly without cumulative loss.
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

MAX_DIMENSION = 1600
JPEG_QUALITY = 80
REPO_ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = REPO_ROOT / "images"
EXTENSIONS = {".jpg", ".jpeg", ".png"}


def optimize(path: Path) -> tuple[int, int]:
    before = path.stat().st_size

    img = Image.open(path)
    img = ImageOps.exif_transpose(img)  # bake in rotation before EXIF is dropped
    if img.mode in ("RGBA", "P") and path.suffix.lower() in (".jpg", ".jpeg"):
        img = img.convert("RGB")

    if max(img.size) > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    if path.suffix.lower() in (".jpg", ".jpeg"):
        img.save(path, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    else:
        img.save(path, format="PNG", optimize=True)

    after = path.stat().st_size
    return before, after


def collect_files(paths: list[str]) -> list[Path]:
    if not paths:
        paths = [str(IMAGES_DIR)]
    files = []
    for p in paths:
        pth = Path(p)
        if pth.is_dir():
            files += [f for f in pth.rglob("*") if f.suffix.lower() in EXTENSIONS]
        elif pth.suffix.lower() in EXTENSIONS:
            files.append(pth)
    return sorted(set(files))


def main():
    files = collect_files(sys.argv[1:])
    if not files:
        print("No images found.")
        return

    total_before = total_after = 0
    for f in files:
        try:
            before, after = optimize(f)
        except Exception as e:
            print(f"FAILED {f}: {e}")
            continue
        total_before += before
        total_after += after
        saved_pct = 100 * (1 - after / before) if before else 0
        label = f.relative_to(REPO_ROOT) if REPO_ROOT in f.parents else f
        print(f"{label}: {before//1024}KB -> {after//1024}KB ({saved_pct:.0f}% smaller)")

    if total_before:
        pct = 100 * (1 - total_after / total_before)
        print(f"\nTotal: {total_before/1024/1024:.1f}MB -> {total_after/1024/1024:.1f}MB ({pct:.0f}% smaller)")


if __name__ == "__main__":
    main()
