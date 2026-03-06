window.addEventListener("DOMContentLoaded", () => {
  const FX_SRC = "./ads/Smoke.mp4";

  const SMOKE_FADE_START = 1500;
  const SMOKE_FADE_MS = 1000;
  const TEXT_START_MS = 2000;
  const TEXT_FADE_MS = 1500;
  const TOTAL_MS = 3500;
  const STEP_GAP_MS = 520;
  const STEP_FADE_MS = 220;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const PALETTES = {
    "reveal-meter":  [135, 155, 285],
    "reveal-wisdom": [250, 275, 205],
    "reveal-number": [35, 15, 300],
    "reveal-colour": null,
    "reveal-joke":   [320, 285, 205],
    "reveal-dinner": [24, 10, 300],
    "reveal-watch":  [210, 235, 190],
    "reveal-fact":   [265, 285, 160]
  };

  const WISDOM = [
    "Earthlings are. Today: Breathe in. Be present. Let go.",
    "Earthlings wonder. Today: Stay curious. Get lost. Learn forever.",
    "Earthlings care. Today: Be gentle. Stay brave. Lead with love.",
    "Earthlings dare. Today: Be bold. Be true. Be whole.",
    "Earthlings create. Today: Make beauty. Share truth. Leave traces.",
    "Earthlings grow. Today: Let go. Adapt. Begin again.",
    "Earthlings belong. Today: Welcome others. Make space. Stay open.",
    "Earthlings tend. Today: Share. Be the person you once needed.",
    "Earthlings laugh. Today: Spread joy. Don’t take things so seriously.",
    "Earthlings marvel. Today: Let wonder guide you. Be grateful."
  ];

  const METER = [
    { t: "Luck is low today. Move slowly and choose carefully.", w: 7 },
    { t: "Luck is quiet. Patience will serve you well.", w: 9 },
    { t: "Luck is soft today. Small steps are wiser than big ones.", w: 12 },
    { t: "Luck is uncertain. Stay steady and trust simple choices.", w: 14 },
    { t: "Luck is balanced today. Your choices shape the outcome.", w: 20 },
    { t: "Luck is steady. Consistent effort will carry you forward.", w: 20 },
    { t: "Luck is leaning your way today. Try the good idea.", w: 16 },
    { t: "Luck is strong. Progress comes easier today.", w: 12 },
    { t: "Luck is very strong today. Trust your instincts.", w: 7 },
    { t: "Luck is powerful today. A bold step may be rewarded.", w: 3 },
    { t: "Luck is overflowing today. Doors may open where none stood before.", w: 1 },
    { t: "The universe is strangely aligned today. A rare stroke of luck may appear.", w: 1 },
    { t: "Cosmic glitch detected. Luck levels are behaving unpredictably.", w: 2 },
    { t: "The universe shrugged today. Anything could happen.", w: 2 },
    { t: "Luck is gathering around you. Pay attention to small opportunities.", w: 5 },
    { t: "Luck moves quietly today. The right choice may be subtle.", w: 6 },
    { t: "Luck favours the curious today. Follow an interesting path.", w: 5 },
    { t: "Luck is turning in your direction. A good moment may arrive.", w: 4 },
    { t: "A gentle current of luck is present today. Go with the flow.", w: 5 }
  ];

  function isLongText(t){
    const s = String(t || "");
    return s.length > 18 || /\s/.test(s);
  }

  function ensureInner(btn){
    let inner = btn.querySelector(".revealInner");
    if (!inner){
      const desktop = btn.dataset.label || "Tap to reveal";
      const mobile = btn.dataset.labelMobile || "Tap to reveal";

      btn.innerHTML = `
        <span class="revealInner">
          <span class="tapDesktop">${desktop}</span>
          <span class="tapMobile">${mobile}</span>
        </span>
      `;
      inner = btn.querySelector(".revealInner");
    }
    return inner;
  }

  function ensureFX(btn){
    let video = btn.querySelector(".fxVideo");
    if (!video){
      video = document.createElement("video");
      video.className = "fxVideo";
      video.src = FX_SRC;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.preload = "auto";
      video.autoplay = false;
      video.loop = false;
      video.controls = false;
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

  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const hsla = (h, a) => `hsla(${h}, 85%, 58%, ${a})`;

  function buildTintGradient(hues){
    const [h1, h2, h3] = hues;
    const blobs = [
      { h:h1, x:rint(18,82), y:rint(18,82), a:0.55, s:rint(40,78) },
      { h:h2, x:rint(18,82), y:rint(18,82), a:0.50, s:rint(38,74) },
      { h:h3, x:rint(18,82), y:rint(18,82), a:0.50, s:rint(36,72) },
      { h:h1, x:rint(18,82), y:rint(18,82), a:0.35, s:rint(45,85) }
    ];

    return blobs.map(b =>
      `radial-gradient(${b.s}% ${b.s}% at ${b.x}% ${b.y}%,
        ${hsla(b.h, b.a)} 0%,
        rgba(0,0,0,0) 64%)`
    ).join(", ");
  }

  function weightedPick(items){
    const total = items.reduce((sum, x) => sum + x.w, 0);
    let r = Math.random() * total;
    for (const it of items){
      r -= it.w;
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  }

  function hslToHex(h, s, l){
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
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

  function rollNiceHex(){
    const h = Math.floor(Math.random() * 360);
    return hslToHex(h, 72, 52);
  }

  function hexToRgb(hex){
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }

  function isDark(hex){
    const { r, g, b } = hexToRgb(hex);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum < 0.55;
  }

  function startSequence(btn, finalText, mode){
    if (btn.classList.contains("isBusy")) return;
    if (mode === "oneshot" && btn.classList.contains("isDone")) return;

    btn.classList.add("isBusy", "isRevealing");
    btn.classList.remove("isDone", "isLong", "isColour");

    const inner = ensureInner(btn);
    const { video, tint } = ensureFX(btn);

    inner.style.transition = "none";
    inner.style.opacity = "0";
    inner.textContent = "";

    const isSteps = finalText && typeof finalText === "object" && Array.isArray(finalText.steps);
    const steps = isSteps ? finalText.steps.map(s => String(s)) : null;
    const text = isSteps ? steps.join(" - ") : String(finalText);

    if (isLongText(text)) btn.classList.add("isLong");

    btn.style.background = "#0b0d12";
    btn.style.color = "#ffffff";

    const hues = PALETTES[btn.id] ?? [260, 290, 180];
    if (hues){
      tint.style.display = "block";
      tint.style.backgroundImage = buildTintGradient(hues);
      tint.style.opacity = "0.55";
    } else {
      tint.style.display = "none";
      tint.style.opacity = "0";
      tint.style.backgroundImage = "none";
    }

    video.style.display = "block";
    video.style.transition = "none";
    tint.style.transition = "none";
    video.style.opacity = "1";

    try { video.pause(); } catch(e){}
    try { video.load(); } catch(e){}
    requestAnimationFrame(() => { video.play().catch(() => {}); });

    setTimeout(() => {
      video.style.transition = `opacity ${SMOKE_FADE_MS}ms ease`;
      tint.style.transition = `opacity ${SMOKE_FADE_MS}ms ease`;
      video.style.opacity = "0";
      tint.style.opacity = "0";

      setTimeout(() => {
        video.style.display = "none";
        tint.style.display = "none";
      }, SMOKE_FADE_MS + 30);
    }, SMOKE_FADE_START);

    function stepSwap(innerEl, nextText){
      innerEl.style.transition = `opacity ${STEP_FADE_MS}ms ease`;
      innerEl.style.opacity = "0";
      setTimeout(() => {
        innerEl.textContent = nextText;
        requestAnimationFrame(() => {
          innerEl.style.transition = `opacity ${STEP_FADE_MS}ms ease`;
          innerEl.style.opacity = "1";
        });
      }, STEP_FADE_MS);
    }

    setTimeout(() => {
      btn.classList.add("isDone");
      btn.classList.remove("isRevealing");
      btn.style.background = "var(--brand)";
      btn.style.color = "#ffffff";

      if (btn.dataset.kind === "colour" && btn.dataset.hex){
        const hex = btn.dataset.hex;
        btn.classList.add("isColour", "isLong");
        btn.style.backgroundColor = hex;

        const label = document.createElement("span");
        label.className = "swatchLabel";
        label.textContent = hex;

        const dark = isDark(hex);
        label.style.color = dark ? "#ffffff" : "#0b0d12";
        label.style.borderColor = dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.18)";
        label.style.background = dark ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.45)";

        btn.innerHTML = "";
        btn.appendChild(label);

        label.style.opacity = "0";
        label.style.transition = `opacity ${TEXT_FADE_MS}ms ease`;
        requestAnimationFrame(() => { label.style.opacity = "1"; });
      } else {
        inner.style.transition = `opacity ${TEXT_FADE_MS}ms ease`;
        inner.style.opacity = "0";
        inner.textContent = "";

        requestAnimationFrame(() => {
          inner.style.transition = `opacity ${TEXT_FADE_MS}ms ease`;
          inner.style.opacity = "1";
        });

        if (steps){
          inner.textContent = steps[0];
          for (let i = 1; i < steps.length; i++){
            setTimeout(() => {
              stepSwap(inner, steps.slice(0, i + 1).join(" - "));
            }, i * STEP_GAP_MS);
          }
        } else {
          inner.textContent = text;
        }
      }
    }, TEXT_START_MS);

    setTimeout(() => {
      btn.classList.remove("isBusy");
      btn.disabled = (mode === "oneshot");
      btn.dataset.kind = "";
      btn.dataset.hex = "";
    }, TOTAL_MS);
  }

  function bind(id, mode, getText){
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.disabled = false;
    ensureInner(btn);
    ensureFX(btn);

    btn.addEventListener("click", () => {
      const text = getText(btn);
      startSequence(btn, text, mode);
    });
  }

  bind("reveal-meter", "oneshot", () => weightedPick(METER).t);

  bind("reveal-colour", "oneshot", (btn) => {
    const hex = rollNiceHex();
    btn.dataset.kind = "colour";
    btn.dataset.hex = hex;
    return hex;
  });

  bind("reveal-wisdom", "oneshot", () => pick(WISDOM));
  bind("reveal-number", "oneshot", () => String(1 + Math.floor(Math.random() * 9)));

  bind("reveal-joke", "oneshot", () => {
    const list = window.JOKES || [];
    return list.length ? pick(list) : "Add jokes.js";
  });

  bind("reveal-dinner", "reroll", () => {
    const list = window.DINNERLIST || [];
    return list.length ? pick(list) : "Add dinnerlist.js";
  });

  bind("reveal-watch", "reroll", () => {
    const list = window.WATCHLIST || [];
    if (!list.length) return "Add watchlist.js";
    const item = pick(list);
    return (item && item.type && item.year)
      ? `${item.title} (${item.year}) — ${item.type}`
      : (item.title || "Watch something good.");
  });

  bind("reveal-fact", "oneshot", () => {
    const list = window.FUNFACTS || [];
    return list.length ? pick(list) : "Add funfacts.js";
  });
});
