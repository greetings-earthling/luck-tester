(function () {
  "use strict";

  const list = Array.isArray(window.WATCHLIST) ? window.WATCHLIST.slice() : [];

  const titleEl = document.getElementById("watch-title");
  const metaEl = document.getElementById("watch-meta");
  const noteEl = document.getElementById("watch-note");
  const spinBtn = document.getElementById("watch-spin");
  const rerollBtn = document.getElementById("watch-reroll");

  if (!titleEl || !metaEl || !noteEl || !spinBtn || !rerollBtn) return;

  if (!list.length) {
    titleEl.textContent = "No watchlist found.";
    metaEl.textContent = "Add items in watchlist.js";
    spinBtn.disabled = true;
    rerollBtn.disabled = true;
    return;
  }

  let spinning = false;
  let hasSpun = false;

  function randomIndex(max) {
    return Math.floor(Math.random() * max);
  }

  function formatMeta(item) {
    const yr = (item.year !== undefined && item.year !== null) ? String(item.year) : "";
    const type = item.type ? String(item.type) : "";
    if (type && yr) return `${type}, ${yr}`;
    if (type) return type;
    return yr;
  }

  function pickRandom() {
    return list[randomIndex(list.length)];
  }

  function spinAnimation(finalItem) {
    const minSteps = 20;
    const maxSteps = 30;
    const totalSteps = minSteps + randomIndex(maxSteps - minSteps + 1);

    let delay = 30;
    const delayIncrease = 7;
    let step = 0;

    let idx = randomIndex(list.length);

    function tick() {
      idx = (idx + 1) % list.length;
      const current = list[idx];

      titleEl.textContent = current.title;
      metaEl.textContent = formatMeta(current);

      // tiny jitter for slot vibe
      titleEl.style.transform = (step % 2 === 0) ? "translateY(1px)" : "translateY(-1px)";
      step++;

      if (step < totalSteps) {
        delay += delayIncrease;
        setTimeout(tick, delay);
      } else {
        titleEl.style.transform = "translateY(0)";
        titleEl.textContent = finalItem.title;
        metaEl.textContent = formatMeta(finalItem);
        noteEl.textContent = "If this is a no, reroll it. No guilt.";
        spinning = false;
        rerollBtn.disabled = false;
      }
    }

    tick();
  }

  function doSpin(isReroll) {
    if (spinning) return;

    if (!isReroll && hasSpun) return;

    spinning = true;
    noteEl.textContent = isReroll ? "Rerolling..." : "Consulting the streaming gods...";
    rerollBtn.disabled = true;

    const finalItem = pickRandom();
    spinAnimation(finalItem);

    if (!isReroll) {
      hasSpun = true;
      spinBtn.disabled = true;
      spinBtn.textContent = "Spun";
    }
  }

  spinBtn.addEventListener("click", () => doSpin(false));
  rerollBtn.addEventListener("click", () => doSpin(true));
})();
