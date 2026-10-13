/* sweet-shapes.js — 原创「糖环」图形工厂（独立实现，非搬运）
 *
 * 设计角色（必须保留，见 README「素材替代」）：
 *   1) 轮廓：环形带（belt/loop）+ 顶端一颗饱满宝石主体，二者一体、有明确上下方向；
 *   2) 体积：径向/线性渐变制造圆润体积感，不是纯色剪影；
 *   3) 透明性：画布透明，主体外无底衬，所以能互相遮挡、能压在色场文字上；
 *   4) 视觉重心：重心偏下（环带），宝石压在环带上方 1/3；
 *   5) 相对尺度：单件约占色场宽度 15%–24%，彼此差别不悬殊。
 *
 * 与来源素材的关系：只借用「环 + 宝石」的轮廓关系与透明背景角色，
 * 颜色、切面、高光、命名全部自制，不使用来源站任何图片或字体。
 */
(function () {
  'use strict';

  var VIEW = { w: 240, h: 210 };

  function esc(s) { return String(s).replace(/[<>"&]/g, function (c) {
    return ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' })[c];
  }); }

  /* 一种口味 = 一个色族：宝石主色、宝石高光、环带主色、环带暗面 */
  var FLAVOURS = {
    berry:  { gem: '#E8352B', gemHi: '#FFB4A6', gemDeep: '#9E1B14', band: '#C7221B', bandHi: '#FF8A79' },
    mango:  { gem: '#F2A02E', gemHi: '#FFE0A8', gemDeep: '#A9631A', band: '#D07F1B', bandHi: '#FFCF7A' },
    lime:   { gem: '#A8E23A', gemHi: '#E8FFB8', gemDeep: '#5F8D17', band: '#82B424', bandHi: '#D6F58A' },
    blush:  { gem: '#F0629E', gemHi: '#FFC6DE', gemDeep: '#A62F60', band: '#CE4A82', bandHi: '#FFA8CB' },
    aqua:   { gem: '#2ED3C6', gemHi: '#B4FFF7', gemDeep: '#12837A', band: '#22A79C', bandHi: '#8FF0E6' },
    grape:  { gem: '#8A4BE8', gemHi: '#D6BCFF', gemDeep: '#4F2394', band: '#6A34BC', bandHi: '#B994F5' },
    lemon:  { gem: '#F7E13C', gemHi: '#FFF8C2', gemDeep: '#A89317', band: '#CFBB24', bandHi: '#FFEF8A' }
  };

  /* 宝石切面：不同口味用不同的切面方向，避免七件长得一模一样 */
  function facetLines(f, i) {
    var cx = 120, cy = 54, r = 52;
    if (i % 3 === 0) {
      return '<path d="M' + (cx - r * 0.62) + ' ' + (cy + r * 0.30) + ' L' + cx + ' ' + (cy - r * 0.78) +
             ' L' + (cx + r * 0.62) + ' ' + (cy + r * 0.30) + '" fill="none" stroke="' + f.gemDeep +
             '" stroke-opacity="0.30" stroke-width="3" stroke-linejoin="round"/>';
    }
    if (i % 3 === 1) {
      return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (r * 0.62) + '" ry="' + (r * 0.30) +
             '" fill="none" stroke="' + f.gemDeep + '" stroke-opacity="0.26" stroke-width="3"/>';
    }
    return '<path d="M' + (cx - r * 0.5) + ' ' + (cy - r * 0.1) + ' Q' + cx + ' ' + (cy + r * 0.55) + ' ' +
           (cx + r * 0.5) + ' ' + (cy - r * 0.1) + '" fill="none" stroke="' + f.gemDeep +
           '" stroke-opacity="0.28" stroke-width="3"/>';
  }

  /**
   * 生成一枚原创糖环 SVG 字符串。
   * @param {string} flavour FLAVOURS 的键
   * @param {string} id      渐变 id 前缀，同一页每个实例唯一
   * @param {number} variant 0..2，决定切面样式
   */
  function sweetSvg(flavour, id, variant) {
    var f = FLAVOURS[flavour] || FLAVOURS.berry;
    var uid = esc(id + '-' + flavour);
    return '' +
      '<svg class="sweet__art" viewBox="0 0 ' + VIEW.w + ' ' + VIEW.h + '" role="img" aria-hidden="true" focusable="false">' +
        '<defs>' +
          '<linearGradient id="' + uid + '-band" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="' + f.bandHi + '"/>' +
            '<stop offset="0.45" stop-color="' + f.band + '"/>' +
            '<stop offset="1" stop-color="' + f.gemDeep + '"/>' +
          '</linearGradient>' +
          '<radialGradient id="' + uid + '-gem" cx="0.38" cy="0.30" r="0.85">' +
            '<stop offset="0" stop-color="' + f.gemHi + '"/>' +
            '<stop offset="0.5" stop-color="' + f.gem + '"/>' +
            '<stop offset="1" stop-color="' + f.gemDeep + '"/>' +
          '</radialGradient>' +
        '</defs>' +
        /* 环带：外椭圆减内椭圆，得到有厚度的圈 */
        '<path fill-rule="evenodd" fill="url(#' + uid + '-band)" d="' +
          'M120 74 A86 58 0 1 0 120 190 A86 58 0 1 0 120 74 Z ' +
          'M120 104 A52 30 0 1 0 120 164 A52 30 0 1 0 120 104 Z"/>' +
        /* 环带顶部高光，制造塑料/糖体的湿润感 */
        '<path d="M46 100 A86 58 0 0 1 194 100" fill="none" stroke="' + f.bandHi +
          '" stroke-opacity="0.55" stroke-width="7" stroke-linecap="round"/>' +
        /* 宝石主体：上圆下收的水滴形，压在环带上方 */
        '<path fill="url(#' + uid + '-gem)" d="' +
          'M120 4 C160 4 186 34 186 66 C186 100 156 122 120 122 C84 122 54 100 54 66 C54 34 80 4 120 4 Z"/>' +
        facetLines(f, variant) +
        /* 高光：保持体积与视觉重心 */
        '<ellipse cx="96" cy="40" rx="20" ry="13" fill="#ffffff" fill-opacity="0.42" transform="rotate(-22 96 40)"/>' +
        '<ellipse cx="150" cy="92" rx="9" ry="5" fill="#ffffff" fill-opacity="0.22" transform="rotate(18 150 92)"/>' +
      '</svg>';
  }

  window.SweetShapes = { sweetSvg: sweetSvg, flavours: Object.keys(FLAVOURS), viewBox: VIEW };
})();
