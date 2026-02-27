// script.js (FULL REPLACE)
window.addEventListener("DOMContentLoaded", () => {
  const FX_SRC = "./ads/Smoke.mp4";

  // Timing
  const SMOKE_ONLY_MS = 1500;     // 0–1.5s: smoke only
  const SMOKE_FADE_START = 1500;  // start fading smoke
  const TEXT_START_MS = 2000;     // start revealing text
  const TEXT_FADE_MS = 1500;      // text fades in over this
  const SEQ_END_MS = 3500;        // cleanup

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ---------- Per-widget palettes (B: defined, but varied) ----------
  // Each palette: [base, secondary, accent]
  const PALETTES = {
    "reveal-meter":  ["hsl(138,78%,52%)", "hsl(160,70%,38%)", "hsl(280,75%,60%)"],
    "reveal-wisdom": ["hsl(248,82%,62%)", "hsl(270,78%,50%)", "hsl(200,85%,60%)"],
    "reveal-number": ["hsl(40,92%,56%)",  "hsl(18,88%,52%)",  "hsl(300,80%,60%)"],
    "reveal-colour": null, // no tint, keep smoke greyscale
    "reveal-joke":   ["hsl(320,85%,62%)", "hsl(290,80%,52%)", "hsl(200,85%,60%)"],
    "reveal-tarot":  ["hsl(190,80%,55%)", "hsl(165,70%,45%)", "hsl(275,78%,60%)"],
    "reveal-dinner": ["hsl(24,90%,56%)",  "hsl(10,85%,50%)",  "hsl(300,80%,60%)"],
    "reveal-watch":  ["hsl(210,85%,60%)", "hsl(235,80%,55%)", "hsl(190,80%,55%)"],
    "reveal-fact":   ["hsl(265,85%,62%)", "hsl(285,78%,52%)", "hsl(160,70%,45%)"],
  };

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
  function rand(a,b){ return a + Math.random()*(b-a); }
  function rint(a,b){ return Math.floor(rand(a,b+1)); }

  function ensureInner(btn){
    if (!btn.querySelector(".revealInner")){
      btn.innerHTML = `<span class="revealInner">TAP TO REVEAL</span>`;
    }
    return btn.querySelector(".revealInner");
  }

  function ensureFX(btn){
    let video = btn.querySelector(".fxVideo");
    if (!video){
      video = document.createElement("video");
      video.className = "fxVideo";
      video.src = FX_SRC;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      btn.insertBefore(video, btn.firstChild);
    }

    let tint = btn.querySelector(".fxTint");
    if (!tint){
      tint = document.createElement("div");
      tint.className = "fxTint";
      btn.insertBefore(tint, video.nextSibling);
    }

    return { video, tint };
  }

  function buildTintGradient(palette){
    // palette = [base, secondary, accent]
    const [a, b, c] = palette;

    // random “crystal ball” pockets
    const x1 = rint(10, 90);
    const y1 = rint(10, 90);
    const x2 = rint(10, 90);
    const y2 = rint(10, 90);
    const x3 = rint(10, 90);
    const y3 = rint(10, 90);

    const r1 = rint(35, 70);
    const r2 = rint(30, 65);
    const r3 = rint(25, 60);

    // layered radials + a soft base wash
    return `
      radial-gradient(${r1}% ${r1}% at ${x1}% ${y1}%,
        ${a} 0%,
        rgba(0,0,0,0) 60%),
      radial-gradient(${r2}% ${r2}% at ${x2}% ${y2}%,
        ${b} 0%,
        rgba(0,0,0,0) 62%),
      radial-gradient(${r3}% ${r3}% at ${x3}% ${y3}%,
        ${c} 0%,
        rgba(0,0,0,0) 65%),
      radial-gradient(90% 90% at 50% 50%,
        rgba(255,255,255,.06) 0%,
        rgba(0,0,0,0) 70%)
    `.trim();
  }

  function isLongText(t){
    const s = String(t || "");
    return s.length > 18 || /\s/.test(s);
  }

  function setFinalText(btn, text){
    const inner = ensureInner(btn);
    inner.textContent = String(text);

    if (isLongText(text)) btn.classList.add("isLong");
    else btn.classList.remove("isLong");
  }

  function startSequence(btn, getFinalText){
    const id = btn.id;
    const inner = ensureInner(btn);
    const { video, tint } = ensureFX(btn);

    // Reset state
    btn.classList.remove("isDone", "showText");
    btn.classList.add("isRevealing");
    btn.style.background = "#0b0d12";

    // Hide TAP text immediately
    inner.textContent = "";
    inner.style.transition = `opacity ${TEXT_FADE_MS}ms ease`;
    inner.style.opacity = "0";

    // Video on
    video.style.transition = "none";
    tint.style.transition = "none";
    video.style.opacity = "1";

    // Tint setup
    const palette = PALETTES[id] || PALETTES["reveal-meter"];
    if (palette){
      tint.style.backgroundImage = buildTintGradient(palette);
      tint.style.opacity = "0.42";
    } else {
      tint.style.backgroundImage = "none";
      tint.style.opacity = "0";
    }

    // Restart video
    try {
      video.pause();
      video.currentTime = 0;
    } catch (e) {}
    video.play().catch(() => {});

    // Fade smoke + tint out
    setTimeout(() => {
      video.style.transition = `opacity ${SMOKE_FADE_MS}ms ease`;
      tint.style.transition  = `opacity ${SMOKE_FADE_MS}ms ease`;
      video.style.opacity = "0";
      tint.style.opacity  = "0";
    }, SMOKE_FADE_START);

    // Reveal text (no scramble, but fade in)
    setTimeout(() => {
      const finalText = getFinalText();
      setFinalText(btn, finalText);

      btn.classList.add("isDone", "showText");
      inner.style.opacity = "1";
    }, TEXT_START_MS);

    // Cleanup
    setTimeout(() => {
      btn.classList.remove("isRevealing");
    }, SEQ_END_MS);
  }

  function bind(id, mode, getFinalText){
    const btn = document.getElementById(id);
    if (!btn) return;

    ensureInner(btn);
    ensureFX(btn);

    // Set correct default copy per button label
    // If your HTML already has TAP TO SPIN, keep it.
    if (!btn.querySelector(".revealInner")){
      btn.innerHTML = `<span class="revealInner">${btn.textContent.trim() || "TAP TO REVEAL"}</span>`;
    }

    btn.addEventListener("click", () => {
      if (mode === "oneshot" && btn.disabled) return;

      // oneshot: lock after click (but only after sequence ends)
      if (mode === "oneshot") btn.disabled = true;

      startSequence(btn, getFinalText);

      // reroll: re-enable after sequence
      if (mode === "reroll"){
        setTimeout(() => { btn.disabled = false; }, SEQ_END_MS);
      }
    });
  }

  // ---------- DATA ----------
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
      if (r <= 0) return it.t;
    }
    return items[items.length - 1].t;
  }

  // ---------- BINDS ----------
  bind("reveal-meter", "oneshot", () => weightedPick(METER));
  bind("reveal-colour","oneshot", () => ""); // your colour button likely has special logic elsewhere. Leave blank here if you want.
  bind("reveal-wisdom","oneshot", () => pick(WISDOM));
  bind("reveal-number","oneshot", () => String(1 + Math.floor(Math.random() * 10)));
  bind("reveal-joke",  "oneshot", () => pick(JOKES));
  bind("reveal-tarot", "oneshot", () => {
    const [card, msg] = pick(TAROT);
    return `${card}. ${msg}`;
  });
  bind("reveal-fact",  "oneshot", () => pick(FACTS));

  // If these exist on your page, they will work.
  bind("reveal-dinner","reroll", () => {
    const list = window.DINNERLIST || [];
    return list.length ? pick(list) : "Add dinnerlist.js";
  });

  bind("reveal-watch","reroll", () => {
    const list = window.WATCHLIST || [];
    if (!list.length) return "Add watchlist.js";
    const item = pick(list);
    return (typeof item === "string") ? item : (item.title || "—");
  });
});
