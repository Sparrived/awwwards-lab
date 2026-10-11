# 错峰分格揭示 · staggered cell reveal

- 类别：motion
- 来源：[awwwards](https://www.awwwards.com/sites/ownitt-2) → [原站](https://ownitt.fr/)
- 作者：（列表页未提供，未取证） ｜ 获奖：Awwwards Nominee（具体日期页未提供）
- 萃取机制：网格瓦片错峰揭示 —— 每格以 `clip-path` 从中心展开、轻微上移并淡入，逐格延迟 75ms

## 这是什么

一个把「网格里 N 个瓦片依次出现」做成入场节奏的动效配方：所有瓦片共用同一段揭示关键帧，只靠 `animation-delay = 序号 × 固定步长` 拉开错峰，再让每 3 个瓦片叠加一次 3D 翻转打破单调。原站用它做首屏的图片矩阵入场（播放一次后整个 overlay 从 DOM 卸载）。

## 取证记录（真实测量，非推测）

原站类名来自 CSS modules，带模块前缀 `IntroAnimation-module__HH0i_W__`。
下表为可读性简写为 `.__cell`，**完整选择器**：`.IntroAnimation-module__HH0i_W__cell` /
`.IntroAnimation-module__HH0i_W__cellInner` / `.IntroAnimation-module__HH0i_W__grid`
（复核时请用完整名，简写在站上查不到，容易被误判为编造）。

| 项 | 值 | 来源 |
| --- | --- | --- |
| 揭示时长 | `0.9s` | `.IntroAnimation-module__HH0i_W__cell { animation-duration }`（计算样式实测） |
| 揭示缓动 | `cubic-bezier(0.65, 0, 0.35, 1)` | 同上 `animation-timing-function` |
| 揭示填充 | `forwards` | 同上 `animation-fill-mode` |
| 错峰步长 | `75ms` | `.…__cellInner { animation-delay: calc(var(--i) * 75ms) }` |
| 揭示关键帧 | `0%{clip-path:inset(50%); opacity:0; transform:translateY(14px)} 50%{opacity:1} 100%{clip-path:inset(0px); opacity:1; transform:translateY(0px)}` | `@keyframes IntroAnimation-module__HH0i_W__cellReveal`（CSS 原文逐字） |
| 3n 翻转 | `cellFlip 1s cubic-bezier(0.77,0,0.175,1) calc(var(--i)*75ms) both` | `.…__cell:nth-child(3n) .…__cellInner`（计算样式实测，实体 delay 实测 `0.15s` = 2×75ms） |
| 3n 翻转关键帧 | `0%{rotateY(0)} 50%{rotateY(90deg)} 100%{rotateY(0)}` | `@keyframes IntroAnimation-module__HH0i_W__cellFlip`（CSS 原文逐字） |
| 网格列 | 5 列，实测每列 `228.34px`（1280 视口）→ `repeat(5, 1fr)` | `.…__grid` 计算样式 `grid-template-columns` |
| 网格 gap | 实测 `8.96px` = `clamp(5px, 0.7vw, 10px)` @1280 | `.…__grid` 计算样式 `gap` |
| 网格尺寸 | 实测 `width 1177.59px` = `min(92vw, 1260px)` @1280；`height 520px` = `min(46vw, 520px)` | 同上 `width` / `height` |
| 瓦片数 | 实测首屏 overlay 内 30 个 `__cell`（5 列 × 6 行） | DOM 实测（**不是** 5×2；demo 用 10 格仅为演示规模） |
| 颗粒叠加 | grainFade `700ms`（delay 50ms）+ grainDrift `1800ms`（delay 500ms） | `getAnimations()` |
| 触发 | load 一次性入场（`animation-fill-mode: forwards`），**由 `sessionStorage['ownitt_intro_seen']` 门控：首访播放、复访整个 overlay 不再挂载** | 交互实测 + storage 键实测 |

**复核要点（不做这两步会取不到数据）：**
1. 先把 `sessionStorage` / `localStorage` 清掉再访问站点，否则 overlay 不挂载（DOM 里 `__cell` 数量为 0，是正常现象而非机制不存在）。
2. 入场 overlay 播完即从 DOM 移除，所以截图只能截到「入场结束后」的状态。

**仍未取证项（如实标注）：** 无。上一版标注的 `cellFlip` 关键帧内容已补取到（见上表），demo 已由 `rotateY(85°→0)` 的近似**改为逐字复刻**。

**未萃取但已发现（留给后续条目）：** 同模块还有一对门开合关键帧
`@keyframes …__doorLeftSlide / …__doorRightSlide`：`0%{translate(-100%)} 48%{translate(0)} 52%{translate(0)} 100%{translate(-100%)}`（右门镜像），以及 `logoDraw`、`taglineOverlay` 等子动效。

截图：`shots/hero.png`（原站首屏，入场结束态）。

## 怎么用

```html
<link rel="stylesheet" href="src/component.css">
<div class="sgr-grid" data-sgr data-flip="on" style="--sgr-cols:5">
  <div class="sgr-cell" style="--i:0"><div class="sgr-cell__inner"></div></div>
  <div class="sgr-cell" style="--i:1"><div class="sgr-cell__inner"></div></div>
  <!-- … 任意格数；--i 递增 -->
</div>
<script src="src/component.js"></script>
```

调用说明：`--i` 可写在 HTML（无 JS 也能错峰），也可交给 `StaggerReveal.init()` 自动编号；`StaggerReveal.replay(gridEl)` 重放。

## 怎么改

- token 在 `src/component.css` 顶部的 `:root` 块（`--sgr-dur / --sgr-ease / --sgr-stagger / --sgr-rise / --sgr-flip-* / --sgr-cols`）；
- 行为在 `src/component.js` 顶部（编号与重放逻辑）；
- 降级：`@media (prefers-reduced-motion: reduce)` 把时长压到 1ms、延迟归零，直接呈现终态。

## 自检怎么验（可复现）

标签页不可见（`document.visibilityState === 'hidden'`）时动画时钟不推进（`document.timeline.currentTime` 恒为 0），
此时 `getAnimations()` 的 `playState` 仍报 `running`、但属性值是冻结的 —— 只看动画条数会误判。确定性做法是**主动 seek**：

```js
document.getAnimations().forEach(a => { a.pause(); a.currentTime = 900; });
// 再读计算样式：clip-path 应为 inset(0%)、opacity 1、transform 无位移
```

实测（seek 法）：`t=0` → `inset(50%) / opacity 0 / translateY(14px)`；`t=450` → `inset(25%) / opacity 1`；
`t=900` → `inset(0%) / opacity 1 / translateY(0)`；三格 delay 实测 `0 / 75ms / 150ms`。

## 依赖

无。纯原生 HTML/CSS/JS，零构建、双击即开。（原站用 GSAP/React，此处按清洁室原则以原生等价复刻，不引入其依赖。）

## 清洁室声明

未复制原站代码、图片、字体、视频或品牌文案；demo 瓦片以纯 CSS 渐变占位。
字体替代：本条只涉及动效，未使用任何字体资源；demo 用系统 `system-ui`。
