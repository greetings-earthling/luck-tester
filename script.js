/* Alien Luck Tablet logic
   - one use per widget per refresh (no storage)
   - no eval, no Function, no string setTimeout
*/

window.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // scramble animation (latin-ish)
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  function scramble(el, ms = 520, finalText = "") {
    if (!el) return Promise.resolve();
    const start = performance.now();
    const len = Math.max(6, Math.min(24, finalText.length || 10));

    return new Promise((resolve) => {
      function frame(now) {
        const p = clamp((now - start) / ms, 0, 1);
        const churn = Math.floor((1 - p) * 10) + 2;

        let s = "";
        for (let i = 0; i < len; i++) {
          s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = s;

        if (p >= 1) {
          el.textContent = finalText || "—";
          el.classList.remove("pop");
          void el.offsetWidth;
          el.classList.add("pop");
          resolve();
          return;
        }
        for (let k = 0; k < churn; k++) {}
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  // lock a widget button after use (until refresh)
  function oneShot(btn, subEl, usedText = "Directive received.") {
    if (!btn) return;
    btn.disabled = true;
    if (subEl) subEl.textContent = usedText;
  }

  // ------------------------
  // Cosmic Wisdom (uses fortunes list if present, otherwise fallback)
  // ------------------------
  const wisdomBtn = $("btn-wisdom");
  const wisdomOut = $("out-wisdom");
  const wisdomSub = $("sub-wisdom");

  const fallbackWisdom = [
    "Proceed. But do not rush the outcome.",
    "Minimize noise. Maximize signal.",
    "Your next decision is smaller than it feels.",
    "Observe first. Act second.",
    "Do the easy win. Skip the hero move."
  ];

  wisdomBtn?.addEventListener("click", async () => {
    const list = window.FORTUNES || fallbackWisdom;
    const msg = pick(list);
    await scramble(wisdomOut, 560, msg);
    oneShot(wisdomBtn, wisdomSub, "Directive received.");
  });

  // ------------------------
  // Luck Aura (0–100, biased toward ~70)
  // ------------------------
  const auraBtn = $("btn-aura");
  const auraOut = $("out-aura");
  const auraSub = $("sub-aura");

  function randNormal(mean, sd) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * sd;
  }
  function rollAura() {
    const raw = randNormal(70, 14);
    return Math.round(clamp(raw, 0, 100));
  }
  function auraLine(pct) {
    if (pct >= 85) return `${pct}% — Luck is highly favourable.`;
    if (pct >= 70) return `${pct}% — Luck is favourable.`;
    if (pct >= 55) return `${pct}% — Luck is stable.`;
    if (pct >= 40) return `${pct}% — Luck levels low. Proceed with caution.`;
    return `${pct}% — Luck levels critical. Avoid gambles.`;
  }

  auraBtn?.addEventListener("click", async () => {
    const pct = rollAura();
    await scramble(auraOut, 520, auraLine(pct));
    oneShot(auraBtn, auraSub, "Scan complete.");
  });

  // ------------------------
  // Lucky Colour (flash then settle)
  // ------------------------
  const colourBtn = $("btn-colour");
  const colourOut = $("out-colour");
  const colourSub = $("sub-colour");
  const swatch = $("swatch-colour");

  const colours = [
    { name:"Solar Gold", hex:"#f59e0b" },
    { name:"Void Violet", hex:"#7c3aed" },
    { name:"Nebula Mint", hex:"#22c55e" },
    { name:"Signal Sky", hex:"#60a5fa" },
    { name:"Cosmic Coral", hex:"#fb7185" },
    { name:"Ion Indigo", hex:"#6366f1" },
    { name:"Aurora Teal", hex:"#06b6d4" }
  ];

  function flashColour(ms = 520) {
    return new Promise((resolve) => {
      const start = performance.now();
      function frame(now) {
        const p = clamp((now - start) / ms, 0, 1);
        const c = pick(colours);
        if (swatch) swatch.style.background = c.hex;
        if (p >= 1) return resolve();
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  colourBtn?.addEventListener("click", async () => {
    await flashColour(520);
    const c = pick(colours);
    if (swatch) swatch.style.background = c.hex;
    await scramble(colourOut, 420, c.name);
    oneShot(colourBtn, colourSub, "Calibration complete.");
  });

  // ------------------------
  // Lucky Number (0–9 for “notice today”)
  // ------------------------
  const numberBtn = $("btn-number");
  const numberOut = $("out-number");
  const numberSub = $("sub-number");

  numberBtn?.addEventListener("click", async () => {
    const n = String(Math.floor(Math.random() * 10));
    await scramble(numberOut, 420, n);
    oneShot(numberBtn, numberSub, "Number received.");
  });

  // ------------------------
  // Earth Meal (uses dinnerlist.js if present)
  // ------------------------
  const mealBtn = $("btn-meal");
  const mealOut = $("out-meal");
  const mealSub = $("sub-meal");

  mealBtn?.addEventListener("click", async () => {
    const list = window.DINNERLIST || window.FOODLIST || [];
    const item = list.length ? pick(list) : "Add dinnerlist.js (window.DINNERLIST).";
    await scramble(mealOut, 520, item);
    oneShot(mealBtn, mealSub, "Decision complete.");
  });

  // ------------------------
  // Earth Entertainment (uses watchlist.js if present)
  // ------------------------
  const entBtn = $("btn-ent");
  const entOut = $("out-ent");
  const entMeta = $("meta-ent");
  const entSub = $("sub-ent");

  function fmtMeta(item){
    if (!item || typeof item !== "object") return "";
    const t = item.type || "";
    const y = item.year || "";
    return [t, y].filter(Boolean).join(" • ");
  }

  entBtn?.addEventListener("click", async () => {
    const list = window.WATCHLIST || [];
    if (!list.length){
      if (entMeta) entMeta.textContent = "";
      await scramble(entOut, 520, "Add watchlist.js (window.WATCHLIST).");
      oneShot(entBtn, entSub, "Observer offline.");
      return;
    }

    const item = pick(list);
    if (entMeta) entMeta.textContent = fmtMeta(item);
    await scramble(entOut, 520, item.title || "—");
    oneShot(entBtn, entSub, "Observation locked.");
  });
});
