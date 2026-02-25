(function () {
  window.ALIEN_TABLET.register(({ glyphBurst, lockButton }) => {
    const btn = document.getElementById("btn-number");
    const out = document.getElementById("res-number");
    if (!btn || !out) return;

    btn.addEventListener("click", async () => {
      lockButton(btn);
      const n = Math.floor(Math.random() * 100); // 0–99
      await glyphBurst(out, String(n), { duration: 780, tickMs: 32 });
    });
  });
})();
