/* Luck Meter site logic
   - Uses window.WATCHLIST, window.FORTUNES, window.DINNERLIST (or window.FOODLIST)
   - Add ?test=1 to URL to show Reset + allow re-spin
*/

window.addEventListener("DOMContentLoaded", () => {
  console.log("script.js running");

  // --- flags / helpers ---
  const TEST_MODE = new URLSearchParams(location.search).get("test") === "1";

  const $ = (id) => document.getElementById(id);

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // Safe event binding: never crashes if an element is missing
  function on(id, evt, handler) {
    const el = $(id);
    if (!el) return false;
    el.addEventListener(evt, handler);
    return true;
  }

  // -----------------------------
  // 8-ball
  // -----------------------------
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

  on("eightBall", "click", () => {
    const out = $("eightResult");
    if (out) out.textContent = pick(eightAnswers);
  });

  // -----------------------------
  // Fortune cookie
  // -----------------------------
  on("cookie", "click", () => {
    const out = $("fortuneResult");
    if (!out) return;

    const list = window.FORTUNES || [];
    out.textContent = list.length ? pick(list) : "Add fortunes.js (window.FORTUNES).";
  });

  // -----------------------------
  // Mini tiles
  // -----------------------------
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

  on("miniNum", "click", () => {
    const el = $("numVal");
    if (el) el.textContent = String(Math.floor(Math.random() * 10)); // 0-9
  });

  on("miniLetter", "click", () => {
    const el = $("letterVal");
    if (el) el.textContent = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  });

  on("miniEmoji", "click", () => {
    const el = $("emojiVal");
    if (el) el.textContent = pick(emojis);
  });

  on("miniColor", "click", () => {
    const swatch = $("colorSwatch");
    const lines = $("colorLines");
    if (!swatch || !lines) return;

    const c = pick(colors);
    swatch.style.background = c.hex;
    lines.innerHTML = `${c.name} ${c.hex}<br>Wear it if you want.<br>Fight about it later.`;
  });

  // -----------------------------
  // Watch spinner (randomized tick order)
  // -----------------------------
  const watchBtn = $("watch-spin");
  let watchSpinning = false;

  function fmtMeta(item){
    if (!item) return "";
    const t = item.type || "";
    const y = item.year || "";
    return [t, y].filter(Boolean).join(" • ");
  }

  function randomTickSpin(list, onPick){
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
        if (watchBtn) watchBtn.disabled = false;
      }
    }
    tick();
  }

  if (watchBtn) {
    watchBtn.addEventListener("click", () => {
      if (watchSpinning) return;

      const titleEl = $("watch-title");
      const metaEl = $("watch-meta");
      if (!titleEl || !metaEl) return;

      const list = window.WATCHLIST || [];
      if (!list.length){
        titleEl.textContent = "Add watchlist.js (window.WATCHLIST).";
        metaEl.textContent = "";
        return;
      }

      watchSpinning = true;
      watchBtn.disabled = true;

      randomTickSpin(list, (item, isTick) => {
        titleEl.textContent = item.title || "—";
        metaEl.textContent = fmtMeta(item);
        titleEl.style.transform = isTick ? "translateY(1px)" : "translateY(0)";
      });
    });
  }

  // -----------------------------
  // Dinner spinner (if you have it on the page)
  // Supports window.DINNERLIST or window.FOODLIST
  // -----------------------------
  const dinnerBtn = $("dinner-spin");
  let dinnerSpinning = false;

  function getDinnerList() {
    return window.DINNERLIST || window.FOODLIST || [];
  }

  if (dinnerBtn) {
    dinnerBtn.addEventListener("click", () => {
      if (dinnerSpinning) return;

      const titleEl = $("dinner-title");
      const noteEl = $("dinner-note");
      if (!titleEl) return;

      const list = getDinnerList();
      if (!list.length) {
        titleEl.textContent = "Add dinnerlist.js (window.DINNERLIST).";
        if (noteEl) noteEl.textContent = "";
        return;
      }

      dinnerSpinning = true;
      dinnerBtn.disabled = true;

      // quick tick spin
      const minSteps = 18;
      const maxSteps = 28;
      const totalSteps = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));
      let step = 0;
      let delay = 26;

      function tick() {
        const item = pick(list);
        titleEl.textContent = typeof item === "string" ? item : (item.title || "—");
        if (noteEl) noteEl.textContent = "";

        step++;
        if (step < totalSteps) {
          delay += 7;
          setTimeout(tick, delay);
        } else {
          dinnerSpinning = false;
          dinnerBtn.disabled = false; // rerolls allowed
        }
      }

      tick();
    });
  }

  // =========================
  // LUCK METER (BOUNCE, NO JUMP)
  // =========================
  const luckSpinBtn = $("luckSpin");
  const lmResult = $("lmResult");
  const lmMeta = $("lmMeta");
  const lmTrack = $("lmTrack");
  const lmBall = $("lmBall");
  const lmWash = $("lmWash");
  const lmBar = $("lmBar");
  const devRow = $("devRow");
  const resetLuckBtn = $("resetLuck");

  // If luck meter elements are missing, don't crash the rest of the site
  if (luckSpinBtn && lmResult && lmMeta && lmTrack && lmBall && lmWash && lmBar) {
    let lmSpinning = false;
    let lastScore = 5;

    function trackWidth(){
      return lmTrack.getBoundingClientRect().width;
    }

    function setBall01(t01){
      const w = trackWidth();
      lmBall.style.left = `${t01 * w}px`;
    }

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

    function setColourFromT(t){
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

      const xPct = (t * 100).toFixed(2);
      lmWash.style.background =
        `radial-gradient(circle at ${xPct}% 45%,
          rgba(185,28,28,${0.10 + redA*0.45}) 0%,
          rgba(107,114,128,${0.06 + neutralA*0.22}) 38%,
          rgba(22,163,74,${0.10 + greenA*0.45}) 72%,
          rgba(0,0,0,0) 82%
        )`;
    }

    function setToScore(score){
      lastScore = score;
      const t01 = score / 10;
      setBall01(t01);
      lmResult.textContent = `Score: ${score} / 10`;
      lmMeta.textContent = messageForScore(score);
      setColourFromT(t01);
    }

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

    function animateLuckTo(targetScore){
  const target = clamp(targetScore, 0, 10);
  const startT = performance.now();

  const totalMs = 6200;     // whole animation length
  const bounces = 5;        // number of full wall bounces after first hit
  const settleMs = 1100;    // final “fate decides” leg

  const w = trackWidth();

  // Helpers
  const lerp = (a,b,t)=> a + (b-a)*t;
  const easeOutCubic = (t)=> 1 - Math.pow(1 - t, 3);

  // Triangle wave 0..1..0 for p 0..1
  const tri01 = (p) => {
    const x = p % 1;
    return x < 0.5 ? x * 2 : 2 - x * 2;
  };

  // Phase plan:
  // 1) quick move from 5 -> 0 (first wall hit)
  // 2) do N bounces between walls (always hits 0/10)
  // 3) final settle: from opposite wall -> target (no mid-air reversal)
  const toFirstWallMs = 900; // 5 -> 0
  const bounceMs = totalMs - toFirstWallMs - settleMs;

  // Decide which wall to start with (0 first feels good since you asked for 5->0 bounce)
  const firstWall = 0;

  // For final settle, come from the opposite side of the target so it “passes the wall”
  const finalWall = target >= 5 ? 0 : 10;

  function render(pos01){
    setBall01(pos01);
    setColourFromT(pos01);
  }

  function frame(now){
    const elapsed = now - startT;

    // 1) 5 -> first wall (0)
    if (elapsed <= toFirstWallMs){
      const t = easeOutCubic(elapsed / toFirstWallMs);
      const pos01 = lerp(0.5, firstWall / 10, t);
      render(pos01);
      requestAnimationFrame(frame);
      return;
    }

    // 2) Bounce wall-to-wall with slowing cadence (but still hitting walls)
    const tBounce = elapsed - toFirstWallMs;

    if (tBounce <= bounceMs){
      // progress 0..1
      const p = tBounce / bounceMs;

      // slow the bounce rate over time by easing the phase
      const eased = easeOutCubic(p);

      // phase runs from 0..(bounces + 1) half-cycles
      // start at wall 0, go to 10, back to 0, etc.
      const phase = eased * (bounces + 1);

      // tri gives 0..1..0, map to 0..1 position
      const pos01 = tri01(phase);
      render(pos01);
      requestAnimationFrame(frame);
      return;
    }

    // 3) Final settle: from finalWall -> target, easing in (no reversal)
    const tSettle = elapsed - toFirstWallMs - bounceMs;
    const tt = clamp(tSettle / settleMs, 0, 1);
    const eased = easeOutCubic(tt);

    const from01 = finalWall / 10;
    const to01 = target / 10;
    const pos01 = lerp(from01, to01, eased);
    render(pos01);

    if (tt < 1){
      requestAnimationFrame(frame);
      return;
    }

    // Finish
    setToScore(targetScore);
    lmSpinning = false;
    markSpun();
    luckSpinBtn.disabled = true;
    luckSpinBtn.textContent = "Come back tomorrow";
  }

  requestAnimationFrame(frame);
}

    function setNeutralStart(){
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

    if (TEST_MODE && devRow && resetLuckBtn){
      devRow.style.display = "flex";
      resetLuckBtn.addEventListener("click", () => {
        resetSpun();
        setNeutralStart();
        lmMeta.textContent = "Reset. Spin again.";
      });
    }

    setNeutralStart();
    lockIfAlreadySpun();

    window.addEventListener("resize", () => {
      if (!lmSpinning){
        setBall01(lastScore / 10);
        setColourFromT(lastScore / 10);
      }
    });
  }
});
