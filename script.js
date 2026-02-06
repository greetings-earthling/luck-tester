// script.js
(function () {
  "use strict";

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");

  const spinBtn = document.getElementById("spinBtn");
  const shareBtn = document.getElementById("shareBtn");
  const shareHint = document.getElementById("shareHint");

  const resultTitle = document.getElementById("resultTitle");
  const resultText = document.getElementById("resultText");

  const luckyNumberEl = document.getElementById("luckyNumber");
  const luckyLetterEl = document.getElementById("luckyLetter");
  const colorSwatch = document.getElementById("colorSwatch");
  const colorName = document.getElementById("colorName");
  const colorHex = document.getElementById("colorHex");
  const emojiOfDayEl = document.getElementById("emojiOfDay");
  const dinnerEl = document.getElementById("dinnerSuggestion");
  const leftRightEl = document.getElementById("leftRight");
  const fortuneEl = document.getElementById("fortuneText");

  // 16 slices total:
  // 1 MEGA, 3 SUPER, 6 A BIT, 6 NOT MUCH
  // Pointer is at 12 o'clock. We choose a target slice and rotate wheel so it lands there.

  const slices = shuffle([
    { tier: "MEGA", label: "MEGA LUCKY", icon: "🍀", color: "rgba(85,190,10,0.95)" },

    { tier: "SUPER", label: "SUPER LUCKY", icon: "✨", color: "rgba(85,190,10,0.75)" },
    { tier: "SUPER", label: "SUPER LUCKY", icon: "🌟", color: "rgba(85,190,10,0.75)" },
    { tier: "SUPER", label: "SUPER LUCKY", icon: "🎯", color: "rgba(85,190,10,0.75)" },

    { tier: "BIT", label: "A BIT LUCKY", icon: "🙂", color: "rgba(85,190,10,0.45)" },
    { tier: "BIT", label: "A BIT LUCKY", icon: "🧲", color: "rgba(85,190,10,0.45)" },
    { tier: "BIT", label: "A BIT LUCKY", icon: "🪙", color: "rgba(85,190,10,0.45)" },
    { tier: "BIT", label: "A BIT LUCKY", icon: "🧠", color: "rgba(85,190,10,0.45)" },
    { tier: "BIT", label: "A BIT LUCKY", icon: "🪴", color: "rgba(85,190,10,0.45)" },
    { tier: "BIT", label: "A BIT LUCKY", icon: "☀️", color: "rgba(85,190,10,0.45)" },

    { tier: "NONE", label: "NOT MUCH LUCK", icon: "😐", color: "rgba(0,0,0,0.06)" },
    { tier: "NONE", label: "NOT MUCH LUCK", icon: "🧊", color: "rgba(0,0,0,0.06)" },
    { tier: "NONE", label: "NOT MUCH LUCK", icon: "🙃", color: "rgba(0,0,0,0.06)" },
    { tier: "NONE", label: "NOT MUCH LUCK", icon: "😮‍💨", color: "rgba(0,0,0,0.06)" },
    { tier: "NONE", label: "NOT MUCH LUCK", icon: "🫠", color: "rgba(0,0,0,0.06)" },
    { tier: "NONE", label: "NOT MUCH LUCK", icon: "🤷", color: "rgba(0,0,0,0.06)" },
  ]);

  const sliceCount = slices.length;
  const sliceAngle = (Math.PI * 2) / sliceCount;

  // Wheel rotation state (radians)
  let angle = 0;
  let spinning = false;
  let landedIndex = null;

  // Extras locked after spin
  let extras = null;

  // Resize canvas for crispness
  function fitCanvas() {
    const cssSize = Math.min(520, canvas.parentElement.clientWidth);
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.style.width = cssSize + "px";
    canvas.style.height = cssSize + "px";
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawWheel();
  }

  window.addEventListener("resize", fitCanvas);

  function drawWheel() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 8;

    ctx.clearRect(0, 0, w, h);

    // Outer shadow ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fill();

    // Slices
    for (let i = 0; i < sliceCount; i++) {
      const start = angle + i * sliceAngle - Math.PI / 2;
      const end = start + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = slices[i].color;
      ctx.fill();

      // Slice divider
      ctx.strokeStyle = "rgba(17,17,17,0.10)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Icon + label
      const mid = (start + end) / 2;
      const iconRadius = r * 0.68;
      const textRadius = r * 0.80;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);

      // Icon
      ctx.font = "26px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(17,17,17,0.92)";
      ctx.fillText(slices[i].icon, iconRadius, 0);

      // Short label
      ctx.font = "800 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillStyle = "rgba(17,17,17,0.86)";
      ctx.fillText(shortLabel(slices[i].tier), textRadius, 0);

      ctx.restore();
    }

    // Center cap
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "rgba(17,17,17,0.10)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "900 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillStyle = "rgba(17,17,17,0.90)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);
  }

  function shortLabel(tier) {
    if (tier === "MEGA") return "MEGA";
    if (tier === "SUPER") return "SUPER";
    if (tier === "BIT") return "A BIT";
    return "NONE";
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function randInt(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
  }

  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  function randLetter(){
    return String.fromCharCode(65 + randInt(0, 25));
  }

  function buildExtras() {
    const colors = [
      { name: "Lucky Green", hex: "#55be0a" },
      { name: "Grape", hex: "#875da6" },
      { name: "Sky", hex: "#5aa9e6" },
      { name: "Sun", hex: "#ffcc33" },
      { name: "Rose", hex: "#ff5d8f" },
      { name: "Teal", hex: "#14b8a6" },
      { name: "Tangerine", hex: "#ff7a00" },
      { name: "Midnight", hex: "#111827" }
    ];

    const dinners = [
      "Tacos",
      "Pasta",
      "Burgers",
      "Stir fry",
      "Pizza",
      "Soup and grilled cheese",
      "Breakfast for dinner",
      "Sushi"
    ];

    const emojis = ["✨","🍀","🧠","🔥","🧊","🎯","🧲","🌊","🛠️","🎧","📚","🧃","🌞","🌙","🧭","🪴"];

    const fortunes = [
      "Small wins count. Collect them.",
      "A simple choice will lead to a better outcome.",
      "Today rewards steady effort, not perfect effort.",
      "Your timing is better than you think.",
      "A tiny risk brings a useful result.",
      "An unexpected message improves your day.",
      "Be curious. Curiosity is lucky.",
      "Make space. Luck likes room to land.",
      "You will notice something you usually miss.",
      "One good decision beats ten good intentions.",
      "Your next step is smaller than you fear.",
      "Your luck improves when you move first."
    ];

    return {
      number: String(randInt(0, 9)),
      letter: randLetter(),
      color: pick(colors),
      emoji: pick(emojis),
      dinner: pick(dinners),
      leftRight: Math.random() < 0.5 ? "LEFT" : "RIGHT",
      fortune: pick(fortunes),
    };
  }

  function applyExtras() {
    luckyNumberEl.textContent = extras.number;
    luckyLetterEl.textContent = extras.letter;

    colorSwatch.style.background = extras.color.hex;
    colorName.textContent = extras.color.name;
    colorHex.textContent = extras.color.hex.toLowerCase();

    emojiOfDayEl.textContent = extras.emoji;
    dinnerEl.textContent = extras.dinner;
    leftRightEl.textContent = extras.leftRight;

    fortuneEl.textContent = extras.fortune;
  }

  function labelAndMessage(tier) {
    if (tier === "MEGA") {
      return {
        title: "MEGA LUCKY DAY",
        text: "Big tailwind energy. If you have a move to make, today is friendly."
      };
    }
    if (tier === "SUPER") {
      return {
        title: "SUPER LUCKY DAY",
        text: "Nice timing ahead. Expect at least one thing to go your way."
      };
    }
    if (tier === "BIT") {
      return {
        title: "A BIT LUCKY",
        text: "Small wins are on the menu. Keep it simple and take the openings."
      };
    }
    return {
      title: "NOT MUCH LUCK TODAY",
      text: "Totally fine. Keep stakes low, stay loose, and make your own luck."
    };
  }

  function shareText() {
    const s = slices[landedIndex];
    const lm = labelAndMessage(s.tier);
    const url = window.location.href;
    return [
      `The Official Luck Meter says: ${lm.title} ${s.icon}`,
      lm.text,
      `Try yours: ${url}`
    ].join("\n");
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }

  function spinToIndex(targetIndex) {
    spinning = true;
    spinBtn.disabled = true;
    shareBtn.disabled = true;
    shareHint.textContent = "";

    // We want the target slice midpoint to land at pointer angle (12 o'clock).
    // Pointer is at -90deg in our draw (we subtract PI/2). We can solve by rotating wheel.
    const targetMid = (targetIndex + 0.5) * sliceAngle;
    const pointerAngle = 0; // because our slice start is angle + i*sliceAngle - PI/2, and pointer is at top
    // We want: angle + targetMid == pointerAngle + 2PI*k
    // So: angle == -targetMid + 2PI*k
    const current = angle % (Math.PI * 2);

    // Add multiple full spins for drama
    const spins = 6 + Math.floor(Math.random() * 4); // 6-9
    const desired = -targetMid + spins * Math.PI * 2;

    const start = current;
    const end = desired;

    const duration = 2400;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const e = easeOutCubic(t);
      angle = start + (end - start) * e;
      drawWheel();

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        spinning = false;
        angle = end;
        drawWheel();

        landedIndex = targetIndex;
        const s = slices[landedIndex];
        const lm = labelAndMessage(s.tier);

        resultTitle.textContent = `${lm.title} ${s.icon}`;
        resultText.textContent = lm.text;

        extras = buildExtras();
        applyExtras();

        shareBtn.disabled = false;
        spinBtn.disabled = false;
      }
    }

    requestAnimationFrame(tick);
  }

  spinBtn.addEventListener("click", () => {
    if (spinning) return;

    // Weighted distribution already baked into slices array
    const idx = Math.floor(Math.random() * sliceCount);
    spinToIndex(idx);
  });

  shareBtn.addEventListener("click", async () => {
    if (landedIndex === null) return;
    shareHint.textContent = "";

    try {
      const ok = await copyToClipboard(shareText());
      shareHint.textContent = ok ? "Copied. Paste it anywhere." : "Could not auto-copy.";
    } catch {
      shareHint.textContent = "Could not auto-copy.";
    }
  });

  // Init
  fitCanvas();
})();
