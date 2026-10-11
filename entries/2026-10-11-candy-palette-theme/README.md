# 糖果配色主题 · candy palette theme

- 类别：theme
- 来源：[awwwards](https://www.awwwards.com/sites/ring-pop-r-candy) → [原站](https://ringpopcandy.com/)
- 作者：（列表页未提供，未取证） ｜ 获奖：Awwwards Nominee（具体日期页未提供）
- 萃取机制：暖米白底 + 单一近墨色 + 一组高饱和糖果原色的配色主题 token 系统

## 这是什么

一套「能承住高能量」的配色 token：用一块暖米白底（`#FFF7E9`）当画布、单一深墨色（`#141723`）承载所有文字，再让一组互补的高饱和原色（黄/红/蓝/粉/青柠/橙/深绿）去做色块分区与强调；配一套极端字号对比的排印比例。原站是糖果品牌的电商改版首屏。

## 取证记录（真实测量，非推测）

| 项 | 值 | 来源 |
| --- | --- | --- |
| 底色 ground | `#FFF7E9` `rgb(255,247,233)` | `getComputedStyle(document.body).backgroundColor` |
| 墨色 ink | `#141723` `rgb(20,23,35)` | `getComputedStyle(document.body).color` |
| 黄 | `#FFF200` `rgb(255,242,0)` | 元素背景色去重统计（页面最常用强调色之一） |
| 红 | `#E1251B` `rgb(225,37,27)` | 同上 |
| 蓝 | `#2B6FFC` `rgb(43,111,252)` | 同上（出现频次最高的强调色） |
| 粉 | `#F9367A` `rgb(249,54,122)` | 同上 |
| 青柠 | `#64F525` `rgb(100,245,37)` | 同上 |
| 橙 | `#FC7600` `rgb(252,118,0)` | 同上 |
| 深绿 | `#0B7302` `rgb(11,115,2)` | 同上 |
| 中性 clay | `#D7CEC3` `rgb(215,206,195)` | 同上 |
| Display 字号 | `250px`，行高 `213px`（0.85），字距 `-5px`（-0.02em），字重 `400` | `getComputedStyle(h1)`（文案 "Ring Pop"） |
| 正文字号 | `20px`（body） | `getComputedStyle(document.body).fontSize` |
| 按钮 | 字号 `24px`，padding `23px 40px`，圆角 `16px` | `getComputedStyle(a 主按钮)` |
| 动效 | 首屏 `document.getAnimations().length === 0` → **静态配色型站点** | `getAnimations()` |

说明：强调色由「页面所有可见元素背景色去重」得到，已剔除外链站点通用灰（`#E7E7E8` 等）。色值均为浏览器实算的 `rgb()`，非从缩略图目测。

截图：`shots/hero.png`（原站首屏）。

## 怎么用

```html
<link rel="stylesheet" href="src/component.css">
<body class="candy-stage">
  <h1 class="candy-title">Sweet</h1>
  <a class="candy-btn" href="#">主按钮</a>
  <button class="candy-btn candy-btn--red">红色强调</button>
  <span class="candy-chip">★ New flavour</span>
  <div class="swatches" data-candy-swatches></div>
</body>
<script src="src/component.js"></script>
```

调用说明：`api` —— 引入 CSS 后用 `.candy-stage / .candy-title / .candy-btn / .candy-chip / .candy-swatch`；全部值走 `--candy-*` 变量，整体覆盖即可换肤。`window.CandyTheme.readTokens()` 可读当前 token。

## 怎么改

- token 在 `src/component.css` 顶部的 `:root` 块（色值 + 字号 + 间距）；
- 行为在 `src/component.js`（读取 token 渲染色板、点击复制 hex）；
- 断点/降级：`display-size` 用 `clamp(72px, 22vw, 250px)`，小屏自动收；`prefers-reduced-motion` 下按钮过渡关闭。

## 依赖

无。系统字体、纯 CSS，零 CDN、零构建。断网时双击 `demo/index.html` 正常可读。

## 清洁室声明

未复制原站代码、图片、字体、视频或品牌文案；demo 用纯 CSS 色块与自绘色板占位，未使用品牌 logo/图片。
字体替代：原站 display 字体 **RINGOLD** 与正文 **GREED STANDARD** 均为商用字体 → 替换为系统无衬线（`system-ui, "Helvetica Neue", Arial`），并保留原站实测的字号/行高/字距比例。demo 标题文案改用中性词 "Sweet"，未复制品牌文案。
