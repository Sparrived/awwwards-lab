/* Halbton · "Under the print" — hold-to-lift lens.
 *
 * Independent implementation of the observed mechanism:
 *   hold the lens  ->  the sheet under it is scaled 1.6x about the pointer and
 *                      the ink layer is unmasked inside the lens circle only
 *   release        ->  the lens parks back at its dock and the ink hides again
 *
 * No dependencies. Works offline and from file://. Degrades to a static sheet
 * with readable notes when JS is off.
 *
 * Usage:
 *   var lens = HalbtonLens.create(document.querySelector('[data-lens-root]'));
 *   lens.revealAll(true); lens.destroy();
 * Auto-initialises on every [data-lens-root].
 */
(function () {
  'use strict';

  var DEFAULTS = {
    zoom: null,       // fallback if --hb-zoom is unreadable
    reveal: null,     // ink radius / lens radius
    holdDelay: 130    // ms of stillness before "press and hold" lifts the lens
  };

  function num(v, fallback) {
    var n = parseFloat(v);
    return isFinite(n) ? n : fallback;
  }

  function Lens(root, options) {
    this.root = root;
    this.opt = Object.assign({}, DEFAULTS, options || {});
    this.sheet = root.querySelector('[data-lens-sheet]');
    this.glass = root.querySelector('[data-lens-glass]');
    this.trackEl = root.querySelector('[data-lens-track]');
    this.dock = root.querySelector('[data-lens-dock]');
    this.count = root.querySelector('[data-lens-count]');
    this.notes = [].slice.call(root.querySelectorAll('[data-note-id]'));
    this.found = Object.create(null);
    this.held = false;
    this.timer = 0;
    this.x = 0;
    this.y = 0;
    this.clone = null;
    var cs = getComputedStyle(root);
    this.zoom = num(this.opt.zoom, num(cs.getPropertyValue('--hb-zoom'), 1.6));
    this.reveal = num(this.opt.reveal, num(cs.getPropertyValue('--hb-reveal'), 0.8));
    // --hb-lens-r is a clamp(): getComputedStyle hands custom properties back as
    // the raw token stream, so the real radius is measured off the glass box.
    this.radius = 0;
    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    this._park();
    root.addEventListener('pointerdown', this._onDown);
    var all = root.querySelector('[data-lens-all]');
    if (all) all.addEventListener('click', this._toggleAll.bind(this));
    this._all = all;
  }

  Lens.prototype._radius = function () {
    var r = this.glass.getBoundingClientRect().width / 2;
    if (isFinite(r) && r > 0) this.radius = r;
    return this.radius || 120;
  };

  Lens.prototype._onDown = function (ev) {
    if (ev.button !== undefined && ev.button !== 0) return;
    var fromDock = !!this.dock && this.dock.contains(ev.target);
    if (!fromDock && ev.target.closest('a, button, input, textarea, select')) return;
    this._move = false;
    this._from = { x: ev.clientX, y: ev.clientY };
    this.x = ev.clientX;
    this.y = ev.clientY;
    this.track(window);
    if (fromDock) {
      this._lift(ev.clientX, ev.clientY);
    } else {
      // "press and hold": lift only after the pointer has settled, so a plain
      // tap or a scroll gesture is never swallowed.
      var self = this;
      this.timer = window.setTimeout(function () { self._lift(self.x, self.y); }, this.opt.holdDelay);
    }
  };

  Lens.prototype.track = function (target) {
    target.addEventListener('pointermove', this._onMove);
    target.addEventListener('pointerup', this._onUp);
    target.addEventListener('pointercancel', this._onUp);
  };

  Lens.prototype.untrack = function (target) {
    target.removeEventListener('pointermove', this._onMove);
    target.removeEventListener('pointerup', this._onUp);
    target.removeEventListener('pointercancel', this._onUp);
  };

  Lens.prototype._onMove = function (ev) {
    this.x = ev.clientX;
    this.y = ev.clientY;
    if (!this.held) {
      if (this._from && Math.abs(ev.clientX - this._from.x) + Math.abs(ev.clientY - this._from.y) > 6) {
        window.clearTimeout(this.timer); // it was a drag/scroll, not a hold
      }
      return;
    }
    this._place(ev.clientX, ev.clientY);
  };

  Lens.prototype._onUp = function () {
    window.clearTimeout(this.timer);
    this.untrack(window);
    if (this.held) this.drop();
  };

  Lens.prototype._ensureClone = function () {
    if (this.clone) return this.clone;
    var copy = this.sheet.cloneNode(true);
    copy.removeAttribute('id');
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('inert', '');
    copy.classList.add('hb-clone');
    var w = this.sheet.getBoundingClientRect().width;
    copy.style.width = w + 'px';
    copy.style.minHeight = this.sheet.getBoundingClientRect().height + 'px';
    this.trackEl.appendChild(copy);
    this.clone = copy;
    return copy;
  };

  Lens.prototype._lift = function (px, py) {
    if (this.held) return;
    this.held = true;
    this._ensureClone();
    this.root.classList.add('is-lifting');
    document.documentElement.classList.add('hb-held');
    this._place(px, py);
  };

  Lens.prototype._place = function (px, py) {
    var r = this._radius();
    this.glass.style.transform = 'translate3d(' + (px - r) + 'px,' + (py - r) + 'px,0)';
    var rect = this.sheet.getBoundingClientRect();
    var tx = r - this.zoom * (px - rect.left);
    var ty = r - this.zoom * (py - rect.top);
    if (this.clone) {
      this.clone.style.transform =
        'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + this.zoom + ')';
    }
    // the sheet's own ink layer is masked to the lens circle (observed --sr/--sx/--sy)
    var rr = r * this.reveal;
    var cx = px - rect.left;
    var cy = py - rect.top;
    for (var i = 0; i < this.notes.length; i++) {
      var n = this.notes[i];
      var nr = n.getBoundingClientRect();
      n.style.setProperty('--hb-r', rr.toFixed(1) + 'px');
      n.style.setProperty('--hb-x', (cx - (nr.left - rect.left)).toFixed(1) + 'px');
      n.style.setProperty('--hb-y', (cy - (nr.top - rect.top)).toFixed(1) + 'px');
      var d = Math.hypot(cx - (nr.left + nr.width / 2 - rect.left), cy - (nr.top + nr.height / 2 - rect.top));
      if (d < rr) this._find(n);
    }
  };

  Lens.prototype._find = function (n) {
    var id = n.getAttribute('data-note-id');
    if (this.found[id]) return;
    this.found[id] = true;
    n.classList.add('is-found');
    var dot = this.root.querySelector('[data-dot="' + id + '"]');
    if (dot) dot.classList.add('is-found');
    var k = Object.keys(this.found).length;
    if (this.count) this.count.textContent = k + ' / ' + this.notes.length;
  };

  Lens.prototype.drop = function () {
    if (!this.held) return;
    this.held = false;
    this.root.classList.remove('is-lifting');
    document.documentElement.classList.remove('hb-held');
    for (var i = 0; i < this.notes.length; i++) {
      this.notes[i].style.removeProperty('--hb-r');
      this.notes[i].style.removeProperty('--hb-x');
      this.notes[i].style.removeProperty('--hb-y');
    }
    this._park();
  };

  Lens.prototype._park = function () {
    // park the lens over the dock so the "lift" reads as picking it up
    var d = this.dock ? this.dock.getBoundingClientRect() : null;
    var r = this._radius();
    var cx = d ? d.left + d.width / 2 : r;
    var cy = d ? d.top + d.height / 2 : r;
    this.x = cx;
    this.y = cy;
    this.glass.style.transform = 'translate3d(' + (cx - r) + 'px,' + (cy - r) + 'px,0)';
  };

  Lens.prototype.revealAll = function (on) {
    var want = on === undefined ? !this.root.classList.contains('is-revealed') : !!on;
    this.root.classList.toggle('is-revealed', want);
    if (this._all) this._all.setAttribute('aria-pressed', String(want));
    return want;
  };

  Lens.prototype._toggleAll = function () {
    this.revealAll();
  };

  Lens.prototype.destroy = function () {
    window.clearTimeout(this.timer);
    this.root.removeEventListener('pointerdown', this._onDown);
    this.untrack(window);
    if (this._all) this._all.removeEventListener('click', this._toggleAll);
    this.drop();
    if (this.clone && this.clone.parentNode) this.clone.parentNode.removeChild(this.clone);
    this.clone = null;
  };

  function create(root, options) {
    if (!root) return null;
    var existing = root.__halbtonLens;
    if (existing) return existing;
    var inst = new Lens(root, options);
    root.__halbtonLens = inst;
    return inst;
  }

  document.documentElement.classList.remove('no-js');
  function boot() {
    [].slice.call(document.querySelectorAll('[data-lens-root]')).forEach(function (el) { create(el); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.HalbtonLens = { create: create, Lens: Lens };
})();
