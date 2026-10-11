/* ============================================================
   candy-palette-theme — 从 :root 读取 --candy-* token，渲染色板
   并支持点击复制 hex。零依赖；断网/无 JS 时 CSS 本身已可读。
   ============================================================ */
(function () {
  "use strict";

  var NAMES = ["ground", "ink", "yellow", "red", "blue",
               "pink", "lime", "orange", "green", "clay", "white"];
  var DARK_TEXT_ON = { yellow: 1, lime: 1, orange: 1, pink: 1, clay: 1, white: 1, ground: 1 };

  function readTokens() {
    var cs = getComputedStyle(document.documentElement);
    return NAMES.map(function (n) {
      return { name: n, value: (cs.getPropertyValue("--candy-" + n) || "").trim() };
    });
  }

  function render(mount) {
    var tokens = readTokens();
    mount.innerHTML = "";
    tokens.forEach(function (t) {
      var cell = document.createElement("div");
      cell.className = "candy-swatch";
      cell.style.background = "var(--candy-" + t.name + ")";
      cell.style.color = DARK_TEXT_ON[t.name] ? "var(--candy-ink)" : "var(--candy-ground)";
      cell.title = "点击复制 " + t.value;

      var b = document.createElement("b");
      b.textContent = t.name;
      var s = document.createElement("span");
      s.textContent = t.value;
      cell.appendChild(b);
      cell.appendChild(s);

      cell.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(t.value).catch(function () {});
        }
      });
      mount.appendChild(cell);
    });
  }

  function boot() {
    var mount = document.querySelector("[data-candy-swatches]");
    if (mount) render(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.CandyTheme = { readTokens: readTokens, render: render };
})();
