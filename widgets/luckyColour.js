(function () {
  const COLORS = [
    { name: "Void Violet", hex: "#7c5cff" },
    { name: "Nebula Mint", hex: "#2ee9a6" },
    { name: "Starlight Gold", hex: "#ffb000" },
    { name: "Orbit Blue", hex: "#60a5fa" },
    { name: "Signal Coral", hex: "#fb7185" },
    { name: "Dust Grey", hex: "#a1a1aa" },
    { name: "Deep Space", hex: "#0b0b12" }
  ];

  window.ALIEN_TABLET.register(({ pick, glyphBurst, lockButton }) => {
    const btn = document.getElementById("btn-colour");
    const out = document.getElementById("res-colour");
    const swatch = document.getElementById("swatch");
    if (!btn || !out || !swatch) return;

    btn.addEventListener("click", async () => {
      lockButton(btn);

      // cycle a bunch of colours, then settle
      let steps = 18;
      await new Promise((resolve) => {
        const t = setInterval(() => {
          const c = pick(COLORS);
          swatch.style.background = c.hex;
          out.textContent = c.name;
          steps--;
          if (steps <= 0) { clearInterval(t); resolve(); }
        }, 55);
      });

      const final = pick(COLORS);
      swatch.style.background = final.hex;
      await glyphBurst(out, `${final.name}`, { duration: 720, tickMs: 34 });
    });
  });
})();
