(function () {
  "use strict";

  // ---------------------------
  // Utilities
  // ---------------------------
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

  // ---------------------------
  // Config
  // ---------------------------
  const COLS = 8;
  const ROWS = 3;
  const CELL_COUNT = COLS * ROWS;

  function rc(i) { return { r: Math.floor(i / COLS), c: i % COLS }; }
  function idxOf(r, c) { return r * COLS + c; }
  function inBounds(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

  function manhattan(a, b) {
    const A = rc(a), B = rc(b);
    return Math.abs(A.r - B.r) + Math.abs(A.c - B.c);
  }

  function ortho(i) {
    const C = rc(i);
    return [
      [C.r-1,C.c],[C.r+1,C.c],[C.r,C.c-1],[C.r,C.c+1]
    ].filter(([r,c]) => inBounds(r,c)).map(([r,c]) => idxOf(r,c));
  }

  function diag(i) {
    const C = rc(i);
    return [
      [C.r-1,C.c-1],[C.r-1,C.c+1],[C.r+1,C.c-1],[C.r+1,C.c+1]
    ].filter(([r,c]) => inBounds(r,c)).map(([r,c]) => idxOf(r,c));
  }

  // ---------------------------
  // Icons (same set)
  // ---------------------------
  const ICONS = window.ICONS || [];
  // ICONS is already defined globally by your existing file.
  // If not, keep your current ICON array here unchanged.

  // ---------------------------
  // DOM
  // ---------------------------
  const gridEl = document.getElementById("grid");
  const statusPill = document.getElementById("statusPill");
  const resetBtn = document.getElementById("resetBtn");

  const resultTitle = document.getElementById("resultTitle");
  const resultText = document.getElementById("resultText");
  const badgeRow = document.getElementById("badgeRow");

  const previewTile = document.getElementById("previewTile");
  const previewOverlay = document.getElementById("previewOverlay");
  const previewIcon = document.getElementById("previewIcon");
  const srStatus = document.getElementById("srStatus");

  let locked = false;

  // ---------------------------
  // Copy
  // ---------------------------
  function labelForScore(s) {
    if (s === 10) return "SUPER LUCKY DAY";
    if (s === 8) return "VERY LUCKY DAY";
    if (s === 6) return "SLIGHTLY LUCKY";
    if (s === 5) return "MEH";
    if (s === 4) return "A BIT OFF";
    if (s === 3) return "UNLUCKY-ISH";
    if (s === 0) return "BAD LUCK DAY";
    return "MEH";
  }

  function messageForScore(s) {
    if (s === 10) return "If you were waiting for a sign, this is technically one.";
    if (s === 8) return "Things might line up. Or not. But probably.";
    if (s === 6) return "A slight tailwind. Don’t overthink it.";
    if (s === 5) return "A day. One of them.";
    if (s === 4) return "Mild resistance detected.";
    if (s === 3) return "Proceed with curiosity.";
    if (s === 0) return "Today is for caution and snacks.";
    return "Meh.";
  }

  // ---------------------------
  // Core roll
  // ---------------------------
  function rollLuck() {
    const seed = hashString(Date.now().toString() + Math.random());
    const rng = mulberry32(seed);

    const iconOrder = Array.from({ length: CELL_COUNT }, (_, i) => i);
    for (let i = iconOrder.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [iconOrder[i], iconOrder[j]] = [iconOrder[j], iconOrder[i]];
    }

    const lucky = Math.floor(rng() * CELL_COUNT);
    const dists = Array.from({ length: CELL_COUNT }, (_, i) => ({ i, d: manhattan(i, lucky) }));
    const maxD = Math.max(...dists.map(x => x.d));
    const unlucky = dists.filter(x => x.d === maxD)[Math.floor(rng() * dists.length)].i;

    const scores = new Array(CELL_COUNT).fill(5);
    const overlays = new Array(CELL_COUNT).fill("");

    scores[lucky] = 10;
    ortho(lucky).forEach(i => scores[i] = 8);
    diag(lucky).forEach(i => scores[i] = 6);

    scores[unlucky] = 0;
    ortho(unlucky).forEach(i => scores[i] = Math.min(scores[i], 3));
    diag(unlucky).forEach(i => scores[i] = Math.min(scores[i], 4));

    return { iconOrder, scores, overlays };
  }

  let state = rollLuck();

  // ---------------------------
  // Render
  // ---------------------------
  function render() {
    gridEl.innerHTML = "";
    locked = false;
    statusPill.textContent = "Status: ready";

    for (let i = 0; i < CELL_COUNT; i++) {
      const icon = ICONS[state.iconOrder[i]];
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.type = "button";
      btn.innerHTML = `${icon.svg}<div class="overlay"></div>`;

      btn.onclick = () => {
        if (locked) return;
        locked = true;

        const score = state.scores[i];
        resultTitle.textContent = `${score}/10: ${labelForScore(score)}`;
        resultText.textContent = messageForScore(score);

        badgeRow.style.display = "flex";
        badgeRow.innerHTML = `<span class="badge">${icon.name}</span>`;

        previewIcon.innerHTML = icon.svg;
        previewTile.classList.add("selectedRing");

        srStatus.textContent = `Luck score ${score} out of ten.`;
        statusPill.textContent = "Status: result revealed";
      };

      gridEl.appendChild(btn);
    }
  }

  resetBtn.onclick = () => {
    state = rollLuck();
    resultTitle.textContent = "Pick one.";
    resultText.textContent = "Then we see what the universe does with it.";
    badgeRow.style.display = "none";
    previewIcon.innerHTML = "";
    previewTile.classList.remove("selectedRing");
    render();
  };

  render();
})();
