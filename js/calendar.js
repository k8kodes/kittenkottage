(function () {
  const DATE_INDEX = buildDateIndex(KITTENS_DATA);
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // Default to the month of the most recent activity so there's always something to see.
  const allDates = Object.keys(DATE_INDEX).sort();
  const latest = allDates.length ? new Date(allDates[allDates.length - 1] + "T00:00:00") : new Date();

  let viewYear = latest.getFullYear();
  let viewMonth = latest.getMonth(); // 0-indexed

  const grid = document.getElementById("calendar-grid");
  const title = document.getElementById("calendar-title");
  const modalBackdrop = document.getElementById("day-modal-backdrop");
  const modal = document.getElementById("day-modal");

  function pad2(n) { return String(n).padStart(2, "0"); }

  function render() {
    title.textContent = `${monthNames[viewMonth]} ${viewYear}`;
    grid.innerHTML = "";
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d => {
      const el = document.createElement("div");
      el.className = "dow";
      el.textContent = d;
      grid.appendChild(el);
    });

    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = todayStr();

    for (let i = 0; i < startOffset; i++) {
      const el = document.createElement("div");
      el.className = "day-cell empty";
      grid.appendChild(el);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
      const info = DATE_INDEX[dateStr];
      const cell = document.createElement("div");
      cell.className = "day-cell" + (dateStr === today ? " today" : "");

      const num = document.createElement("span");
      num.className = "day-num";
      num.textContent = day;
      cell.appendChild(num);

      if (info) {
        info.arrivals.forEach(a => {
          const tag = document.createElement("span");
          tag.className = "day-tag new";
          tag.textContent = "🐾 New Fosters!";
          cell.appendChild(tag);
        });
        if (info.weighIns.length) {
          const tag = document.createElement("span");
          tag.className = "day-tag weigh";
          tag.textContent = `⚖ ${info.weighIns.length} weigh-in${info.weighIns.length > 1 ? "s" : ""}`;
          cell.appendChild(tag);
        }
        cell.addEventListener("click", () => openDay(dateStr, info));
      }

      grid.appendChild(cell);
    }
  }

  function openDay(dateStr, info) {
    const d = new Date(dateStr + "T00:00:00");
    const niceDate = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    let html = `<button class="close-btn" aria-label="Close">✕</button><h3>${niceDate}</h3>`;
    if (info.arrivals.length) {
      info.arrivals.forEach(a => {
        html += `<p>🐾 <strong>New Fosters!</strong> — <a href="litter.html?id=${encodeURIComponent(a.batchId)}">${escapeHtml(a.label)}</a> arrived today.</p>`;
      });
    }
    if (info.weighIns.length) {
      html += `<div>`;
      info.weighIns.forEach(w => {
        html += `<div class="weigh-entry"><span>${escapeHtml(w.name)}${w.isMom ? " (mom)" : ""}</span><span>${formatOz(w.oz)}</span></div>`;
      });
      html += `</div>`;
    }
    modal.innerHTML = html;
    modal.querySelector(".close-btn").addEventListener("click", closeDay);
    modalBackdrop.classList.add("open");
  }

  function closeDay() {
    modalBackdrop.classList.remove("open");
  }

  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeDay();
  });

  document.getElementById("prev-month").addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    render();
  });
  document.getElementById("next-month").addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    render();
  });
  document.getElementById("today-btn").addEventListener("click", () => {
    viewYear = latest.getFullYear();
    viewMonth = latest.getMonth();
    render();
  });

  render();
})();
