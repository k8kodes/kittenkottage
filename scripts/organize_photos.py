#!/usr/bin/env python3
"""Matches Photos-app-exported date folders to litters and copies images into images/<litter-id>/.

Usage: python3 scripts/organize_photos.py "/Users/katebecker/Desktop/Kitten Photos"
"""
import sys, os, re, json, shutil
from datetime import datetime, timedelta

MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"
DATE_RE = re.compile(rf"({MONTHS}) (\d{{1,2}}), (\d{{4}})$")

# Filenames deliberately excluded from the site (removed on request), keyed by
# original filename so they aren't silently re-added on the next import.
EXCLUDED_FILENAMES = {
    "IMG_7269.jpeg",
    "IMG_6966.jpeg",
    "IMG_5783.jpeg",
    "IMG_4844.jpeg",
    "IMG_3898.jpeg",
}

def parse_folder_date(name):
    m = DATE_RE.search(name)
    if not m:
        return None
    month, day, year = m.groups()
    return datetime.strptime(f"{month} {day} {year}", "%B %d %Y").date()

def main():
    if len(sys.argv) < 2:
        print("Usage: organize_photos.py <source-folder>")
        sys.exit(1)
    src_root = sys.argv[1]
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data = json.load(open(os.path.join(root, "data", "kittens.json")))

    # Build date range per batch, with a couple days of slack on each side.
    ranges = []
    for b in data:
        dates = [b["arrival"]]
        if b["mom"]:
            dates += [w["date"] for w in b["mom"]["weights"]]
        for k in b["kittens"]:
            dates += [w["date"] for w in k["weights"]]
        dmin = min(dates)
        dmax = max(dates)
        dmin_d = datetime.strptime(dmin, "%Y-%m-%d").date() - timedelta(days=2)
        dmax_d = datetime.strptime(dmax, "%Y-%m-%d").date() + timedelta(days=2)
        ranges.append((b["id"], b["label"], dmin_d, dmax_d))

    matched = {b["id"]: [] for b in data}
    unmatched = []
    ambiguous = []

    for entry in sorted(os.listdir(src_root)):
        full = os.path.join(src_root, entry)
        if not os.path.isdir(full):
            continue
        d = parse_folder_date(entry)
        if not d:
            unmatched.append((entry, "could not parse date"))
            continue
        hits = [(bid, label) for bid, label, dmin, dmax in ranges if dmin <= d <= dmax]
        files = [f for f in sorted(os.listdir(full)) if not f.startswith(".") and f not in EXCLUDED_FILENAMES]
        if len(hits) == 0:
            unmatched.append((entry, f"{len(files)} photo(s), no litter covers {d.isoformat()}"))
        elif len(hits) > 1:
            ambiguous.append((entry, hits, files))
        else:
            bid, label = hits[0]
            for f in files:
                matched[bid].append((os.path.join(full, f), d.isoformat(), f))

    # Copy matched files
    manifest = {}
    for bid, items in matched.items():
        if not items:
            continue
        dest_dir = os.path.join(root, "images", bid)
        os.makedirs(dest_dir, exist_ok=True)
        manifest[bid] = []
        for src_path, date_str, orig_name in sorted(items, key=lambda x: x[1]):
            ext = os.path.splitext(orig_name)[1].lower()
            dest_name = f"{date_str}_{orig_name}"
            dest_path = os.path.join(dest_dir, dest_name)
            if not os.path.exists(dest_path):
                shutil.copy2(src_path, dest_path)
            manifest[bid].append(dest_name)

    # Write manifest for the site to consume
    manifest_path = os.path.join(root, "js", "photos-data.js")
    with open(manifest_path, "w") as f:
        f.write("const PHOTOS_MANIFEST = ")
        json.dump(manifest, f, indent=2)
        f.write(";\n")

    print("=== Matched & copied ===")
    for bid, items in matched.items():
        if items:
            label = next(l for i, l, *_ in ranges if i == bid)
            print(f"  {label} ({bid}): {len(items)} photo(s)")

    if ambiguous:
        print("\n=== Ambiguous (overlapping litters, needs manual review) ===")
        for entry, hits, files in ambiguous:
            print(f"  {entry}: {len(files)} photo(s) could belong to: {[h[1] for h in hits]}")

    if unmatched:
        print("\n=== Unmatched (no litter date range covers this folder) ===")
        for entry, reason in unmatched:
            print(f"  {entry}: {reason}")

    print(f"\nWrote {manifest_path}")

if __name__ == "__main__":
    main()
