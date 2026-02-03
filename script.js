(function () {
  "use strict";

  const ICONS = Array.isArray(window.ICONS) ? window.ICONS : [];
  const gridEl = document.getElementById("grid");

  function showError(msg) {
    console.error(msg);
    if (!gridEl) return;
    gridEl.style.gridTemplateColumns = "1fr";
    gridEl.innerHTML = `
      <div style="border:1px solid #e6e6e6;border-radius:14px;padding:14px;color:#666;background:#fff;">
        <strong style="color:#111;">Luck Tester error</strong><br>
        ${msg}
      </div>
    `;
  }

  if (!ICONS.length) {
    showError("Icons did not load. Check that <code>icons.js</code> exists in the repo root and is referenced in <code>index.html</code>.");
    return;
  }

  // DOM
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

  const rng = mulberry32(hashString(`${Date.now()}|${Math.random()}|luck`));

  // Grid sizing
  const CELL_COUNT = ICONS.length;
  const COLS = (CELL_COUNT === 21) ? 7 : 8;
  const ROWS = Math.ceil(CELL_COUNT / COLS);

  gridEl.style.gridTemplateColumns = `repeat(${COLS}, minmax(0, 1fr))`;

  function rc(idx) { return { r: Math.floor(idx / COLS), c: idx % COLS }; }
  function idxOf(r, c) { return r * COLS + c; }
  function inBounds(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

  function manhattan(a, b) {
    const A = rc(a), B = rc(b);
    return Math.abs(A.r - B.r) + Math.abs(A.c - B.c);
  }

  function ortho(i) {
    const C = rc(i);
    const coords = [[C.r - 1, C.c], [C.r + 1, C.c], [C.r, C.c - 1], [C.r, C.c + 1]];
    return coords
      .filter(([r, c]) => inBounds(r, c))
      .map(([r, c]) => idxOf(r, c))
      .filter(x => x >= 0 && x < CELL_COUNT);
  }

  function diag(i) {
    const C = rc(i);
    const coords = [[C.r - 1, C.c - 1], [C.r - 1, C.c + 1], [C.r + 1, C.c - 1], [C.r + 1, C.c + 1]];
    return coords
      .filter(([r, c]) => inBounds(r, c))
      .map(([r, c]) => idxOf(r, c))
      .filter(x => x >= 0 && x < CELL_COUNT);
  }

  // Shuffle icon placement
  const iconOrder = Array.from({ length: CELL_COUNT }, (_, i) => i);
  for (let i = iconOrder.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [iconOrder[i], iconOrder[j]] = [iconOrder[j], iconOrder[i]];
  }

  // Lucky and unlucky
  const luckyCell = Math.floor(rng() * CELL_COUNT);

  const dists = Array.from({ length: CELL_COUNT }, (_, i) => ({ i, d: manhattan(i, luckyCell) }));
  const maxD = Math.max(...dists.map(x => x.d));
  const farthest = dists.filter(x => x.d === maxD).map(x => x.i);
  const unluckyCell = farthest[Math.floor(rng() * farthest.length)];

  // Score + overlay maps
  const score = new Array(CELL_COUNT).fill(5);
  const overlay = new Array(CELL_COUNT).fill("");
  const prio = new Array(CELL_COUNT).fill(0);

  function setCell(i, s, o, p) {
    if (i < 0 || i >= CELL_COUNT) return;
    if (p >= prio[i]) {
      prio[i] = p;
      score[i] = s;
      overlay[i] = o;
    }
  }

  setCell(unluckyCell, 0, "o-r0", 2);
  ortho(unluckyCell).forEach(i => setCell(i, 3, "o-r3", 1));
  diag(unluckyCell).forEach(i => setCell(i, 4, "o-r4", 1));

  setCell(luckyCell, 10, "o-g10", 4);
  ortho(luckyCell).forEach(i => setCell(i, 8, "o-g8", 3));
  diag(luckyCell).forEach(i => setCell(i, 6, "o-g6", 3));

  function labelForScore(s) {
    if (s === 10) return "SUPER LUCKY";
    if (s === 8) return "VERY LUCKY";
    if (s === 6) return "SLIGHTLY LUCKY";
    if (s === 5) return "MEH";
    if (s === 4) return "A BIT OFF";
    if (s === 3) return "UNLUCKY-ISH";
    if (s === 0) return "BAD LUCK";
    return "MEH";
  }

  function messageForScore(s) {
    if (s === 10) return "Clean hit. Take the win.";
    if (s === 8) return "Pretty good odds for a nonsense machine.";
    if (s === 6) return "A small tailwind. Nothing dramatic.";
    if (s === 5) return "Neutral. You are floating normally.";
    if (s === 4) return "A little friction. Nothing personal.";
    if (s === 3) return "Today may require patience and snacks.";
    if (s === 0) return "Proceed carefully. Keep beverages away from keyboards.";
    return "Neutral.";
  }

  let locked = false;

  function setLockedUI(isLocked) {
    locked = isLocked;
    statusPill.textContent = isLocked ? "Status: revealed" : "Status: ready";
    lockNote.textContent = isLocked ? "Refresh to try again." : "Pick one icon.";
    gridEl.querySelectorAll(".tile").forEach(t => {
      if (isLocked) t.setAttribute("disabled", "true");
      else t.removeAttribute("disabled");
    });
  }

  function applyPreview(iconSvg, overlayClass) {
    previewIcon.innerHTML = iconSvg;
    previewOverlay.className = `previewOverlay ${overlayClass || ""}`;
    previewTile.classList.add("selectedRing");
  }

  function revealAll(chosenCell) {
    gridEl.querySelectorAll(".tile").forEach((tile, i) => {
      tile.classList.add("revealed");
      const o = tile.querySelector(".overlay");
      if (o) o.className = `overlay ${overlay[i] || ""}`;
      tile.classList.toggle("selectedRing", i === chosenCell);
    });
  }

  function renderGrid() {
    gridEl.innerHTML = "";
    for (let cell = 0; cell < CELL_COUNT; cell++) {
      const icon = ICONS[iconOrder[cell]];
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "tile";
      tile.setAttribute("aria-label", `Pick ${icon.name}`);
      tile.innerHTML = `${icon.svg}<div class="overlay"></div>`;

      tile.addEventListener("click", () => {
        if (locked) return;

        const s = score[cell];
        const label = labelForScore(s);

        resultTitle.textContent = `${s}/10: ${label}`;
        resultText.textContent = messageForScore(s);

        badgeRow.style.display = "flex";
        badgeRow.innerHTML = `
          <span class="badge">You picked: <strong>${icon.name}</strong></span>
          <span class="badge">Luck score: <strong>${s}/10</strong></span>
        `;

        srStatus.textContent = `Luck score ${s} out of 10. ${label}.`;

        revealAll(cell);
        applyPreview(icon.svg, overlay[cell]);
        setLockedUI(true);
      });

      gridEl.appendChild(tile);
    }
  }

  renderGrid();
  setLockedUI(false);
})();
