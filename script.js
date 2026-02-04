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

  const base = Array.isArray(window.MOODS) ? window.MOODS : [];
  if (base.length !== 20) return;

  // 40 tiles = 20 moods x 2
  const tiles = [...base, ...base];

  // Shuffle on load (duplicates spread out naturally)
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  const COLS = 8;
  const ROWS = 5;
  const COUNT = COLS * ROWS;

  function rc(i) { return { r: Math.floor(i / COLS), c: i % COLS }; }

  // Chebyshev distance makes clean square rings
  function dist(a, b) {
    const A = rc(a), B = rc(b);
    return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
  }

  // Pick bullseye
  const luckyIndex = Math.floor(Math.random() * COUNT);

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

  const moodPhrases = {
    happy: "that happy mood",
    meh: "that meh mood",
    rage: "that rage mood",
    frustrated: "that frustrated mood",
    anxious: "that anxious mood",
    tired: "that tired mood",
    hopeful: "that hopeful mood",
    confident: "that confident mood",
    overwhelm: "that overwhelmed mood",
    nervous: "that nervous mood",
    excited: "that excited mood",
    nauseous: "that nauseous mood",
    cat: "that playful mood",
    unsure: "that unsure mood",
    goofy: "that goofy mood",
    devilish: "that devilish mood",
    melting: "that melting mood",
    hearteyes: "that heart-eyes mood",
    frazzled: "that frazzled mood",
    shrug: "that shrug mood"
  };

  function messageFor(tierKey, moodKey) {
    const m = moodPhrases[moodKey] || "that mood";

    if (tierKey === "mega") {
      return `Well this is interesting. Looks like you have a bit of good luck today to go with ${m}. Use it while it is here.`;
    }
    if (tierKey === "very") {
      return `Nice. Things may line up today to go with ${m}. Keep it light and take the win.`;
    }
    if (tierKey === "side") {
      return `Small wins are in the air today to go with ${m}. Stay open.`;
    }
    if (tierKey === "fric") {
      return `Low friction vibes today to go with ${m}. Nothing dramatic. Just smoother.`;
    }
    return `Today is one of those make your own luck kinda days to go with ${m}. I would avoid anything that requires good luck. Try again tomorrow.`;
  }

  // Precompute distances for all cells (used for wave)
  const dists = new Array(COUNT).fill(0).map((_, i) => dist(i, luckyIndex));

  let locked = false;
  let chosenIndex = -1;

  function setPreview(symbol, overlayClass) {
    previewIcon.textContent = symbol;
    previewOverlay.className = "previewOverlay on " + (overlayClass || "");
  }

  function clearOverlays() {
    gridEl.querySelectorAll(".overlay").forEach(o => {
      o.className = "overlay";   // remove colour classes
      o.classList.remove("fill"); // keep hidden
    });
  }

  function applyWave() {
    const tilesEls = gridEl.querySelectorAll(".tile");

    // Bullseye pop + fill
    const bull = tilesEls[luckyIndex];
    if (bull) bull.classList.add("pop");

    // Ring-by-ring fill
    const waveDelay = 170; // time between rings
    for (let ring = 0; ring <= 3; ring++) {
      setTimeout(() => {
        tilesEls.forEach((tile, i) => {
          if (dists[i] !== ring) return;
          const overlay = tile.querySelector(".overlay");
          if (!overlay) return;

          const cls = overlayClassByDistance(ring);
          if (!cls) return;

          overlay.classList.add(cls);
          overlay.classList.add("fill");
        });
      }, ring * waveDelay);
    }
  }

  function lockBoard() {
    gridEl.classList.add("locked");
    const all = gridEl.querySelectorAll(".tile");

    all.forEach((tile, i) => {
      tile.setAttribute("disabled", "true");
      tile.classList.remove("chosen", "bullseye", "pop");

      if (i === chosenIndex) tile.classList.add("chosen");
      if (i === luckyIndex) tile.classList.add("bullseye");
    });
  }

  function buildShareText() {
    const mood = tiles[chosenIndex];
    const tier = tierByDistance(dists[chosenIndex]);
    const url = window.location.href;

    return [
      `The Official Luck Meter says I am having a ${tier.title} ${mood.symbol}`,
      `Feeling a little more hopeful already.`,
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
    const mood = tiles[i];

    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("aria-label", `Choose ${mood.name}`);

    // Overlay starts blank and hidden. Wave assigns colour + fill later.
    tile.innerHTML = `
      <span class="symbol" aria-hidden="true">${mood.symbol}</span>
      <div class="overlay"></div>
    `;

    tile.addEventListener("click", () => {
      if (locked) return;
      locked = true;
      chosenIndex = i;

      const tier = tierByDistance(dists[i]);

      resultTitle.textContent = tier.title;
      resultText.textContent = messageFor(tier.key, mood.key);

      badgeRow.style.display = "flex";
      badgeRow.innerHTML = `
        <span class="badge">Mood: <strong>${mood.name}</strong> ${mood.symbol}</span>
        <span class="badge">Reading: <strong>${tier.title}</strong></span>
      `;

      // Preview uses the overlay class for your tile’s distance (instant)
      setPreview(mood.symbol, overlayClassByDistance(dists[i]));

      shareBtn.disabled = false;
      shareHint.textContent = "";

      // Lock board first (no wave yet)
      lockBoard();

      // Ensure overlays start from zero before the wave
      clearOverlays();

      // Delay before animation so it feels intentional
      setTimeout(() => {
        applyWave();
      }, 380);
    });

    gridEl.appendChild(tile);
  }
})();
