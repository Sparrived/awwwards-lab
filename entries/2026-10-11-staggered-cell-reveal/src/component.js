/* ============================================================
   staggered-cell-reveal — 组件行为（零依赖）
   职责：① 给每格写 --i 序号（也可直接写在 HTML 的 style 里）；
        ② 提供 replay() 重放同一段入场。
   API：window.StaggerReveal.init(root?) / .replay(gridEl) / .index(gridEl)
   双击 demo/index.html 即可用，无需构建、无需服务器。
   ============================================================ */
(function (global) {
  "use strict";

  var SELECTOR = "[data-sgr]";

  function cells(grid) {
    return Array.prototype.slice.call(grid.querySelectorAll(".sgr-cell"));
  }

  /* 给每格写入 --i（0-based）；delay 由 CSS calc(var(--i) * 75ms) 计算 */
  function index(grid) {
    cells(grid).forEach(function (c, i) {
      if (!c.style.getPropertyValue("--i")) c.style.setProperty("--i", String(i));
    });
  }

  /* 重放：清空 animation → 强制回流 → 复原 */
  function replay(grid) {
    var list = cells(grid);
    list.forEach(function (c) {
      c.style.animation = "none";
      var inner = c.querySelector(".sgr-cell__inner");
      if (inner) inner.style.animation = "none";
    });
    void grid.offsetWidth; // 强制回流，重置动画时间轴
    list.forEach(function (c) {
      c.style.animation = "";
      var inner = c.querySelector(".sgr-cell__inner");
      if (inner) inner.style.animation = "";
    });
  }

  function init(root) {
    var scope = root || document;
    Array.prototype.forEach.call(scope.querySelectorAll(SELECTOR), function (g) {
      index(g);
      if (g.id) {
        var btn = document.querySelector('[data-sgr-replay="' + g.id + '"]');
        if (btn) btn.addEventListener("click", function () { replay(g); });
      }
    });
  }

  global.StaggerReveal = { init: init, replay: replay, index: index };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { init(document); });
  } else {
    init(document);
  }
})(window);
