# 巨字 × 满幅图分幕 · giant type scenes

- 类别轴：typography（**由 theme 轴发现、复盘后改到 typography**）
- 萃取的维度（strength）：`type-as-image`（排印当图像）
- 来源：[awwwards](https://www.awwwards.com/sites/ring-pop-r-candy) → [原站](https://ringpopcandy.com/)

## 三层叠起来才是它的看点

### ① 字压图（不是字配图）

标题不是摆在产品图旁边，而是**压在图上面**。实测：对标题中心点调用 `document.elementsFromPoint( cx, cy )`，命中的最上层元素是 `picture.mfr-responsive-image`——产品图就是字的底。

由此推翻了两个错误读法：

- **「它有一套配色方案」是偏的。** 全站底色**恒定**为 `rgb(255,247,233)`，一个值都没变过；每幕的「色」来自那张**满幅产品图**（实测宽 1278px ≈ 视口宽，高 863~1490px）。
- **真正逐幕变化的是「字色」，而字色是跟着图挑的**：粉 `#E8588A` 配桃底、萤光黄 `#E0FF18` 配蓝底、柠檬 `#64F525`、黄 `#FFF200`。所以它出众的是「**从图里挑字色**」这个配对动作，不是色板本身。

### ② 文字效果（静态首屏量不到，必须切状态）

标题被拆成**逐词块**：

```html
<div class="section-title__inner split-text--rendered">
  <div class="split-text is-inview"><span class="split-text__inner">PUT</span></div>
  <div class="split-text is-inview"><span class="split-text__inner">YOUR</span></div>
  …
```

配套的实测规则：

| 机制 | 实测规则 | 效果 |
| --- | --- | --- |
| 遮罩 | `[split-text="fadeUp"] .split-text { overflow: hidden }` | 每个词外面套一个遮罩盒 |
| 未进入视口 | `:not(.is-inview):not(.disable-inview) { opacity: 0; transform: translateY(min(100%, 80px)) }` | 词块藏在遮罩下方 |
| 进入视口 | JS 加 `.is-inview` | 词块**逐词从下往上抽出来**，天然可逐词错峰 |
| 词级局部换色 | `.section-title .highlighted / b / strong { color: var(--highlight-color) }` | 一个巨字块里可以让**某一个词换色** |
| 渐变高亮 | `.section-title.has-gradient-highlight strong` | 同上，换成渐变填充 |
| 下划线 | `strong::after { content:""; height: 0.025em; background: var(--underline-color) }` | **不是 border，是画出来的一条小条** |

### ③ 层级靠极端对比，不靠装饰

- kicker（`.small-title`）**16px** ↔ 巨字 **250px** = **15.6 倍**字号差，而且常常是**同色系**里的极小 + 极大；
- 分幕之间用 `.as-stacking-section--shadow { box-shadow: 0 -30px 40px }` 上投影制造**层叠感**；
- 巨字的秩序参数只有三个：行高比 `0.680~0.852`、字距 `-0.02em`、强制换行位置。

## 取证记录（真实测量）

| 项 | 值 | 来源 |
| --- | --- | --- |
| 全站底色 | `rgb(255,247,233)` **恒定** | `getComputedStyle(body).backgroundColor` |
| 满幅产品图 | 宽 `1278px`（视口 1280）、高 `863~1490px`；示例 `Bazooka_DefendTheRing_Website_Orange.jpg` | `img` 几何测量 |
| 标题数 / 字号 | 10 个 `.section-title`；`250px`（6 段）/ `160` / `128` / `120` / `102px` | 逐段 `getComputedStyle` |
| 行高比 | `250/170=0.680`、`250/205=0.820`、`250/213=0.852`、`120/100=0.833`、`102/86=0.843`、`128/107=0.836`、`160/115=0.719` | 行高 ÷ 字号 |
| 字距 / 大写 | `-0.02em`、`text-transform: uppercase` | 同上 |
| kicker | `.small-title` **16px** | 同上 |
| 分幕 | 5 个 `.as-stacking-section`，高 `863 / 882 / 942 / 839 / 859px` | 几何测量 |
| 页面总高 | `11047px`，14 个 `section` | 实测 |
| 动效 | **25 个 `@keyframes`** + **147 处 `transition`** | 样式表全文统计 |
| 真实 h1 | `h1.visually-hidden`（读屏可见、视觉隐藏） | DOM 实测 |

## 视效状态清单（关键帧原文实测）

| 动效 | 时长 | 关键帧原文（摘） |
| --- | --- | --- |
| `floating` | — | `0% translateY(0)` → `65% translateY(15px)` → `100% translateY(0)` |
| `floating-reverse` | — | 同上，`-15px` |
| `shadow-blur` | — | `0% blur(1.3rem) grayscale(1) brightness(0); scale(1) skew(30deg,-4deg)` → `65% blur(0.8rem); scale(0.85); 同斜切` → `100% 回位` |
| `spark` / `spark-fast` | **3s** / **2s** | `scale(0)` → `scale(1)` → `scale(0)`，ease-in-out 无限循环 |
| `rotating` | **26s** | `rotate(0)` → `rotate(360deg)`，linear 无限循环 |
| `pulsate` | — | `scale(1)` → `scale(0.7)` → `scale(1)` |
| `tada` | — | `scale3d(0.9,0.9,0.9) rotate(-3deg)` ↔ `scale3d(1.1,1.1,1.1) rotate(3deg)` |
| `flying` | — | `left: -5%` → `65%: 70%` → `110%` |
| `waveAnimation` | — | `background-position-x: 0` → `200%` |
| `dash` | **1.4s** | `stroke-dashoffset: 280` → `75` 且 `rotate(135deg)` → `280` 且 `rotate(450deg)` |
| `arrow-move` | — | `translate(-100%)` → `translate(100%)` |
| `*-marquee` | — | `translate(0)` ↔ `translate(-50%)` |
| `animateMenuOpen` | **0.4s** | `cubic-bezier(0.5,0,0,1)` |
| hover 状态 | — | 导航下划线 `scaleX(1)` 展开；搜索图标 `scale(1.25)` + `drop-shadow`，其六边形 `rotate(180deg)`；封面图 `scale(1.05)` |

> 25 个 keyframe 中有 2 个（`onetrust-fade-in`、`ot-go-spin`）来自第三方 OneTrust cookie 组件，不计入站点设计。

## 别照搬

1. **配色本身不精致。** 8 个高饱和原色并置，单看色板不是好配色——它成立是因为色块被放大到满幅、与 250px 巨字并置。**抄到小尺寸界面会立刻显廉价。**
2. **全大写 + 强制换行牺牲可读性。** 一字母一行只对短英文词成立；中文、德文长词、需要连续阅读的段落都不适用。
3. **首屏文字全部依赖 JS 揭示。** 文字初始 `opacity: 0`，脚本失败或爬虫/预览不执行 JS 时正文是隐形空白的。本 demo 用 `html.js` 作用域 + 无 JS 兜底规避，**原站没做**。
4. **强依赖商用字体与大幅产品摄影。** 原站用 Ringold（商用）与大量商品图；代码复刻只能以系统无衬线 + 纯色场替代，观感必然打折。

## 复刻时踩到的两个真坑（都写在 `src/scenes.css` 注释里）

1. **`overflow: hidden` 会变成滚动容器**，于是子元素的 `view()` 时间线以**该容器**为 scrollport 而不是页面，滚动驱动动画永远停在终态。若要滚动驱动，容器用 `overflow: clip`（裁剪但不产生滚动容器）。
2. **`IntersectionObserver` 对被「跳滚」跳过的元素不回调**：实测直接滚到底部只揭开了 3/17 个词，用户回头上翻会看到空白词。改用 AOS 同款的 **rAF 节流滚动位置检查**（本 demo 的做法），对跳滚、锚点跳转、刷新恢复滚动位置都成立。

另外：本 demo 最终**没有**用 CSS 滚动时间线做揭示，因为实测 `view()` 给出的进度不合理（词还在视口下方 300px 就开始揭示），而原站本来就是 **JS 加 `.is-inview`**——按原机制实现既更忠实、也可验证。

## 怎么用

```html
<link rel="stylesheet" href="src/scenes.css">
<section class="scene" style="--field:#1F5FE0; color:var(--neon); --highlight-color:#FFF7E9">
  <span class="kicker">collection</span>
  <h2 class="scene__title">
    <span class="word" style="--i:0"><span class="word__in">ORIGINALS</span></span>
  </h2>
  <span class="candy candy--bl"></span>
</section>
```

- 每幕：`section.scene` + 可选 `.scene__field`（色场）、`.candy`（自绘占位）、`.spark`；
- 每个**词**包一层 `.word > .word__in`（`.word` 提供遮罩，因此每词独占一行）；
- 变量：`--field / color / --fs / --lh / --highlight-color / --underline-color / --i`。

## 怎么改

- 可调项集中在 `src/scenes.css` 顶部 `:root`（色、字体、字距、内边距）与各 `.sN` 类；
- **字号公式**：`--fs: clamp(下限, min(宽度项, 高度项), 上限)`，其中
  宽度项 `≈ 92.8vw ÷ (0.60 × 最长单词字符数)`（实测字形推进约 0.588em/字符），
  高度项 `≈ 88svh ÷ (行数 × 行高比)`。**两个都要有**：只有宽度项会在矮窗口把多行字块裁掉；
- 揭示：`html.js` 下词块初始隐藏，加 `.is-inview` 后归位，错峰由 `transition-delay: calc(var(--i) * 90ms)` 控制。

截图：`shots/original-site.png`（原站首屏）、`shots/demo.png`（本条目 demo）。
