function renderGallery() {
  const container = document.getElementById("litter-gallery");
  if (!container) return;
  const sorted = [...KITTENS_DATA].sort((a, b) => b.arrival.localeCompare(a.arrival));
  container.innerHTML = sorted.map(batch => {
    const names = batch.kittens.map(k => k.name).join(", ");
    const arrivalDate = new Date(batch.arrival + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const total = batch.kittens.length + (batch.mom ? 1 : 0);
    return `
      <a class="litter-card" href="litter.html?id=${encodeURIComponent(batch.id)}" style="text-decoration:none;color:inherit;">
        <div class="photo-row">${photoRow(batch.id, total)}</div>
        <div class="body">
          <h3>${escapeHtml(batch.label)}</h3>
          <div class="arrival-date">Arrived ${arrivalDate}</div>
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
    ${fullGallery(batch.id)}
    <section>
  `;

  if (batch.mom) {
    html += kittenCard(batch.mom.name, null, null, batch.mom.weights, "#f4a6b7", true);
  }
  batch.kittens.forEach(k => {
    html += kittenCard(k.name, k.sex, k.color, k.weights, "#4f9e8a", false);
  });

  html += `</section>`;
  container.innerHTML = html;
}

function kittenCard(name, sex, color, weights, chartColor, isMom) {
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const meta = [sex, color].filter(Boolean).join(" · ");
  return `
    <div class="kitten-detail-card">
      <h4>${isMom ? "🐈 " : "🐱 "}${escapeHtml(name)}${isMom ? " (mom)" : ""}</h4>
      ${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ""}
      ${sparklineSVG(sorted, chartColor)}
      <div class="meta">${formatOz(first.oz)} on ${first.date} &rarr; ${formatOz(last.oz)} on ${last.date}</div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderGallery();
  renderLitterDetail();
});
