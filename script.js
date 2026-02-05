(function () {
  "use strict";

  // Board config
  const COLS = 12;
  const ROWS = 12;
  const COUNT = COLS * ROWS;

  const boardEl = document.getElementById("board");
  const resultTitleEl = document.getElementById("resultTitle");
  const resultTextEl = document.getElementById("resultText");
  const shareBtn = document.getElementById("shareBtn");
  const shareHint = document.getElementById("shareHint");

  const luckyNumberEl = document.getElementById("luckyNumber");
  const luckyLetterEl = document.getElementById("luckyLetter");
  const colorSwatch = document.getElementById("colorSwatch");
  const colorName = document.getElementById("colorName");
  const colorHex = document.getElementById("colorHex");
  const leftRightEl = document.getElementById("leftRight");

  const dinnerSuggestionEl = document.getElementById("dinnerSuggestion");
  const microMoveEl = document.getElementById("microMove");
  const luckyVibeEl = document.getElementById("luckyVibe");
  const luckyPlaceEl = document.getElementById("luckyPlace");

  if (!boardEl) return;

  // Helpers
  function rc(i){ return { r: Math.floor(i / COLS), c: i % COLS }; }

  // Chebyshev distance gives clean square rings
  function dist(a, b) {
    const A = rc(a), B = rc(b);
    return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
  }

  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  function randInt(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
  }

  function randLetter(){
    const code = 65 + randInt(0, 25);
    return String.fromCharCode(code);
  }

  // Right-side “lucky of the day”
  const colorPool = [
    { name: "Lucky Green", hex: "#55be0a" },
    { name: "Lilac", hex: "#875da6" },
    { name: "Sky", hex: "#5aa9e6" },
    { name: "Sun", hex: "#ffcc33" },
    { name: "Rose", hex: "#ff5d8f" },
    { name: "Midnight", hex: "#111827" },
    { name: "Cream", hex: "#f6f0ff" },
    { name: "Tangerine", hex: "#ff7a00" },
    { name: "Teal", hex: "#14b8a6" },
    { name: "Brick", hex: "#c2410c" }
  ];

  luckyNumberEl.textContent = String(randInt(0, 9));
  luckyLetterEl.textContent = randLetter();

  const c = pick(colorPool);
  colorSwatch.style.background = c.hex;
  colorName.textContent = c.name;
  colorHex.textContent = c.hex;

  leftRightEl.textContent = Math.random() < 0.5 ? "LEFT" : "RIGHT";

  // Bottom extras
  const dinners = ["Tacos", "Burgers", "Pasta", "Sushi", "Stir fry", "Pizza", "Breakfast for dinner", "Chili"];
  const microMoves = ["Clean one small thing", "Send one message you have delayed", "Take a 10 minute walk", "Drink water first", "Do the annoying task first", "Write one sentence"];
  const vibes = ["Calm", "Curious", "Bold", "Playful", "Patient", "Focused", "Gentle", "Decisive"];
  const places = ["Near a window", "Outside for 5 minutes", "Somewhere quiet", "A new spot", "A familiar spot", "Near water"];

  dinnerSuggestionEl.textContent = pick(dinners);
  microMoveEl.textContent = pick(microMoves);
  luckyVibeEl.textContent = pick(vibes);
  luckyPlaceEl.textContent = pick(places);

  // Luck board
  const luckyIndex = Math.floor(Math.random() * COUNT);
  const dists = new Array(COUNT).fill(0).map((_, i) => dist(i, luckyIndex));

  function scoreForDistance(d){
    if (d === 0) return 5;
    if (d === 1) return 4;
    if (d === 2) return 3;
    if (d === 3) return 1;
    return 0;
  }

  function labelForScore(s){
    if (s === 5) return "5/5: Bullseye";
    if (s === 4) return "4/5: Very close";
    if (s === 3) return "3/5: Close enough";
    if (s === 1) return "1/5: Not far off";
    return "0/5: Make your own luck day";
  }

  function messageForScore(s){
    if (s === 5) return "Huge day. Do the thing you have been putting off.";
    if (s === 4) return "Oooh so close. Expect some nice timing today.";
    if (s === 3) return "Solid day. A few small wins should show up.";
    if (s === 1) return "Not far off. Keep it simple and take the easy wins.";
    return "Not in the zone today. Keep it light. Luck is a funny thing.";
  }

  function overlayClassByDistance(d){
    if (d === 0) return "o-g5";
    if (d === 1) return "o-g4";
    if (d === 2) return "o-g3";
    if (d === 3) return "o-g1";
    return "";
  }

  let locked = false;
  let chosenIndex = -1;

  function clearBoardVisuals() {
    boardEl.querySelectorAll(".overlay").forEach(o => {
      o.className = "overlay";
      o.classList.remove("fill");
    });
    boardEl.querySelectorAll(".tile").forEach(t => {
      t.classList.remove("pulse", "chosen");
      const lab = t.querySelector(".label");
      if (lab) {
        lab.textContent = "";
        lab.classList.remove("zero");
      }
    });
  }

  function lockBoard() {
    boardEl.classList.add("locked");
    boardEl.querySelectorAll(".tile").forEach((tile, i) => {
      tile.classList.toggle("chosen", i === chosenIndex);
      tile.setAttribute("aria-disabled", "true");
      tile.tabIndex = -1;
    });
  }

  function revealWave() {
    const tiles = boardEl.querySelectorAll(".tile");
    const waveDelay = 120;

    for (let ring = 0; ring <= 3; ring++) {
      setTimeout(() => {
        tiles.forEach((tile, i) => {
          if (dists[i] !== ring) return;

          const overlay = tile.querySelector(".overlay");
          const label = tile.querySelector(".label");
          if (!overlay || !label) return;

          const s = scoreForDistance(dists[i]);
          label.textContent = (s === 5) ? "5!" : String(s);
          if (s === 0) label.classList.add("zero");

          const cls = overlayClassByDistance(dists[i]);
          if (cls) {
            overlay.classList.add(cls);
            overlay.classList.add("fill");
          }

          tile.classList.remove("pulse");
          void tile.offsetWidth;
          tile.classList.add("pulse");
        });
      }, ring * waveDelay);
    }

    setTimeout(() => {
      tiles.forEach((tile, i) => {
        const label = tile.querySelector(".label");
        if (!label) return;
        if (dists[i] > 3) {
          label.textContent = "0";
          label.classList.add("zero");
        }
      });
    }, 3 * waveDelay + 120);
  }

  function buildShareText(score) {
    const url = window.location.href;
    return [
      `The Official Luck Meter says: ${labelForScore(score)}`,
      `${messageForScore(score)}`,
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

    const s = scoreForDistance(dists[chosenIndex]);
    const text = buildShareText(s);
    shareHint.textContent = "";

    try {
      const ok = await copyToClipboard(text);
      shareHint.textContent = ok ? "Copied. Paste it anywhere." : "Could not auto-copy.";
    } catch {
      shareHint.textContent = "Could not auto-copy.";
    }
  });

  // Build board
  boardEl.innerHTML = "";
  for (let i = 0; i < COUNT; i++) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("aria-label", "Pick this spot");

    tile.innerHTML = `
      <span class="label" aria-hidden="true"></span>
      <div class="overlay"></div>
    `;

    tile.addEventListener("click", () => {
      if (locked) return;
      locked = true;
      chosenIndex = i;

      const score = scoreForDistance(dists[i]);
      resultTitleEl.textContent = labelForScore(score);
      resultTextEl.textContent = messageForScore(score);

      shareBtn.disabled = false;
      shareHint.textContent = "";

      lockBoard();
      clearBoardVisuals();

      setTimeout(() => {
        revealWave();
      }, 320);
    });

    boardEl.appendChild(tile);
  }
})();
