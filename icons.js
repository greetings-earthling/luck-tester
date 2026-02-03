// icons.js
// Fixed symbol order: A–Z then 0–9
// Exposes: window.SYMBOLS (array of { name, symbol })

(function () {
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A-Z
  const digits = Array.from({ length: 10 }, (_, i) => String(i)); // 0-9

  window.SYMBOLS = [...letters, ...digits].map((ch) => ({
    name: ch,
    symbol: ch
  }));
})();
