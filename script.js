(function () {
  "use strict";

  // ---------- Helpers ----------
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function hexToRgb(hex) {
    const h = String(hex || "").replace("#", "").trim();
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }

  function readableTextColor(bgHex) {
    const rgb = hexToRgb(bgHex);
    if (!rgb) return "#111";
    // perceived luminance
    const L = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    return L > 0.62 ? "#111" : "#fff";
  }

  function spinText({
    button,
    stepsMin = 18,
    stepsMax = 28,
    delayStart = 35,
    delayInc = 7,
    onTick,
    onDone
  }) {
    let step = 0;
    const total = randInt(stepsMin, stepsMax);
    let delay = delayStart;

    button.disabled = true;

    function tick() {
      step++;
      if (onTick) onTick(step, total);

      if (step < total) {
        delay += delayInc;
        setTimeout(tick, delay);
      } else {
        if (onDone) onDone();
        button.disabled = false;
      }
    }

    tick();
  }

  // ---------- Data (fallbacks if your lists are missing) ----------
  const WATCH = Array.isArray(window.WATCHLIST) && window.WATCHLIST.length
    ? window.WATCHLIST.slice()
    : [
        { title: "The Matrix", type: "Movie", year: "1999" },
        { title: "Heat", type: "Movie", year: "1995" },
        { title: "The Office (US)", type: "TV", year: "2005–2013" },
        { title: "Severance", type: "TV", year: "2022–" }
      ];

  const FOOD = Array.isArray(window.FOODLIST) && window.FOODLIST.length
    ? window.FOODLIST.slice()
    : ["Tacos", "Pizza", "Burgers", "Pasta", "Sushi"];

  const FORTUNES = Array.isArray(window.FORTUNES) && window.FORTUNES.length
    ? window.FORTUNES.slice()
    : [
        "Luck likes motion.",
        "Small steps still count.",
        "Good timing finds you when you are ready.",
        "A little risk clears the fog.",
        "You are closer than you think."
      ];

  // ---------- Luck Meter ----------
  const luckResult = document.getElementById("luck-result");
  const luckHint = document.getElementById("luck-hint");
  const luckNote = document.getElementById("luck-note");
  const luckSpin = document.getElementById("luck-spin");

  const luckOutcomes = [
    { score: 5, title: "MEGA LUCKY DAY", note: "Green lights. Say yes to the good stuff." },
    { score: 4, title: "VERY LUCKY DAY", note: "Nice tailwind. Take one confident swing." },
    { score: 3, title: "LUCK IS AROUND YOU", note: "Not perfect, but things can click for you today." },
    { score: 2, title: "LOW FRICTION DAY", note: "Nothing dramatic. Just a smoother ride." },
    { score: 1, title: "MAKE YOUR OWN LUCK DAY", note: "Create the luck. Keep it simple and steady." },
    { score: 0, title: "NOT MUCH LUCK TODAY", note: "Play it safe. Tomorrow is a new roll." }
  ];

  function doLuckSpin() {
    const pool = shuffle(luckOutcomes);
    let idx = 0;

    luckHint.textContent = "Consulting the cosmos…";
    luckNote.textContent = "";

    spinText({
      button: luckSpin,
      stepsMin: 20,
      stepsMax: 32,
      delayStart: 35,
      delayInc: 8,
      onTick: () => {
        idx = (idx + 1) % pool.length;
        luckResult.textContent = pool[idx].title;
      },
      onDone: () => {
        const chosen = pick(luckOutcomes);
        luckResult.textContent = `${chosen.title} (${chosen.score}/5)`;
        luckHint.textContent = "";
        luckNote.textContent = chosen.note;
      }
    });
  }

  luckSpin.addEventListener("click", doLuckSpin);

  // ---------- Lucky Number ----------
  const numResult = document.getElementById("num-result");
  const numHint = document.getElementById("num-hint");
  const numSpin = document.getElementById("num-spin");

  numSpin.addEventListener("click", () => {
    const seq = shuffle([0,1,2,3,4,5,6,7,8,9]);
    let i = 0;
    numHint.textContent = "";

    spinText({
      button: numSpin,
      onTick: () => {
        i = (i + 1) % seq.length;
        numResult.textContent = String(seq[i]);
      },
      onDone: () => {
        const final = String(randInt(0, 9));
        numResult.textContent = final;
        numHint.textContent = "Good luck.";
      }
    });
  });

  // ---------- Lucky Letter ----------
  const letterResult = document.getElementById("letter-result");
  const letterHint = document.getElementById("letter-hint");
  const letterSpin = document.getElementById("letter-spin");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  letterSpin.addEventListener("click", () => {
    const seq = shuffle(letters);
    let i = 0;
    letterHint.textContent = "";

    spinText({
      button: letterSpin,
      onTick: () => {
        i = (i + 1) % seq.length;
        letterResult.textContent = seq[i];
      },
      onDone: () => {
        const final = pick(letters);
        letterResult.textContent = final;
        letterHint.textContent = `${final} is calling to you.`;
      }
    });
  });

  // ---------- Lucky Colour ----------
  const colorResult = document.getElementById("color-result");
  const colorHint = document.getElementById("color-hint");
  const colorSpin = document.getElementById("color-spin");

  const colors = [
    { name: "Emerald", hex: "#55be0a" },
    { name: "Violet", hex: "#875da6" },
    { name: "Ocean", hex: "#1677ff" },
    { name: "Sunset", hex: "#ff6a3d" },
    { name: "Gold", hex: "#f5c542" },
    { name: "Rose", hex: "#ff4d8d" },
    { name: "Mint", hex: "#2dd4bf" },
    { name: "Midnight", hex: "#111827" }
  ];

  colorSpin.addEventListener("click", () => {
    const seq = shuffle(colors);
    let i = 0;
    colorHint.textContent = "";

    spinText({
      button: colorSpin,
      onTick: () => {
        i = (i + 1) % seq.length;
        const c = seq[i];
        colorResult.textContent = `${c.name} ${c.hex}`;
        colorResult.style.setProperty("--pick", c.hex);
        colorResult.style.setProperty("--pickText", readableTextColor(c.hex));
      },
      onDone: () => {
        const c = pick(colors);
        colorResult.textContent = `${c.name} ${c.hex}`;
        colorResult.style.setProperty("--pick", c.hex);
        colorResult.style.setProperty("--pickText", readableTextColor(c.hex));
        colorHint.textContent = "Wear it. Notice it. Use it.";
      }
    });
  });

  // ---------- Emoji of the day ----------
  const emojiResult = document.getElementById("emoji-result");
  const emojiHint = document.getElementById("emoji-hint");
  const emojiSpin = document.getElementById("emoji-spin");

  const emojis = ["✨","🍀","🔥","🧠","🫶","😌","😤","😵‍💫","🥳","🤝","☕","🏠","🐶","🐱","🪩","🧊"];

  emojiSpin.addEventListener("click", () => {
    const seq = shuffle(emojis);
    let i = 0;
    emojiHint.textContent = "";

    spinText({
      button: emojiSpin,
      onTick: () => {
        i = (i + 1) % seq.length;
        emojiResult.textContent = seq[i];
      },
      onDone: () => {
        const final = pick(emojis);
        emojiResult.textContent = final;
        emojiHint.textContent = "This one is yours today.";
      }
    });
  });

  // ---------- What should I eat ----------
  const foodResult = document.getElementById("food-result");
  const foodHint = document.getElementById("food-hint");
  const foodSpin = document.getElementById("food-spin");

  foodSpin.addEventListener("click", () => {
    const seq = shuffle(FOOD);
    let i = 0;
    foodHint.textContent = "Choosing…";

    spinText({
      button: foodSpin,
      stepsMin: 18,
      stepsMax: 26,
      delayStart: 28,
      delayInc: 6,
      onTick: () => {
        i = (i + 1) % seq.length;
        foodResult.textContent = seq[i];
      },
      onDone: () => {
        const final = pick(FOOD);
        foodResult.textContent = final;
        foodHint.textContent = "Keep it simple tonight.";
      }
    });
  });

  // ---------- What should I watch (fixed: shuffled spin) ----------
  const watchResult = document.getElementById("watch-result");
  const watchMeta = document.getElementById("watch-meta");
  const watchHint = document.getElementById("watch-hint");
  const watchSpin = document.getElementById("watch-spin");

  watchSpin.addEventListener("click", () => {
    const seq = shuffle(WATCH);
    let i = 0;
    watchHint.textContent = "Scanning the archives…";
    watchMeta.textContent = "";

    spinText({
      button: watchSpin,
      stepsMin: 22,
      stepsMax: 34,
      delayStart: 25,
      delayInc: 7,
      onTick: () => {
        i = (i + 1) % seq.length;
        const item = seq[i];
        watchResult.textContent = item.title;
        watchMeta.textContent = `${item.type} • ${item.year}`;
      },
      onDone: () => {
        const item = pick(WATCH);
        watchResult.textContent = item.title;
        watchMeta.textContent = `${item.type} • ${item.year}`;
        watchHint.textContent = "";
      }
    });
  });

  // ---------- Fortune ----------
  const fortuneResult = document.getElementById("fortune-result");
  const fortuneHint = document.getElementById("fortune-hint");
  const fortuneSpin = document.getElementById("fortune-spin");

  fortuneSpin.addEventListener("click", () => {
    const seq = shuffle(FORTUNES);
    let i = 0;
    fortuneHint.textContent = "Cracking the cookie…";

    spinText({
      button: fortuneSpin,
      stepsMin: 16,
      stepsMax: 24,
      delayStart: 28,
      delayInc: 6,
      onTick: () => {
        i = (i + 1) % seq.length;
        fortuneResult.textContent = seq[i];
      },
      onDone: () => {
        const final = pick(FORTUNES);
        fortuneResult.textContent = final;
        fortuneHint.textContent = "";
      }
    });
  });

})();
