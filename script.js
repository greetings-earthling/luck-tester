(function () {
  // ---------- Pools ----------
  const decidePool = [
    { main: "YES", sub: "You already know the answer. This is permission." },
    { main: "NO", sub: "Not now. Save your energy for the right door." },
    { main: "MAYBE", sub: "Gather one more detail, then decide fast." },
    { main: "DO IT", sub: "A clean swing. No overthinking allowed." },
    { main: "WAIT", sub: "Not forever. Just long enough to be sure." },
    { main: "ASK AGAIN TOMORROW", sub: "Today is noisy. Tomorrow is clearer." }
  ];

  // Classic plus modern, mixed
  const eightBallPool = [
    { main: "It is certain.", sub: "The cosmos is confident." },
    { main: "Without a doubt.", sub: "This one is a yes." },
    { main: "Reply hazy.", sub: "Try again after coffee." },
    { main: "Ask again later.", sub: "The universe is buffering." },
    { main: "Better not tell you now.", sub: "Mystery adds flavour." },
    { main: "Don’t count on it.", sub: "Not this time." },
    { main: "My sources say no.", sub: "Gentle no, but still no." },
    { main: "Outlook not so good.", sub: "Protect your time." },
    { main: "Signs point to yes.", sub: "Lean into it." },
    { main: "Yes.", sub: "Simple. Clean. Done." }
  ];

  const focusPool = [
    { main: "One small win", sub: "Pick something tiny and finish it." },
    { main: "Clarity", sub: "Remove one source of noise." },
    { main: "Momentum", sub: "Start before you feel ready." },
    { main: "Connection", sub: "Text someone. No agenda." },
    { main: "Care", sub: "Do one kind thing for future you." },
    { main: "Curiosity", sub: "Follow the interesting thread." }
  ];

  // Keep small for now. We can expand later.
  const watchPool = [
    { title: "The Bear", note: "Sharp, stressful, great." },
    { title: "Severance", note: "Beautiful weirdness." },
    { title: "The Matrix", note: "Classic reset." },
    { title: "Hot Fuzz", note: "Comedy comfort." },
    { title: "True Detective (S1)", note: "Heavy, but elite." },
    { title: "Chef", note: "Pure good vibes." },
    { title: "Arrival", note: "Quiet, smart, emotional." },
    { title: "Parks and Rec", note: "Easy win." }
  ];

  const dinnerPool = [
    { title: "Tacos", note: "Store-bought counts." },
    { title: "Pasta", note: "One pan sauce. Done." },
    { title: "Burgers", note: "Smash style if you can." },
    { title: "Stir fry", note: "Fridge clean-out edition." },
    { title: "Pizza", note: "Frozen is allowed." },
    { title: "Soup + grilled cheese", note: "Comfort guaranteed." },
    { title: "Breakfast for dinner", note: "Eggs solve problems." },
    { title: "Wraps", note: "Anything tastes better wrapped." }
  ];

  // ---------- Slot animation ----------
  function randInt(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
  }

  function pick(arr){
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function spinText(elMain, elSub, pool, getMain, getSub, finalItem, done) {
    const steps = randInt(20, 34);
    let delay = 28;
    const delayInc = 7;

    let i = randInt(0, pool.length - 1);
    let step = 0;

    function tick(){
      i = (i + 1) % pool.length;
      const item = pool[i];

      elMain.textContent = getMain(item);
      if (elSub) elSub.textContent = getSub ? getSub(item) : "";

      elMain.style.transform = step % 2 === 0 ? "translateY(1px)" : "translateY(-1px)";
      step++;

      if (step < steps) {
        delay += delayInc;
        setTimeout(tick, delay);
      } else {
        elMain.style.transform = "translateY(0)";
        elMain.textContent = getMain(finalItem);
        if (elSub) elSub.textContent = getSub ? getSub(finalItem) : "";
        done();
      }
    }

    tick();
  }

  function disableButtons(scope, disabled){
    scope.querySelectorAll('button[data-action="spin"]').forEach(b => b.disabled = disabled);
  }

  // ---------- Card logic ----------
  const usedOnce = new Set();

  function setStatus(key, text){
    const el = document.querySelector(`[data-status="${key}Status"]`);
    if (el) el.textContent = text;
  }

  // Prompts selection for 8 ball
  const promptChips = Array.from(document.querySelectorAll('.chip[data-prompt]'));
  const eightPromptEl = document.querySelector('[data-out="eightPrompt"]');
  const eightPromptLabel = document.querySelector('[data-out="eightPromptLabel"]');
  let selectedPrompt = "";

  function setPrompt(p){
    selectedPrompt = p;
    eightPromptLabel.textContent = "Prompt";
    eightPromptEl.textContent = p;
    promptChips.forEach(c => c.classList.toggle("active", c.getAttribute("data-prompt") === p));
  }

  if (promptChips.length) {
    setPrompt(promptChips[0].getAttribute("data-prompt"));
    promptChips.forEach(chip => {
      chip.addEventListener("click", () => setPrompt(chip.getAttribute("data-prompt")));
    });
  }

  // ---------- Spins ----------
  function spinDecide(card){
    const key = "decide";
    if (usedOnce.has(key)) {
      setStatus(key, "That’s the answer. Walk it off.");
      return;
    }

    const mainEl = document.querySelector('[data-out="decideMain"]');
    const subEl = document.querySelector('[data-out="decideSub"]');

    const final = pick(decidePool);

    disableButtons(card, true);
    setStatus(key, "Consulting the cosmos…");

    spinText(mainEl, subEl, decidePool, x => x.main, x => x.sub, final, () => {
      usedOnce.add(key);
      setStatus(key, "Locked in. No take-backs.");
      disableButtons(card, false);
      // keep button enabled but it will refuse politely next time
    });
  }

  function spinEight(card){
    const key = "eight";
    if (usedOnce.has(key)) {
      setStatus(key, "The ball has spoken. Sit with it.");
      return;
    }

    const mainEl = document.querySelector('[data-out="eightMain"]');
    const subEl = document.querySelector('[data-out="eightSub"]');

    const final = pick(eightBallPool);

    disableButtons(card, true);
    setStatus(key, "Shaking the void…");

    // Make sure prompt exists
    if (!selectedPrompt) setPrompt("Should I do the thing?");

    spinText(mainEl, subEl, eightBallPool, x => x.main, x => x.sub, final, () => {
      usedOnce.add(key);
      setStatus(key, "Answer delivered. No refunds.");
      disableButtons(card, false);
    });
  }

  function spinFocus(card){
    const key = "focus";
    if (usedOnce.has(key)) {
      setStatus(key, "You already have your focus.");
      return;
    }

    const mainEl = document.querySelector('[data-out="focusMain"]');
    const subEl = document.querySelector('[data-out="focusSub"]');

    const final = pick(focusPool);

    disableButtons(card, true);
    setStatus(key, "Dialing in…");

    spinText(mainEl, subEl, focusPool, x => x.main, x => x.sub, final, () => {
      usedOnce.add(key);
      setStatus(key, "Keep it simple. Do that.");
      disableButtons(card, false);
    });
  }

  function spinWatch(card){
    const key = "watch";
    const mainEl = document.querySelector('[data-out="watchMain"]');
    const subEl = document.querySelector('[data-out="watchSub"]');

    const final = pick(watchPool);

    disableButtons(card, true);
    setStatus(key, "Rolling credits…");

    spinText(
      mainEl,
      subEl,
      watchPool,
      x => x.title,
      x => x.note,
      final,
      () => {
        setStatus(key, "You can reroll. But will you?");
        disableButtons(card, false);
      }
    );
  }

  function spinDinner(card){
    const key = "dinner";
    const mainEl = document.querySelector('[data-out="dinnerMain"]');
    const subEl = document.querySelector('[data-out="dinnerSub"]');

    const final = pick(dinnerPool);

    disableButtons(card, true);
    setStatus(key, "Summoning snacks…");

    spinText(
      mainEl,
      subEl,
      dinnerPool,
      x => x.title,
      x => x.note,
      final,
      () => {
        setStatus(key, "Reroll if you must.");
        disableButtons(card, false);
      }
    );
  }

  // ---------- Button wiring ----------
  document.querySelectorAll('button[data-action="spin"]').forEach(btn => {
    const target = btn.getAttribute("data-target");
    btn.addEventListener("click", () => {
      const card = document.querySelector(`.ballot[data-card="${target}"]`);
      if (!card) return;

      if (target === "decide") return spinDecide(card);
      if (target === "eight") return spinEight(card);
      if (target === "focus") return spinFocus(card);
      if (target === "watch") return spinWatch(card);
      if (target === "dinner") return spinDinner(card);
    });
  });

})();
