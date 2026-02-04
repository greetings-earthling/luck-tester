(function () {
  "use strict";

  const gridEl = document.getElementById("grid");
  const resultTitle = document.getElementById("resultTitle");
  const resultText = document.getElementById("resultText");
  const badgeRow = document.getElementById("badgeRow");
  const previewIcon = document.getElementById("previewIcon");
  const previewOverlay = document.getElementById("previewOverlay");
  const shareBtn = document.getElementById("shareBtn");
  const shareHint = document.getElementById("shareHint");

  if (!gridEl) return;

  const base = Array.isArray(window.SYMBOLS) ? window.SYMBOLS : [];
  if (base.length !== 40) return;

  // Shuffle on load
  const tiles = base.slice();
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  const COLS = 8;
  const ROWS = 5;
  const COUNT = COLS * ROWS;

  function rc(i) { return { r: Math.floor(i / COLS), c: i % COLS }; }

  // Chebyshev distance makes square rings
  function dist(a, b) {
    const A = rc(a), B = rc(b);
    return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
  }

  const luckyIndex = Math.floor(Math.random() * COUNT);
  const dists = new Array(COUNT).fill(0).map((_, i) => dist(i, luckyIndex));

  function tierByDistance(d) {
    if (d === 0) return { key: "mega", title: "MEGA LUCKY DAY!" };
    if (d === 1) return { key: "very", title: "VERY LUCKY DAY!" };
    if (d === 2) return { key: "side", title: "LUCK IS ON YOUR SIDE TODAY!" };
    if (d === 3) return { key: "fric", title: "LOW FRICTION DAY" };
    return { key: "diy", title: "MAKE YOUR OWN LUCK KINDA DAY" };
  }

  function overlayClassByDistance(d) {
    if (d === 0) return "o-p10";
    if (d === 1) return "o-p8";
    if (d === 2) return "o-p6";
    if (d === 3) return "o-p4";
    return "";
  }

  function messageForDistance(d) {
    if (d === 0) return "Bullseye. Luck is on your side today.";
    if (d === 1) return "Oooh so close, but good news, you're still in for a ton of good luck today!";
    if (d === 2) return "Pretty close. You should still catch some good luck today.";
    if (d === 3) return "Not far off. Keep your eyes open for small wins.";
    return "Today is one of those make your own luck kinda days. Still, you never know.";
  }

  let locked = false;
  let chosenIndex = -1;

  function setPreview(symbol, overlayClass) {
    previewIcon.textContent = symbol;
    previewOverlay.className = "previewOverlay on " + (overlayClass || "");
  }

  function clearOverlays() {
    gridEl.querySelectorAll(".overlay").forEach(o => {
      o.className = "overlay";
      o.classList.remove("fill");
    });
  }

  function lockBoard() {
    gridEl.classList.add("locked");
    const all = gridEl.querySelectorAll(".tile");

    all.forEach((tile, i) => {
      tile.classList.remove("chosen", "bullseye", "pulse");
      tile.setAttribute("aria-disabled", "true");
      tile.tabIndex = -1;

      if (i === chosenIndex) tile.classList.add("chosen");
      if (i === luckyIndex) tile.classList.add("bullseye");
    });
  }

  function applyWave() {
    const tileEls = gridEl.querySelectorAll(".tile");

    const delayStart = 0;
    const waveDelay = 170;

    for (let ring = 0; ring <= 3; ring++) {
      setTimeout(() => {
        tileEls.forEach((tile, i) => {
          if (dists[i] !== ring) return;

          const overlay = tile.querySelector(".overlay");
          if (!overlay) return;

          const cls = overlayClassByDistance(ring);
          if (!cls) return;

          overlay.classList.add(cls);
          overlay.classList.add("fill");

          tile.classList.remove("pulse");
          // retrigger animation
          void tile.offsetWidth;
          tile.classList.add("pulse");
        });
      }, delayStart + ring * waveDelay);
    }
  }

  function buildShareText() {
    const chosen = tiles[chosenIndex];
    const tier = tierByDistance(dists[chosenIndex]);
    const url = window.location.href;

    return [
      `The Official Luck Meter says I am having a ${tier.title} ${chosen.symbol}`,
      `Wanna check your luck? ${url}`
    ].join("\n");
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }

  shareBtn.addEventListener("click", async () => {
    if (!locked || chosenIndex < 0) return;

    const text = buildShareText();
    shareHint.textContent = "";

    try {
      const ok = await copyToClipboard(text);
      shareHint.textContent = ok
        ? "Your luck is copied! Paste it into any post and spread the luck ✨"
        : "Could not auto-copy. Copy your result text manually.";
    } catch {
      shareHint.textContent = "Could not auto-copy. Copy your result text manually.";
    }
  });

  // Render grid
  gridEl.innerHTML = "";
  for (let i = 0; i < COUNT; i++) {
    const item = tiles[i];

    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("aria-label", `Choose ${item.name}`);

    tile.innerHTML = `
      <span class="symbol" aria-hidden="true">${item.symbol}</span>
      <div class="overlay"></div>
    `;

    tile.addEventListener("click", () => {
      if (locked) return;
      locked = true;
      chosenIndex = i;

      const d = dists[i];
      const tier = tierByDistance(d);

      resultTitle.textContent = tier.title;
      resultText.textContent = messageForDistance(d);

      badgeRow.style.display = "flex";
      badgeRow.innerHTML = `
        <span class="badge">You picked: <strong>${item.name}</strong> ${item.symbol}</span>
      `;

      setPreview(item.symbol, overlayClassByDistance(d));

      shareBtn.disabled = false;
      shareHint.textContent = "";

      lockBoard();
      clearOverlays();

      // Delay before the wave so it feels intentional
      setTimeout(() => {
        applyWave();
      }, 380);
    });

    gridEl.appendChild(tile);
  }
})();
