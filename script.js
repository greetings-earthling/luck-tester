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
  if (!base.length) return;

  // Build 64 tiles: 16 moods repeated 4x
  const tiles = [];
  for (let r = 0; r < 4; r++) tiles.push(...base);

  // Shuffle tile order each load for freshness
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  const COLS = 8;
  const COUNT = tiles.length;

  function rc(i) {
    return { r: Math.floor(i / COLS), c: i % COLS };
  }

  function distChebyshev(a, b) {
    const A = rc(a), B = rc(b);
    return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
  }

  // Luck tiers by distance from bullseye
  function tierByDistance(d) {
    if (d === 0) return { key: "mega",  title: "MEGA LUCKY DAY!" };
    if (d === 1) return { key: "very",  title: "VERY LUCKY DAY!" };
    if (d === 2) return { key: "side",  title: "LUCK IS ON YOUR SIDE TODAY!" };
    if (d === 3) return { key: "fric",  title: "LOW FRICTION DAY" };
    return         { key: "diy",   title: "MAKE YOUR OWN LUCK KINDA DAY" };
  }

  function overlayClassByDistance(d) {
    if (d === 0) return "o-p10";
    if (d === 1) return "o-p8";
    if (d === 2) return "o-p6";
    if (d === 3) return "o-p4";
    return "";
  }

  // Mood phrasing used inside the result message
  const moodPhrases = {
    happy:      "that happy mood",
    meh:        "that meh mood",
    rage:       "that rage mood",
    frustrated: "that frustrated mood",
    anxious:    "that anxious mood",
    tired:      "that tired mood",
    hopeful:    "that hopeful mood",
    confident:  "that confident mood",
    overwhelm:  "that overwhelmed mood",
    nervous:    "that nervous mood",
    excited:    "that excited mood",
    nauseous:   "that nauseous mood",
    cat:        "that playful mood",
    unsure:     "that unsure mood",
    goofy:      "that goofy mood",
    devilish:   "that devilish mood"
  };

  // Tier-based hopeful messaging (always good vibes)
  function messageFor(tierKey, moodKey) {
    const m = moodPhrases[moodKey] || "that mood";

    if (tierKey === "mega") {
      return `Well this is interesting. Looks like you will have a bit of good luck today to go with ${m}. Use it while it is here.`;
    }
    if (tierKey === "very") {
      return `Nice. Things may line up more easily today to go with ${m}. Keep it light and take the win.`;
    }
    if (tierKey === "side") {
      return `Luck is showing up in small ways today to go with ${m}. Stay open.`;
    }
    if (tierKey === "fric") {
      return `This feels like a low friction day to go with ${m}. Nothing dramatic. Just a smoother ride.`;
    }
    return `Today is one of those make your own luck kinda days to go with ${m}. I would avoid anything that requires good luck. Try again tomorrow.`;
  }

  // Pick bullseye (fresh each load)
  const luckyIndex = Math.floor(Math.random() * COUNT);

  // Precompute overlays per cell
  const overlays = new Array(COUNT).fill("");
  const tiers = new Array(COUNT).fill(null);

  for (let i = 0; i < COUNT; i++) {
    const d = distChebyshev(i, luckyIndex);
    overlays[i] = overlayClassByDistance(d);
    tiers[i] = tierByDistance(d);
  }

  let locked = false;
  let chosenIndex = -1;

  function setPreview(symbol, overlayClass) {
    previewIcon.textContent = symbol;
    previewOverlay.className = "previewOverlay on " + (overlayClass || "");
  }

 function revealBoard() {
  gridEl.classList.add("locked");

  const all = gridEl.querySelectorAll(".tile");
  all.forEach((tile, i) => {
    tile.classList.add("revealed");
    tile.setAttribute("disabled", "true");

    if (i === chosenIndex) {
      tile.classList.add("chosen");
      return;
    }

    if (i === luckyIndex) {
      tile.classList.add("bullseye");
      return;
    }

    tile.classList.add("faded");
  });

  setTimeout(() => {
    const bull = all[luckyIndex];
    if (bull) bull.classList.add("pop");
  }, 220);
}

  function buildShareText() {
    const mood = tiles[chosenIndex];
    const tier = tiers[chosenIndex];
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

    // Fallback
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
    try {
      const ok = await copyToClipboard(text);
      if (ok) {
        shareHint.textContent = "Your luck is copied! Paste it into any post and spread the luck ✨";
      } else {
        shareHint.textContent = "Could not auto-copy. Copy your result text manually.";
      }
    } catch {
      shareHint.textContent = "Could not auto-copy. Copy your result text manually.";
    }
  });

  // Render grid
  gridEl.innerHTML = "";
  tiles.forEach((mood, i) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("aria-label", `Choose ${mood.name}`);
    tile.innerHTML = `
      <span class="symbol" aria-hidden="true">${mood.symbol}</span>
      <div class="overlay ${overlays[i]}"></div>
    `;

    tile.addEventListener("click", () => {
      if (locked) return;
      locked = true;
      chosenIndex = i;

      const tier = tiers[i];

      resultTitle.textContent = tier.title;
      resultText.textContent = messageFor(tier.key, mood.key);

      badgeRow.style.display = "flex";
      badgeRow.innerHTML = `
        <span class="badge">Mood: <strong>${mood.name}</strong> ${mood.symbol}</span>
        <span class="badge">Reading: <strong>${tier.title}</strong></span>
      `;

      setPreview(mood.symbol, overlays[i]);

      shareBtn.disabled = false;
      shareHint.textContent = "";

      revealBoard();
    });

    gridEl.appendChild(tile);
  });
})();
