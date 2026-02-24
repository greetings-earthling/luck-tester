/* Luck Meter site logic
   - Uses window.WATCHLIST, window.FORTUNES, window.FOODLIST from separate files
   - Add ?test=1 to URL to show Reset + allow re-spin
*/

const TEST_MODE = new URLSearchParams(location.search).get("test") === "1";

const $ = (id) => document.getElementById(id);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/* ---------- 8-ball + fortunes ---------- */
const eightAnswers = [
  "Signs point to yes.",
  "Yes.",
  "No.",
  "Ask again later.",
  "Outlook not so good.",
  "Cannot predict now.",
  "Don’t count on it.",
  "Without a doubt."
];

$("eightBall").addEventListener("click", () => {
  $("eightResult").textContent = pick(eightAnswers);
});

$("cookie").addEventListener("click", () => {
  const list = window.FORTUNES || [];
  $("fortuneResult").textContent = list.length ? pick(list) : "Add fortunes.js (window.FORTUNES).";
});

/* ---------- Mini tiles ---------- */
const emojis = ["🍀","✨","😌","🔥","🧠","🌈","🧿","🪄","🫶","😈","😇","🌀"];

const colors = [
  { name: "Green", hex: "#22c55e" },
  { name: "Purple", hex: "#875da6" },
  { name: "Sky", hex: "#60a5fa" },
  { name: "Gold", hex: "#f59e0b" },
  { name: "Coral", hex: "#fb7185" },
  { name: "Mint", hex: "#34d399" },
  { name: "Indigo", hex: "#6366f1" }
];

$("miniNum").addEventListener("click", () => {
  $("numVal").textContent = String(Math.floor(Math.random() * 10)); // 0-9
});

$("miniLetter").addEventListener("click", () => {
  $("letterVal").textContent = String.fromCharCode(65 + Math.floor(Math.random() * 26));
});

$("miniEmoji").addEventListener("click", () => {
  $("emojiVal").textContent = pick(emojis);
});

$("miniColor").addEventListener("click", () => {
  const c = pick(colors);
  $("colorSwatch").style.background = c.hex;
  // keep the 3 lines, just swap line 1 to show name/hex
  $("colorLines").innerHTML = `${c.name} ${c.hex}<br>Wear it if you want.<br>Fight about it later.`;
});

/* ---------- Watch spinner (randomized tick order) ---------- */
const watchBtn = $("watch-spin");
let watchSpinning = false;

function fmtMeta(item){
  if (!item) return "";
  const t = item.type || "";
  const y = item.year || "";
  return [t, y].filter(Boolean).join(" • ");
}

function randomTickSpin(list, onPick){
  // Looks random while spinning (no alphabetical run)
  const minSteps = 24;
  const maxSteps = 38;
  const totalSteps = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));
  let step = 0;
  let delay = 28;
  const delayIncrease = 7;

  function tick(){
    const item = pick(list);
    onPick(item, true);

    step++;
    if (step < totalSteps){
      delay += delayIncrease;
      setTimeout(tick, delay);
    } else {
      const finalPick = pick(list);
      onPick(finalPick, false);
      watchSpinning = false;
      watchBtn.disabled = false;
    }
  }
  tick();
}

watchBtn.addEventListener("click", () => {
  if (watchSpinning) return;

  const list = window.WATCHLIST || [];
  if (!list.length){
    $("watch-title").textContent = "Add watchlist.js (window.WATCHLIST).";
    $("watch-meta").textContent = "";
    return;
  }

  watchSpinning = true;
  watchBtn.disabled = true;

  randomTickSpin(list, (item, isTick) => {
    $("watch-title").textContent = item.title || "—";
    $("watch-meta").textContent = fmtMeta(item);
    // subtle “tick” feel without resizing anything
    $("watch-title").style.transform = isTick ? "translateY(1px)" : "translateY(0)";
  });
});

/* =========================
   LUCK METER (BOUNCE, NO JUMP)
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

const TEST_MODE = new URLSearchParams(location.search).get("test") === "1";

function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }

function trackWidth(){
  return lmTrack.getBoundingClientRect().width;
}
function setBall01(t01){
  const w = trackWidth();
  lmBall.style.left = `${t01 * w}px`;
}
function setToScore(score){
  lastScore = score;
  const t01 = score / 10;
  setBall01(t01);
  lmResult.textContent = `Score: ${score} / 10`;
  lmMeta.textContent = messageForScore(score);      // <-- your custom messages go here
  setColourFromT(t01);
}

/* Normal distribution, slightly positive */
function randNormal(mean, sd){
  let u=0, v=0;
  while (u===0) u = Math.random();
  while (v===0) v = Math.random();
  const z = Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
  return mean + z*sd;
}
function rollLuckScore(){
  const raw = randNormal(5.8, 1.7);
  return Math.round(clamp(raw, 0, 10));
}

/* Custom message per number (emoji OK) */
function messageForScore(s){
  const map = {
    0: "🧨 0/10. Do not test fate today.",
    1: "🧯 1/10. Keep it small and safe.",
    2: "🪨 2/10. Low luck. High caution.",
    3: "🌧️ 3/10. Not great. You’ll survive.",
    4: "⚖️ 4/10. Slightly off. Stay steady.",
    5: "🧘 5/10. Neutral. You steer.",
    6: "🍀 6/10. Slightly lucky. Take the easy win.",
    7: "✨ 7/10. Good luck today. Momentum’s real.",
    8: "🔥 8/10. Very lucky. Say yes to the good idea.",
    9: "🚀 9/10. Big luck. Bold moves welcomed.",
    10:"👑 10/10. Mega luck. Do the thing."
  };
  return map[s] || `${s}/10.`;
}

/* Colour (make wash match side you’re on) */
function setColourFromT(t){
  // t: 0..1
  const bias = (t - 0.5) * 2; // -1..1
  const redA = clamp(-bias, 0, 1);
  const greenA = clamp(bias, 0, 1);
  const neutralA = 1 - Math.max(redA, greenA);

  lmBar.style.background =
    `linear-gradient(90deg,
      rgba(185,28,28,${0.10 + redA*0.65}) 0%,
      rgba(107,114,128,${0.08 + neutralA*0.40}) 50%,
      rgba(22,163,74,${0.10 + greenA*0.65}) 100%
    )`;

  // wash should NOT be green when you’re on red side (and vice versa)
  const xPct = (t * 100).toFixed(2);
  lmWash.style.background =
    `radial-gradient(circle at ${xPct}% 45%,
      rgba(185,28,28,${0.10 + redA*0.45}) 0%,
      rgba(107,114,128,${0.06 + neutralA*0.22}) 38%,
      rgba(22,163,74,${0.10 + greenA*0.45}) 72%,
      rgba(0,0,0,0) 82%
    )`;
}

/* once per day */
function todayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function lockIfAlreadySpun(){
  if (TEST_MODE) return false;
  if (localStorage.getItem("LUCK_METER_SPUN_DATE") === todayKey()){
    luckSpinBtn.disabled = true;
    luckSpinBtn.textContent = "Come back tomorrow";
    return true;
  }
  return false;
}
function markSpun(){
  if (!TEST_MODE) localStorage.setItem("LUCK_METER_SPUN_DATE", todayKey());
}
function resetSpun(){
  localStorage.removeItem("LUCK_METER_SPUN_DATE");
}

/* Physics bounce (continuous, no teleport) */
function animateLuckTo(targetScore){
  const target = targetScore;     // 0..10
  let pos = 5;                    // start neutral
  let vel = (Math.random() < 0.5 ? -1 : 1) * (10.5 + Math.random()*3.5); // units/sec
  let t0 = performance.now();

  const totalMs = 6200;           // tension
  const minVel = 0.04;            // stop threshold

  function step(now){
    const dt = Math.min(0.032, (now - t0) / 1000); // seconds
    t0 = now;

    const elapsed = now - start;
    const p = clamp(elapsed / totalMs, 0, 1);

    // damping increases over time
    const damp = 1 - (0.010 + p*0.030);
    vel *= damp;

    // attraction to target increases over time
    const attract = (0.25 + p*2.10);
    vel += (target - pos) * attract * dt;

    // update
    pos += vel * dt;

    // hard bounce off walls
    if (pos < 0){ pos = -pos; vel = -vel; }
    if (pos > 10){ pos = 20 - pos; vel = -vel; }

    // render
    const t01 = pos / 10;
    setBall01(t01);
    setColourFromT(t01);

    // finish when slow and close OR time is up
    const close = Math.abs(pos - target) < 0.03;
    const slow = Math.abs(vel) < minVel;

    if ((p >= 1 && close) || (close && slow)){
      setToScore(targetScore);
      lmSpinning = false;
      markSpun();
      luckSpinBtn.disabled = true;
      luckSpinBtn.textContent = "Come back tomorrow";
      return;
    }

    requestAnimationFrame(step);
  }

  const start = performance.now();
  requestAnimationFrame(step);
}

function setNeutralStart(){
  lastScore = 5;
  setToScore(5);
  lmMeta.textContent = "Neutral start. Tap the button.";
  luckSpinBtn.disabled = false;
  luckSpinBtn.textContent = "How lucky am I today?";
}

luckSpinBtn.addEventListener("click", () => {
  if (lmSpinning) return;
  if (lockIfAlreadySpun()) return;

  lmSpinning = true;
  luckSpinBtn.disabled = true;

  lmResult.textContent = "Score: deciding…";
  lmMeta.textContent = "Consulting fate…";

  const score = rollLuckScore();
  animateLuckTo(score);
});

/* test UI */
if (TEST_MODE){
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
  if (!lmSpinning){
    setBall01(lastScore / 10);
    setColourFromT(lastScore / 10);
  }
});
