window.addEventListener("DOMContentLoaded", () => {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789⌁⟡⟢⌬⟣⟠⟟⟞⌇";

  function isLongText(t){
    const s = String(t || "");
    return s.length > 18 || /\s/.test(s);
  }

  function ensureInner(btn){
    let inner = btn.querySelector(".revealInner");
    if(!inner){
      btn.innerHTML = `<span class="revealInner"></span>`;
      inner = btn.querySelector(".revealInner");
    }
    return inner;
  }

  function setRevealContent(btn, text){
    const t = String(text ?? "");
    const inner = ensureInner(btn);
    inner.textContent = t;

    if (isLongText(t)) btn.classList.add("isLong");
    else btn.classList.remove("isLong");
  }

  function scrambleTo(btn, finalText, ms=420){
    const target = String(finalText);
    const len = clamp(target.length, 4, 40);
    const steps = 14;

    const inner = ensureInner(btn);

    if (isLongText(target)) btn.classList.add("isLong");
    else btn.classList.remove("isLong");

    let i = 0;
    const timer = setInterval(() => {
      i++;
      const lock = Math.floor((i / steps) * len);

      let out = "";
      for (let k = 0; k < len; k++) {
        out += (k < lock) ? (target[k] || "") : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }

      inner.textContent = out;

      if (i >= steps) {
        clearInterval(timer);
        inner.textContent = target;
      }
    }, ms / steps);
  }

  function markDone(btn){
    btn.classList.add("isDone");
    btn.disabled = true;
  }

  function bind(id, mode, run){
    const btn = document.getElementById(id);
    if(!btn) return;

    btn.addEventListener("click", () => {
      // oneshot: ignore if already disabled
      if (mode === "oneshot" && btn.disabled) return;

      run(btn);

      if (mode === "oneshot") markDone(btn);
      if (mode === "reroll") btn.classList.add("isDone"); // style it, but keep enabled
    });
  }

  /* DATA */
  const WISDOM = [
    "Proceed. But do not rush.",
    "Choose the calm option.",
    "One useful move is enough.",
    "Take the obvious win.",
    "Quiet beats loud today."
  ];

  const TAROT = [
    ["The Fool","Start. Learn by moving."],
    ["The Sun","Say yes to what is simple."],
    ["The Magician","Use what you have."],
    ["Wheel of Fortune","Timing matters."]
  ];

  const FACTS = [
    "Honey never spoils.",
    "Octopuses have three hearts.",
    "Bananas are berries."
  ];

  const JOKES = [
    "I tried to read a book on anti-gravity. Couldn’t put it down.",
    "I’m on a whiskey diet. I’ve lost three days."
  ];

  function rollAura(){
    const mean = 70, sd = 14;
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return Math.round(clamp(mean + z * sd, 0, 100));
  }

  function auraLine(p){
    if (p <= 45) return "Low luck. Proceed with caution.";
    if (p <= 65) return "Neutral luck. You steer.";
    return "High luck. Take the easy wins.";
  }

  function rollNiceHex(){
    const h = Math.floor(Math.random() * 360);
    const s = 70, l = 55;

    const sat = s / 100;
    const lig = l / 100;
    const c = (1 - Math.abs(2 * lig - 1)) * sat;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = lig - c / 2;

    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  /* WIDGETS */
  bind("reveal-number","oneshot",(btn)=>{
    const n = 1 + Math.floor(Math.random() * 10);
    btn.classList.add("isDone");
    scrambleTo(btn, n);
    setAfter("after-number", "Notice it today.");
  });

  bind("reveal-letter","oneshot",(btn)=>{
    const l = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    btn.classList.add("isDone");
    scrambleTo(btn, l);
    setAfter("after-letter", "Watch for it.");
  });

bind("reveal-colours","oneshot",(btn)=>{
  const colour = rollNiceHex();

  btn.classList.add("colourFill","isDone");
  btn.disabled = true;

  // fill background
  btn.style.background = colour;

  // auto contrast
  const r = parseInt(colour.substr(1,2),16);
  const g = parseInt(colour.substr(3,2),16);
  const b = parseInt(colour.substr(5,2),16);

  const brightness = (r*299 + g*587 + b*114) / 1000;
  btn.style.color = brightness > 160 ? "#0b0d12" : "#ffffff";

  setRevealContent(btn, colour);

  setAfter("after-colours", "Use it for a choice.");
});

  bind("reveal-aura","oneshot",(btn)=>{
    const p = rollAura();
    btn.classList.add("isDone");
    scrambleTo(btn, `${p}%`);
    setAfter("after-aura", auraLine(p));
  });

  bind("reveal-wisdom","oneshot",(btn)=>{
    const msg = pick(WISDOM);
    btn.classList.add("isDone");
    scrambleTo(btn, msg);
    setAfter("after-wisdom", "One sentence. One move.");
  });

  bind("reveal-tarot","oneshot",(btn)=>{
    const [card, msg] = pick(TAROT);
    btn.classList.add("isDone");
    scrambleTo(btn, card);
    setAfter("after-tarot", msg);
  });

  bind("reveal-dinner","reroll",(btn)=>{
    const list = window.DINNERLIST || [];
    const text = list.length ? pick(list) : "Add dinnerlist.js";
    setRevealContent(btn, text);
    btn.classList.add("isDone");
    setAfter("after-dinner", "");
  });

  bind("reveal-watch","reroll",(btn)=>{
    const list = window.WATCHLIST || [];
    const text = list.length ? (pick(list).title || "—") : "Add watchlist.js";
    setRevealContent(btn, text);
    btn.classList.add("isDone");
    setAfter("after-watch", "");
  });

  bind("reveal-fact","oneshot",(btn)=>{
    btn.classList.add("isDone");
    scrambleTo(btn, pick(FACTS));
    setAfter("after-fact", "");
  });

  bind("reveal-joke","oneshot",(btn)=>{
    btn.classList.add("isDone");
    scrambleTo(btn, pick(JOKES));
    setAfter("after-joke", "");
  });
});
