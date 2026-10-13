/* ORVE · 滚动消费的封面（scroll-consumed cover）
 * 独立实现，零依赖。核心关系：
 *   封面 = 一屏浅色「品牌印章」；滚动时
 *   ① 主体标记绕视觉中心连续放大（近指数加速）→ 吞满视口
 *   ② 纵向标签列表在固定高度窗口内是一台持续自走的循环带（原站实测约 12.9px/s
 *      匀速推进，与滚动位置无关；轨末重复首两行以保证无缝回绕）
 *   ③ 滚动提示在封面早期淡出
 *   ④ 最后一段滚动里整屏墨色幕布落下
 *   ⑤ 滚满一屏后封面被「消费」（移出文档流），深色章节接管，滚动基点回到章节顶部
 * 触发与反馈全部由真实滚动位置映射，不写死时长。
 */
(function (global) {
  'use strict';

  var DEFAULTS = {
    markScaleMax: 31,    // 标记最终放大倍数
    markOnset: 0.26,     // 进度到该点前标记不放大
    markAccel: 2.4,      // 放大曲线加速指数
    tickerSpeed: 12.9,   // 列表自走速度（px/s）——原站 1440×900 无输入实测值
    hintFade: 0.34,      // 滚动提示淡出消耗的封面进度
    veilOnset: 0.86,     // 幕布开始落下的进度
    settle: 240          // 换幕收束时长（ms），只用于最后一下收束
  };

  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* 原创径向品牌标记：8 支由中心收细到尖端的火花臂，单色，绕中心对称。
   * 保留的设计角色：径向对称、单色、以视觉中心为锚点、可连续放大到满屏。 */
  function markSvg(arms) {
    arms = arms || 8;
    var step = (Math.PI * 2) / arms, half = 0.2269, rTip = 46, rBase = 15, cx = 50, cy = 50;
    var d = '';
    for (var i = 0; i < arms; i++) {
      var a = i * step - Math.PI / 2;
      var ax = cx + Math.cos(a - half) * rBase, ay = cy + Math.sin(a - half) * rBase;
      var bx = cx + Math.cos(a + half) * rBase, by = cy + Math.sin(a + half) * rBase;
      var tx = cx + Math.cos(a) * rTip, ty = cy + Math.sin(a) * rTip;
      d += 'M' + cx + ' ' + cy +
           'L' + ax.toFixed(2) + ' ' + ay.toFixed(2) +
           'L' + tx.toFixed(2) + ' ' + ty.toFixed(2) +
           'L' + bx.toFixed(2) + ' ' + by.toFixed(2) + 'Z';
    }
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
           '<path d="' + d + '" fill="currentColor"/></svg>';
  }

  function Cover(root, options) {
    this.root = root;
    this.opts = Object.assign({}, DEFAULTS, options || {});
    this.stage = root.querySelector('[data-orve-stage]');
    this.mark = root.querySelector('[data-orve-mark]');
    this.track = root.querySelector('[data-orve-track]');
    this.ticker = root.querySelector('[data-orve-ticker]');
    this.hint = root.querySelector('[data-orve-hint]');
    this.veil = root.querySelector('[data-orve-veil]');
    this.target = document.querySelector(root.getAttribute('data-orve-chapter') || '#orve-chapitre');
    this.consumed = false;
    this.frame = 0;
    this.settleTimer = 0;
    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
    this.trackY = 0;      // 当前自走位移
    this.loopFrame = 0;   // 常驻 rAF 句柄
    this.lastTs = 0;      // 上一帧时间戳（用于 dt）
    this.init();
  }

  Cover.prototype.init = function () {
    if (this.mark && !this.mark.querySelector('svg')) {
      this.mark.insertAdjacentHTML('afterbegin', markSvg(8));
    }
    this.measure();
    this.root.classList.add('is-live');
    global.addEventListener('scroll', this.onScroll, { passive: true });
    global.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.update();
    this.startLoop();
  };

  Cover.prototype.measure = function () {
    this.coverH = Math.max(1, this.root.getBoundingClientRect().height);
    if (!this.track || !this.ticker) { this.trackLoop = 0; return; }
    var line = parseFloat(getComputedStyle(this.track.firstElementChild || this.track).lineHeight) || 0;
    this.lineH = line;
    /* 无缝回绕长度 = 不重复行数 × 行高（轨末重复了首两行） */
    var seen = {}, unique = 0;
    Array.prototype.forEach.call(this.track.children, function (li) {
      var key = (li.textContent || '').trim();
      if (!(key in seen)) { seen[key] = 1; unique++; }
    });
    this.trackLoop = line * Math.max(1, unique);
  };

  Cover.prototype.onScroll = function () { this.schedule(); };
  Cover.prototype.onResize = function () { this.measure(); this.schedule(); };
  Cover.prototype.onVisibility = function () {
    /* 隐藏标签页里 rAF 被冻结；显式停掉自走循环，回到前台再重启并补一次滚动映射。 */
    if (document.hidden) { this.stopLoop(); return; }
    this.startLoop();
    this.schedule();
  };

  Cover.prototype.schedule = function () {
    if (this.frame || this.consumed) return;
    var self = this;
    this.frame = global.requestAnimationFrame(function () { self.frame = 0; self.update(); });
  };

  /* 列表自走循环：与滚动位置无关，按实测速度持续推进，到循环长度处无缝回绕。
   * dt 上限 0.05s，避免隐藏/卡顿后一次跳一大截。 */
  Cover.prototype.loop = function (ts) {
    this.loopFrame = 0;
    if (this.consumed || document.hidden || !this.trackLoop) return;
    var dt = this.lastTs ? Math.min(0.05, (ts - this.lastTs) / 1000) : 0;
    this.lastTs = ts;
    this.trackY = (this.trackY + this.opts.tickerSpeed * dt) % this.trackLoop;
    if (this.track) {
      this.track.style.transform = 'translate3d(0,' + (-this.trackY).toFixed(2) + 'px,0)';
    }
    var self = this;
    this.loopFrame = global.requestAnimationFrame(function (t) { self.loop(t); });
  };

  Cover.prototype.startLoop = function () {
    if (this.loopFrame || this.consumed || !this.trackLoop) return;
    var self = this;
    this.lastTs = 0;
    this.loopFrame = global.requestAnimationFrame(function (t) { self.loop(t); });
  };

  Cover.prototype.stopLoop = function () {
    if (this.loopFrame) global.cancelAnimationFrame(this.loopFrame);
    this.loopFrame = 0;
    this.lastTs = 0;
  };

  Cover.prototype.update = function () {
    var y = global.scrollY || global.pageYOffset || 0;
    var o = this.opts, p = clamp01(y / this.coverH);

    /* ① 标记放大：进度过 onset 后按指数加速放大 */
    if (this.mark) {
      var raw = clamp01((p - o.markOnset) / (1 - o.markOnset));
      var eased = Math.pow(raw, o.markAccel);
      this.mark.style.transform = 'scale(' + (1 + (o.markScaleMax - 1) * eased).toFixed(4) + ')';
    }
    /* ② 列表自走：由独立常驻 rAF 循环驱动（见 loop()），与滚动位置无关 */
    /* ③ 提示淡出 */
    if (this.hint) {
      this.hint.style.opacity = (1 - clamp01(y / (this.coverH * o.hintFade))).toFixed(3);
    }
    /* ④ 幕布落下 */
    if (this.veil) {
      this.veil.style.opacity = clamp01((p - o.veilOnset) / (1 - o.veilOnset)).toFixed(3);
    }
    /* ⑤ 滚满一屏即消费封面 */
    if (!this.consumed && p >= 1) this.consume();
  };

  /* 换幕：幕布收束 → 封面移出文档流 → 深色章节接管，滚动基点回到章节顶部 */
  Cover.prototype.consume = function () {
    if (this.consumed) return;
    this.consumed = true;
    this.stopLoop();
    if (this.veil) this.veil.style.opacity = '1';
    var self = this;
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.settleTimer = global.setTimeout(function () {
      self.root.classList.add('is-consumed');
      self.root.setAttribute('aria-hidden', 'true');
      var top = self.target ? Math.max(0, self.target.offsetTop) : 0;
      global.scrollTo(0, top);
      self.emit('orve:consumed');
    }, this.opts.settle);
  };

  /* 复位：恢复封面并回到封面顶部（demo 复核用；原站是一次性的，见 README） */
  Cover.prototype.reset = function () {
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.consumed = false;
    this.trackY = 0;
    this.startLoop();
    this.root.classList.remove('is-consumed');
    this.root.removeAttribute('aria-hidden');
    global.scrollTo(0, 0);
    this.measure();
    this.update();
    this.emit('orve:reset');
  };

  Cover.prototype.destroy = function () {
    if (this.settleTimer) clearTimeout(this.settleTimer);
    if (this.frame) global.cancelAnimationFrame(this.frame);
    this.stopLoop();
    global.removeEventListener('scroll', this.onScroll);
    global.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.root.classList.remove('is-live');
  };

  Cover.prototype.emit = function (name) {
    this.root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { cover: this } }));
  };

  function boot() {
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nodes = document.querySelectorAll('[data-orve-cover]');
    var instances = [];
    Array.prototype.forEach.call(nodes, function (node) {
      if (reduced) {
        /* 降级：静态封面 + 正常滚走，不做换幕 */
        document.documentElement.classList.add('orve-reduced');
        var m = node.querySelector('[data-orve-mark]');
        if (m && !m.querySelector('svg')) m.insertAdjacentHTML('afterbegin', markSvg(8));
        return;
      }
      instances.push(new Cover(node));
    });
    global.OrveCover = { Cover: Cover, markSvg: markSvg, instances: instances };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})(window);
