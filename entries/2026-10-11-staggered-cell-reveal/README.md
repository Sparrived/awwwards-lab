# 错峰分格揭示 · staggered cell reveal

- 类别：motion
- 来源：[awwwards](https://www.awwwards.com/sites/ownitt-2) → [原站](https://ownitt.fr/)
- 作者：（列表页未提供，未取证） ｜ 获奖：Awwwards Nominee（具体日期页未提供）
- 萃取机制：网格瓦片错峰揭示 —— 每格以 `clip-path` 从中心展开、轻微上移并淡入，逐格延迟 75ms

## 这是什么

一个把「网格里 N 个瓦片依次出现」做成入场节奏的动效配方：所有瓦片共用同一段揭示关键帧，只靠 `animation-delay = 序号 × 固定步长` 拉开错峰，再让每 3 个瓦片叠加一次 3D 翻转打破单调。原站用它做首屏的图片矩阵入场。

## 取证记录（真实测量，非推测）

| 项 | 值 | 来源 |
| --- | --- | --- |
| 揭示时长 | `900ms` | `.__cell { animation-duration: 0.9s }`（CSSOM 规则） |
| 揭示缓动 | `cubic-bezier(0.65, 0, 0.35, 1)` | `.__cell { animation-timing-function: … }` |
| 错峰步长 | `75ms` | `.__cellInner { animation-delay: calc(var(--i) * 75ms) }` |
| 揭示关键帧 | `0%{clip-path:inset(50%);opacity:0;translateY(14px)} 50%{opacity:1} 100%{clip-path:inset(0);opacity:1;translateY(0)}` | `@keyframes …__cellReveal` |
| 3n 翻转 | `1000ms cubic-bezier(0.77,0,0.175,1)`，同错峰 | `.__cell:nth-child(3n) .__cellInner { animation: …cellFlip … }` |
| 网格 | `grid-template-columns: repeat(5,1fr)` / `repeat(2,1fr)` 行；`gap: clamp(5px,0.7vw,10px)`；`width:min(92vw,1260px)`；`height:min(46vw,520px)` | `.__grid` 规则 |
| 颗粒叠加 | grainFade `700ms`（delay 50ms）+ grainDrift `1800ms`（delay 500ms） | `getAnimations()` |
| 触发 | load 一次性（`animation-fill-mode: forwards`） | 交互实测 |

**未取证项（如实标注，未用想象填补）：**
- `cellFlip` 关键帧的**具体内容**未取到（只拿到 duration/easing/delay），demo 里用 `rotateY(85°→0)` 等效**重建** → `[未验证]`。
- 原站 `__cell` 的可变 `--i` 由 JS 注入，`nth-child(3n)` 翻转的确切元素层级为重建。

截图：`shots/hero.png`（原站首屏，入场结束后）；因入场 overlay 播完即从 DOM 移除、轮询始终慢半拍，未能截到入场中的帧 → **无入场过程截图**。

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

- token 在 `src/component.css` 顶部的 `:root` 块（`--sgr-dur / --sgr-ease / --sgr-stagger / --sgr-rise / --sgr-cols`）；
- 行为在 `src/component.js` 顶部（编号与重放逻辑）；
- 降级：`@media (prefers-reduced-motion: reduce)` 把时长压到 1ms、延迟归零，直接呈现终态。

## 依赖

无。纯原生 HTML/CSS/JS，零构建、双击即开。（原站用 GSAP/React，此处按清洁室原则以原生等价复刻，不引入其依赖。）

## 清洁室声明

未复制原站代码、图片、字体、视频或品牌文案；demo 瓦片以纯 CSS 渐变占位。
字体替代：本条只涉及动效，未使用任何字体资源；demo 用系统 `system-ui`。
