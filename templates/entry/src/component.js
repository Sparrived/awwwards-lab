/* <条目名> · <机制>
 * 零依赖优先。若机制本质上需要外部库（物理滚动 / 时间轴 / 3D），
 * 才在此处按需引入，并保证断网时降级为静态可读状态。
 * 外部库引入方式（如需）：demo/index.html 里加 CDN <script>，
 *   并同步登记到 SPEC.json 的 deps。
 */
(function () {
  'use strict';

  const CFG = {
    // 行为参数集中在这里，便于复用者改
  };

  function init(root) {
    // TODO: 组件初始化
  }

  document.querySelectorAll('[data-demo-root]').forEach(init);
})();
