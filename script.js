// script.js
window.addEventListener("DOMContentLoaded", () => {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789⌁⟡⟢⌬⟣⟠⟟⟞⌇";

  function isLongText(t){
    const s = String(t || "");
    return s.length > 18 || /\s/.test(s);
  }

  function ensureInner(btn){
    if (!btn.querySelector(".revealInner")) {
      btn.innerHTML = `<span class="revealInner"></span>`;
    }
    return btn.querySelector(".revealInner");
  }

  function setReveal(btn, text){
    const t = String(text);
    const inner = ensureInner(btn);
    inner.textContent = t;

    if (isLongText(t)) btn.classList.add("isLong");
    else btn.classList.remove("isLong");
  }

  function scrambleTo(btn, finalText, ms = 420){
    const target = String(finalText);
    const len = clamp(target.length, 4, 60);
    const steps = 14;
    let i = 0;

    const inner = ensureInner(btn);

    if (isLongText(target)) btn.classList.add("isLong");
    else btn.classList.remove("isLong");

    const timer = setInterval(() => {
      i++;
      const lock = Math.floor((i / steps) * len);
      let out = "";
      for (let k = 0; k < len; k++){
        out += (k < lock) ? (target[k] || "") : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      inner.textContent = out;

      if (i >= steps){
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
    if (!btn) return;

    btn.addEventListener("click", () => {
      if (mode === "oneshot" && btn.disabled) return;
      run(btn);
      if (mode === "oneshot") markDone(btn);
    });
  }

  // -----------------------------
  // DATA
  // -----------------------------

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
    ["Wheel of Fortune","Timing matters."],
    ["The Hermit","Less noise. More signal."],
    ["Justice","Choose what is fair, not fast."],
    ["Strength","Soft control wins."],
    ["The Star","Stay steady. Keep going."]
  ];

  const FACTS = [
    "Honey never spoils.",
    "Octopuses have three hearts.",
    "Bananas are berries.",
    "A day on Venus is longer than a year on Venus.",
    "Some turtles can breathe through their butts."
  ];

  const JOKES = [
    "I tried to read a book on anti-gravity. Couldn’t put it down.",
    "I’m on a whiskey diet. I’ve lost three days.",
    "Parallel lines have so much in common. It’s a shame they’ll never meet.",
    "I told my computer I needed a break. It said: no problem, I’ll go to sleep."
  ];

  // Luck Meter (text only) with weights (center heavy)
  const METER = [
    { t: "Low luck. Keep it simple. Avoid big swings.", w: 6 },
    { t: "Luck levels are low. Double-check everything.", w: 7 },
    { t: "Caution day. Go slow. Choose the sure thing.", w: 9 },
    { t: "Slightly off. Stay steady. No dramatic decisions.", w: 10 },
    { t: "Neutral day. You steer. Consistency wins.", w: 14 },
    { t: "Pretty normal. Make your own luck today.", w: 14 },
    { t: "A bit lucky. Take the easy win when it appears.", w: 12 },
    { t: "Good luck day. Momentum is real. Use it.", w: 9 },
    { t: "Very lucky. Push the good idea forward.", w: 6 },
    { t: "Big luck. Bold moves are oddly welcome.", w: 3 }
  ];

  function weightedPick(items){
    const total = items.reduce((sum, x) => sum + x.w, 0);
    let r = Math.random() * total;
    for (const it of items){
      r -= it.w;
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  }

  // Nice colour (HSL -> HEX)
  function hslToHex(h, s, l){
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2*l - 1)) * s;
    const x = c * (1 - Math.abs((h/60) % 2 - 1));
    const m = l - c/2;
    let r=0,g=0,b=0;

    if (h < 60) { r=c; g=x; b=0; }
    else if (h < 120) { r=x; g=c; b=0; }
    else if (h < 180) { r=0; g=c; b=x; }
    else if (h < 240) { r=0; g=x; b=c; }
    else if (h < 300) { r=x; g=0; b=c; }
    else { r=c; g=0; b=x; }

    const toHex = (v) => Math.round((v+m)*255).toString(16).padStart(2,"0");
    return (`#${toHex(r)}${toHex(g)}${toHex(b)}`).toUpperCase();
  }

  function rollNiceHex(){
    const h = Math.floor(Math.random()*360);
    const s = 72;
    const l = 52;
    return hslToHex(h, s, l);
  }

  function hexToRgb(hex){
    const h = hex.replace("#","");
    const r = parseInt(h.slice(0,2),16);
    const g = parseInt(h.slice(2,4),16);
    const b = parseInt(h.slice(4,6),16);
    return {r,g,b};
  }

  function isDark(hex){
    const {r,g,b} = hexToRgb(hex);
    // perceived luminance
    const lum = (0.2126*r + 0.7152*g + 0.0722*b) / 255;
    return lum < 0.55;
  }

  // -----------------------------
  // BINDS
  // -----------------------------

  bind("reveal-meter","oneshot",(btn)=>{
    const pickOne = weightedPick(METER).t;
    scrambleTo(btn, pickOne);
  });

  bind("reveal-colour","oneshot",(btn)=>{
    const hex = rollNiceHex();

    btn.classList.add("isDone","isColour");
    btn.disabled = true;

    btn.style.background = hex;

    // label in the corner (optional but useful)
    const label = document.createElement("span");
    label.className = "swatchLabel";
    label.textContent = hex;

    const dark = isDark(hex);
    label.style.color = dark ? "#ffffff" : "#0b0d12";
    label.style.borderColor = dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.18)";
    label.style.background = dark ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.45)";

    btn.innerHTML = "";
    btn.appendChild(label);

    // keep typography classing sane
    btn.classList.add("isLong");
  });

  bind("reveal-wisdom","oneshot",(btn)=>{
    scrambleTo(btn, pick(WISDOM));
  });

  bind("reveal-number","oneshot",(btn)=>{
    const n = 1 + Math.floor(Math.random() * 10);
    scrambleTo(btn, n);
  });

  bind("reveal-joke","oneshot",(btn)=>{
    scrambleTo(btn, pick(JOKES));
  });

  bind("reveal-tarot","oneshot",(btn)=>{
    const [card, msg] = pick(TAROT);
    scrambleTo(btn, `${card} — ${msg}`);
  });

  bind("reveal-dinner","reroll",(btn)=>{
    const list = window.DINNERLIST || [];
    const text = list.length ? pick(list) : "Add dinnerlist.js";
    btn.classList.add("isDone");
    btn.disabled = false;
    setReveal(btn, text);
  });

  bind("reveal-watch","reroll",(btn)=>{
    const list = window.WATCHLIST || [];
    let text = "Add watchlist.js";
    if (list.length){
      const item = pick(list);
      text = (typeof item === "string") ? item : (item.title || "—");
    }
    btn.classList.add("isDone");
    btn.disabled = false;
    setReveal(btn, text);
  });

  bind("reveal-fact","oneshot",(btn)=>{
    scrambleTo(btn, pick(FACTS));
  });
});
