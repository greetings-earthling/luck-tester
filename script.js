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

  const COLS = 8;
  const ROWS = 5;
  const COUNT = COLS * ROWS;

  function rc(i) { return { r: Math.floor(i / COLS), c: i % COLS }; }

  // Square rings
  function dist(a, b) {
    const A = rc(a), B = rc(b);
    return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
  }

  const luckyIndex = Math.floor(Math.random() * COUNT);
  const dists = new Array(COUNT).fill(0).map((_, i) => dist(i, luckyIndex));

  function overlayClassByDistance(d) {
    if (d === 0) return "o-p10";
    if (d === 1) return "o-p8";
    if (d === 2) return "o-p6";
    if (d === 3) return "o-p4";
    return "";
  }

  function tierTitle(d) {
    if (d === 0) return "MEGA LUCKY DAY!";
    if (d === 1) return "VERY LUCKY DAY!";
    if (d === 2) return "LUCK IS ON YOUR SIDE TODAY!";
    if (d === 3) return "LOW FRICTION DAY";
    return "MAKE YOUR OWN LUCK KINDA DAY";
  }

  function messageFor(d) {
    if (d === 0) return "Bullseye. You found the luck zone.";
    if (d === 1) return "Oooh so close. Still a ton of good luck in the air for you today.";
    if (d === 2) return "Pretty close. You should still catch some good luck today.";
    if (d === 3) return "Not far off. Keep your eyes open for small wins.";
    return "Not in the zone today. Still, you never know. Luck is a funny thing.";
  }

  let locked = false;
  let chosenIndex = -1;

  function setPreview(d, isBull) {
    previewIcon.textContent = isBull ? "🍀" : "";
    previewOverlay.className = "previewOverlay on " + (overlayClassByDistance(d) || "");
  }

  function clearOverlays() {
    gridEl.querySelectorAll(".overlay").forEach(o => {
      o.className = "overlay";
      o.classList.remove("fill");
    });
    gridEl.querySelectorAll(".tile").forEach(t => t.classList.remove("pulse"));
  }

  function lockBoard() {
    gridEl.classList.add("locked");
    const all = gridEl.querySelectorAll(".tile");

    all.forEach((tile, i) => {
      tile.classList.remove("chosen", "bullseye");

      tile.setAttribute("aria-disabled", "true");
      tile.tabIndex = -1;

      if (i === chosenIndex) tile.classList.add("chosen");
      if (i === luckyIndex) tile.classList.add("bullseye");
    });
  }

  function applyWave() {
    const tiles = gridEl.querySelectorAll(".tile");
    const waveDelay = 170;

    for (let ring = 0; ring <= 3; ring++) {
      setTimeout(() => {
        tiles.forEach((tile, i) => {
          if (dists[i] !== ring) return;

          const overlay = tile.querySelector(".overlay");
          if (!overlay) return;

          const cls = overlayClassByDistance(ring);
          if (!cls) return;

          overlay.classList.add(cls);
          overlay.classList.add("fill");

          tile.classList.remove("pulse");
          void tile.offsetWidth;
          tile.classList.add("pulse");

          // Clover appears only in bullseye once ring 0 fills
          if (ring === 0 && i === luckyIndex) {
            const content = tile.querySelector(".content");
            if (content) content.textContent = "🍀";
          }
        });
      }, ring * waveDelay);
    }
  }

  function buildShareText(d) {
    const title = tierTitle(d);
    const url = window.location.href;
    return [
      `The Official Luck Meter says: ${title}`,
      `I was ${d === 0 ? "right in" : "near"} the luck zone today.`,
      `Try yours: ${url}`
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

    const d = dists[chosenIndex];
    const text = buildShareText(d);
    shareHint.textContent = "";

    try {
      const ok = await copyToClipboard(text);
      shareHint.textContent = ok
        ? "Copied. Paste it anywhere."
        : "Could not auto-copy. Copy your result text manually.";
    } catch {
      shareHint.textContent = "Could not auto-copy. Copy your result text manually.";
    }
  });

  // Render 40 blank tiles
  gridEl.innerHTML = "";
  for (let i = 0; i < COUNT; i++) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("aria-label", "Pick this spot");

    tile.innerHTML = `
      <span class="content" aria-hidden="true"></span>
      <div class="overlay"></div>
    `;

    tile.addEventListener("click", () => {
      if (locked) return;
      locked = true;
      chosenIndex = i;

      const d = dists[i];

      resultTitle.textContent = tierTitle(d);
      resultText.textContent = messageFor(d);

      badgeRow.style.display = "flex";
      badgeRow.innerHTML = `<span class="badge">You were <strong>${d === 0 ? "in" : `${d} step${d===1?"":"s"} away from`}</strong> the luck zone.</span>`;

      setPreview(d, d === 0);

      shareBtn.disabled = false;
      shareHint.textContent = "";

      lockBoard();
      clearOverlays();

      setTimeout(() => {
        applyWave();
      }, 380);
    });

    gridEl.appendChild(tile);
  }
})();
