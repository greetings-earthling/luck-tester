// script.js
window.addEventListener("DOMContentLoaded", () => {
  const FX_SRC = "./ads/Smoke.mp4";

  // Timing
  const SMOKE_ONLY_MS = 1500;   // smoke only
  const SMOKE_FADE_MS = 900;    // fade smoke/tint
  const TEXT_START_MS = 2000;   // start text fade in
  const TEXT_FADE_MS  = 1400;   // text fade in duration
  const DONE_MS       = 3500;   // total sequence end

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function ensureInner(btn) {
    let inner = btn.querySelector(".revealInner");
    if (!inner) {
      btn.innerHTML = `<span class="revealInner">TAP TO REVEAL</span>`;
      inner = btn.querySelector(".revealInner");
    }
    // if empty for any reason, restore
    if (!inner.textContent.trim()) inner.textContent = "TAP TO REVEAL";
    return inner;
  }

  function ensureFX(btn) {
    let video = btn.querySelector(".fxVideo");
    if (!video) {
      video = document.createElement("video");
      video.className = "fxVideo";
      video.src = FX_SRC;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      btn.insertBefore(video, btn.firstChild);
    }

    let tint = btn.querySelector(".fxTint");
    if (!tint) {
      tint = document.createElement("div");
      tint.className = "fxTint";
      btn.insertBefore(tint, video.nextSibling);
    }

    return { video, tint };
  }

  function randomSubtleTint() {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}, 55%, 60%)`;
  }

  function isLongText(t) {
    return String(t || "").length > 18;
  }

  function setFinalText(btn, text) {
    const t = String(text);
    const inner = ensureInner(btn);
    inner.textContent = t;

    if (isLongText(t)) btn.classList.add("isLong");
    else btn.classList.remove("isLong");
  }

  function startSequence(btn, getFinalText, mode) {
    if (btn.classList.contains("isBusy")) return;
    btn.classList.add("isBusy");

    const { video, tint } = ensureFX(btn);
    ensureInner(btn);

    // Immediately go black under smoke
    btn.classList.add("isDone");

    // Reset layers
    video.pause();
    video.currentTime = 0;
    video.style.transition = "none";
    video.style.opacity = "1";

    tint.style.background = randomSubtleTint();
    tint.style.transition = "none";
    tint.style.opacity = "0.35";

    // Show smoke immediately
    video.style.opacity = "1";
    tint.style.opacity = "0.35";
    video.play().catch(() => {});

    // Compute final text while smoke runs (still hidden because .isBusy)
    setFinalText(btn, getFinalText(btn));

    // Fade smoke/tint out
    setTimeout(() => {
      video.style.transition = `opacity ${SMOKE_FADE_MS}ms ease`;
      tint.style.transition  = `opacity ${SMOKE_FADE_MS}ms ease`;
      video.style.opacity = "0";
      tint.style.opacity  = "0";
    }, SMOKE_ONLY_MS);

    // Fade text in by removing isBusy
    setTimeout(() => {
      const inner = btn.querySelector(".revealInner");
      if (inner) {
        inner.style.transition = `opacity ${TEXT_FADE_MS}ms ease`;
      }
      btn.classList.remove("isBusy");
    }, TEXT_START_MS);

    // Lock oneshot after done
    setTimeout(() => {
      if (mode === "oneshot") {
        btn.disabled = true;
      } else {
        btn.disabled = false;
      }
    }, DONE_MS);
  }

  function bind(id, mode, getFinalText) {
    const btn = document.getElementById(id);
    if (!btn) return;

    ensureInner(btn);
    ensureFX(btn);

    btn.addEventListener("click", () => {
      if (mode === "oneshot" && btn.disabled) return;
      startSequence(btn, getFinalText, mode);
    });
  }

  // DATA
  const WISDOM = [
    "Proceed. But do not rush.",
    "Choose the calm option.",
    "One useful move is enough.",
    "Take the obvious win.",
    "Quiet beats loud today."
  ];

  const JOKES = [
    "Parallel lines have so much in common. It’s a shame they’ll never meet.",
    "I tried to read a book on anti-gravity. Couldn’t put it down.",
    "I told my computer I needed a break. It said: no problem, I’ll go to sleep."
  ];

  const FACTS = [
    "Honey never spoils.",
    "Octopuses have three hearts.",
    "A day on Venus is longer than a year on Venus."
  ];

  const TAROT = [
    ["The Fool", "Start. Learn by moving."],
    ["The Sun", "Say yes to what is simple."],
    ["Wheel of Fortune", "Timing matters."],
    ["The Hermit", "Less noise. More signal."]
  ];

  const METER = [
    { t: "Luck is low. Keep it simple. Avoid big swings.", w: 7 },
    { t: "Caution day. Go slow. Choose the sure thing.", w: 10 },
    { t: "Pretty normal. Make your own luck today.", w: 16 },
    { t: "A bit lucky. Take the easy win when it appears.", w: 13 },
    { t: "Good luck day. Momentum is real. Use it.", w: 9 },
    { t: "Very lucky. Push the good idea forward.", w: 5 }
  ];

  function weightedPick(items) {
    const total = items.reduce((sum, x) => sum + x.w, 0);
    let r = Math.random() * total;
    for (const it of items) {
      r -= it.w;
      if (r <= 0) return it.t;
    }
    return items[items.length - 1].t;
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2*l - 1)) * s;
    const x = c * (1 - Math.abs((h/60) % 2 - 1));
    const m = l - c/2;
    let r=0,g=0,b=0;
    if (h < 60) { r=c; g=x; }
    else if (h < 120) { r=x; g=c; }
    else if (h < 180) { g=c; b=x; }
    else if (h < 240) { g=x; b=c; }
    else if (h < 300) { r=x; b=c; }
    else { r=c; b=x; }
    const toHex = (v) => Math.round((v+m)*255).toString(16).padStart(2,"0");
    return (`#${toHex(r)}${toHex(g)}${toHex(b)}`).toUpperCase();
  }

  function rollNiceHex() {
    const h = Math.floor(Math.random() * 360);
    return hslToHex(h, 72, 52);
  }

  // BINDS
  bind("reveal-meter", "oneshot", () => weightedPick(METER));
  bind("reveal-wisdom", "oneshot", () => pick(WISDOM));
  bind("reveal-number", "oneshot", () => String(1 + Math.floor(Math.random() * 10)));
  bind("reveal-joke", "oneshot", () => pick(JOKES));
  bind("reveal-tarot", "oneshot", () => {
    const [card, msg] = pick(TAROT);
    return `${card}. ${msg}`;
  });
  bind("reveal-dinner", "reroll", () => {
    const list = window.DINNERLIST || [];
    return list.length ? pick(list) : "Add dinnerlist.js";
  });
  bind("reveal-watch", "reroll", () => {
    const list = window.WATCHLIST || [];
    if (!list.length) return "Add watchlist.js";
    const item = pick(list);
    return (typeof item === "string") ? item : (item.title || "—");
  });
  bind("reveal-fact", "oneshot", () => pick(FACTS));

  // Colour (if you still have this widget id)
  const colourBtn = document.getElementById("reveal-colour");
  if (colourBtn) {
    bind("reveal-colour", "oneshot", (btn) => {
      const hex = rollNiceHex();
      btn.style.background = hex;
      return hex;
    });
  }
});
