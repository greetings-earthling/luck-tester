/* Clean 2-column widget system
   - Tap reveal area to reveal
   - One-shot per refresh for most widgets
   - Rerolls allowed for Dinner + Watch
   - No eval (CSP-safe)
*/

window.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));

  // --- glyph scramble animation (fast, simple) ---
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789⌁⟡⟢⌬⟣⟠⟟⟞⌇";
  function scrambleTo(el, finalText, ms = 420) {
    const target = String(finalText);
    const len = clamp(target.length, 6, 64);
    const steps = 14;
    let i = 0;

    const timer = setInterval(() => {
      i++;
      const lock = Math.floor((i / steps) * len);
      let out = "";
      for (let k = 0; k < len; k++){
        out += (k < lock) ? (target[k] ?? " ") : GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
      }
      el.textContent = out.trimEnd();
      if (i >= steps){
        clearInterval(timer);
        el.textContent = target;
      }
    }, Math.floor(ms / steps));
  }

  // --- nice colours via HSL -> HEX ---
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2*l - 1)) * s;
    const x = c * (1 - Math.abs(((h/60) % 2) - 1));
    const m = l - c/2;
    let r=0,g=0,b=0;

    if (h < 60) { r=c; g=x; }
    else if (h < 120) { r=x; g=c; }
    else if (h < 180) { g=c; b=x; }
    else if (h < 240) { g=x; b=c; }
    else if (h < 300) { r=x; b=c; }
    else { r=c; b=x; }

    const toHex = (v) => Math.round((v+m)*255).toString(16).padStart(2,"0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }
  function rollNiceHex(){
    const h = Math.floor(Math.random()*360);
    const s = 62 + Math.floor(Math.random()*26); // 62–87
    const l = 44 + Math.floor(Math.random()*16); // 44–59
    return hslToHex(h,s,l);
  }

  // --- aura (usually ~70) ---
  function randNormal(mean, sd){
    let u=0,v=0;
    while(u===0) u=Math.random();
    while(v===0) v=Math.random();
    const z = Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
    return mean + z*sd;
  }
  function rollAura(){
    return Math.round(clamp(randNormal(70, 14), 0, 100));
  }
  function auraLine(p){
    if (p <= 25) return "Low luck. Proceed with caution.";
    if (p <= 45) return "Luck is low. Keep it simple.";
    if (p <= 65) return "Neutral luck. You steer.";
    if (p <= 82) return "Favourable luck. Take the easy wins.";
    return "High luck. Momentum is real.";
  }
  function auraAfter(p){
    if (p <= 45) return "It’s a make-your-own-luck kind of day.";
    if (p <= 65) return "Nothing dramatic. Just be consistent.";
    return "If there’s a clean opening, take it.";
  }

  // --- data (starter) ---
  const WISDOM = [
    "Proceed. But do not rush the outcome.",
    "Take the obvious win. Ignore the dramatic one.",
    "Today rewards precision, not volume.",
    "If it feels loud, it is not for you.",
    "Do one useful thing. Then stop."
  ];
  const TAROT = [
    ["The Fool", "Start. Learn by moving."],
    ["The Magician", "Use what you already have."],
    ["The High Priestess", "Keep it private. Trust the signal."],
    ["Wheel of Fortune", "Timing is the whole trick."],
    ["The Sun", "Say yes to what is simple."]
  ];
  const FACTS = [
    "Honey never spoils.",
    "Octopuses have three hearts.",
    "A day on Venus is longer than a year on Venus.",
    "Bananas are berries. Strawberries are not."
  ];
  const JOKES = [
    "I tried to read a book on anti-gravity. Couldn’t put it down.",
    "I told my computer I needed a break. It said: no problem, I’ll go to sleep.",
    "I’m on a whiskey diet. I’ve lost three days."
  ];

  // --- helpers for one-shot / reroll ---
  function markDone(btn){
    btn.classList.add("isDone");
    btn.disabled = true;
  }
  function showAfter(id, text){
    const el = $(id);
    if (!el) return;
    el.hidden = false;
    el.textContent = text;
  }

  function bindWidget(btnId, afterId, mode, run){
    const btn = $(btnId);
    if (!btn) return;

    btn.addEventListener("click", () => {
      if (mode === "oneshot" && btn.disabled) return;
      run(btn);
      if (mode === "oneshot") markDone(btn);
    });
  }

  // Lucky Number
  bindWidget("reveal-number", "after-number", "oneshot", (btn) => {
    const n = 1 + Math.floor(Math.random()*10);
    scrambleTo(btn, String(n), 360);
    showAfter("after-number", "Notice it today. Treat it like a nudge.");
  });

  // Lucky Letter
  bindWidget("reveal-letter", "after-letter", "oneshot", (btn) => {
    const letter = String.fromCharCode(65 + Math.floor(Math.random()*26));
    scrambleTo(btn, letter, 340);
    showAfter("after-letter", "Watch for it in names, signs, and receipts.");
  });

  // Lucky Colours (pair)
  bindWidget("reveal-colours", "after-colours", "oneshot", (btn) => {
    const a = rollNiceHex();
    let b = rollNiceHex();
    while (b === a) b = rollNiceHex();
    scrambleTo(btn, `${a}\n${b}`, 420);
    showAfter("after-colours", "Use them for a choice, a mood, or a tie-breaker.");
  });

  // Luck Aura
  bindWidget("reveal-aura", "after-aura", "oneshot", (btn) => {
    const p = rollAura();
    scrambleTo(btn, `${p}%`, 420);
    showAfter("after-aura", `${auraLine(p)} ${auraAfter(p)}`);
  });

  // Cosmic Wisdom
  bindWidget("reveal-wisdom", "after-wisdom", "oneshot", (btn) => {
    const msg = pick(WISDOM);
    scrambleTo(btn, msg, 520);
    showAfter("after-wisdom", "One sentence. One move. Done.");
  });

  // Tarot
  bindWidget("reveal-tarot", "after-tarot", "oneshot", (btn) => {
    const [card, msg] = pick(TAROT);
    scrambleTo(btn, card, 520);
    showAfter("after-tarot", msg);
  });

  // Dinner (reroll)
  bindWidget("reveal-dinner", "after-dinner", "reroll", (btn) => {
    const list = window.DINNERLIST || window.FOODLIST || [];
    const out = list.length ? pick(list) : "Add dinnerlist.js (window.DINNERLIST).";
    scrambleTo(btn, String(out), 420);
    showAfter("after-dinner", "Reroll if it’s not speaking to you.");
  });

  // Watch (reroll)
  bindWidget("reveal-watch", "after-watch", "reroll", (btn) => {
    const list = window.WATCHLIST || [];
    if (!list.length){
      btn.textContent = "Add watchlist.js";
      showAfter("after-watch", "No list loaded.");
      return;
    }
    const item = pick(list);
    const title = item.title || "—";
    scrambleTo(btn, title, 420);
    showAfter("after-watch", "Reroll if you hate it.");
  });

  // Fact
  bindWidget("reveal-fact", "after-fact", "oneshot", (btn) => {
    const msg = pick(FACTS);
    scrambleTo(btn, msg, 520);
    showAfter("after-fact", "Do nothing with that. Just keep it.");
  });

  // Joke
  bindWidget("reveal-joke", "after-joke", "oneshot", (btn) => {
    const msg = pick(JOKES);
    scrambleTo(btn, msg, 520);
    showAfter("after-joke", "You’re welcome. I’m sorry.");
  });
});
