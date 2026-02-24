/* script.js
   Luck Meter + tiles + 8-ball + fortune + watch spinner

   Notes:
   - Luck Meter uses a PREBUILT bounce path that ends exactly on the chosen score (no snap/jump).
   - One spin per day (localStorage) unless URL has ?test=1
*/

(() => {
  "use strict";

  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  const TEST_MODE = new URLSearchParams(location.search).has("test");

  // ---------- DAILY LOCK (Luck Meter only) ----------
  const todayKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const LUCK_LOCK_KEY = "LM_LUCK_METER_LAST_SPIN";

  function hasSpunToday() {
    if (TEST_MODE) return false;
    return localStorage.getItem(LUCK_LOCK_KEY) === todayKey();
  }

  function markSpunToday() {
    if (TEST_MODE) return;
    localStorage.setItem(LUCK_LOCK_KEY, todayKey());
  }

  function clearSpunToday() {
    localStorage.removeItem(LUCK_LOCK_KEY);
  }

  // ---------- LUCK METER ----------
  // Expected DOM ids/classes (matches what we’ve been using):
  // #luckBtn, #luckScoreText, #luckMsg
  // #luckTrack (the bar), #luckBall (the dot)
  // #luckMeterPanel (the inner area that gets coloured)
  // #luckReset (optional, only shown in test)
  const luckBtn = qs("#luckBtn");
  const luckScoreText = qs("#luckScoreText");
  const luckMsg = qs("#luckMsg");
  const luckBall = qs("#luckBall");
  const luckTrack = qs("#luckTrack");
  const luckMeterPanel = qs("#luckMeterPanel");
  const luckReset = qs("#luckReset");

  // If your page doesn’t have Luck Meter on it, don’t crash.
  const hasLuck = !!(luckBtn && luckScoreText && luckMsg && luckBall && luckTrack && luckMeterPanel);

  // “Bell curve” pick: sum of 3 uniforms gives a nice centre bias.
  // Then slightly bias toward “better” (gentle uplift), without eliminating lows.
  function pickLuck0to10() {
    const u = Math.random() + Math.random() + Math.random(); // 0..3
    let v = Math.round((u / 3) * 10); // 0..10 centred around 5
    // Soft uplift: reroll a tiny bit of the very low outcomes
    if (v <= 1 && Math.random() < 0.55) v = 2 + Math.floor(Math.random() * 2); // 2..3
    if (v === 2 && Math.random() < 0.25) v = 3;
    return Math.max(0, Math.min(10, v));
  }

  function luckLabel(n) {
    if (n <= 1) return "Rough orbit.";
    if (n <= 3) return "Low luck.";
    if (n <= 6) return "Balanced.";
    if (n <= 8) return "Good luck.";
    return "Mega luck.";
  }

  function luckMessage(n) {
    if (n <= 1) return "Keep it simple. Avoid casino-level decisions.";
    if (n <= 3) return "Nothing dramatic. Just don’t force the timing.";
    if (n <= 6) return "Balanced. You steer the day.";
    if (n <= 8) return "Nice. Say yes to the small opportunities.";
    return "Big green light energy. Take a swing.";
  }

  // Colour mapping based on current position (0..10)
  // Red -> neutral grey -> green
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mixRGB(c1, c2, t) {
    return {
      r: Math.round(lerp(c1.r, c2.r, t)),
      g: Math.round(lerp(c1.g, c2.g, t)),
      b: Math.round(lerp(c1.b, c2.b, t)),
    };
  }
  function rgbToCss(c, a = 1) { return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`; }

  const RED = { r: 219, g: 68, b: 55 };
  const NEUTRAL = { r: 210, g: 214, b: 220 };
  const GREEN = { r: 76, g: 175, b: 80 };

  function bgForPos(pos01) {
    // pos01 0..1
    if (pos01 <= 0.5) {
      const t = pos01 / 0.5;
      const c = mixRGB(RED, NEUTRAL, t);
      return rgbToCss(c, 0.35);
    } else {
      const t = (pos01 - 0.5) / 0.5;
      const c = mixRGB(NEUTRAL, GREEN, t);
      return rgbToCss(c, 0.35);
    }
  }

  // Build a bounce path that ends EXACTLY at target. No snap.
  // Start at 5, then hit ends (0/10) a few times, then finish on target.
  // Add micro “overshoot” at ends to feel bouncy.
  function buildBounceKeyframes(target) {
    const frames = [];
    const start = 5;

    frames.push({ x: start, ms: 0 });

    // number of wall hits
    const hits = 5 + Math.floor(Math.random() * 3); // 5..7

    // choose first wall direction randomly
    let wall = Math.random() < 0.5 ? 0 : 10;

    // segment timing: start fast, then slower, then slowest
    let base = 420; // first segment duration
    const growth = 1.22;

    let current = start;

    for (let i = 0; i < hits; i++) {
      // travel to wall
      frames.push({ x: wall, ms: Math.round(base) });

      // quick overshoot and settle back (bounce feel)
      const over = wall === 0 ? -0.45 : 10.45;
      frames.push({ x: over, ms: 120 });
      frames.push({ x: wall, ms: 160 });

      current = wall;
      wall = wall === 0 ? 10 : 0;
      base *= growth;
    }

    // Final approach to target from wherever we ended (current is 0 or 10)
    // Add a small “fake bounce” if target is near the wall to keep it feeling alive
    // without changing the final.
    if (current === 0 && target <= 2) {
      frames.push({ x: 1.8, ms: 260 });
      frames.push({ x: 0, ms: 220 });
    } else if (current === 10 && target >= 8) {
      frames.push({ x: 8.2, ms: 260 });
      frames.push({ x: 10, ms: 220 });
    }

    frames.push({ x: target, ms: Math.round(base * 1.05) });

    return frames;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function setBallAt(value0to10) {
    const pct = clamp(value0to10 / 10, 0, 1);
    luckBall.style.left = `${pct * 100}%`;
    luckMeterPanel.style.background = bgForPos(pct);
  }

  let luckAnimating = false;

  function setLuckUIIdle() {
    luckScoreText.textContent = "Score: 5 / 10";
    luckMsg.textContent = "Balanced. You steer the day.";
    setBallAt(5);
    if (hasSpunToday()) {
      luckBtn.disabled = true;
      luckBtn.textContent = "Come back tomorrow";
    } else {
      luckBtn.disabled = false;
      luckBtn.textContent = "How lucky am I today?";
    }
  }

  async function animateKeyframes(frames) {
    // frames: [{x, ms}, ...] where each ms is duration to next frame
    for (let i = 0; i < frames.length - 1; i++) {
      const from = frames[i];
      const to = frames[i + 1];
      const dur = Math.max(0, to.ms);

      if (dur === 0) {
        setBallAt(to.x);
        continue;
      }

      const start = performance.now();
      const end = start + dur;

      await new Promise((resolve) => {
        function tick(now) {
          const t = clamp((now - start) / dur, 0, 1);
          const e = easeInOutCubic(t);
          const x = from.x + (to.x - from.x) * e;

          // allow slight overshoot visually, but keep background + label in-range
          setBallAt(clamp(x, 0, 10));

          if (now < end) requestAnimationFrame(tick);
          else {
            setBallAt(clamp(to.x, 0, 10));
            resolve();
          }
        }
        requestAnimationFrame(tick);
      });
    }
  }

  async function spinLuckMeter() {
    if (!hasLuck) return;
    if (luckAnimating) return;
    if (hasSpunToday()) return;

    luckAnimating = true;
    luckBtn.disabled = true;

    // Pick target, build path that ends on it (no snap)
    const target = pickLuck0to10();
    const frames = buildBounceKeyframes(target);

    // Run animation
    await animateKeyframes(frames);

    // Finalize
    luckScoreText.textContent = `Score: ${target} / 10`;
    luckMsg.textContent = `${luckLabel(target)} ${luckMessage(target)}`;

    markSpunToday();

    if (!TEST_MODE) {
      luckBtn.textContent = "Come back tomorrow";
      luckBtn.disabled = true;
    } else {
      // In test mode, allow re-testing via reset button only
      luckBtn.textContent = "How lucky am I today?";
      luckBtn.disabled = true;
      if (luckReset) luckReset.style.display = "inline-flex";
    }

    luckAnimating = false;
  }

  if (hasLuck) {
    luckBtn.addEventListener("click", spinLuckMeter);

    if (luckReset) {
      luckReset.style.display = TEST_MODE ? "inline-flex" : "none";
      luckReset.addEventListener("click", () => {
        clearSpunToday();
        luckAnimating = false;
        setLuckUIIdle();
        if (TEST_MODE) {
          luckBtn.disabled = false;
          luckBtn.textContent = "How lucky am I today?";
        }
      });
    }

    setLuckUIIdle();
  }

  // ---------- SMALL TILES (number/letter/colour/emoji) ----------
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // hooks (safe if missing)
  const tileNumBtn = qs("#tileNumBtn");
  const tileNumVal = qs("#tileNumVal");

  const tileLetterBtn = qs("#tileLetterBtn");
  const tileLetterVal = qs("#tileLetterVal");

  const tileColourBtn = qs("#tileColourBtn");
  const tileColourSwatch = qs("#tileColourSwatch");
  const tileColourVal = qs("#tileColourVal");

  const tileEmojiBtn = qs("#tileEmojiBtn");
  const tileEmojiVal = qs("#tileEmojiVal");

  const colours = [
    { name: "Green", hex: "#55be0a" },
    { name: "Purple", hex: "#875da6" },
    { name: "Blue", hex: "#1f6feb" },
    { name: "Gold", hex: "#f2b705" },
    { name: "Red", hex: "#e5534b" },
    { name: "Teal", hex: "#17a2b8" },
    { name: "Pink", hex: "#ff5ca8" },
    { name: "Orange", hex: "#ff8a00" },
  ];

  const emojis = ["🍀", "✨", "🧿", "🌙", "🔥", "🫶", "🧠", "🧿", "😌", "😈", "😵‍💫", "🤞", "🧲", "🎲", "🪙", "🧧"];

  if (tileNumBtn && tileNumVal) {
    tileNumBtn.addEventListener("click", () => {
      tileNumVal.textContent = String(randInt(0, 99));
    });
  }

  if (tileLetterBtn && tileLetterVal) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    tileLetterBtn.addEventListener("click", () => {
      tileLetterVal.textContent = pick(letters);
    });
  }

  if (tileColourBtn && tileColourSwatch && tileColourVal) {
    tileColourBtn.addEventListener("click", () => {
      const c = pick(colours);
      tileColourSwatch.style.background = c.hex;
      tileColourVal.textContent = `${c.name} ${c.hex}`;
    });
  }

  if (tileEmojiBtn && tileEmojiVal) {
    tileEmojiBtn.addEventListener("click", () => {
      tileEmojiVal.textContent = pick(emojis);
    });
  }

  // ---------- MAGIC 8 BALL ----------
  const eightBtn = qs("#eightBtn");
  const eightOut = qs("#eightOut");

  const eightAnswers = [
    "All signs point to yes.",
    "Reply hazy. Try later.",
    "Don’t count on it.",
    "Yes, definitely.",
    "Ask again soon.",
    "My sources say no.",
    "It is certain.",
    "Better not tell you now.",
    "Outlook not so good.",
    "You already know the answer.",
    "Signs point to yes-ish.",
    "Cosmic shrug.",
  ];

  if (eightBtn && eightOut) {
    eightBtn.addEventListener("click", () => {
      eightBtn.classList.remove("shake");
      // restart CSS animation cleanly
      void eightBtn.offsetWidth;
      eightBtn.classList.add("shake");
      eightOut.textContent = pick(eightAnswers);
    });
  }

  // ---------- FORTUNE COOKIE ----------
  const cookieBtn = qs("#cookieBtn");
  const cookieImg = qs("#cookieImg");
  const cookieOut = qs("#cookieOut");

  const fortunes = Array.isArray(window.FORTUNES) ? window.FORTUNES : [];

  function pickFortune() {
    if (fortunes.length) return pick(fortunes);
    return "A warm thought becomes tomorrow’s good news.";
  }

  if (cookieBtn && cookieOut) {
    cookieBtn.addEventListener("click", () => {
      cookieBtn.classList.remove("crack");
      void cookieBtn.offsetWidth;
      cookieBtn.classList.add("crack");

      // swap image if present
      if (cookieImg) {
        const closed = cookieImg.getAttribute("data-closed");
        const open = cookieImg.getAttribute("data-open");
        if (closed && open) {
          const isOpen = cookieImg.getAttribute("data-state") === "open";
          cookieImg.src = isOpen ? closed : open;
          cookieImg.setAttribute("data-state", isOpen ? "closed" : "open");
        }
      }

      cookieOut.textContent = pickFortune();
    });
  }

  // ---------- WHAT TO WATCH (WATCHLIST global) ----------
  const watchTitle = qs("#watch-title");
  const watchMeta = qs("#watch-meta");
  const watchNote = qs("#watch-note");
  const watchSpin = qs("#watch-spin");

  const WATCHLIST = Array.isArray(window.WATCHLIST) ? window.WATCHLIST : null;

  function shuffleCopy(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function runSlotSpin(list, onTick, onDone) {
    const shuffled = shuffleCopy(list);

    const minSteps = 22;
    const maxSteps = 34;
    const totalSteps = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));

    let step = 0;
    let delay = 40;
    const delayIncrease = 7;

    // pick a random start index inside the shuffled list
    let idx = Math.floor(Math.random() * shuffled.length);

    function tick() {
      idx = (idx + 1) % shuffled.length;
      onTick(shuffled[idx], step);

      step++;
      if (step < totalSteps) {
        delay += delayIncrease;
        setTimeout(tick, delay);
      } else {
        onDone(shuffled[idx]);
      }
    }

    tick();
  }

  if (watchSpin && watchTitle && watchMeta && watchNote && WATCHLIST && WATCHLIST.length) {
    let spinning = false;

    watchSpin.addEventListener("click", () => {
      if (spinning) return;
      spinning = true;
      watchSpin.disabled = true;

      watchNote.textContent = "";
      watchMeta.textContent = "";

      runSlotSpin(
        WATCHLIST,
        (item, step) => {
          // Fixed-height UI: do not let text reflow the box wildly
          watchTitle.textContent = item.title || "—";
          watchMeta.textContent = `${item.type || ""}${item.year ? ` • ${item.year}` : ""}`.trim();
          watchTitle.style.transform = step % 2 ? "translateY(1px)" : "translateY(-1px)";
        },
        (chosen) => {
          watchTitle.style.transform = "translateY(0)";
          watchTitle.textContent = chosen.title || "—";
          watchMeta.textContent = `${chosen.type || ""}${chosen.year ? ` • ${chosen.year}` : ""}`.trim();
          watchNote.textContent = "Rerolls allowed.";

          watchSpin.disabled = false;
          spinning = false;
        }
      );
    });
  }

})();
