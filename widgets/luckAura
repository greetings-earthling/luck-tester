(function () {
  function randNormal(mean, sd){
    let u=0, v=0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * sd;
  }

  window.ALIEN_TABLET.register(({ clamp, glyphBurst, lockButton }) => {
    const btn = document.getElementById("btn-aura");
    const out = document.getElementById("res-aura");
    const fill = document.getElementById("auraFill");
    if (!btn || !out || !fill) return;

    btn.addEventListener("click", async () => {
      lockButton(btn);

      // Bias toward ~70, still allows low days
      const raw = randNormal(70, 14);
      const aura = Math.round(clamp(raw, 0, 100));

      fill.style.width = "0%";
      await glyphBurst(out, `${aura}%`, { duration: 920, tickMs: 34 });

      // smooth fill after reveal
      requestAnimationFrame(() => {
        fill.style.transition = "width 700ms ease";
        fill.style.width = `${aura}%`;
      });
    });
  });
})();
