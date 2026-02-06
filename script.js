(function () {
  // ---- Luck Meter options ----
  const luckOptions = [
    {
      tier: "MEGA",
      name: "MEGA LUCKY DAY",
      icon: "🍀",
      mantra: "Green light. Go.",
      text: "Luck is on your side today. Take the shot you’ve been hesitating on."
    },
    {
      tier: "SUPER",
      name: "SUPER LUCKY DAY",
      icon: "✨",
      mantra: "Timing is your friend.",
      text: "Expect at least one perfectly timed break. Say yes to the easy opening."
    },
    {
      tier: "BIT",
      name: "A BIT LUCKY",
      icon: "🙂",
      mantra: "Small wins count.",
      text: "Not magic, but smoother than average. Keep it simple and you’ll notice it."
    },
    {
      tier: "NONE",
      name: "MAKE YOUR OWN LUCK DAY",
      icon: "🧱",
      mantra: "No tailwind today. That’s fine.",
      text: "Keep stakes low and manufacture your own good breaks. Momentum beats luck."
    }
  ];

  // Weighted distribution: 16 total
  // 1 MEGA, 3 SUPER, 6 BIT, 6 NONE
  const luckWeighted = [
    "MEGA",
    "SUPER","SUPER","SUPER",
    "BIT","BIT","BIT","BIT","BIT","BIT",
    "NONE","NONE","NONE","NONE","NONE","NONE"
  ];

  // ---- Data pools ----
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

  const emojis = ["✨","🍀","🧠","🔥","🧊","🎯","🧲","🌊","🛠️","🎧","📚","🧃","🌞","🌙","🧭","🪴","🤝","🧘","🚀","🧩"];

  const dinners = [
    { name: "Tacos", detail: "Keep it easy. Store-bought shells counts." },
    { name: "Pasta", detail: "One pan sauce. You’re done in 20 minutes." },
    { name: "Burgers", detail: "Smash style. Minimal effort, maximum reward." },
    { name: "Stir fry", detail: "Whatever is in the fridge. That’s the recipe." },
    { name: "Pizza", detail: "Frozen is allowed. Add a topping and call it a win." },
    { name: "Soup + grilled cheese", detail: "Comfort food that never fails." },
    { name: "Breakfast for dinner", detail: "Eggs solve problems." },
    { name: "Sushi", detail: "Takeout night. Treat yourself." },
    { name: "Chicken bowls", detail: "Rice, protein, sauce. Repeat forever." },
    { name: "Wraps", detail: "Anything tastes better wrapped." }
  ];

  const fortunes = [
    "Small wins count. Collect them.",
    "Your timing is better than you think.",
    "One good decision beats ten good intentions.",
    "Make space. Luck likes room to land.",
    "A helpful person appears at the right time.",
    "Say it plainly. Plain words are lucky.",
    "Curiosity is a form of luck.",
    "Today rewards steady effort, not perfect effort.",
    "You will notice something you usually miss.",
    "The simplest option is the lucky one."
  ];

  // ---- Slot spin utility ----
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randInt(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
  }

  function randLetter(){
    return String.fromCharCode(65 + randInt(0, 25));
  }

  function findLuckByTier(tier){
    return luckOptions.find(x => x.tier === tier) || luckOptions[2];
  }

  function spinText(el, items, getText, done) {
    // Slot-machine-ish: quick ticks then slow down
    const minSteps = 18;
    const maxSteps = 30;
    const totalSteps = randInt(minSteps, maxSteps);

    let delay = 30;
    const delayIncrease = 6;

    let step = 0;
    let index = randInt(0, items.length - 1);

    function tick() {
      index = (index + 1) % items.length;
      el.textContent = getText(items[index]);

      // tiny oscillation
      el.style.transform = step % 2 === 0 ? "translateY(1px)" : "translateY(-1px)";
      step++;

      if (step < totalSteps) {
        delay += delayIncrease;
        setTimeout(tick, delay);
      } else {
        el.style.transform = "translateY(0)";
        done(items[index]);
      }
    }

    tick();
  }

  // ---- DOM bindings ----
  const outs = {
    luckIcon: document.querySelector('[data-out="luckIcon"]'),
    luckName: document.querySelector('[data-out="luckName"]'),
    luckMantra: document.querySelector('[data-out="luckMantra"]'),
    luckText: document.querySelector('[data-out="luckText"]'),

    numberValue: document.querySelector('[data-out="numberValue"]'),
    letterValue: document.querySelector('[data-out="letterValue"]'),

    colorSwatch: document.querySelector('[data-out="colorSwatch"]'),
    colorName: document.querySelector('[data-out="colorName"]'),
    colorHex: document.querySelector('[data-out="colorHex"]'),

    emojiValue: document.querySelector('[data-out="emojiValue"]'),

    fortuneValue: document.querySelector('[data-out="fortuneValue"]'),

    dinnerValue: document.querySelector('[data-out="dinnerValue"]'),
    dinnerDetail: document.querySelector('[data-out="dinnerDetail"]'),

    lrValue: document.querySelector('[data-out="lrValue"]')
  };

  const statuses = {
    luck: document.querySelector('[data-status="luckStatus"]'),
    number: document.querySelector('[data-status="numberStatus"]'),
    letter: document.querySelector('[data-status="letterStatus"]'),
    color: document.querySelector('[data-status="colorStatus"]'),
    emoji: document.querySelector('[data-status="emojiStatus"]'),
    fortune: document.querySelector('[data-status="fortuneStatus"]'),
    dinner: document.querySelector('[data-status="dinnerStatus"]'),
    lr: document.querySelector('[data-status="lrStatus"]')
  };

  const spinButtons = Array.from(document.querySelectorAll("[data-spin]"));
  const spinning = new Set();

  function setStatus(key, msg){
    if (statuses[key]) statuses[key].textContent = msg;
  }

  function disableBtn(btn, disabled){
    btn.disabled = disabled;
  }

  // ---- Spin handlers ----
  function spinLuck(btn){
    if (spinning.has("luck")) return;
    spinning.add("luck");
    disableBtn(btn, true);

    setStatus("luck", "Consulting the cosmos…");
    outs.luckMantra.textContent = "";
    outs.luckText.textContent = "";

    // Preselect result
    const tier = pick(luckWeighted);
    const final = findLuckByTier(tier);

    // We spin the NAME only, then reveal icon/mantra/text
    const nameEl = outs.luckName;
    const iconEl = outs.luckIcon;

    spinText(nameEl, luckOptions, x => x.name, () => {
      iconEl.textContent = final.icon;
      nameEl.textContent = final.name;
      outs.luckMantra.textContent = final.mantra;
      outs.luckText.textContent = final.text;
      setStatus("luck", "Transmission received.");
      spinning.delete("luck");
      disableBtn(btn, false);
    });
  }

  function spinNumber(btn){
    if (spinning.has("number")) return;
    spinning.add("number");
    disableBtn(btn, true);

    setStatus("number", "Spinning…");
    const pool = Array.from({length:10}, (_,i)=>String(i));
    spinText(outs.numberValue, pool, x => x, (final) => {
      outs.numberValue.textContent = final;
      setStatus("number", "Locked in.");
      spinning.delete("number");
      disableBtn(btn, false);
    });
  }

  function spinLetter(btn){
    if (spinning.has("letter")) return;
    spinning.add("letter");
    disableBtn(btn, true);

    setStatus("letter", "Spinning…");
    const pool = Array.from({length:26}, (_,i)=>String.fromCharCode(65+i));
    spinText(outs.letterValue, pool, x => x, (final) => {
      outs.letterValue.textContent = final;
      setStatus("letter", "Locked in.");
      spinning.delete("letter");
      disableBtn(btn, false);
    });
  }

  function spinColor(btn){
    if (spinning.has("color")) return;
    spinning.add("color");
    disableBtn(btn, true);

    setStatus("color", "Spinning…");
    // Spin the name as the visible ticker
    spinText(outs.colorName, colors, x => x.name, (final) => {
      outs.colorName.textContent = final.name;
      outs.colorHex.textContent = final.hex.toLowerCase();
      outs.colorSwatch.style.background = final.hex;
      setStatus("color", "Locked in.");
      spinning.delete("color");
      disableBtn(btn, false);
    });
  }

  function spinEmoji(btn){
    if (spinning.has("emoji")) return;
    spinning.add("emoji");
    disableBtn(btn, true);

    setStatus("emoji", "Spinning…");
    spinText(outs.emojiValue, emojis, x => x, (final) => {
      outs.emojiValue.textContent = final;
      setStatus("emoji", "Locked in.");
      spinning.delete("emoji");
      disableBtn(btn, false);
    });
  }

  function spinFortune(btn){
    if (spinning.has("fortune")) return;
    spinning.add("fortune");
    disableBtn(btn, true);

    setStatus("fortune", "Cracking the cookie…");
    // Spin shortened fortune previews for effect
    const pool = fortunes.slice();
    spinText(outs.fortuneValue, pool, x => x, (final) => {
      outs.fortuneValue.textContent = final;
      setStatus("fortune", "Received.");
      spinning.delete("fortune");
      disableBtn(btn, false);
    });
  }

  function spinDinner(btn){
    if (spinning.has("dinner")) return;
    spinning.add("dinner");
    disableBtn(btn, true);

    setStatus("dinner", "Spinning…");
    spinText(outs.dinnerValue, dinners, x => x.name, (final) => {
      outs.dinnerValue.textContent = final.name;
      outs.dinnerDetail.textContent = final.detail;
      setStatus("dinner", "Locked in.");
      spinning.delete("dinner");
      disableBtn(btn, false);
    });
  }

  function spinLR(btn){
    if (spinning.has("lr")) return;
    spinning.add("lr");
    disableBtn(btn, true);

    setStatus("lr", "Spinning…");
    const pool = ["LEFT", "RIGHT"];
    spinText(outs.lrValue, pool, x => x, (final) => {
      outs.lrValue.textContent = final;
      setStatus("lr", "Locked in.");
      spinning.delete("lr");
      disableBtn(btn, false);
    });
  }

  // ---- Wire buttons ----
  spinButtons.forEach(btn => {
    const key = btn.getAttribute("data-spin");
    btn.addEventListener("click", () => {
      if (key === "luck") return spinLuck(btn);
      if (key === "number") return spinNumber(btn);
      if (key === "letter") return spinLetter(btn);
      if (key === "color") return spinColor(btn);
      if (key === "emoji") return spinEmoji(btn);
      if (key === "fortune") return spinFortune(btn);
      if (key === "dinner") return spinDinner(btn);
      if (key === "lr") return spinLR(btn);
    });
  });

})();
