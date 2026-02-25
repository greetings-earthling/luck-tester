(function () {
  window.ALIEN_TABLET.register(({ pick, glyphBurst, lockButton }) => {
    const btn = document.getElementById("btn-watch");
    const out = document.getElementById("res-watch");
    const meta = document.getElementById("meta-watch");
    if (!btn || !out || !meta) return;

    function fmt(item){
      if (!item) return { title: "—", meta: "" };
      const t = item.type || "";
      const y = item.year || "";
      return { title: item.title || "—", meta: [t, y].filter(Boolean).join(" • ") };
    }

    btn.addEventListener("click", async () => {
      const list = window.WATCHLIST || [];
      const item = list.length ? pick(list) : null;
      const f = fmt(item);

      lockButton(btn);
      meta.textContent = "";

      await glyphBurst(out, f.title, { duration: 980, tickMs: 34 });
      meta.textContent = f.meta;
    });
  });
})();
