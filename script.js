(function () {
  "use strict";

  const grid = document.getElementById("grid");
  const resultTitle = document.getElementById("resultTitle");
  const resultText = document.getElementById("resultText");
  const badgeRow = document.getElementById("badgeRow");
  const previewIcon = document.getElementById("previewIcon");
  const previewOverlay = document.getElementById("previewOverlay");

  if (!grid) return;

  const symbols = Array.isArray(window.SYMBOLS) ? window.SYMBOLS.slice(0, 64) : [];
  if (!symbols.length) return;

  const COLS = 8;
  const CELL_COUNT = symbols.length;

  function rc(i) {
    return { r: Math.floor(i / COLS), c: i % COLS };
  }

  function dist(a, b) {
    const A = rc(a), B = rc(b);
    return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
  }

  // Fresh roll on each page load
  const lucky = Math.floor(Math.random() * CELL_COUNT);

  const score = new Array(CELL_COUNT).fill(5);
  const overlay = new Array(CELL_COUNT).fill("");

  for (let i = 0; i < CELL_COUNT; i++) {
    const d = dist(i, lucky);
    if (d === 0) { score[i] = 10; overlay[i] = "o-p10"; }
    else if (d === 1) { score[i] = 8; overlay[i] = "o-p8"; }
    else if (d === 2) { score[i] = 6; overlay[i] = "o-p6"; }
    else if (d === 3) { score[i] = 4; overlay[i] = "o-p4"; }
  }

  function label(s) {
    if (s === 10) return "BULLSEYE";
    if (s === 8) return "SO CLOSE";
    if (s === 6) return "GOOD VIBES";
    if (s === 4) return "A LITTLE LUCK";
    return "NOT IN THE CARDS";
  }

  function message(s) {
    if (s === 10) return "Luck is on your side today.";
    if (s === 8) return "Right on the edge. Something might click.";
    if (s === 6) return "A decent tailwind. Take one small swing.";
    if (s === 4) return "Not nothing. Stay open to timing.";
    return "It’s not in the cards today. But you never know.";
  }

  let locked = false;

  function reveal(chosen) {
    document.querySelectorAll(".tile").forEach((t, i) => {
      t.classList.add("revealed");
      const o = t.querySelector(".overlay");
      if (o) o.className = `overlay ${overlay[i]}`;

      t.classList.toggle("selectedRing", i === chosen);
      t.classList.toggle("bullseye", i === lucky);
      t.setAttribute("disabled", "true");
    });
  }

  symbols.forEach((item, i) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("aria-label", `Pick ${item.name || "symbol"}`);

    tile.innerHTML = `
      <span class="symbol" aria-hidden="true">${item.symbol}</span>
      <div class="overlay"></div>
    `;

    tile.addEventListener("click", () => {
      if (locked) return;
      locked = true;

      const s = score[i];
      resultTitle.textContent = `${s}/10: ${label(s)}`;
      resultText.textContent = message(s);

      badgeRow.style.display = "flex";
      badgeRow.innerHTML = `<span class="badge">You picked ${item.symbol}</span>`;

      previewIcon.textContent = item.symbol;
      previewOverlay.className = `previewOverlay ${overlay[i]}`;

      reveal(i);
    });

    grid.appendChild(tile);
  });
})();
