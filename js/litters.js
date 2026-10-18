function renderGallery() {
  const container = document.getElementById("litter-gallery");
  if (!container) return;
  const sorted = [...KITTENS_DATA].sort((a, b) => b.arrival.localeCompare(a.arrival));
  container.innerHTML = sorted.map(batch => {
    const names = batch.kittens.map(k => k.name).join(", ");
    const total = batch.kittens.length + (batch.mom ? 1 : 0);
    return `
      <a class="litter-card" href="litter.html?id=${encodeURIComponent(batch.id)}" style="text-decoration:none;color:inherit;">
        <div class="photo-row">${photoRow(batch.id, total)}</div>
        <div class="body">
          <h3>${escapeHtml(batch.label)}</h3>
          <div class="arrival-date">${kottageLine(batch)}</div>
          <div class="kitten-names">${escapeHtml(names)}${batch.mom ? ` &middot; with mom ${escapeHtml(batch.mom.name)}` : ""}</div>
        </div>
      </a>`;
  }).join("");
}

function renderLitterDetail() {
  const container = document.getElementById("litter-detail");
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const batch = KITTENS_DATA.find(b => b.id === id);
  if (!batch) {
    container.innerHTML = `<p>Litter not found. <a href="litters.html">Back to all litters.</a></p>`;
    return;
  }
  const arrivalDate = new Date(batch.arrival + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  document.title = `${batch.label} — Kitten Kottage`;

  let html = `
    <p><a href="litters.html">&larr; All litters</a></p>
    <div class="litter-detail-header">
      <div class="photo-row" style="width:200px;">${photoRow(batch.id, 3)}</div>
      <div>
        <h1 style="margin-bottom:0.2rem;">${escapeHtml(batch.label)}</h1>
        <p class="arrival-date" style="font-size:1rem;">🐾 Arrived ${arrivalDate}</p>
        ${batch.notes.map(n => `<div class="food-notes">${escapeHtml(n)}</div>`).join("")}
      </div>
    </div>
    ${memorialSection(batch)}
    ${fullGallery(batch.id)}
    <section>
  `;

  if (batch.mom) {
    html += kittenCard(batch.mom.name, null, null, batch.mom.weights, "#f4a6b7", true);
  }
  batch.kittens.forEach(k => {
    const inMemory = batch.memorial && batch.memorial.name === k.name ? batch.memorial.date : null;
    html += kittenCard(k.name, k.sex, k.color, k.weights, "#4f9e8a", false, inMemory);
    if (k.grownUp) html += grownUpCard(batch.id, k);
  });

  html += `</section>`;
  container.innerHTML = html;
}

// Follow-up card for a kitten who was adopted and has a new name and adult photo.
function grownUpCard(batchId, kitten) {
  const g = kitten.grownUp;
  const photo = g.photo ? `<img src="images/${batchId}/${encodeURIComponent(g.photo)}" alt="${escapeHtml(g.name)}, grown up">` : "";
  return `
    <div class="kitten-detail-card grown-up">
      <h4>🐱 ${escapeHtml(g.name)} (formerly ${escapeHtml(kitten.name)})</h4>
      ${photo}
      <div class="meta">${escapeHtml(g.text)}</div>
    </div>`;
}

// Tribute for a kitten we lost, shown at the top of the litter page.
function memorialSection(batch) {
  const m = batch.memorial;
  if (!m) return "";
  const photo = m.photo ? `<img src="images/${batch.id}/${encodeURIComponent(m.photo)}" alt="${escapeHtml(m.name)}">` : "";
  return `
    <section class="memorial">
      ${photo}
      <div>
        <h2>In memory of ${escapeHtml(m.name)}</h2>
        <p>${escapeHtml(m.text)}</p>
      </div>
    </section>`;
}

function kittenCard(name, sex, color, weights, chartColor, isMom, inMemoryDate) {
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const meta = [sex, color].filter(Boolean).join(" · ");
  const memoryTag = inMemoryDate
    ? `<div class="meta"><strong>In memory</strong> &middot; ${new Date(inMemoryDate + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>`
    : "";
  return `
    <div class="kitten-detail-card">
      <h4>${isMom ? "🐈 " : "🐱 "}${escapeHtml(name)}${isMom ? " (mom)" : ""}</h4>
      ${memoryTag}
      ${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ""}
      ${sparklineSVG(sorted, chartColor)}
      <div class="meta">${formatOz(first.oz)} on ${first.date} &rarr; ${formatOz(last.oz)} on ${last.date}</div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderGallery();
  renderLitterDetail();
});
