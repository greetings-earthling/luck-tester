// script.js
window.addEventListener("DOMContentLoaded", () => {
  const FX_SRC = "./ads/Smoke.mp4";

  // Timing
  const SMOKE_ONLY_MS = 1500;   // 0–1.5s smoke only
  const SMOKE_FADE_MS = 800;    // fade duration
  const TEXT_FADE_MS  = 1400;   // text fade in
  const TEXT_START_MS = 2000;   // start fading in text
  const DONE_MS       = 3500;   // lock end

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // -----------------------------
  // Helpers
  // -----------------------------

  function ensureInner(btn) {
    let inner = btn.querySelector(".revealInner");
    if (!inner) {
      btn.innerHTML = `<span class="revealInner">TAP TO REVEAL</span>`;
      inner = btn.querySelector(".revealInner");
    }
    return inner;
  }

  function ensureFX(btn) {
    // video
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

    // tint overlay
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
    return `hsl(${h}, 45%, 55%)`;
  }

  function isLongText(t) {
    const s = String(t || "");
    return s.length > 18;
  }

  function setText(btn, text) {
    const inner = ensureInner(btn);
    inner.textContent = String(text);

    if (isLongText(text)) btn.classList.add("isLong");
    else btn.classList.remove("isLong");
  }

  function markDone(btn) {
    btn.classList.add("isDone");
    btn.disabled = true;
  }

  function startSequence(btn, getFinalText) {
    const inner = ensureInner(btn);
    const { video, tint } = ensureFX(btn);

    // prevent double-click during sequence
    if (btn.classList.contains("isBusy")) return;
    btn.classList.add("isBusy");

    // hide "tap to reveal" immediately
    inner.style.opacity = "0";
    inner.style.transition = "none";

    // go black under smoke
    btn.style.background = "#0b0d12";

    // reset video/tint
    video.pause();
    video.currentTime = 0;
    video.style.opacity = "1";
    video.style.transition = "none";

    tint.style.background = randomSubtleTint();
    tint.style.opacity = "0.35";
    tint.style.transition = "none";

    // start smoke
    video.play().catch(() => {});

    // set the final text while smoke is up (still hidden)
    const finalText = getFinalText();
    setText(btn, finalText);

    // fade smoke and tint out
    setTimeout(() => {
      video.style.transition = `opacity ${SMOKE_FADE_MS}ms ease`;
      tint.style.transition = `opacity ${SMOKE_FADE_MS}ms ease`;
      video.style.opacity = "0";
      tint.style.opacity = "0";
    }, SMOKE_ONLY_MS);

    // fade text in
    setTimeout(() => {
      inner.style.transition = `opacity ${TEXT_FADE_MS}ms ease`;
      inner.style.opacity = "1";
    }, TEXT_START_MS);

    // finish
    setTimeout(() => {
      btn.classList.remove("isBusy");
    }, DONE_MS);
  }

  function bind(id, mode, getFinalText) {
    const btn = document.getElementById(id);
    if (!btn) return;

    ensureInner(btn);
    ensureFX(btn);

    btn.addEventListener("click", () => {
      if (mode === "oneshot" && btn.classList.contains("isDone")) return;

      startSequence(btn, () => getFinalText(btn));

      // lock oneshot after click
      if (mode === "oneshot") {
        // lock visually immediately, but keep smoke running
        btn.classList.add("isDone");
        markDone(btn);
      } else {
        // reroll stays clickable
        btn.classList.add("isDone");
        btn.disabled = false;
      }
    });
  }

  // -----------------------------
  // Data
  // -----------------------------

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

  // colour (single)
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h < 60)      { r = c; g = x; b = 0; }
    else if (h < 120){ r = x; g = c; b = 0; }
    else if (h < 180){ r = 0; g = c; b = x; }
    else if (h < 240){ r = 0; g = x; b = c; }
    else if (h < 300){ r = x; g = 0; b = c; }
    else             { r = c; g = 0; b = x; }

    const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return (`#${toHex(r)}${toHex(g)}${toHex(b)}`).toUpperCase();
  }

  function rollNiceHex() {
    const h = Math.floor(Math.random() * 360);
    return hslToHex(h, 72, 52);
  }

  // -----------------------------
  // Binds
  // -----------------------------

  bind("reveal-meter", "oneshot", () => weightedPick(METER));

  bind("reveal-colour", "oneshot", (btn) => {
    const hex = rollNiceHex();
    btn.classList.add("isColour");
    btn.style.background = hex;
    return hex;
  });

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
});
