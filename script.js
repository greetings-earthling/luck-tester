(function () {
  "use strict";

  const SYMBOLS = Array.isArray(window.SYMBOLS) ? window.SYMBOLS : [];
  if (!SYMBOLS.length) return;

  const gridEl = document.getElementById("grid");
  const resultTitle = document.getElementById("resultTitle");
  const resultText = document.getElementById("resultText");
  const badgeRow = document.getElementById("badgeRow");
  const previewTile = document.getElementById("previewTile");
  const previewOverlay = document.getElementById("previewOverlay");
  const previewIcon = document.getElementById("previewIcon");
  const srStatus = document.getElementById("srStatus");

  // Random utilities
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

  // Fresh roll each load
  const rng = mulberry32(hashString(`${Date.now()}|${Math.random()}|luck`));

  // Fixed 6x6 grid
  const COLS = 6;
  const ROWS = 6;
  const CELL_COUNT = 36;

  function rc(idx) { return { r: Math.floor(idx / COLS), c: idx % COLS }; }

  // Chebyshev distance makes a nice square ripple:
  // 0 = bullseye, 1 = immediate ring, 2 = outer ring.
  function chebyshev(a, b) {
    const A = rc(a), B = rc(b);
    return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
  }

  // Choose the lucky cell uniformly
  const luckyCell = Math.floor(rng() * CELL_COUNT);

  // Build score/overlay by ripple
  // dist 0: 10 (o-g80)
  // dist 1: 8  (o-g60)
  // dist 2: 6  (o-g40)
  // else: 5 (white)
  const scoreMap = new Array(CELL_COUNT).fill(5);
  const overlayMap = new Array(CELL_COUNT).fill("");

  for (let i = 0; i < CELL_COUNT; i++) {
    const d = chebyshev(i, luckyCell);
    if (d === 0) {
      scoreMap[i] = 10;
      overlayMap[i] = "o-g80";
    } else if (d === 1) {
      scoreMap[i] = 8;
      overlayMap[i] = "o-g60";
    } else if (d === 2) {
      scoreMap[i] = 6;
      overlayMap[i] = "o-g40";
    }
  }

  function labelForScore(s) {
    if (s === 10) return "BULLSEYE";
    if (s === 8) return "SO CLOSE";
    if (s === 6) return "MAYBE";
    return "NOT IN THE CARDS";
  }

  function messageForScore(s) {
    if (s === 10) return "Luck is on your side today.";
    if (s === 8) return "Good vibes are all around you.";
    if (s === 6) return "You may just have some good luck today.";
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
      const overlay = tile.querySelector(".overlay");
      overlay.className = `overlay ${overlayMap[i] || ""}`;
      tile.classList.toggle("selectedRing", i === chosenCell);
    });
  }

  function lockGrid() {
    locked = true;
    gridEl.querySelectorAll(".tile").forEach(t => t.setAttribute("disabled", "true"));
  }

  function renderGrid() {
    gridEl.innerHTML = "";

    for (let cell = 0; cell < CELL_COUNT; cell++) {
      const sym = SYMBOLS[cell]; // fixed A-Z, then 0-9

      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "tile tileText";
      tile.setAttribute("aria-label", `Pick ${sym.name}`);
      tile.innerHTML = `<span class="symbol">${sym.symbol}</span><div class="overlay"></div>`;

      tile.addEventListener("click", () => {
        if (locked) return;

        const s = scoreMap[cell];

        resultTitle.textContent = `${s}/10: ${labelForScore(s)}`;
        resultText.textContent = messageForScore(s);

        badgeRow.style.display = "flex";
        badgeRow.innerHTML = `
          <span class="badge">You picked: <strong>${sym.symbol}</strong></span>
          <span class="badge">Luck score: <strong>${s}/10</strong></span>
        `;

        srStatus.textContent = `Luck score ${s} out of 10. ${labelForScore(s)}.`;

        revealAllTiles(cell);
        applyPreview(sym.symbol, overlayMap[cell]);
        lockGrid();
      });

      gridEl.appendChild(tile);
    }
  }

  renderGrid();
})();
