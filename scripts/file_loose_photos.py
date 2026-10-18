#!/usr/bin/env python3
"""Moves loose photo files into date-named subfolders of the Kitten Photos
folder (matching the Photos-app export convention), based on each file's
EXIF/content creation date, converted to local time.

Usage: file_loose_photos.py ROOT [SOURCE_DIR ...]
With no SOURCE_DIRs, files loose at the root of ROOT are filed. Pass one or
more named subfolders (e.g. "Breakfast Bunch") to file their contents instead.
"""
import sys, os, re, subprocess, shutil
from datetime import datetime

MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"
DATE_RE = re.compile(rf"({MONTHS}) (\d{{1,2}}), (\d{{4}})$")

SKIP = {"IMG_0931.jpeg", "IMG_6827.jpeg"}  # already handled in earlier passes

def get_creation_date(path):
    out = subprocess.run(
        ["mdls", "-name", "kMDItemContentCreationDate", "-raw", path],
        capture_output=True, text=True
    ).stdout.strip()
    if not out or out == "(null)":
        return None
    # e.g. "2024-01-20 03:07:15 +0000" (UTC); the shot's local date can differ
    dt = datetime.strptime(out, "%Y-%m-%d %H:%M:%S %z")
    return dt.astimezone().date()

def main():
    root = sys.argv[1]
    existing_date_folders = {}
    for entry in os.listdir(root):
        full = os.path.join(root, entry)
        if os.path.isdir(full):
            m = DATE_RE.search(entry)
            if m:
                month, day, year = m.groups()
                d = datetime.strptime(f"{month} {day} {year}", "%B %d %Y").date()
                existing_date_folders.setdefault(d, entry)

    source_dirs = [os.path.join(root, d) for d in sys.argv[2:]] or [root]
    loose_files = [
        (src, f) for src in source_dirs for f in sorted(os.listdir(src))
        if os.path.isfile(os.path.join(src, f)) and not f.startswith(".")
    ]
    moved, skipped, unknown = [], [], []

    for src, f in loose_files:
        if f in SKIP:
            skipped.append(f)
            continue
        full = os.path.join(src, f)
        d = get_creation_date(full)
        if d is None:
            unknown.append(f)
            continue
        folder_name = existing_date_folders.get(d)
        if folder_name is None:
            folder_name = d.strftime("%B %-d, %Y")
            existing_date_folders[d] = folder_name
        dest_dir = os.path.join(root, folder_name)
        os.makedirs(dest_dir, exist_ok=True)
        shutil.move(full, os.path.join(dest_dir, f))
        moved.append((f, folder_name))

    print("=== Moved ===")
    for f, folder in moved:
        print(f"  {f} -> {folder}/")
    if skipped:
        print("\n=== Skipped (already handled) ===")
        for f in skipped:
            print(f"  {f}")
    if unknown:
        print("\n=== Unknown date (left in place) ===")
        for f in unknown:
            print(f"  {f}")

if __name__ == "__main__":
    main()
