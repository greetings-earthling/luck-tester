(function () {
  "use strict";

  const SYMBOLS = Array.isArray(window.SYMBOLS) ? window.SYMBOLS : [];
  if (!SYMBOLS.length) {
    console.error("SYMBOLS missing. Make sure icons.js loads before script.js.");
    return;
  }

  // DOM
  const gridEl = document.getElementById("grid");
  const statusPill = document.getElementById("statusPill");
  const lockNote = document.getElementById("lockNote");
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

  // New roll on every refresh
  const rng = mulberry32(hashString(`${Date.now()}|${Math.random()}|luck`));

  // Grid sizing: 36 symbols
  const CELL_COUNT = SYMBOLS.length; // should be 36
  const COLS = 6;
  const ROWS = 6;

  gridEl.style.gridTemplateColumns = `repeat(${COLS}, minmax(0, 1fr))`;

  function rc(idx) { return { r: Math.floor(idx / COLS), c: idx % COLS }; }
  function idxOf(r, c) { return r * COLS + c; }
  function inBounds(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

  function manhattan(a, b) {
    const A = rc(a), B = rc(b);
    return Math.abs(A.r - B.r) + Math.abs(A.c - B.c);
  }

  function orthogonalNeighbors(centerIdx) {
    const C = rc(centerIdx);
    const coords = [[C.r - 1, C.c], [C.r + 1, C.c], [C.r, C.c - 1], [C.r, C.c + 1]];
    return coords.filter(([r, c]) => inBounds(r, c)).map(([r, c]) => idxOf(r, c));
  }

  function diagonalNeighbors(centerIdx) {
    const C = rc(centerIdx);
    const coords = [[C.r - 1, C.c - 1], [C.r - 1, C.c + 1], [C.r + 1, C.c - 1], [C.r + 1, C.c + 1]];
    return coords.filter(([r, c]) => inBounds(r, c)).map(([r, c]) => idxOf(r, c));
  }

  // Lucky/unlucky selection (random cells)
  const luckyCell = Math.floor(rng() * CELL_COUNT);

  const distances = Array.from({ length: CELL_COUNT }, (_, i) => ({ i, d: manhattan(i, luckyCell) }));
  const maxD = Math.max(...distances.map(x => x.d));
  const farthest = distances.filter(x => x.d === maxD).map(x => x.i);
  const unluckyCell = farthest[Math.floor(rng() * farthest.length)];

  // Score + overlay maps
  const scoreMap = new Array(CELL_COUNT).fill(5);
  const overlayMap = new Array(CELL_COUNT).fill("");
  const prio = new Array(CELL_COUNT).fill(0);

  function setCell(idx, score, overlayClass, priority) {
    if (priority >= prio[idx]) {
      prio[idx] = priority;
      scoreMap[idx] = score;
      overlayMap[idx] = overlayClass;
    }
  }

  // Unlucky zones first (lower priority)
  setCell(unluckyCell, 0, "o-r0", 2);
  orthogonalNeighbors(unluckyCell).forEach(i => setCell(i, 3, "o-r3", 1));
  diagonalNeighbors(unluckyCell).forEach(i => setCell(i, 4, "o-r4", 1));

  // Lucky zones override (higher priority)
  setCell(luckyCell, 10, "o-g10", 4);
  orthogonalNeighbors(luckyCell).forEach(i => setCell(i, 8, "o-g8", 3));
  diagonalNeighbors(luckyCell).forEach(i => setCell(i, 6, "o-g6", 3));

  // Copy
  function labelForScore(score) {
    if (score === 10) return "SUPER LUCKY";
    if (score === 8) return "VERY LUCKY";
    if (score === 6) return "SLIGHTLY LUCKY";
    if (score === 5) return "MEH";
    if (score === 4) return "A BIT OFF";
    if (score === 3) return "UNLUCKY-ISH";
    if (score === 0) return "BAD LUCK";
    return "MEH";
  }

  function messageForScore(score) {
    if (score === 10) return "Lucky, lucky!";
    if (score === 8) return "Pretty good odds for a nonsense machine.";
    if (score === 6) return "A small tailwind. Nothing dramatic.";
    if (score === 5) return "Neutral. You are floating normally.";
    if (score === 4) return "A little friction. Nothing personal.";
    if (score === 3) return "Today may require patience and snacks.";
    if (score === 0) return "Proceed carefully. Keep beverages away from keyboards.";
    return "Neutral.";
  }

  // UI
  let locked = false;

  function setLockedUI(isLocked) {
    locked = isLocked;
    statusPill.textContent = isLocked ? "Status: revealed" : "Status: ready";
    lockNote.textContent = isLocked ? "Refresh to try again." : "Pick one symbol.";
    gridEl.querySelectorAll(".tile").forEach(t => {
      if (isLocked) t.setAttribute("disabled", "true");
      else t.removeAttribute("disabled");
    });
  }

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

  function renderGrid() {
    gridEl.innerHTML = "";

    for (let cell = 0; cell < CELL_COUNT; cell++) {
      const sym = SYMBOLS[cell]; // fixed order
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "tile tileText";
      tile.setAttribute("aria-label", `Pick ${sym.name}`);
      tile.innerHTML = `<span class="symbol">${sym.symbol}</span><div class="overlay"></div>`;

      tile.addEventListener("click", () => {
        if (locked) return;

        const s = scoreMap[cell];
        const label = labelForScore(s);

        resultTitle.textContent = `${s}/10: ${label}`;
        resultText.textContent = messageForScore(s);

        badgeRow.style.display = "flex";
        badgeRow.innerHTML = `
          <span class="badge">You picked: <strong>${sym.symbol}</strong></span>
          <span class="badge">Luck score: <strong>${s}/10</strong></span>
        `;

        srStatus.textContent = `Luck score ${s} out of 10. ${label}.`;

        revealAllTiles(cell);
        applyPreview(sym.symbol, overlayMap[cell]);
        setLockedUI(true);
      });

      gridEl.appendChild(tile);
    }
  }

  renderGrid();
  setLockedUI(false);
})();
