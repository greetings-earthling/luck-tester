(function () {
  const luckOptions = [
    {
      tier: "MEGA",
      name: "MEGA LUCKY DAY",
      icon: "🍀",
      colorClass: "mega",
      mantra: "Green light. Go.",
      text: "Luck is on your side today. If you’ve been waiting for a sign, this is it."
    },
    {
      tier: "SUPER",
      name: "SUPER LUCKY DAY",
      icon: "✨",
      colorClass: "super",
      mantra: "Timing is your friend.",
      text: "Expect at least one weirdly perfect moment. Say yes to the easy opening."
    },
    {
      tier: "BIT",
      name: "A BIT LUCKY",
      icon: "🙂",
      colorClass: "bit",
      mantra: "Small wins count.",
      text: "Not magic, but smoother than average. Keep things simple and you’ll notice it."
    },
    {
      tier: "NONE",
      name: "MAKE YOUR OWN LUCK DAY",
      icon: "😐",
      colorClass: "none",
      mantra: "No tailwind today. That’s fine.",
      text: "Keep stakes low, avoid relying on luck, and manufacture your own good breaks."
    }
  ];

  // Weighted distribution to match your ask:
  // 1 lucky, 3 super, 6 a bit, 6 none = 16 total
  const weighted = [
    "MEGA",
    "SUPER","SUPER","SUPER",
    "BIT","BIT","BIT","BIT","BIT","BIT",
    "NONE","NONE","NONE","NONE","NONE","NONE"
  ];

  const slotName = document.getElementById("slot-name");
  const slotIcon = document.getElementById("slot-icon");
  const slotMantra = document.getElementById("slot-mantra");
  const slotDetail = document.getElementById("slot-text-detail");
  const status = document.getElementById("slot-status");
  const spinBtn = document.getElementById("spin-btn");

  const shareBtn = document.getElementById("shareBtn");
  const shareHint = document.getElementById("shareHint");

  const luckyNumberEl = document.getElementById("luckyNumber");
  const luckyLetterEl = document.getElementById("luckyLetter");
  const colorSwatch = document.getElementById("colorSwatch");
  const colorName = document.getElementById("colorName");
  const colorHex = document.getElementById("colorHex");
  const emojiOfDayEl = document.getElementById("emojiOfDay");
  const dinnerEl = document.getElementById("dinnerSuggestion");
  const leftRightEl = document.getElementById("leftRight");
  const fortuneEl = document.getElementById("fortuneText");

  const revealables = Array.from(document.querySelectorAll(".revealable"));

  let spinning = false;
  let finalChoice = null;
  let extras = null;

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randInt(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
  }

  function randLetter(){
    return String.fromCharCode(65 + randInt(0, 25));
  }

  function buildExtras() {
    const colors = [
      { name: "Lucky Green", hex: "#55be0a" },
      { name: "Grape", hex: "#885DA7" },
      { name: "Sky", hex: "#5aa9e6" },
      { name: "Sun", hex: "#ffcc33" },
      { name: "Rose", hex: "#ff5d8f" },
      { name: "Teal", hex: "#14b8a6" },
      { name: "Tangerine", hex: "#ff7a00" },
      { name: "Midnight", hex: "#111827" }
    ];

    const emojis = ["✨","🍀","🧠","🔥","🧊","🎯","🧲","🌊","🛠️","🎧","📚","🧃","🌞","🌙","🧭","🪴","🫠","🤝","🧘","🚀"];

    const dinners = [
      "Tacos",
      "Pasta",
      "Burgers",
      "Stir fry",
      "Pizza",
      "Soup and grilled cheese",
      "Breakfast for dinner",
      "Sushi",
      "Chicken bowls",
      "Wraps and fries"
    ];

    const fortunes = [
      "Small wins count. Collect them.",
      "Your timing is better than you think.",
      "One good decision beats ten good intentions.",
      "Make space. Luck likes room to land.",
      "A helpful person appears at the right time.",
      "Say it plainly. Plain words are lucky.",
      "Today rewards steady effort, not perfect effort.",
      "Curiosity is a form of luck."
    ];

    return {
      number: String(randInt(0, 9)),
      letter: randLetter(),
      color: pick(colors),
      emoji: pick(emojis),
      dinner: pick(dinners),
      leftRight: Math.random() < 0.5 ? "LEFT" : "RIGHT",
      fortune: pick(fortunes)
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

    revealables.forEach((el, i) => {
      setTimeout(() => el.classList.add("revealed"), 80 + i * 60);
    });
  }

  function optionByTier(tier) {
    return luckOptions.find(x => x.tier === tier);
  }

  function consultFate() {
    const tier = pick(weighted);
    return optionByTier(tier);
  }

  function shareText() {
    const url = window.location.href;
    return [
      `The Official Luck Meter says: ${finalChoice.name} ${finalChoice.icon}`,
      finalChoice.text,
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

  function clearContent() {
    slotMantra.textContent = "";
    slotDetail.textContent = "";
    shareHint.textContent = "";
  }

  function showResult(choice) {
    slotIcon.textContent = choice.icon;
    slotName.textContent = choice.name;
    slotMantra.textContent = choice.mantra;
    slotDetail.textContent = choice.text;

    status.textContent = "Transmission received.";
    shareBtn.disabled = false;
  }

  spinBtn.addEventListener("click", function () {
    if (spinning) return;

    spinning = true;
    spinBtn.disabled = true;
    shareBtn.disabled = true;
    status.textContent = "Consulting the cosmos…";
    clearContent();

    // Pre-spin: cycle through tiers, like a slot machine
    const steps = randInt(22, 34);
    let delay = 35;
    const delayIncrease = 7;
    let step = 0;

    let tempIndex = randInt(0, luckOptions.length - 1);

    // Decide final result up front
    finalChoice = consultFate();

    function tick() {
      tempIndex = (tempIndex + 1) % luckOptions.length;
      const current = luckOptions[tempIndex];

      slotIcon.textContent = current.icon;
      slotName.textContent = current.name;

      // tiny jitter
      const jig = step % 2 === 0 ? "translateY(1px)" : "translateY(-1px)";
      slotName.style.transform = jig;

      step++;
      if (step < steps) {
        delay += delayIncrease;
        setTimeout(tick, delay);
      } else {
        slotName.style.transform = "translateY(0)";
        showResult(finalChoice);

        // Build + reveal extras and fortune after a beat
        extras = buildExtras();
        setTimeout(() => applyExtras(), 250);

        spinning = false;
        spinBtn.disabled = false;
        spinBtn.textContent = "Spin again";
      }
    }

    tick();
  });

  shareBtn.addEventListener("click", async () => {
    if (!finalChoice) return;

    shareHint.textContent = "";
    try {
      const ok = await copyToClipboard(shareText());
      shareHint.textContent = ok ? "Copied. Paste it anywhere." : "Could not auto-copy.";
    } catch {
      shareHint.textContent = "Could not auto-copy.";
    }
  });

})();
