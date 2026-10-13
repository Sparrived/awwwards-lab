/* throwable-sweets.js — 「可抛掷糖环页脚」片段的行为核心
 *
 * 机制（独立实现，不搬运来源站代码）：
 *   1) 对象第一次进入色场视口时，从色场上方画外下落（重力积分）；
 *   2) 落到「地板」（色场底边）后按恢复系数回弹、按地面摩擦减速；
 *   3) 对象之间用圆近似做碰撞：位置分离 + 法向冲量 + 切向自转，形成可重叠/遮挡的静置堆叠；
 *   4) 指针按下即抓取、拖动直接跟随、抬起时按最近采样给速度（惯性抛掷），随后重力拉回、再次静置；
 *   5) 键盘 ←→↑↓ 可微调选中对象（输入方式降级）；reduce motion 时直接呈现终态、不做抛掷。
 *
 * 数值口径：重力/空气阻尼/恢复系数/地面摩擦/滑移摩擦/最大步长沿用来源站公开脚本里可读到的一组常量
 * （见 SPEC.evidence ev6，source-supported），但积分、碰撞与拖拽全部自行实现。
 */
(function () {
  'use strict';

  var DEFAULTS = {
    gravity: 0.55,        // px / frame^2
    air: 0.985,           // 每帧速度衰减
    bounce: 0.38,         // 恢复系数
    floorFriction: 0.6,   // 触地水平摩擦
    slideFriction: 0.85,  // 空气中水平滑移摩擦
    spinDamp: 0.985,
    maxStep: 18,          // 单帧位移上限（防穿透）
    maxAngular: 6,        // deg / frame
    bounceMin: 0.9,       // 低于此下落速度不再回弹（避免每帧微弹）
    contactSpeed: 0.9,    // 低于此速度、且已有支承的接触按「静置接触」处理
    floorBand: 60,        // 距地板多近算「已有支承」
    wakeSpeed: 0.9,       // 只有明显在动的对象才会唤醒睡着的邻居
    collideSlop: 1.5,     // 位置修正的容差（px）
    collidePush: 0.25,    // 位置修正每帧解掉的比例
    settleSpeed: 0.6,     // 判定静置的速度阈值
    settleFrames: 24,
    spawnAbove: 260,      // 从色场上方多少像素外生成
    spawnJitter: 280,
    dropDelayMs: 300      // 进入视口后延迟，等版面稳定
  };

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function mount(root, options) {
    var field = root.querySelector('[data-sweets-field]');
    if (!field) return null;
    var els = Array.prototype.slice.call(field.querySelectorAll('[data-sweet]'));
    if (!els.length) return null;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cfg = {};
    for (var k in DEFAULTS) cfg[k] = DEFAULTS[k];
    for (var k2 in (options || {})) cfg[k2] = options[k2];

    var st = {
      w: 0, h: 0, raf: 0, running: false, visible: false,
      items: [], drag: null, destroyed: false, dropTimer: 0
    };

    function measure() {
      st.w = field.clientWidth;
      st.h = field.clientHeight;
    }

    function makeItem(el, i) {
      var inlineLeft = parseFloat(el.style.getPropertyValue('--x')) || 0;
      var rot = parseFloat(el.style.getPropertyValue('--r')) || 0;
      var w = el.offsetWidth || 160;
      var h = el.offsetHeight || 140;
      return {
        el: el, idx: i, w: w, h: h,
        xFrac: inlineLeft / 100,               // 静置水平位置：占色场宽度（与无 JS 的 left:% 同义）
        restX: st.w * (inlineLeft / 100),
        restY: Math.max(0, st.h - h),          // 静置 = 落在色场地板上
        restRot: rot,
        x: 0, y: 0, rot: 0, vx: 0, vy: 0, vr: 0,
        rad: 0.30 * Math.max(w, h),   // 圆近似半径（偏小，允许压叠；见 README 已知取舍）
        dragging: false, settled: false, sleep: false, contact: false, restFrames: 0, samples: []
      };
    }

    function layoutRest() {
      measure();
      st.items.forEach(function (o) {
        o.w = o.el.offsetWidth || o.w;
        o.h = o.el.offsetHeight || o.h;
        o.rad = 0.30 * Math.max(o.w, o.h);
        var rp = restFor(o);
        o.x = rp.x; o.y = rp.y;
        o.vx = o.vy = o.vr = 0;
        sleep(o);
        render(o);
      });
    }

    function spawn(o) {
      var span = Math.max(0, st.w - o.w);
      o.x = clamp(o.restX + (Math.random() - 0.5) * span * 0.35, 0, span);
      o.y = -(o.h + cfg.spawnAbove + Math.random() * cfg.spawnJitter);
      o.rot = (Math.random() - 0.5) * 160;
      o.vx = (Math.random() - 0.5) * 2.4;
      o.vy = 0;
      o.vr = (Math.random() - 0.5) * 1.6;
      wake(o);
      render(o);
    }

    function render(o) {
      o.el.style.transform = 'translate3d(' + o.x.toFixed(2) + 'px,' + o.y.toFixed(2) +
        'px,0) rotate(' + o.rot.toFixed(2) + 'deg)';
    }

    /* 旋转后的包围盒：绕元素中心旋转，据此算出色场内的活动范围，
     * 让旋转过的糖环也整体留在色场里（与来源站用旋转包围盒留边的做法一致）。 */
    function boundsFor(o, rot) {
      var a = Math.abs(rot) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      var bw = o.w * c + o.h * s, bh = o.w * s + o.h * c;
      var padX = Math.max(0, (bw - o.w) / 2), padY = Math.max(0, (bh - o.h) / 2);
      var minX = padX, maxX = Math.max(minX, st.w - o.w - padX);
      return { minX: minX, maxX: maxX, floor: Math.max(0, st.h - o.h / 2 - bh / 2) };
    }

    /* 静置位：水平按 xFrac 占色场宽度，垂直落在色场地板上 */
    function restFor(o) {
      var b = boundsFor(o, o.restRot);
      return {
        x: clamp(st.w * o.xFrac, b.minX, b.maxX),
        y: b.floor
      };
    }

    function speedOf(o) { return Math.sqrt(o.vx * o.vx + o.vy * o.vy); }

    function sleep(o) {
      if (o.sleep) return;
      o.sleep = true;
      o.vx = o.vy = o.vr = 0;
      o.settled = true;
      o.restFrames = 0;
      o.el.classList.add('is-settled');
    }

    function wake(o) {
      if (!o.sleep && !o.settled) { o.restFrames = 0; return; }
      o.sleep = false;
      o.settled = false;
      o.restFrames = 0;
      o.el.classList.remove('is-settled');
    }

    function step() {
      var o, i, j;
      var floorY, right;

      for (i = 0; i < st.items.length; i++) {
        o = st.items[i];
        if (o.dragging || o.sleep) continue;      // 睡着的对象不再积分，也不再重绘

        o.vy += cfg.gravity;
        o.vy *= cfg.air;
        o.vx *= cfg.air;
        if (o.y + o.h < st.h - 1) o.vx *= cfg.slideFriction;   // 空中滑移衰减
        o.vx = clamp(o.vx, -cfg.maxStep, cfg.maxStep);
        o.vy = clamp(o.vy, -cfg.maxStep, cfg.maxStep);
        o.vr = clamp(o.vr, -cfg.maxAngular, cfg.maxAngular);
        o.vr *= cfg.spinDamp;

        o.x += o.vx;
        o.y += o.vy;
        o.rot += o.vr;

        var bb = boundsFor(o, o.rot);
        floorY = bb.floor;
        right = bb.maxX;

        if (o.y >= floorY) {                                   // 地板
          o.y = floorY;
          if (o.vy > cfg.bounceMin) { o.vy = -o.vy * cfg.bounce; o.vr += o.vx * 0.02; }
          else { o.vy = 0; }
          o.vx *= cfg.floorFriction;
          o.vr *= 0.55;
        }
        if (o.x < bb.minX) { o.x = bb.minX; o.vx = Math.abs(o.vx) * cfg.bounce; o.vr *= -0.5; }
        if (o.x > right) { o.x = right; o.vx = -Math.abs(o.vx) * cfg.bounce; o.vr *= -0.5; }
        if (o.y < -(o.h + 4000)) { o.y = -(o.h + 4000); o.vy = 0; }
      }

      for (i = 0; i < st.items.length; i++) st.items[i].contact = false;
      for (i = 0; i < st.items.length; i++) {                  // 两两碰撞
        for (j = i + 1; j < st.items.length; j++) collide(st.items[i], st.items[j]);
      }

      for (i = 0; i < st.items.length; i++) {
        o = st.items[i];
        if (o.dragging || o.sleep) continue;
        var eb = boundsFor(o, o.rot);
        o.x = clamp(o.x, eb.minX, eb.maxX);               // 碰撞分离后仍留在色场范围内
        o.y = Math.min(o.y, eb.floor);
        // 只有「有支承」（落在地板上或被别的对象托住）且速度足够小才累计静置计时，
        // 否则对象在画外下落途中就会被误判成静置。
        var onFloor = Math.abs(o.y - eb.floor) < 1.5;
        if ((onFloor || o.contact) && speedOf(o) < cfg.settleSpeed) {
          o.restFrames++;
          if (o.restFrames > cfg.settleFrames) sleep(o);
        } else {
          o.restFrames = 0;
        }
        render(o);
      }
    }

    function collide(a, b) {
      if (a.sleep && b.sleep) return;              // 都睡着 = 稳定堆叠，保持现状
      var acx = a.x + a.w / 2, acy = a.y + a.h / 2;
      var bcx = b.x + b.w / 2, bcy = b.y + b.h / 2;
      var dx = bcx - acx, dy = bcy - acy;
      var d = Math.sqrt(dx * dx + dy * dy) || 0.001;
      var min = a.rad + b.rad;
      if (d >= min) return;

      if (a.sleep && speedOf(b) > cfg.wakeSpeed) wake(a);   // 只有真的在动才唤醒睡着的邻居
      if (b.sleep && speedOf(a) > cfg.wakeSpeed) wake(b);

      var nx = dx / d, ny = dy / d;
      var overlap = min - d;
      var ia = 1 / (a.w * a.h), ib = 1 / (b.w * b.h);

      // 双方都接近静止 = 静置接触：只做速度阻尼，不再互相推开。
      // 否则堆叠面每帧被分离一次，会一直「爬行」，永远进不了静置态。
      var nearFloorA = Math.abs(a.y - boundsFor(a, a.rot).floor) < cfg.floorBand;
      var nearFloorB = Math.abs(b.y - boundsFor(b, b.rot).floor) < cfg.floorBand;
      var supported = a.contact || b.contact || nearFloorA || nearFloorB;   // 空中相撞不套用静置处理
      if (!a.dragging && !b.dragging && supported &&
          speedOf(a) < cfg.contactSpeed && speedOf(b) < cfg.contactSpeed) {
        a.vx *= 0.4; a.vy *= 0.4; a.vr *= 0.6;
        b.vx *= 0.4; b.vy *= 0.4; b.vr *= 0.6;
        a.contact = true; b.contact = true;
        return;
      }

      // 软位置修正：每帧只解掉一部分重叠并留 slop，避免一帧把重叠全部推开导致速度爆炸
      var corr = Math.max(0, overlap - cfg.collideSlop) * cfg.collidePush;
      var ca = a.dragging ? 0 : corr * ib / (ia + ib);
      var cb = b.dragging ? 0 : corr * ia / (ia + ib);
      a.x -= nx * ca; a.y -= ny * ca;
      b.x += nx * cb; b.y += ny * cb;

      var rvx = b.vx - a.vx, rvy = b.vy - a.vy;
      var vn = rvx * nx + rvy * ny;
      if (vn > 0) return;
      var jimp = -(1 + cfg.bounce) * vn / (ia + ib);
      if (!a.dragging) { a.vx -= jimp * ia * nx; a.vy -= jimp * ia * ny; }
      if (!b.dragging) { b.vx += jimp * ib * nx; b.vy += jimp * ib * ny; }

      var tx = -ny, ty = nx;                                   // 切向 → 自转
      var vt = rvx * tx + rvy * ty;
      a.vr = clamp(a.vr - vt * 0.02, -cfg.maxAngular, cfg.maxAngular);
      b.vr = clamp(b.vr + vt * 0.02, -cfg.maxAngular, cfg.maxAngular);

      // 冲量后双方都很慢 = 支承接触（静置判定的依据）
      if (speedOf(a) < cfg.settleSpeed && speedOf(b) < cfg.settleSpeed) {
        a.contact = true; b.contact = true;
      }
    }

    var readTick = 0;

    function tick() {
      st.raf = 0;
      if (!st.running) return;
      step();
      if (++readTick % 45 === 0) refreshRead();
      st.raf = window.requestAnimationFrame(tick);
    }

    function start() {
      if (st.running || st.destroyed) return;
      st.running = true;
      if (!st.raf) st.raf = window.requestAnimationFrame(tick);
    }

    function stop() {
      st.running = false;
      if (st.raf) { window.cancelAnimationFrame(st.raf); st.raf = 0; }
    }

    /* ---- 抓取 / 拖动 / 惯性抛掷 ---- */
    function onDown(e, o) {
      if (e.button !== undefined && e.button !== 0) return;
      st.drag = {
        o: o, pointerId: e.pointerId,
        startX: e.clientX, startY: e.clientY, grabX: o.x, grabY: o.y
      };
      o.dragging = true;
      o.contact = false;
      wake(o);
      o.samples = [];
      o.el.classList.add('is-dragging');
      o.el.classList.remove('is-settled');
      o.settled = false;
      o.vx = o.vy = o.vr = 0;
      try { o.el.setPointerCapture(e.pointerId); } catch (err) { /* 忽略不支持捕获的环境 */ }
      start();
    }

    function onMove(e, o) {
      if (!st.drag || st.drag.o !== o) return;
      var nx = st.drag.grabX + (e.clientX - st.drag.startX);
      var ny = st.drag.grabY + (e.clientY - st.drag.startY);
      o.x = clamp(nx, 0, Math.max(0, st.w - o.w));
      o.y = clamp(ny, -(o.h + 400), Math.max(0, st.h - o.h));
      o.samples.push({ x: o.x, y: o.y, t: (window.performance || Date).now() });
      if (o.samples.length > 6) o.samples.shift();
      render(o);
      e.preventDefault();
    }

    function onUp(e, o) {
      if (!st.drag || st.drag.o !== o) return;
      st.drag = null;
      o.dragging = false;
      o.contact = false;
      o.el.classList.remove('is-dragging');
      var s = o.samples;
      if (!reduced && s.length > 1) {
        var a = s[0], b = s[s.length - 1];
        var dt = (b.t - a.t) / 1000;
        if (dt > 0.008) {
          o.vx = clamp((b.x - a.x) / (dt * 60), -60, 60);
          o.vy = clamp((b.y - a.y) / (dt * 60), -60, 60);
          o.vr = clamp(o.vx * 0.06, -cfg.maxAngular, cfg.maxAngular);
        }
      }
      o.restFrames = 0;
      start();
    }

    function onKey(e, o) {
      var nudge = e.shiftKey ? 40 : 12, hit = true;
      wake(o);
      if (e.key === 'ArrowLeft') o.x = clamp(o.x - nudge, 0, Math.max(0, st.w - o.w));
      else if (e.key === 'ArrowRight') o.x = clamp(o.x + nudge, 0, Math.max(0, st.w - o.w));
      else if (e.key === 'ArrowUp') o.y = clamp(o.y - nudge, 0, Math.max(0, st.h - o.h));
      else if (e.key === 'ArrowDown') o.y = clamp(o.y + nudge, 0, Math.max(0, st.h - o.h));
      else hit = false;
      if (hit) {
        o.vx = o.vy = o.vr = 0;
        o.settled = false;
        o.el.classList.remove('is-settled');
        render(o);
        e.preventDefault();
      }
    }

    function bind(o) {
      o.el.addEventListener('pointerdown', function (e) { onDown(e, o); });
      o.el.addEventListener('pointermove', function (e) { onMove(e, o); });
      o.el.addEventListener('pointerup', function (e) { onUp(e, o); });
      o.el.addEventListener('pointercancel', function (e) { onUp(e, o); });
      o.el.addEventListener('keydown', function (e) { onKey(e, o); });
    }

    /* ---- 生命周期 ---- */
    function reset() {
      measure();
      st.items.forEach(function (o) {
        o.w = o.el.offsetWidth || o.w;
        o.h = o.el.offsetHeight || o.h;
        o.rad = 0.30 * Math.max(o.w, o.h);
        var rp = restFor(o);
        o.restX = rp.x; o.restY = rp.y;
        if (reduced) {
          o.x = rp.x; o.y = rp.y;
          o.rot = o.restRot;
          sleep(o);
          render(o);
        } else {
          spawn(o);
        }
      });
      if (!reduced) start();
      refreshRead();
    }

    function settleNow() {
      st.items.forEach(function (o) {
        if (o.dragging) return;
        var rp = restFor(o);
        o.x = rp.x; o.y = rp.y;
        o.rot = o.restRot;
        sleep(o);
        render(o);
      });
      refreshRead();
    }

    function setOptions(opts) {
      for (var k in (opts || {})) if (k in cfg) cfg[k] = opts[k];
    }

    function readout() {
      return {
        count: st.items.length,
        settled: st.items.filter(function (o) { return o.settled; }).length,
        gravity: cfg.gravity, bounce: cfg.bounce,
        width: st.w, height: st.h,
        running: st.running, reducedMotion: reduced
      };
    }

    function destroy() {
      stop();
      st.destroyed = true;
      if (st.io) st.io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      st.items.forEach(function (o) { o.el.classList.remove('is-dragging', 'is-settled'); });
    }

    function onVisibility() { document.hidden ? stop() : (st.visible && start()); }

    function onResize() {
      var prevW = st.w;
      measure();
      if (!st.w || st.w === prevW) return;
      st.items.forEach(function (o) {
        o.w = o.el.offsetWidth || o.w;
        o.h = o.el.offsetHeight || o.h;
        o.rad = 0.30 * Math.max(o.w, o.h);
        var rp = restFor(o);
        o.restX = rp.x; o.restY = rp.y;
        o.x = clamp(o.x, 0, Math.max(0, st.w - o.w));
        if (o.settled) { o.x = rp.x; o.y = rp.y; render(o); }
      });
    }

    /* ---- 初始化 ---- */
    measure();
    st.items = els.map(makeItem);
    measure();
    st.items.forEach(function (o) {
      o.w = o.el.offsetWidth || o.w;
      o.h = o.el.offsetHeight || o.h;
      o.rad = 0.30 * Math.max(o.w, o.h);
      var rp = restFor(o);
      o.restX = rp.x; o.restY = rp.y;
      o.el.style.bottom = 'auto';          // 交给 JS 用 transform 驱动
      o.el.style.top = '0';
      o.el.style.left = '0';               // --x 已被读出为 xFrac，清掉以免与 transform 叠加
      o.el.style.removeProperty('--r');
      o.el.style.transformOrigin = '50% 50%';   // JS 路径以中心为旋转轴，包围盒与碰撞中心一致
      bind(o);
    });

    if (reduced) {
      layoutRest();
      st.visible = true;
    } else {
      st.items.forEach(function (o) { o.x = o.restX; o.y = -(o.h + 600); o.rot = o.restRot; render(o); });
    }

    if ('IntersectionObserver' in window) {
      st.io = new IntersectionObserver(function (entries) {
        st.visible = entries[0].isIntersecting;
        if (st.visible) {
          st.dropTimer = window.setTimeout(reset, cfg.dropDelayMs);
        } else {
          window.clearTimeout(st.dropTimer);
          stop();
        }
      }, { threshold: 0.15 });
      st.io.observe(root);
    } else {
      st.visible = true;
      st.dropTimer = window.setTimeout(reset, cfg.dropDelayMs);
    }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);

    function refreshRead() {
      var read = root.querySelector('[data-sweets-read]');
      if (!read) return;
      var r = readout();
      read.textContent = r.count + ' 件 · 静置 ' + r.settled + ' · 重力 ' + r.gravity.toFixed(2) +
        ' · 恢复 ' + r.bounce.toFixed(2) + ' · 色场 ' + r.width + '×' + r.height +
        (r.reducedMotion ? ' · reduce-motion' : '');
    }

    // 面板控件（若 demo 提供）；测量与调参不占主画面
    root.querySelectorAll('[data-sweets-opt]').forEach(function (input) {
      input.addEventListener('input', function () {
        var v = {}; v[input.getAttribute('data-sweets-opt')] = parseFloat(input.value);
        setOptions(v);
        var out = input.parentNode.querySelector('output');
        if (out) out.textContent = input.value;
        refreshRead();
      });
    });
    root.querySelectorAll('[data-sweets-reset]').forEach(function (b) { b.addEventListener('click', function () { reset(); refreshRead(); }); });
    root.querySelectorAll('[data-sweets-settle]').forEach(function (b) { b.addEventListener('click', function () { settleNow(); refreshRead(); }); });
    refreshRead();

    return {
      reset: reset, settleNow: settleNow, setOptions: setOptions,
      readout: readout, destroy: destroy,
      get items() { return st.items; },
      get state() { return st; }        // 便于调试/二次开发读取运行时状态（只读参考）
    };
  }

  var instances = [];

  function autoMount(scope) {
    var list = (scope || document).querySelectorAll('[data-sweets-band]');
    return Array.prototype.map.call(list, function (el) {
      var inst = mount(el);
      if (inst) instances.push(inst);
      return inst;
    });
  }

  window.ThrowableSweets = {
    mount: mount, autoMount: autoMount, defaults: DEFAULTS,
    get instances() { return instances; }
  };

  if (document.readyState !== 'loading') autoMount();
  else document.addEventListener('DOMContentLoaded', function () { autoMount(); });
})();