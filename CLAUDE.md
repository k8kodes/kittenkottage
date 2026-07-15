# KittenKottage

Static site (plain HTML/CSS/JS, no build step) for a home cat-breeding operation: litter pages, photo galleries, weight-tracking charts, a calendar. Litter/kitten data lives in `data/` and `js/*-data.js`; photos live in `images/<litter-id>/`.

## Adding photos

Photos come straight off phones and land at 300-900KB each with full EXIF, including GPS coordinates for wherever they were shot — often home. Since this site is public, that leaks the location.

**Whenever new images are added to `images/`, run them through the optimizer before committing:**

```
python3 scripts/optimize_images.py [path ...]
```

With no arguments it scans everything under `images/`. It's safe to re-run on already-optimized files (idempotent — negligible further loss). It:
- caps the longest edge at 1600px (site only ever displays these as small thumbnails or a click-through full view, never larger)
- recompresses JPEGs at quality 80 with Pillow (roughly 45-50% smaller than the sips/camera default at visually identical quality)
- strips all EXIF, including GPS

Requires Pillow: `pip3 install --user Pillow` (one-time, already done on this machine).
