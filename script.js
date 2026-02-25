/* Clean widget logic (CSP-safe)
   - Reveal once per widget until refresh
   - Reroll allowed for Dinner + Watch only
   - Uses window.WATCHLIST and window.DINNERLIST (or window.FOODLIST)
*/

window.addEventListener("DOMContentLoaded", () => {
  const $all = (sel) => Array.from(document.querySelectorAll(sel));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // -----------------------------
  // Reference lists
  // -----------------------------
  const WATCH = Array.isArray(window.WATCHLIST) ? window.WATCHLIST : [];
  const DINNER = Array.isArray(window.DINNERLIST)
    ? window.DINNERLIST
    : (Array.isArray(window.FOODLIST) ? window.FOODLIST : []);

  // -----------------------------
  // Built-in content (placeholders, expand anytime)
  // -----------------------------
  const WISDOM = [
    "Proceed gently. Let the day come to you.",
    "Choose one thing. Do it cleanly.",
    "Take the small win. Ignore the noise.",
    "If it’s messy, it’s alive. Keep going.",
    "Say yes to the easy kindness.",
    "You’re allowed to simplify."
  ];

  const JOKES = [
    "I’m not superstitious. I’m just… efficiently cautious.",
    "Today’s forecast: 70% chance of vibes.",
    "If luck calls, I’m sending it to voicemail."
  ];

  const FACTS = [
    "Honey never spoils. (Archaeologists have found edible honey in ancient tombs.)",
    "Octopuses have three hearts.",
    "Bananas are berries. Strawberries aren’t."
  ];

  const PLACES = [
    "Reykjavík, Iceland",
    "Kyoto, Japan",
    "Lisbon, Portugal",
    "Marrakesh, Morocco",
    "Banff, Alberta",
    "Hanoi, Vietnam"
  ];

  const WORDS = [
    { word: "serendipity", def: "finding something good without looking for it" },
    { word: "sonder", def: "realizing others have lives as vivid as yours" },
    { word: "lilt", def: "a light, cheerful rhythm or lift" }
  ];

  const TAROT = [
    "The Fool",
    "The Magician",
    "The High Priestess",
    "The Empress",
    "The Wheel of Fortune",
    "The Star",
    "The Moon"
  ];

  // -----------------------------
  // Colour generator (HSL -> HEX) + ensure difference
  // -----------------------------
  function randLuckyHex() {
    const h = Math.floor(Math.random() * 360);
    const s = 70 + Math.floor(Math.random() * 20);  // 70–89
    const l = 45 + Math.floor(Math.random() * 15);  // 45–59
    return hslToHex(h, s, l);
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }

    const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0").toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function hexToRgb(hex){
    const h = hex.replace("#","");
    return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
  }

  function colorDistance(a,b){
    const A = hexToRgb(a), B = hexToRgb(b);
    return Math.abs(A.r-B.r) + Math.abs(A.g-B.g) + Math.abs(A.b-B.b);
  }

  function pickTwoLuckyHexColors(){
    let c1 = randLuckyHex();
    let c2 = randLuckyHex();
    let tries = 0;
    while (colorDistance(c1, c2) < 140 && tries < 12){
      c2 = randLuckyHex();
      tries++;
    }
    return [c1, c2];
  }

  // -----------------------------
  // Aura score: 0–100 (usually closer to 70)
  // -----------------------------
  function randNormal(mean, sd){
    let u=0, v=0;
    while (u===0) u = Math.random();
    while (v===0) v = Math.random();
    const z = Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
    return mean + z*sd;
  }

  function rollAura(){
    const raw = randNormal(70, 14); // skewed "usually closer to 70"
    return Math.round(clamp(raw, 0, 100));
  }

  function auraAfter(score){
    if (score < 30) return "Low luck. Keep it simple and proceed with caution.";
    if (score < 50) return "Luck is quiet today. Move deliberately.";
    if (score < 70) return "Steady luck. You’ll do fine if you don’t force it.";
    if (score < 85) return "Nice luck. The universe is cooperating.";
    return "Big luck. This is a ‘say yes’ kind of day.";
  }

  // -----------------------------
  // Lucky numbers
  // -----------------------------
  function uniqueInts(count, min, max){
    const set = new Set();
    while (set.size < count){
      const n = min + Math.floor(Math.random() * (max - min + 1));
      set.add(n);
    }
    return Array.from(set);
  }

  // -----------------------------
  // Watch formatting
  // -----------------------------
  function fmtWatch(item){
    if (!item) return "Add watchlist.js (window.WATCHLIST).";
    if (typeof item === "string") return item;
    const title = item.title || "Untitled";
    const metaParts = [];
    if (item.type) metaParts.push(item.type);
    if (item.year) metaParts.push(item.year);
    return metaParts.length ? `${title}  •  ${metaParts.join(" • ")}` : title;
  }

  // -----------------------------
  // Reveal animation helper
  // -----------------------------
  function doReveal(cardEl, revealEl, afterEl, accent, computeResult){
    cardEl.classList.add("isRevealing");

    // Pre-message changes while "revealing"
    revealEl.textContent = "Decoding…";

    // Fade-out to match button colour (subtle): tint the reveal box briefly
    const prevBg = revealEl.style.background;
    const prevColor = revealEl.style.color;

    revealEl.style.background = `linear-gradient(90deg, rgba(255,255,255,0.0), ${accent}33, rgba(255,255,255,0.0))`;

    window.setTimeout(() => {
      const res = computeResult();

      // Allow widget-specific styling
      if (res && typeof res === "object"){
        revealEl.textContent = res.text ?? "";
        if (res.bg !== undefined) revealEl.style.background = res.bg;
        if (res.fg !== undefined) revealEl.style.color = res.fg;
        if (res.after !== undefined){
          afterEl.textContent = res.after;
          afterEl.hidden = false;
        }
      } else {
        revealEl.textContent = String(res ?? "");
      }

      // Clean up reveal state
      cardEl.classList.remove("isRevealing");

      // If widget didn’t override, restore basics after reveal
      if (!res || typeof res !== "object" || res.bg === undefined){
        revealEl.style.background = prevBg;
      }
      if (!res || typeof res !== "object" || res.fg === undefined){
        revealEl.style.color = prevColor;
      }
    }, 560);
  }

  // -----------------------------
  // Wiring widgets
  // -----------------------------
  const rows = $all(".widgetRow");

  rows.forEach((row) => {
    const card = row.querySelector(".widgetCard");
    const btn = row.querySelector('[data-action="reveal"]');
    const revealEl = row.querySelector('[data-field="reveal"]');
    const afterEl = row.querySelector('[data-field="after"]');

    if (!card || !btn || !revealEl || !afterEl) return;

    const lockMode = card.getAttribute("data-lock") || "once";
    let used = false;

    const accent = getComputedStyle(btn).getPropertyValue("--accent").trim() || "#111827";

    btn.addEventListener("click", () => {
      if (lockMode === "once" && used) return;

      const widget = row.getAttribute("data-widget");

      // For once-only widgets, disable until refresh
      if (lockMode === "once"){
        used = true;
        btn.disabled = true;
      }

      // For reroll widgets, keep enabled
      if (lockMode === "reroll"){
        btn.disabled = true; // disable during animation only
      }

      const finish = () => {
        if (lockMode === "reroll"){
          btn.disabled = false;
        }
      };

      doReveal(card, revealEl, afterEl, accent, () => {
        // Default reveal + after
        let out = { text: "", after: "" };

        if (widget === "wisdom"){
          const text = pick(WISDOM);
          out.text = text;
          out.after = "Keep it simple. One good move is enough.";
          return out;
        }

        if (widget === "aura"){
          const score = rollAura();
          out.text = `${score}%`;
          out.after = auraAfter(score);
          return out;
        }

        if (widget === "colors"){
          const [c1, c2] = pickTwoLuckyHexColors();
          out.text = " ";
          out.bg = `linear-gradient(90deg, ${c1}, ${c2})`;
          out.fg = "transparent";
          out.after = `${c1} & ${c2}`;
          return out;
        }

        if (widget === "numbers"){
          const small = 1 + Math.floor(Math.random() * 10);
          const lotto = uniqueInts(6, 1, 49).sort((a,b)=>a-b);
          out.text = `${small}  •  ${lotto.join(", ")}`;
          out.after = "Notice the small number. Use the rest only if you must.";
          return out;
        }

        if (widget === "dinner"){
          const list = DINNER;
          const pickItem = list.length ? pick(list) : "Add dinnerlist.js (window.DINNERLIST).";
          out.text = typeof pickItem === "string" ? pickItem : (pickItem.title || "—");
          out.after = "Commit for tonight. Reroll only if you’re truly stuck.";
          window.setTimeout(finish, 0);
          return out;
        }

        if (widget === "watch"){
          const list = WATCH;
          const pickItem = list.length ? pick(list) : null;
          out.text = pickItem ? fmtWatch(pickItem) : "Add watchlist.js (window.WATCHLIST).";
          out.after = "Pick one. Start it. No browsing.";
          window.setTimeout(finish, 0);
          return out;
        }

        if (widget === "joke"){
          out.text = pick(JOKES);
          out.after = "If it’s bad, blame the machine.";
          return out;
        }

        if (widget === "fact"){
          out.text = pick(FACTS);
          out.after = "Use this knowledge irresponsibly.";
          return out;
        }

        if (widget === "place"){
          out.text = pick(PLACES);
          out.after = "Look it up later. Or just daydream.";
          return out;
        }

        if (widget === "word"){
          const w = pick(WORDS);
          out.text = `${w.word}: ${w.def}`;
          out.after = "Try to spot it today. Or slip it into a sentence.";
          return out;
        }

        if (widget === "tarot"){
          out.text = pick(TAROT);
          out.after = "No interpretation provided. That’s your job.";
          return out;
        }

        return out;
      });

      // Re-enable reroll after animation delay
      if (lockMode === "reroll"){
        window.setTimeout(() => {
          btn.disabled = false;
        }, 620);
      }
    });
  });
});
