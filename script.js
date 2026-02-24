/* =========================================================
   Luck Meter site script
   - Data files (optional):
     window.WATCHLIST  -> from watchlist.js
     window.FORTUNES   -> from fortunes.js
     window.FOODLIST   -> from foodlist.js
   ========================================================= */

/* TEST MODE:
   add ?test=1 to your URL to disable the daily lock and show Reset button.
*/
const TEST_MODE = new URLSearchParams(location.search).get("test") === "1";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/* =========================
   Mini tiles (unlimited)
   ========================= */
const emojis = ["🍀","✨","😌","🔥","🧠","🌈","🧿","🫠","😍","😵‍💫","🤷","🥴","😈","🐱","☕","🏠","💃","🕺","🐶","🎧"];

const colors = [
  { name: "Green", hex: "#55be0a" },
  { name: "Purple", hex: "#875da6" },
  { name: "Sky", hex: "#60a5fa" },
  { name: "Gold", hex: "#f59e0b" },
  { name: "Coral", hex: "#fb7185" },
  { name: "Mint", hex: "#34d399" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Rose", hex: "#f43f5e" }
];

document.getElementById("miniNum").addEventListener("click", () => {
  document.getElementById("num").textContent = String(Math.floor(Math.random() * 10));
});

document.getElementById("miniLetter").addEventListener("click", () => {
  document.getElementById("letter").textContent = String.fromCharCode(65 + Math.floor(Math.random() * 26));
});

document.getElementById("miniEmoji").addEventListener("click", () => {
  document.getElementById("emoji").textContent = pick(emojis);
});

document.getElementById("miniColor").addEventListener("click", () => {
  const c = pick(colors);
  const sw = document.getElementById("colorSwatch");
  sw.style.background = c.hex;
  document.getElementById("colorMeta").textContent = `${c.name}  ${c.hex}`;
});

/* =========================
   Magic 8-ball + Fortune cookie
   ========================= */
const eightAnswers = [
  "It is certain.",
  "Yes.",
  "Signs point to yes.",
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Don’t count on it.",
  "My reply is no.",
  "Outlook not so good.",
  "Very doubtful."
];

const fallbackFortunes = [
  "A warm thought becomes tomorrow’s good news.",
  "Luck is borrowed, not owned.",
  "An unexpected win is nearby.",
  "Today favors small risks.",
  "Patience pays off."
];

const FORTUNES = Array.isArray(window.FORTUNES) && window.FORTUNES.length
  ? window.FORTUNES
  : fallbackFortunes;

document.getElementById("eightBall").addEventListener("click", () => {
  document.getElementById("eightResult").textContent = pick(eightAnswers);
});

document.getElementById("cookie").addEventListener("click", () => {
  document.getElementById("fortuneResult").textContent = pick(FORTUNES);
});

/* =========================
   What should I watch? (spin + rerolls)
   - Fix: animation now uses random picks (not alphabetical stepping)
   - Layout stable: fixed-height window in CSS
   ========================= */
const watchTitle = document.getElementById("watch-title");
const watchMeta = document.getElementById("watch-meta");
const watchNote = document.getElementById("watch-note");
const watchSpinBtn = document.getElementById("watch-spin");

const WATCHLIST = Array.isArray(window.WATCHLIST) ? window.WATCHLIST : [];

function setWatchItem(item) {
  if (!item) return;
  watchTitle.textContent = item.title || "Untitled";
  watchMeta.textContent = `${item.type || ""}${item.year ? ` • ${item.year}` : ""}`.trim();
  watchNote.textContent = "Reroll if you hate it.";
}

function spinRandomSlot(list, onTick, onDone) {
  if (!list || !list.length) return;

  const minSteps = 22;
  const maxSteps = 34;
  const totalSteps = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));

  let step = 0;
  let delay = 40;        // starts fast
  const delayInc = 10;   // slows down each tick

  function tick() {
    const item = pick(list);
    onTick(item);

    step++;
    delay += delayInc;

    if (step < totalSteps) {
      setTimeout(tick, delay);
    } else {
      onDone(item);
    }
  }

  tick();
}

watchSpinBtn.addEventListener("click", () => {
  if (!WATCHLIST.length) {
    watchTitle.textContent = "No watchlist loaded.";
    watchMeta.textContent = "Check watchlist.js";
    watchNote.textContent = "";
    return;
  }

  watchSpinBtn.disabled = true;
  watchNote.textContent = "Consulting the streaming gods…";

  spinRandomSlot(
    WATCHLIST,
    (item) => { setWatchItem(item); },
    (item) => {
      setWatchItem(item);
      watchSpinBtn.disabled = false;
    }
  );
});

/* =========================
   Luck Meter (top)
   - One spin per day (unless ?test=1)
   - Long bounce that hits walls repeatedly
   - No “jump” at the end: final segment is continuous
   ========================= */
const luckSpinBtn = document.getElementById("luckSpin");
const lmResult = document.getElementById("lmResult");
const lmMeta = document.getElementById("lmMeta");
const lmTrack = document.getElementById("lmTrack");
const lmBall = document.getElementById("lmBall");
const lmWash = document.getElementById("lmWash");
const lmBar = document.getElementById("lmBar");
const devRow = document.getElementById("devRow");
const resetLuckBtn = document.getElementById("resetLuck");

let lmSpinning = false;
let lastScore = 5;

function trackWidth() {
  return lmTrack.getBoundingClientRect().width;
}

function setBallPx(x) {
  lmBall.style.left = `${x}px`;
}

function setColourFromT(t01) {
  const t = clamp(t01, 0, 1);

  const bad = clamp((0.45 - t) / 0.45, 0, 1);
  const good = clamp((t - 0.55) / 0.45, 0, 1);
  const neutral = clamp(1 - Math.max(bad, good), 0, 1);

  lmBar.style.background =
    `linear-gradient(90deg,
      rgba(185,28,28,${0.10 + bad*0.65}) 0%,
      rgba(107,114,128,${0.08 + neutral*0.45}) 50%,
      rgba(22,163,74,${0.10 + good*0.65}) 100%
    )`;

  const xPct = (t * 100).toFixed(2);
  lmWash.style.background =
    `radial-gradient(circle at ${xPct}% 45%,
      rgba(185,28,28,${0.06 + bad*0.42}) 0%,
      rgba(107,114,128,${0.05 + neutral*0.26}) 34%,
      rgba(22,163,74,${0.06 + good*0.42}) 70%,
      rgba(0,0,0,0) 78%
    )`;
}

function metaForScore(s) {
  if (s <= 1) return "Chaos energy. Keep it simple.";
  if (s <= 3) return "Low luck. High awareness.";
  if (s <= 6) return "Balanced. You steer the day.";
  if (s <= 8) return "Good luck. Take the easy win.";
  return "Mega luck. Do the bold thing.";
}

function setToScore(score) {
  lastScore = score;
  const w = trackWidth();
  const x = (score / 10) * w;
  setBallPx(x);
  setColourFromT(score / 10);
  lmResult.textContent = `Score: ${score} / 10`;
  lmMeta.textContent = metaForScore(score);
}

/* bell curve, slightly positive */
function randNormal(mean, sd) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * sd;
}

function rollLuckScore() {
  const raw = randNormal(5.9, 1.6);
  return Math.round(clamp(raw, 0, 10));
}

/* daily lock */
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function lockIfAlreadySpun() {
  if (TEST_MODE) return false;

  const key = todayKey();
  const saved = localStorage.getItem("LUCK_METER_SPUN_DATE");
  if (saved === key) {
    luckSpinBtn.disabled = true;
    luckSpinBtn.textContent = "Come back tomorrow";
    lmMeta.textContent = "Already read today.";
    return true;
  }
  return false;
}

function markSpun() {
  if (TEST_MODE) return;
  localStorage.setItem("LUCK_METER_SPUN_DATE", todayKey());
}

function resetSpun() {
  localStorage.removeItem("LUCK_METER_SPUN_DATE");
}

/* easing */
function easeInOut(t) {
  // smoothstep-ish
  return t * t * (3 - 2 * t);
}

/* Build a bounce path that ALWAYS stays continuous and ends on target (no jump). */
function animateBounceTo(targetScore) {
  const w = trackWidth();
  const targetT = targetScore / 10;

  // segments: from -> to, each with its own duration (slows over time)
  const segments = [];
  let from = 0.5; // start at 5 (neutral)
  let dir = Math.random() < 0.5 ? -1 : 1;

  const wallBounces = 7;     // number of wall hits
  let dur = 420;             // start quick
  const durGrow = 1.18;      // slows down

  for (let i = 0; i < wallBounces; i++) {
    const to = dir < 0 ? 0 : 1;
    segments.push({ from, to, ms: Math.round(dur) });
    from = to;
    dir *= -1;
    dur *= durGrow;
  }

  // final segment to target (slow + dramatic)
  segments.push({ from, to: targetT, ms: 1200 });

  lmSpinning = true;

  let segIndex = 0;
  let segStart = performance.now();

  function step(now) {
    const seg = segments[segIndex];
    const elapsed = now - segStart;
    const t = clamp(elapsed / seg.ms, 0, 1);
    const e = easeInOut(t);

    const pos01 = seg.from + (seg.to - seg.from) * e;

    setBallPx(pos01 * w);
    setColourFromT(pos01);

    if (t < 1) {
      requestAnimationFrame(step);
      return;
    }

    // next segment
    segIndex++;
    if (segIndex < segments.length) {
      segStart = performance.now();
      requestAnimationFrame(step);
      return;
    }

    // done
    lmSpinning = false;
    setToScore(targetScore);
    markSpun();
    luckSpinBtn.disabled = true;
    luckSpinBtn.textContent = "Come back tomorrow";
    lmMeta.textContent = "That’s today’s reading.";
  }

  requestAnimationFrame(step);
}

/* init */
function setNeutralStart() {
  setToScore(5);
  lmMeta.textContent = "Neutral start. Tap the button.";
  luckSpinBtn.disabled = false;
  luckSpinBtn.textContent = "How lucky am I today?";
}

luckSpinBtn.addEventListener("click", () => {
  if (lmSpinning) return;
  if (lockIfAlreadySpun()) return;

  luckSpinBtn.disabled = true;
  lmResult.textContent = "Score: deciding…";
  lmMeta.textContent = "Consulting fate…";

  const score = rollLuckScore();
  animateBounceTo(score);
});

/* test UI */
if (TEST_MODE) {
  devRow.style.display = "flex";
  resetLuckBtn.addEventListener("click", () => {
    resetSpun();
    setNeutralStart();
    lmMeta.textContent = "Reset. Spin again.";
  });
}

window.addEventListener("load", () => {
  setNeutralStart();
  lockIfAlreadySpun();
});

window.addEventListener("resize", () => {
  if (!lmSpinning) setToScore(lastScore);
});
