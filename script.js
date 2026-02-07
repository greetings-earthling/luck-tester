(function () {
  "use strict";

  // --------------------
  // Helpers
  // --------------------
  function byId(id){ return document.getElementById(id); }

  function randInt(max){
    return Math.floor(Math.random() * max);
  }

  function formatMeta(item){
    const type = item.type ? String(item.type) : "";
    const year = (item.year !== undefined && item.year !== null) ? String(item.year) : "";
    if (type && year) return `${type}, ${year}`;
    if (type) return type;
    return year;
  }

  function slotSpin(list, titleEl, metaEl, noteEl, finalItem, done){
    const minSteps = 18;
    const maxSteps = 28;
    const totalSteps = minSteps + randInt(maxSteps - minSteps + 1);

    let delay = 30;
    const delayIncrease = 7;
    let step = 0;
    let idx = randInt(list.length);

    function tick(){
      idx = (idx + 1) % list.length;
      const current = list[idx];

      titleEl.textContent = current.title || current;
      if (metaEl) metaEl.textContent = current.meta ? current.meta : formatMeta(current);

      titleEl.style.transform = (step % 2 === 0) ? "translateY(1px)" : "translateY(-1px)";
      step++;

      if (step < totalSteps){
        delay += delayIncrease;
        setTimeout(tick, delay);
      } else {
        titleEl.style.transform = "translateY(0)";
        titleEl.textContent = finalItem.title || finalItem;
        if (metaEl) metaEl.textContent = finalItem.meta ? finalItem.meta : formatMeta(finalItem);
        if (noteEl) noteEl.textContent = "";
        done();
      }
    }

    tick();
  }

  // --------------------
  // Luck Meter (no reroll)
  // --------------------
  const luckTitle = byId("luck-title");
  const luckMeta  = byId("luck-meta");
  const luckNote  = byId("luck-note");
  const luckSpin  = byId("luck-spin");
  const luckSpinDisabled = byId("luck-spin-disabled");

  const luckOutcomes = [
    // weights: 1 mega, 3 very, 6 on-side, 4 low-friction, 2 make-your-own
    { title: "MEGA LUCKY DAY", meta: "🚀 Things may line up without you asking.", note: "Use it. Make one bold move." },

    { title: "VERY LUCKY DAY", meta: "✨ Good timing energy is around you.", note: "Say yes faster than usual." },
    { title: "VERY LUCKY DAY", meta: "✨ The universe is being weirdly cooperative.", note: "Lean into momentum." },
    { title: "VERY LUCKY DAY", meta: "✨ Expect a couple pleasant surprises.", note: "Watch for easy wins." },

    { title: "LUCK IS ON YOUR SIDE", meta: "🍀 A solid tailwind today.", note: "One small risk could pay off." },
    { title: "LUCK IS ON YOUR SIDE", meta: "🍀 Things should flow better than normal.", note: "Do the thing you’ve been avoiding." },
    { title: "LUCK IS ON YOUR SIDE", meta: "🍀 Not magic. Just smoother.", note: "Stay open to coincidences." },
    { title: "LUCK IS ON YOUR SIDE", meta: "🍀 The vibes are friendly.", note: "Send the message. Make the ask." },
    { title: "LUCK IS ON YOUR SIDE", meta: "🍀 Try your idea. Tiny is fine.", note: "Action creates luck." },
    { title: "LUCK IS ON YOUR SIDE", meta: "🍀 Quietly fortunate.", note: "Keep your eyes up." },

    { title: "LOW FRICTION DAY", meta: "🛼 Nothing dramatic. Just easier.", note: "Great day for errands and cleanup." },
    { title: "LOW FRICTION DAY", meta: "🛼 The path is open.", note: "Take the straightforward route." },
    { title: "LOW FRICTION DAY", meta: "🛼 Neutral to good.", note: "You won’t need to fight today." },
    { title: "LOW FRICTION DAY", meta: "🛼 Steady energy.", note: "Consistency wins." },

    { title: "MAKE YOUR OWN LUCK KIND OF DAY", meta: "🧰 The universe isn’t doing you favours.", note: "Keep it simple. Keep it moving." },
    { title: "MAKE YOUR OWN LUCK KIND OF DAY", meta: "🧰 You’re the engine today.", note: "Avoid gambles. Choose control." },
  ];

  let luckHasSpun = false;
  let luckSpinning = false;

  luckSpin.addEventListener("click", () => {
    if (luckHasSpun || luckSpinning) return;

    luckSpinning = true;
    luckSpin.disabled = true;
    luckNote.textContent = "Consulting the cosmos…";

    const final = luckOutcomes[randInt(luckOutcomes.length)];

    slotSpin(
      luckOutcomes,
      luckTitle,
      luckMeta,
      luckNote,
      final,
      () => {
        luckNote.textContent = final.note;
        luckHasSpun = true;
        luckSpinning = false;

        luckSpin.style.display = "none";
        luckSpinDisabled.style.display = "inline-flex";
      }
    );
  });

  // --------------------
  // Lucky Number / Letter / Colour / Emoji (no reroll)
  // --------------------
  function oneSpinSetup(btnId, titleId, metaId, noteId, list, finalize){
    const btn = byId(btnId);
    const titleEl = byId(titleId);
    const metaEl = metaId ? byId(metaId) : null;
    const noteEl = noteId ? byId(noteId) : null;

    let hasSpun = false;
    let spinning = false;

    btn.addEventListener("click", () => {
      if (hasSpun || spinning) return;
      spinning = true;
      btn.disabled = true;
      if (noteEl) noteEl.textContent = "Spinning…";

      const final = list[randInt(list.length)];
      const finalItem = finalize ? finalize(final) : final;

      slotSpin(
        list.map(x => (typeof x === "string" || typeof x === "number") ? ({ title: String(x), meta: "" }) : x),
        titleEl,
        metaEl,
        noteEl,
        (typeof finalItem === "string" || typeof finalItem === "number") ? ({ title: String(finalItem), meta: "" }) : finalItem,
        () => {
          hasSpun = true;
          spinning = false;
          if (noteEl) noteEl.textContent = "";
        }
      );
    });
  }

  // Number 0–9
  oneSpinSetup(
    "num-spin",
    "num-title",
    "num-meta",
    "num-note",
    Array.from({ length: 10 }, (_, i) => ({ title: String(i), meta: "" })),
    null
  );

  // Letter A–Z
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(ch => ({ title: ch, meta: "" }));
  oneSpinSetup("letter-spin", "letter-title", "letter-meta", "letter-note", letters, null);

  // Colour (single)
  const colours = [
    { title: "Emerald", meta: "#1DB954" },
    { title: "Cobalt", meta: "#2563EB" },
    { title: "Tangerine", meta: "#F97316" },
    { title: "Sunflower", meta: "#FACC15" },
    { title: "Cherry", meta: "#EF4444" },
    { title: "Grape", meta: "#875DA6" },
    { title: "Teal", meta: "#14B8A6" },
    { title: "Slate", meta: "#64748B" },
  ];
  oneSpinSetup("color-spin", "color-title", "color-meta", "color-note", colours, null);

  // Emoji of the day
  const emojis = [
    { title: "😌", meta: "calm" },
    { title: "😤", meta: "determined" },
    { title: "🥴", meta: "goofy" },
    { title: "🤷", meta: "shrug" },
    { title: "🫠", meta: "melting" },
    { title: "😍", meta: "heart eyes" },
    { title: "😵‍💫", meta: "frazzled" },
    { title: "😈", meta: "devilish" },
    { title: "🤞", meta: "hopeful" },
    { title: "☕", meta: "coffee mode" },
  ];
  oneSpinSetup("emoji-spin", "emoji-title", "emoji-meta", "emoji-note", emojis, null);

  // --------------------
  // Watch (reroll)
  // --------------------
  const watchList = Array.isArray(window.WATCHLIST) ? window.WATCHLIST.slice() : [];
  const watchTitle = byId("watch-title");
  const watchMeta  = byId("watch-meta");
  const watchNote  = byId("watch-note");
  const watchSpin  = byId("watch-spin");
  const watchReroll = byId("watch-reroll");

  function watchPick(){ return watchList[randInt(watchList.length)]; }

  let watchHasSpun = false;
  let watchSpinning = false;

  function doWatchSpin(isReroll){
    if (watchSpinning) return;
    if (!isReroll && watchHasSpun) return;

    watchSpinning = true;
    watchNote.textContent = isReroll ? "Rerolling…" : "Consulting the streaming gods…";
    watchReroll.disabled = true;

    const final = watchPick();

    slotSpin(
      watchList,
      watchTitle,
      watchMeta,
      watchNote,
      final,
      () => {
        watchNote.textContent = "If it’s a no, reroll it. No guilt.";
        watchSpinning = false;
        watchReroll.disabled = false;

        if (!isReroll){
          watchHasSpun = true;
          watchSpin.disabled = true;
          watchSpin.textContent = "Spun";
        }
      }
    );
  }

  if (watchList.length){
    watchSpin.addEventListener("click", () => doWatchSpin(false));
    watchReroll.addEventListener("click", () => doWatchSpin(true));
  } else {
    watchTitle.textContent = "No watchlist found.";
    watchMeta.textContent = "Add items in watchlist.js";
    watchSpin.disabled = true;
    watchReroll.disabled = true;
  }

  // --------------------
  // Dinner (reroll)
  // --------------------
  const dinnerList = Array.isArray(window.DINNERLIST) ? window.DINNERLIST.slice() : [];
  const dinnerTitle = byId("dinner-title");
  const dinnerMeta  = byId("dinner-meta");
  const dinnerNote  = byId("dinner-note");
  const dinnerSpin  = byId("dinner-spin");
  const dinnerReroll = byId("dinner-reroll");

  function dinnerPick(){ return dinnerList[randInt(dinnerList.length)]; }

  let dinnerHasSpun = false;
  let dinnerSpinning = false;

  function doDinnerSpin(isReroll){
    if (dinnerSpinning) return;
    if (!isReroll && dinnerHasSpun) return;

    dinnerSpinning = true;
    dinnerNote.textContent = isReroll ? "Rerolling…" : "Consulting your stomach…";
    dinnerReroll.disabled = true;

    const final = dinnerPick();

    slotSpin(
      dinnerList,
      dinnerTitle,
      dinnerMeta,
      dinnerNote,
      final,
      () => {
        dinnerNote.textContent = "If you hate it, reroll it. We’re not monsters.";
        dinnerSpinning = false;
        dinnerReroll.disabled = false;

        if (!isReroll){
          dinnerHasSpun = true;
          dinnerSpin.disabled = true;
          dinnerSpin.textContent = "Spun";
        }
      }
    );
  }

  if (dinnerList.length){
    dinnerSpin.addEventListener("click", () => doDinnerSpin(false));
    dinnerReroll.addEventListener("click", () => doDinnerSpin(true));
  } else {
    dinnerTitle.textContent = "No dinner list found.";
    dinnerMeta.textContent = "Add items in dinnerlist.js";
    dinnerSpin.disabled = true;
    dinnerReroll.disabled = true;
  }

  // --------------------
  // Fortune (reroll)
  // --------------------
  const fortunes = Array.isArray(window.FORTUNES) ? window.FORTUNES.slice() : [];
  const fortuneText = byId("fortune-text");
  const fortuneSpin = byId("fortune-spin");
  const fortuneReroll = byId("fortune-reroll");

  let fortuneHasSpun = false;
  let fortuneSpinning = false;

  function fortunePick(){ return fortunes[randInt(fortunes.length)]; }

  function doFortune(isReroll){
    if (fortuneSpinning) return;
    if (!isReroll && fortuneHasSpun) return;

    fortuneSpinning = true;
    fortuneReroll.disabled = true;

    const minSteps = 16;
    const maxSteps = 26;
    const totalSteps = minSteps + randInt(maxSteps - minSteps + 1);

    let delay = 22;
    const delayIncrease = 6;
    let step = 0;

    function tick(){
      fortuneText.textContent = fortunes[randInt(fortunes.length)];
      fortuneText.style.transform = (step % 2 === 0) ? "translateY(1px)" : "translateY(-1px)";
      step++;

      if (step < totalSteps){
        delay += delayIncrease;
        setTimeout(tick, delay);
      } else {
        fortuneText.style.transform = "translateY(0)";
        fortuneText.textContent = fortunePick();

        fortuneSpinning = false;
        fortuneReroll.disabled = false;

        if (!isReroll){
          fortuneHasSpun = true;
          fortuneSpin.disabled = true;
          fortuneSpin.textContent = "Spun";
          fortuneReroll.disabled = false;
        }
      }
    }

    tick();
  }

  if (fortunes.length){
    fortuneSpin.addEventListener("click", () => {
      doFortune(false);
      fortuneReroll.disabled = false;
    });
    fortuneReroll.addEventListener("click", () => doFortune(true));
  } else {
    fortuneText.textContent = "No fortunes found.";
    fortuneSpin.disabled = true;
    fortuneReroll.disabled = true;
  }
})();
