(function () {
  "use strict";

  const gridEl = document.getElementById("grid");

  function showError(msg) {
    console.error(msg);
    if (!gridEl) return;
    gridEl.style.gridTemplateColumns = "1fr";
    gridEl.innerHTML = `
      <div style="border:1px solid #e6e6e6;border-radius:14px;padding:14px;background:#fff;color:#111;">
        <strong>Luck Tester error</strong><br>
        <span style="color:#666;">${msg}</span>
      </div>
    `;
  }

  const RAW = Array.isArray(window.SYMBOLS) ? window.SYMBOLS : [];
  if (!RAW.length) {
    showError("No symbols found. Confirm symbols.js loads before script.js and defines window.SYMBOLS.");
    return;
  }

  // Use first 100. If more exist, ignore extras. If fewer, we still render what we have.
  const CELL_COUNT = Math.min(100, RAW.length);
  const SYMBOLS = RAW.slice(0, CELL_COUNT);

  // Fixed 10x10 board assumptions only hold if we have 100.
  // If fewer symbols exist, we still render a grid, but luck math uses the active cell count.
  const COLS = 10;
  const ROWS = Math.ceil(CELL_COUNT / COLS);

  // DOM
  const resultTitle = document.getElementById("resultTitle");
  const resultText = document.getElementById("resultText");
  const badgeRow = document.getElementById("badgeRow");
  const previewTile = document.getElementById("previewTile");
  const previewOverlay = document.getElementById("previewOverlay");
  const previewIcon = document.getElementById("previewIcon");
  const srStatus = document.getElementById("srStatus");

  // Random
  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    return function () {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rng = mulberry32(hashString(`${Date.now()}|${Math.random()}|luck100`));

  function rc(idx) { return { r: Math.floor(idx / COLS), c: idx % COLS }; }

  function chebyshev(a, b) {
    const A = rc(a), B = rc(b);
    return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
  }

  // Pick lucky cell uniformly over whatever we have
  const luckyCell = Math.floor(rng() * CELL_COUNT);

  // 4-layer ripple
  const scoreMap = new Array(CELL_COUNT).fill(5);
  const overlayMap = new Array(CELL_COUNT).fill("");

  for (let i = 0; i < CELL_COUNT; i++) {
    const d = chebyshev(i, luckyCell);
    if (d === 0) { scoreMap[i] = 10; overlayMap[i] = "o-g10"; }
    else if (d === 1) { scoreMap[i] = 8; overlayMap[i] = "o-g8"; }
    else if (d === 2) { scoreMap[i] = 6; overlayMap[i] = "o-g6"; }
    else if (d === 3) { scoreMap[i] = 4; overlayMap[i] = "o-g4"; }
  }

  function labelForScore(s) {
    if (s === 10) return "BULLSEYE";
    if (s === 8) return "SO CLOSE";
    if (s === 6) return "GOOD VIBES";
    if (s === 4) return "A LITTLE LUCK";
    return "NOT IN THE CARDS";
  }

  function messageForScore(s) {
    if (s === 10) return "Luck is on your side today.";
    if (s === 8) return "Right on the edge. Something might click.";
    if (s === 6) return "A decent tailwind. Take one small swing.";
    if (s === 4) return "Not nothing. Stay open to weird timing.";
    return "It’s not in the cards today, but you never know. Luck is a funny thing.";
  }

  let locked = false;

  function applyPreview(symbolText, overlayClass) {
    previewIcon.textContent = symbolText;
    previewOverlay.className = `previewOverlay ${overlayClass || ""}`;
    previewTile.classList.add("selectedRing");
  }

  function revealAllTiles(chosenCell) {
    const tiles = gridEl.querySelectorAll(".tile");
    tiles.forEach((tile, i) => {
      tile.classList.add("revealed");

      const o = tile.querySelector(".overlay");
      if (o) o.className = `overlay ${overlayMap[i] || ""}`;

      tile.classList.toggle("selectedRing", i === chosenCell);
      tile.classList.toggle("bullseye", i === luckyCell);
    });
  }

  function lockGrid() {
    locked = true;
    gridEl.querySelectorAll(".tile").forEach(t => t.setAttribute("disabled", "true"));
  }

  function renderGrid() {
    gridEl.innerHTML = "";
    gridEl.style.gridTemplateColumns = `repeat(${COLS}, minmax(0, 1fr))`;

    for (let cell = 0; cell < CELL_COUNT; cell++) {
      const item = SYMBOLS[cell];

      if (!item || typeof item.symbol !== "string") {
        showError("A symbol entry is malformed. Each item must be { name, symbol }.");
        return;
      }

      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "tile";
      tile.setAttribute("aria-label", `Pick ${item.name || "symbol"}`);
      tile.innerHTML = `<span class="symbol" aria-hidden="true">${item.symbol}</span><div class="overlay"></div>`;

      tile.addEventListener("click", () => {
        if (locked) return;

        const s = scoreMap[cell];

        resultTitle.textContent = `${s}/10: ${labelForScore(s)}`;
        resultText.textContent = messageForScore(s);

        badgeRow.style.display = "flex";
        badgeRow.innerHTML = `
          <span class="badge">You picked: <strong>${item.symbol}</strong></span>
          <span class="badge">Luck score: <strong>${s}/10</strong></span>
        `;

        srStatus.textContent = `Luck score ${s} out of 10. ${labelForScore(s)}.`;

        revealAllTiles(cell);
        applyPreview(item.symbol, overlayMap[cell]);
        lockGrid();
      });

      gridEl.appendChild(tile);
    }
  }

  renderGrid();
})();
