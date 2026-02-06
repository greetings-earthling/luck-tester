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
  const dinnerSuggestionEl = document.getElementById("dinnerSuggestion");
  const emojiOfDayEl = document.getElementById("emojiOfDay");
  const fortuneTextEl = document.getElementById("fortuneText");

  if (!boardEl) return;

  function rc(i){ return { r: Math.floor(i / COLS), c: i % COLS }; }

  // Square rings
  function dist(a, b) {
    const A = rc(a), B = rc(b);
    return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
  }

  function randInt(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
  }

  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  function randLetter(){
    return String.fromCharCode(65 + randInt(0, 25));
  }

  // Daily extras
  const colors = [
    { name: "Lucky Green", hex: "#55be0a" },
    { name: "Grape", hex: "#875da6" },
    { name: "Sky", hex: "#5aa9e6" },
    { name: "Sun", hex: "#ffcc33" },
    { name: "Rose", hex: "#ff5d8f" },
    { name: "Teal", hex: "#14b8a6" },
    { name: "Tangerine", hex: "#ff7a00" },
    { name: "Midnight", hex: "#111827" }
  ];

  const dinners = [
    "Tacos",
    "Pasta",
    "Burgers",
    "Stir fry",
    "Pizza",
    "Breakfast for dinner",
    "Soup and grilled cheese",
    "Sushi"
  ];

  const emojis = ["✨","🍀","🧠","🔥","🧊","🎯","🧲","🌊","🛠️","🎧","📚","🧃","🌞","🌙","🧭","🪴"];

  const fortunes = [
    "Small wins count. Collect them.",
    "A simple choice will lead to a better outcome.",
    "Today rewards steady effort, not perfect effort.",
    "Your timing is better than you think.",
    "A tiny risk brings a useful result.",
    "An unexpected message improves your day.",
    "Be curious. Curiosity is lucky.",
    "The easy path is not always the right one, but today it might be.",
    "Make space. Luck likes room to land.",
    "You will notice something you usually miss.",
    "One good decision beats ten good intentions.",
    "A calm yes is stronger than a loud maybe.",
    "Your next step is smaller than you fear.",
    "Your luck improves when you move first.",
    "A helpful person appears at the right time.",
    "Say it plainly. Plain words are lucky."
  ];

  luckyNumberEl.textContent = String(randInt(0, 9));
  luckyLetterEl.textContent = randLetter();

  const c = pick(colors);
  colorSwatch.style.background = c.hex;
  colorName.textContent = c.name;
  colorHex.textContent = c.hex.toLowerCase();

  dinnerSuggestionEl.textContent = pick(dinners);
  emojiOfDayEl.textContent = pick(emojis);
  fortuneTextEl.textContent = pick(fortunes);

  // Luck board setup
  const luckyIndex = Math.floor(Math.random() * COUNT);
  const dists = Array.from({ length: COUNT }, (_, i) => dist(i, luckyIndex));

  function scoreForDistance(d){
    if (d === 0) return 5;
    if (d === 1) return 4;
    if (d === 2) return 3;
    if (d === 3) return 1;
    return 0;
  }

  function labelForScore(s){
    if (s === 5) return "5/5: Clover zone";
    if (s === 4) return "4/5: Very lucky day";
    if (s === 3) return "3/5: Luck is on your side";
    if (s === 1) return "1/5: Small luck day";
    return "0/5: Make your own luck day";
  }

  function messageForScore(s){
    if (s === 5) return "Big green energy. If you have been waiting to start something, today is friendly.";
    if (s === 4) return "Oooh so close. Expect at least one nice break in your favour.";
    if (s === 3) return "Good odds for small wins. Keep your eyes open and say yes to the easy openings.";
    if (s === 1) return "Not nothing. Take the simple path and do one useful thing. That counts as luck too.";
    return "No green zone today. That is fine. Keep it light, avoid high stakes choices, and create your own luck.";
  }

  function overlayClassByDistance(d){
    if (d === 0) return "o-g5";
    if (d === 1) return "o-g4";
    if (d === 2) return "o-g3";
    if (d === 3) return "o-g1";
    return "";
  }

  function shareText(score){
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

  let locked = false;
  let chosenIndex = -1;

  function clearBoard() {
    boardEl.querySelectorAll(".overlay").forEach(o => {
      o.className = "overlay";
      o.classList.remove("fill");
    });
    boardEl.querySelectorAll(".label").forEach(l => {
      l.textContent = "";
      l.classList.remove("zero");
    });
    boardEl.querySelectorAll(".tile").forEach(t => {
      t.classList.remove("chosen");
    });
  }

  function lockBoardUI() {
    boardEl.classList.add("locked");
    boardEl.querySelectorAll(".tile").forEach((tile, i) => {
      tile.classList.toggle("chosen", i === chosenIndex);
      tile.setAttribute("aria-disabled", "true");
      tile.tabIndex = -1;
    });
  }

  function revealRings() {
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

          if (dists[i] === 0) {
            label.textContent = "🍀";
          } else {
            label.textContent = String(s);
            if (s === 0) label.classList.add("zero");
          }

          const cls = overlayClassByDistance(dists[i]);
          if (cls) {
            overlay.classList.add(cls);
            overlay.classList.add("fill");
          }
        });
      }, ring * waveDelay);
    }

    setTimeout(() => {
      tiles.forEach((tile, i) => {
        if (dists[i] <= 3) return;
        const label = tile.querySelector(".label");
        if (!label) return;
        label.textContent = "0";
        label.classList.add("zero");
      });
    }, 3 * waveDelay + 140);
  }

  // Build board
  boardEl.innerHTML = "";
  for (let i = 0; i < COUNT; i++) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("aria-label", "Pick this square");
    tile.innerHTML = `<span class="label" aria-hidden="true"></span><div class="overlay"></div>`;

    tile.addEventListener("click", () => {
      if (locked) return;
      locked = true;
      chosenIndex = i;

      const score = scoreForDistance(dists[i]);
      resultTitleEl.textContent = labelForScore(score);
      resultTextEl.textContent = messageForScore(score);

      shareBtn.disabled = false;
      shareHint.textContent = "";

      lockBoardUI();
      clearBoard();

      setTimeout(() => {
        revealRings();
      }, 320);
    });

    boardEl.appendChild(tile);
  }

  shareBtn.addEventListener("click", async () => {
    if (!locked || chosenIndex < 0) return;

    const score = scoreForDistance(dists[chosenIndex]);
    const text = shareText(score);
    shareHint.textContent = "";

    try {
      const ok = await copyToClipboard(text);
      shareHint.textContent = ok ? "Copied. Paste it anywhere." : "Could not auto-copy.";
    } catch {
      shareHint.textContent = "Could not auto-copy.";
    }
  });
})();
