# 巨字分幕装置 · giant type scenes

- 类别轴：typography（**由 theme 轴发现、复盘后改到 typography**，见下）
- 萃取的维度（strength）：`type-as-image`（排印当图像）
- 来源：[awwwards](https://www.awwwards.com/sites/ring-pop-r-candy) → [原站](https://ringpopcandy.com/)
- 作者：（列表页未提供，未取证） ｜ 获奖：Awwwards Nominee

## 这是什么

一条反直觉的做法：**不画主视觉，把标题放大成主视觉。**

同一套排印规则（全大写、字距 `-0.02em`、行高比压紧）在 10 个区段里重复，只改两件事——**字号**（102 / 120 / 128 / 160 / 250px）和**断行位置**。于是：

- 短句被强制断成 2~4 行，变成一块占大半屏的长方形「字屏」；
- 长单词一字母一行（`W E D D I N G`），变成一根竖字柱；
- 每段配一个**整屏色块**当幕，色块切换即章节切换。

关键参数是**行高比**而不是字号：250px 的字配 170 / 205 / 213px 行高（0.680 / 0.820 / 0.852），字号变小比值不变（120→100 = 0.833）。行高比压紧，字块才会像印刷物一样贴成一块，而不是「一行行排开的标题」。

色板在这里的角色**不是审美，是分幕**：8 个高饱和原色被放大到 1278px 宽，和 250px 的字并置，反而被尺度压住了。

## 取证记录（真实测量，非推测）

| 项 | 值 | 来源 |
| --- | --- | --- |
| 区段标题数 | 10 个 `.section-title` | DOM 实测 |
| 标题字号 | `250px`（6 段）/ `160px` / `128px` / `120px` / `102px` | 逐段 `getComputedStyle` |
| 标题行高 | `170px` / `205px` / `213px`（250px 字号下按字面微调） | 同上 |
| 行高比 | `0.680` / `0.820` / `0.852`；小字号同比 `0.833` / `0.843` / `0.836` / `0.719` | 行高 ÷ 字号，实测 |
| 字距 | `-0.02em`（-5px @ 250px） | 同上 |
| 大写 | `text-transform: uppercase`；标题为 `display: inline-block` | 同上 |
| 真实 h1 | `h1.visually-hidden`（对读屏可见、对视觉隐藏） | DOM 实测 |
| 分幕尺度 | 页面总高 `11047px`，14 个 `section`；整屏色块宽 `1278px`（视口 1280），单块高 `766~1209px` | 几何实测 |
| 动效 | **25 个 `@keyframes`** + **147 处 `transition` 声明** | 样式表全文统计 |
| 其中可确定时长的 | `animateMenuOpen 0.4s cubic-bezier(0.5,0,0,1)`、`placeholderCardShimmer 2.25s ease`、`dash 1.4s ease-in-out`、`offcanvas-search-caret-blink 1s step-end` | 规则匹配 |
| 配色 | ground `#FFF7E9` / ink `#141723` / blue `#2364E7` / red `#E1251B` / yellow `#FFF200` / orange `#FC7600` / green `#0B7302` | 计算样式（rgb→hex 归一化） |

## 别照搬（这条和机制一样重要）

1. **配色本身并不精致。** 8 个高饱和原色并置，单看色板不是好配色——它成立只是因为色块被放大到整屏、与 250px 巨字并置。**把它的色板抄到小尺寸界面会立刻显廉价。**
2. **全大写 + 强制换行牺牲可读性。** 一字母一行只对短英文单词成立；中文、德文长词、需要连续阅读的段落都不适用。
3. **强依赖商用字体与大幅摄影。** 原站用 Ringold（商用）与大量商品图，本 demo 只能以系统无衬线 + 纯色替代，观感会打折。

## 复刻时的两处必要修正

- **字号必须双约束**：`clamp(32px, min(16.6vw, 40svh), 250px)`。只用 `vw` 只保证「撑满宽度」，在矮窗口里多行字块会被裁掉——实测 6 行 × 250px = 1278px，而视口高只有 577px。`svh` 那一项保证「不超出高度」。
- **原站揭示机制未取证**：demo 里的入场揭示是我们自加的（CSS 滚动驱动动画 `animation-timeline: view()`，浏览器不支持则退化为静止呈现），标记 `[未验证]`，可整块删掉。

## 怎么用

```html
<link rel="stylesheet" href="src/scenes.css">
<section class="scene s1">
  <h2 class="scene__title">PUT YOUR
COLORS ON</h2>          <!-- 换行是真实的换行符，white-space: pre 保留 -->
  <span class="scene__spec">250px · lh 0.852 · 2 行</span>
</section>
```

新增一幕：加一个 `.sN` 类，给 `--bg / --fg / --fs / --lh / --fw` 五个变量即可。

## 怎么改

- 全部可调项在 `src/scenes.css` 顶部的 `:root`（色板、字体栈、字距、内边距）与各 `.sN` 类（每幕的底色/字色/字号/行高比）；
- 字号公式：`--fs: clamp(下限, min(宽度项, 高度项), 上限)`——宽度项 ≈ `148vw ÷ 行内字符数`，高度项 ≈ `100svh ÷ (行数 × 行高比) × 0.75`；
- 降级：`prefers-reduced-motion` 下不加揭示动画；不支持滚动驱动动画的浏览器直接静止呈现，不影响排版。

## 依赖

无。纯原生 HTML/CSS，零构建、零 JS、零 CDN，双击即开。断网正常可读。

## 复盘记录：这条为什么被改名

本条最初被记为 **`2026-10-11-candy-palette-theme`「糖果配色主题」**，轴为 `theme`。问题在两处：

1. **分类轴反过来决定了叙事**——当天轮换轴是「配色主题」，于是最容易测量的东西（色值）成了条目主题；
2. **只写优点**，没有判断`——原站的配色其实并不出众，条目却把它当成了学习对象。

修正：改轴为 `typography`、改名为 `giant-type-scenes`、机制改为「巨字分幕装置」、补 `strength` / `expression` / `composition` / `motion_catalog` / `dont_copy`，并修掉了原条目里「静态配色型站点」的错误结论（`getAnimations()=0` 只是采样时刻无运行动画，实际站内有 25 个 keyframe）。提示词同步升到 v7：**分类轴只是搜索面，不是命令；必须写出它不出众的地方。**

截图：`shots/original-site.png`（原站首屏，非本 demo）。
