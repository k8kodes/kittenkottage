// Shared helpers used across pages.

function formatOz(totalOz) {
  const lbs = Math.floor(totalOz / 16);
  const oz = Math.round((totalOz - lbs * 16) * 10) / 10;
  if (lbs === 0) return `${oz} oz`;
  if (oz === 0) return `${lbs} lb`;
  return `${lbs} lb ${oz} oz`;
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// Formats the span between two dates as "X years, Y months" (or just one unit).
function formatDuration(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  if (to.getDate() < from.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months > 0 || years === 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
  return parts.join(", ");
}

// Days the longest-staying kitten was with us: arrival to that kitten's last weigh-in.
// A litter weighed within the last day or so is still here, so it reads "Fostering".
function stayLabel(batch) {
  const toDay = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  const lastWeighIn = batch.kittens.flatMap(k => k.weights.map(w => w.date)).sort().pop();
  if (!lastWeighIn) return "";
  const days = Math.round((toDay(lastWeighIn) - toDay(batch.arrival)) / 86400000);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const active = (today - toDay(lastWeighIn)) / 86400000 <= 1;
  const unit = days === 1 ? "day" : "days";
  return `${active ? "Fostering" : "Stayed"} ${days} ${unit}`;
}

// Builds date -> { arrivals: [{batchId,label}], weighIns: [{batchId,label,name,oz,isMom}] }
function buildDateIndex(data) {
  const index = {};
  function ensure(date) {
    if (!index[date]) index[date] = { arrivals: [], weighIns: [] };
    return index[date];
  }
  data.forEach(batch => {
    ensure(batch.arrival).arrivals.push({ batchId: batch.id, label: batch.label });
    if (batch.mom) {
      batch.mom.weights.forEach(w => {
        ensure(w.date).weighIns.push({ batchId: batch.id, label: batch.label, name: batch.mom.name, oz: w.oz, isMom: true });
      });
    }
    batch.kittens.forEach(kitten => {
      kitten.weights.forEach(w => {
        ensure(w.date).weighIns.push({ batchId: batch.id, label: batch.label, name: kitten.name, oz: w.oz, isMom: false });
      });
    });
  });
  return index;
}

// Returns an inline SVG line chart string for a series of {date, oz} points.
function sparklineSVG(weights, color) {
  if (!weights.length) return "";
  const w = 300, h = 70, pad = 6;
  const values = weights.map(p => p.oz);
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const stepX = weights.length > 1 ? (w - pad * 2) / (weights.length - 1) : 0;
  const points = weights.map((p, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((p.oz - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = weights[weights.length - 1];
  const lastX = pad + (weights.length - 1) * stepX;
  const lastY = h - pad - ((last.oz - min) / range) * (h - pad * 2);
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline fill="none" stroke="${color || '#4f9e8a'}" stroke-width="2.5" points="${points}" />
    <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="3.5" fill="${color || '#4f9e8a'}" />
  </svg>`;
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function placeholderPhotos(count) {
  const paws = ["🐱","🐈","🐾"];
  let html = "";
  for (let i = 0; i < Math.min(count, 3); i++) {
    html += `<div class="placeholder-photo">${paws[i % paws.length]}</div>`;
  }
  return html;
}

// All photos for a batch: the auto-generated manifest plus any hand-added extras.
function getPhotosForBatch(batchId) {
  const fromManifest = (typeof PHOTOS_MANIFEST !== "undefined" && PHOTOS_MANIFEST[batchId]) || [];
  const extra = (typeof PHOTOS_EXTRA !== "undefined" && PHOTOS_EXTRA[batchId]) || [];
  return fromManifest.concat(extra);
}

// Orders a batch's photos for the cover thumbnails. If an explicit coverOrder
// is set, that's used as-is. Otherwise the mom photo (if identified) leads,
// followed by any collage shot, then the rest in chronological order.
function orderPhotosForCover(batchId, photos) {
  const overrides = (typeof PHOTO_OVERRIDES !== "undefined" && PHOTO_OVERRIDES[batchId]) || {};
  if (overrides.coverOrder) {
    const inOrder = overrides.coverOrder.filter(f => photos.includes(f));
    const rest = photos.filter(f => !inOrder.includes(f));
    return inOrder.concat(rest);
  }
  const momPhoto = overrides.momPhoto && photos.includes(overrides.momPhoto) ? overrides.momPhoto : null;
  const collagePhoto = photos.find(f => /collage/i.test(f) && f !== momPhoto) || null;
  const lead = [momPhoto, collagePhoto].filter(Boolean);
  const rest = photos.filter(f => !lead.includes(f));
  return lead.concat(rest);
}

// Returns up to `count` <img> cover thumbnails for a batch, or emoji placeholders if no photos exist yet.
function photoRow(batchId, count) {
  const photos = getPhotosForBatch(batchId);
  if (!photos.length) return placeholderPhotos(count);
  const shown = orderPhotosForCover(batchId, photos).slice(0, 3);
  let html = shown.map(f => `<img class="placeholder-photo" style="object-fit:cover;" src="images/${batchId}/${encodeURIComponent(f)}" alt="">`).join("");
  for (let i = shown.length; i < Math.min(count, 3); i++) {
    html += `<div class="placeholder-photo">🐾</div>`;
  }
  return html;
}

// Full photo gallery grid for a litter's detail page.
function fullGallery(batchId) {
  const photos = getPhotosForBatch(batchId);
  if (!photos.length) return "";
  return `
    <section>
      <h2>Photos</h2>
      <div class="photo-gallery">
        ${photos.map(f => `<a href="images/${batchId}/${encodeURIComponent(f)}" target="_blank" rel="noopener"><img src="images/${batchId}/${encodeURIComponent(f)}" alt="${escapeHtml(batchId)} photo" loading="lazy"></a>`).join("")}
      </div>
    </section>`;
}
