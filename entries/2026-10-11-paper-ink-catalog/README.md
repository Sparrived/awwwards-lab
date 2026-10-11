# 纸墨编目 · paper-ink-catalog theme

- 类别：theme
- 来源：[awwwards](https://www.awwwards.com/sites/metic-take-a-closer-look) → [原站](https://metic.studio/en)
- 作者：（列表页未提供，未取证） ｜ 获奖：Awwwards Nominee
- 萃取机制：暖纸底 + 近墨色 + 细线分隔 + 单一强调色的「纸墨编目」主题

## 这是什么

一套「内容比装饰重要」的配色与排印主题。它不靠投影、渐变、毛玻璃或大圆角堆质感，而是靠四件事建立秩序：

1. **一块暖纸底** `#F4F4F2` 承住全部内容，**近墨色** `#121214` 承载全部文字——只用两级明度，没有中间灰块；
2. **1px 低对比细线** `rgba(18,18,20,.12)` 做所有分隔，替代卡片投影与浮起；
3. **唯一强调色** `#FF3E3E`，只在「需要指向」的地方出现（分类标签、链接悬停、焦点环、选中文字），绝不铺面积；
4. **排印建立层级**：display 与正文形成约 5.4 倍字号差，字距随字号收紧（display `-0.035em`、h3 `-0.02em`），标签一律 12px 大写字距 `0.06em`。

作品预览放进暗底 `#0B0C10` 的框里——纸面上挖出一个黑窗口，"展品"立刻有了层级。

## 取证记录（真实测量，非推测）

| 项 | 值 | 来源 |
| --- | --- | --- |
| 纸底 paper | `rgb(244,244,242)` = `#F4F4F2`（出现 152 次） | `getComputedStyle(body).backgroundColor` + 全站色频统计 |
| 墨色 ink | `rgb(18,18,20)` = `#121214`（726 次） | 同上 |
| 次要 ink-soft | `rgb(98,98,106)` = `#62626A`（305 次） | 同上 |
| 强调 accent | `rgb(255,62,62)` = `#FF3E3E`（88 次） | 同上 |
| 强调色用途 | `color` 44 处 / `backgroundColor` 44 处 / `borderTopColor` 47 处 / `outlineColor` 44 处 | 逐元素比对等于该色的四个属性 |
| 细线 | `1px rgba(18,18,20,0.12)` 42 处；加重变体 `1px rgb(98,98,106)` 13 处 | 全站 borderTop 统计 |
| 暗底 | `#0B0C10` | CSS 变量 `--xray-bg` 实测值 |
| display 字阶 | `92.16px` / 行高 `88.47px`（0.96）/ 字距 `-3.2256px`（-0.035em）/ 字重 500 | `getComputedStyle(h1)` |
| h3 字阶 | `30.72px` / 行高 `34.4px`（1.12）/ 字距 `-0.6144px`（-0.02em）/ 字重 500 | `getComputedStyle(h3)` |
| 正文字阶 | `17px` / 行高 `26.35px`（1.55） | `getComputedStyle(body)` |
| 小字/标签 | `14px`/行高 1.43；标签 `12px` 大写 字距 `0.72px`（0.06em） | `getComputedStyle(p)` 与标签元素 |
| 网格 | 12 栏，`gap: 40px` | `getComputedStyle(grid)` |
| 区段节奏 | 纵向 `padding: 160px`（部分 `128px`） | `getComputedStyle(section)` |
| 圆角 | 卡片 `12px`；药丸 `999px` / `50%` | 全站 borderRadius 统计 |
| 动效 | `1050ms linear`；错峰 `120 / 210 / 300ms`（步长 90ms），另有 `-400 / -750 / -550ms` 负延迟组 | `document.getAnimations()` 的 `effect.getTiming()` |

**复核要点：** 色值取自全站元素 `backgroundColor`/`color` 的频次统计 + 关键元素计算样式，未做 rgb→hex 之外的任何加工；强调色的"克制使用"有量化依据（四个属性各 44~47 处，均分散在标签/链接/焦点环上，没有大面积色块）。

**仍未取证项：** 原站字体的**字重轴与字形细节**未取（只取到 family 与 weight 500）；原站有 sound/three.js 相关资源，与本主题无关，未纳入。

## 怎么用

```html
<link rel="stylesheet" href="src/theme.css">
<div class="shell">
  <h1 class="display">标题</h1>
  <p class="lede">导语，17px / 1.55。</p>
  <dl class="stats">
    <div><dt>条目</dt><dd class="mono">3</dd></div>
  </dl>
  <div class="catalog">
    <article class="plate" style="--pi:0">
      <div class="plate__head"><span class="label accent">theme</span><h2 class="plate__title">卡片标题</h2></div>
      <div class="plate__media"><span class="plate__idx">01</span></div>
      <dl class="meta">
        <div class="meta__row"><span class="meta__k">字段</span><p class="meta__v">值</p></div>
      </dl>
    </article>
  </div>
</div>
```

调用说明：**只引一个 CSS，无 JS、无 CDN、无构建**。`--pi` 控制展品卡入场错峰序号（0,1,2…）。

## 怎么改

- 全部可调项在 `src/theme.css` 顶部的 `:root`：`--paper / --paper-2 / --ink / --ink-soft / --accent / --dark`、字体栈、`--fs-*` 字阶、`--gap / --sec-y / --pad-x` 节奏、`--dur-reveal / --stagger` 动效；
- 想要更冷静：把 `--accent` 改成 `--ink`，整页立刻变成纯纸墨无彩色；
- 降级：`@media (prefers-reduced-motion: reduce)` 关掉入场与过渡，直接呈现终态。

## 本库自身就在用它（第 1 条被消费的条目）

画廊页 `gallery/index.html`（由 `templates/gallery_shell.html` 生成）**直接 link 本条的 `src/theme.css`**，不再自带一套样式。也就是说：改这个文件，画廊与条目 demo 一起变。这是本库「可复用」的第一次自证。

截图：`shots/hero.png`（本条目 demo）、`shots/catalog-in-use.png`（画廊页复用本主题的实拍）。

## 依赖

无。零 CDN、零构建、零 JS。字体只在 `font-family` 里声明 `Bricolage Grotesque` / `Space Grotesk`（原站所用，均为免费字体），**不联网加载**：本地装了就用，没装则回退 `system-ui`，布局与层级不变。断网双击 `demo/index.html` 正常可读。

## 清洁室声明

未复制原站代码、图片、字体文件、视频或品牌文案。只复刻了可测量的设计参数（颜色、字号、字距、行高、间距、圆角、动效时长与错峰步长）与设计思路（纸墨两级明度、细线分隔、单一强调色、排印建立层级）；原站字体文件未搬运，只声明字体名。
