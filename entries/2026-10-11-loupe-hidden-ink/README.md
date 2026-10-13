# metic. – Take a closer look · hold-to-lift lens with hidden ink

- 发现类别：theme（仅用于发现与检索，不预设亮点）
- 来源：[Awwwards](https://www.awwwards.com/sites/metic-take-a-closer-look) → [原站](https://metic.studio/en)
- 作者：Manuel Mayrhofer（取自原站 `<meta name="author">`；Awwwards 详情页的署名区块未取到，故不写在该页名下）｜获奖信息：Awwwards **Nominee – 2026-10-10**（榜单页原文，非获奖者）
- 实际访问：2026-10-11 15:53–16:02 (+08:00) ｜路由与视口：`https://metic.studio/en`，1440×900 与 390×844。原站当前是 Next.js 站点，`/`、`/de`、`/en` 三个路由并存；本次分析对象是 `/en` 当时的实际渲染，不是榜单缩略图
- 规格：`schema_version: 2`；当前状态：**草稿——除独立复核外全部达标**

## 设计判断与亮点排序

原站是一家奥地利单人设计/代码工作室的门面。它的主张是「精确到细节」（`metic.` 读作 meticulous），因此页面需要的不是把「精细」说一遍，而是让访客自己碰到细节。三处关系按移除检验排序如下。

| 亮点 id / 排序 | 具体设计关系 | 为什么有效（解释判断） | 必要依赖 | 证据 id |
| --- | --- | --- | --- | --- |
| h1 / 1 | 右下角泊着一枚圆形放大镜；按住（或拖动镜柄）时镜片抬起，镜下纸面**绕指针**放大 1.6×，而只有镜圈以内才浮出手写红墨批注层 | 这是把品牌主张交给访客执行：「仔细看」只有在真能看到别处没有的东西时才成立。批注是镜片之外取不到的内容，好奇心换到的是内容而不是动画；不抬镜片的人仍然读到一张安静排好的纸 | 纸/墨/一红三色与量度小字；一层真正隐藏的第二内容；把纸面复制一份并用同一原点缩放；按镜心与半径驱动的径向遮罩；可见的镜位与按住—释放，以及不依赖镜片的替代路径 | ev1, ev2, ev3, ev7 |
| h2 / 2 | 480vh 的钉住舞台：滚动线性映射到 `--dots`（0→1）与 000→100% 计数器，八条字幕（A line → … → Your turn）依次交叉淡入淡出 | 它把「怎么做」而不是「做什么」变成主内容：从基准线到成品按钮的节奏就是论证本身；点阵底纹正是字幕所说的「guides」，形式在演示工艺主张 | 足够长的滚动段；sticky 舞台与随滚动变透明度的点阵；八条字幕的位移+模糊交叉淡入；计数器与「跳过」出口 | ev4 |
| h3 / 3 | 导航 X 光开关：把调色板整体重映射为蓝图色（`--paper` #0b0c10、`--ink` #eeeeea），并在各元素上浮出「为什么这样做」的注解 | 把本来只能靠口头讲的量度规则（每行 30 字、按钮至少 44px）变成可在页面上查验的说明，等于把镜片那句承诺写成了文档 | 用角色变量而非硬编码色值的配色系统；默认隐藏的逐元素注解；图片去饱和以保证注解可读 | ev5 |

排序理由：h1 是唯一「拿掉就没了身份」的关系；h2 拿掉后仍是一家排版良好的工作室页，只是丢了工艺叙事；h3 拿掉后页面依旧成立。三者都以实际触发或实际读取为准，未观察到的效果不进入上表。

## 本次片段与不可丢的关系

- 选中亮点：**h1**
- 实现范围与选择理由：一屏纸面（含点阵底纹、量度小字、一个展示级标题、一段引言、三行样张）＋ 右上角泊着的圆形镜片。按住纸面或拖动镜柄抬起镜片，镜下纸面绕指针放大 1.6×，只有镜圈以内浮出手写红墨批注；释放后镜片回到镜位、墨迹重新隐藏；被镜片读到的批注在图例里打勾。选择它是因为它既是主要辨识度，又是访客用手完成的动作，机制（绕指针缩放＋被遮罩的第二层）可迁移到任何「底下还有一层」的表面。原站的滚动叙事与 X 光属于同一作者语汇，但作用不同，已分别在 h2 / h3 记录，不塞进本片段。
- 不实现：480vh 滚动蓝图；X 光开关；菜单覆盖层；五个字母的隐藏搜集与计数面板；声音开关；除 `prefers-color-scheme` 之外的明暗切换；原站的全部文案、图片、字体与样式表。

| 不变量 id | 必须保留的关系 | 如何操作/对照验收 |
| --- | --- | --- |
| inv1 | 按住抬起、释放归位：静止时镜片泊在镜位、无放大也无墨迹；按住时镜心跟随指针；释放后回到镜位并淡出，墨迹重新隐藏 | 静止截图 → 按住镜柄拖过纸面 → 释放；分别记录镜片中心、`is-lifting`、透明度与墨迹可见性 |
| inv2 | 放大锚定在指针：镜心底下那一小块纸面原地不动，其周围放大 1.6× | 把镜片停在某个数值上缓慢平移，观察压住镜心的字形是否滑动 |
| inv3 | 墨迹只在镜圈内浮现：离开镜圈，纸面不显示任何批注 | 先将镜片停在某条批注上，再移到远离所有批注的位置，对比纸面 |
| inv4 | 镜片像一片真实的玻璃，且纸面不动：1px 亮边与柔和内阴影；移动镜片时纸面不位移、不回流 | 按住镜片四角扫过，同时读取纸面 rect 与镜片 rect |
| inv5 | 没有镜片也能读到批注：关闭 JS、reduced-motion，或用键盘可达的「显示全部批注」控件，每条批注都可读；被镜片读过的批注在图例里打勾 | 键盘触发 reveal-all；禁用 JS 重载；检查图例勾选是否保留 |

不变量写入 `selected_fragment.invariants`，每项为 `{id, description}`；独立复核的每条 case 用 `invariant_id` 对应，不用字体数值或动画数量冒充关系保真。

## 体验路径与证据状态

体验地图（桌面 1440×900，按正常速度）：

| 页面位置 | 用户动作 | 可见变化 | 在叙事/操作中的作用 |
| --- | --- | --- | --- |
| 首屏（Hero，100dvh） | 载入后静止观察 | SVG 施工图＋大标题「Take a closer look.」（103.68px / 500 / lh .96 / ls −.035em）；右上角泊着镜柄，底部提示「按住页面某处自己看」 | 先给主张，再给执行主张的工具；镜柄是可见的邀请 |
| 首屏 | 拖动镜柄 | html 得到 `loupe-held`，`.loupe-view` 透明度 0→1，镜片跟手；镜下纸面绕指针放大 1.6× | 核心动作：从「看」到「看得更近」 |
| 首屏 | 把镜片停在标题上 | 标题下浮出手写红字「The first letter sets the measure. closer → m」，遮罩 `--sr` 95.8px（镜半径 121px） | 镜片确实有东西可给；这条批注只在这里存在 |
| 首屏 | 释放 | `loupe-view` 透明度 1→0，镜片回到镜位，墨迹重新隐藏 | 动作可逆、可重复，不留下状态残留 |
| 中段 (`section.build`) | 正常滚动 | 舞台钉住 480vh：点阵底纹 `--dots` 0→1，计数器 000→100%，八条字幕按序模糊交叉淡入；另有「跳过 build」按钮 | 把工艺流程当作主内容；点阵＝字幕所说的 guides |
| 中段 | 继续滚动到 100% | 计数器停在 100%，字幕「Your turn.」可见 | 叙事收束到「这一切都在一个按钮里」 |
| 右上角导航 | 点击 X 光按钮 | `html.xray`，`--paper` #f4f4f2→#0b0c10、`--ink` #121214→#eeeeea，z-79 画布透明度 0→1，视口内元素浮出注解（1440×900 下 5 条） | 「看穿页面怎么搭的」，与镜片同源的另一种「看下面」 |
| 页脚 | 滚动到底 | 无相关强效果 | 未观察到值得萃取的收尾关系，不凑动效 |
| 390×844 | 窄屏重排 | 标题 44px 单行，`scrollWidth` 等于视口（无横向溢出）；镜柄仍在右上角但更小 | 响应式只改尺度，不改关系 |

| 证据 id | 用户动作 → 所见变化 | 结论与状态 | 路由 / 元素 / 视口 | 文件 / 是否可公开 |
| --- | --- | --- | --- | --- |
| ev1 | 按住镜柄并分四步拖动；逐步读 `.loupe-hit/.loupe-glass` rect 与 `.loupe-page` inline transform | observed：镜片跟手；纸面副本 `translate3d(-(k−1)·pointer) scale(1.6)`，与实测指针位置逐项吻合 | `/en` · `.loupe-hit`/`.loupe-page` · 1440×900 | shots/private/orig-loupe-drag-1440.png；publishable false |
| ev2 | 把镜片停在标题上，读每条 `.secret-ink` 的 `--sr/--sx/--sy` 与 visibility | observed：`--sr` 95.8px（镜半径 121px），其余条目 `--sr` 0 且 visibility hidden | `/en` · `.secret-ink` · 1440×900 | shots/private/orig-loupe-heading-1440.png、orig-loupe-held-1440.png；publishable false |
| ev3 | 释放后读 `.loupe-view` 透明度与 html class | observed：透明度 1→0，`loupe-held` 移除，遮罩变量清空，回到静止首屏 | `/en` · `.loupe-view` · 1440×900 | shots/private/orig-hero-1440.png；publishable false |
| ev4 | 在 `section.build` 内以 540px 步长滚动，读 `--dots`、计数器与八条字幕透明度 | observed：0→1 / 000→100% / 逐条交叉淡入（现役字幕 opacity 1，其余 0 + translate-y-3 + blur(2px)） | `/en` · `.build-stage` · 1440×900 | shots/private/orig-build-start/mid/end-1440.png；publishable false |
| ev5 | 点击导航 X 光按钮，读 class、aria-pressed、画布透明度、`--paper/--ink` 与在视口内的 `[data-note]` 数 | observed：`html.xray`、aria-pressed true、z-79 画布 opacity 1、调色板整体换为蓝图色、视口内 5 条注解可读；再点一次复原 | `/en` · `html.xray` · 1440×900 | shots/private/orig-xray-1440.png；publishable false |
| ev6 | 390×844 下测量标题与 `scrollWidth`，再用触摸事件按住拖动 | observed：标题 44px 单行、无横向溢出；合成触摸只置了 held 态，镜片未移动——触摸分支**未确认** | `/en` · `h1`/`.loupe-hit` · 390×844 | shots/private/orig-hero-390.png、orig-loupe-touch-390.png；publishable false |
| ev7 | 读 `.lens-hint` 与隐藏面板 `#entdeckungen` 的文案，并枚举 `.secret-ink`（15 个）与 `[data-note]` | source-supported：站点自述「按住页面某处」「把镜片停在标题上读下面的东西」「藏了 13 样东西」；这是站点的说法，不替代上面的实际触发 | `/en` · 文案与节点枚举 · 1440×900 | 无截图；publishable false |

- 源码声明只能支持机制解释，不能自动升级为用户实际看见：ev7 单独标为 source-supported，未与 observed 混写。
- 静态作品才有理由用 `motion_catalog: []`；本条有三条已观察动效，故 `motion_catalog` 非空且每条都指向 observed 证据。
- 原站证据与 demo 用同视口、同片段、同关键状态对照；首屏图只用于「静止态」对照，不冒充核心中段。
- demo 封面为 `shots/demo.png`（demo 实拍）。未确认再发布条件的原站证据全部放 `shots/private/`（Git 忽略），`publishable: false`，不进入 demo 或公开海报。

## 机制与实现 / API

机制（一个最小完整片段）见 `extracted_mechanism`。构成与素材、触发、反馈如何彼此依赖：

- 纸面 `.hb-sheet` 自带 16px 点阵底纹（`::before` 的 radial-gradient），提供「下有基准线」的语汇；
- 墨迹层 `.hb-ink` 默认 `visibility: hidden`，并被 `mask-image: radial-gradient(circle var(--hb-r) at var(--hb-x) var(--hb-y))` 裁成圆——`--hb-r/--hb-x/--hb-y` 由 JS 按镜心与镜半径写入（与原站实测的 `--sr/--sx/--sy` 同构，只是坐标按每条批注自身盒计算）；
- 镜片 `.hb-glass` 是 `border-radius: 50%; overflow: hidden` 的 fixed 窗口，内部 `.hb-clone` 是纸面的克隆，带 `hb-clone` 类后墨迹被强制可见且去遮罩——**圆形窗口本身就是遮罩**，墨迹因此只可能出现在镜圈内；
- 克隆的变换是 `translate3d(r − k·(pointer − sheetOrigin)) scale(k)`（origin 0 0），即「绕指针放大 k 倍」：实测与原站 `translate3d(-(k−1)·pointer) scale(1.6)` 公式等价；
- 反馈有两层：镜圈内的墨迹，以及图例里被读到即打勾的圆点（保留成 found 态）。

```html
<!-- 最小使用示例；核心在 src/，不是 demo 内联代码 -->
<link rel="stylesheet" href="src/lens.css">
<main data-lens-root>
  <section class="hb-sheet" data-lens-sheet>
    <span class="hb-ink" data-note-id="m1">hidden note</span>
  </section>
  <div class="hb-glass" data-lens-glass>
    <div class="hb-track" data-lens-track></div>
    <span class="hb-rim"></span>
  </div>
  <button class="hb-dock" data-lens-dock>Lift</button>
  <div class="hb-legend"><span data-lens-count>0 / 1</span>
    <span class="hb-dots"><i data-dot="m1"></i></span></div>
</main>
<div hidden><button data-lens-all>Reveal all notes</button></div>
<script src="src/lens.js"></script>
<script>
  const lens = HalbtonLens.create(document.querySelector('[data-lens-root]'), { holdDelay: 130 });
  lens.revealAll(true);  // 不依赖镜片的替代路径
  lens.destroy();        // 解绑监听并移除克隆
</script>
```

- 调参：`--hb-lens-r`（镜半径，`clamp(88px, 8.4vw, 128px)`）、`--hb-zoom`（1.6）、`--hb-reveal`（0.8，墨迹半径/镜半径）、`--hb-drop`（420ms）、`--hb-ease`（与原站实测同一条 `cubic-bezier(.23,1,.32,1)`）；行为参数走 `HalbtonLens.create(el, { zoom, reveal, holdDelay })`。
- 断点、无 JS、离线、reduced-motion、离屏处理：<640px 时样张行改为三列、数值另起一行，镜半径降到 88px，无横向溢出；无 JS（或脚本失败）时 `html.no-js` 保留，墨迹直接可读、镜柄隐藏，并有 `<noscript>` 兜底；reduced-motion 下所有过渡与勾选动画置 0；字体为本地打包的 woff2，`file://` 直开无报错；片段没有任何自走动画（全部指针驱动、无 rAF 循环），所以不存在需要暂停的离屏/后台时间轴。
- 依赖：无（`deps: []`）。
- 代码量：核心约 650 行（`src/lens.css` 416 行，含四组 `@font-face`、完整 token 块与无 JS／reduced-motion／暗色降级；`src/lens.js` 241 行含注释），略超 400–600 的预算提示；多出的部分是降级路径与随行文档，不是被掩盖的复杂度。

## 素材替代与适用边界

| 设计角色 | 独立替代素材 / 字体 | 保留的轮廓、尺度与层级 | 来源 / 许可 / 已知损失 |
| --- | --- | --- | --- |
| 被放大的主体（纸面） | 原创样张「Halbton.」（虚构的莱比锡印刷工作室）：点阵底纹、量度小字、一个展示级标题、引言、三行样张 | 保留单栏阅读、低对比纸色、一处大字量、零星小字批注的角色与相对尺度 | 本次原创 |
| 镜片 | CSS 圆形窗口（`border-radius:50%; overflow:hidden`）内含纸面克隆；`box-shadow: inset 0 0 0 1px rgba(255,255,255,.35), inset 0 0 22px rgba(18,18,20,.1)` | 保留「圆、亮边、轻内阴影、只在圈内可见」的物理读法 | 独立实现；原站把一部分镜圈画在 difference 混合的 canvas 上，本片段用纯 CSS，观感角色相同 |
| 手写墨迹层 | 三条原创英文批注，Kalam（OFL，本地打包），红色、各自轻微旋转 | 保留「小、偏、手写、红色、只做标记不装饰」的角色 | 原创文案；未抄录原站批注文字 |
| 展示字体（Bricolage Grotesque） | Archivo variable（SIL OFL 1.1，本地打包） | 保留展示级字重 500／字距 −0.035em／行高 0.96 的比例关系与换行度量 | OFL 打包，许可文本见 `src/fonts/FONTS.md`；Archivo 比 Bricolage 少一点光学尺寸的怪脾气，大字更平 |
| 正文字体（Space Grotesk） | Inter variable（SIL OFL 1.1，本地打包） | 保留中性无衬线正文的整体调性 | 已知损失：Inter 字面更高、骨架更中性，Space Grotesk 偏窄的个性未保留 |
| 量度标签（IBM Plex Mono） | 系统等宽栈 | 10–11px 大写小字的排布不变 | 不打包；损失在笔画末端 |

适用任务：任何「表面 + 底下还有一层」的界面（规格表、带批注的图纸、带解说的代码、带热点的产品图、带备注的地图）。必要条件：底层表面必须能独立读懂，隐藏层必须是增量信息而非重要内容的唯一副本，且页面愿意让出 ~130ms 的按住时间。不适用：页面本身已做滚动劫持；或第二层内容长过镜片能展示的范围——镜片只给片段，批注必须能当片段读。已验证风险：合成的触摸按住只置了 held 态而未移动镜片，因此**触摸分支未确认**，不应被当作保证照抄；原站的对比度与无障碍树未测量，因此不写「原站失败」。

## 独立操作复核与未验证项

> **状态：第 1 轮未通过 → 已修订 → 第 2 轮独立复核已通过（2026-10-13，5/5 实测 pass，`rendered_ok` 与 `user_review.passed` 一并置 true）。**
> 以下第 1 轮的表格、结论与实拍**均已作废**，仅作修订过程凭证；当前实现的判定以本节末尾「第 2 轮独立复核」为准。
> 第 1 轮由未参与实现的独立子代理执行，判 inv2/inv3 fail：
> `.hb-clone` 把纸面的 **border-box** 宽高（`getBoundingClientRect`）写进行内 `width/min-height`，而克隆体沿用 `content-box`
> 且自带同样的 `padding`，于是放大副本比纸面宽一个 padding、与纸面不注册——镜下看到的不是该点的纸面内容，红墨永远落在镜圈外。
> 已修：`src/lens.css` 的 `.hb-clone` 加 `box-sizing: border-box`（附因果注释）。修复者自测：镜下注释中心到镜心 **0px**（修前 396px），
> 1440×900 镜圈内红墨 **1746** 像素（修前 0；原站同视口 1181），390×844 为 **952** 像素。`verification.user_review` 已重置。
> 下表为第 1 轮原始记录（**已作废，不再代表当前实现**，保留以示证伪与修订过程）；复核 #1 的实拍 `shots/demo-review-*` 同属旧版实现。

- 复核者：独立子代理 `loupe-review`（Hermes 浏览器会话，Chromium + CDP；未参与本条目实现，未读任何旧实现）
- 复核时间 2026-10-11｜对象：未入库草稿，直接 `file://` 打开 `demo/index.html`；视口：桌面 1440×900、窄屏 390×844
- **结论：不通过（2/5 不变量实测 fail）。`user_review.passed` 与 `rendered_ok` 保持 false。**

| invariant_id | 实际动作 | 用户所见（实测） | 视口 | 结果 | demo 实拍 |
| --- | --- | --- | --- | --- | --- |
| inv1 | 静止 → 按镜柄拖到 (760,470)、(430,300) → 释放 | 静止镜片恰停镜位 (1309,116)、opacity 0、无克隆、墨迹 hidden；按住后 `is-lifting`＋`hb-held`、镜心逐点与指针重合；释放后 100ms 内退类、镜片回镜位、opacity 1→0.24→0，墨迹重新 hidden；控制台 0 错误 | 1440×900 | **pass** | demo-review-rest / inv1-held / inv1-released-1440.png |
| inv2 | 按住停在 02 号样张，读同一元素在纸面与克隆里的 rect，再把指针移 40px | **fail**：克隆 transform 确实把指针设为不动点，但克隆用 content-box 承载纸面 **border-box** 的 width/minHeight（inline 1425px/1116px），克隆内容比真实纸面宽 144px、高 216px（克隆 h1 宽 2280px=1.6×1425，应为 1.6×1281；02 号样张克隆内 y=1076.8 vs 纸面 860.8）。镜心底下不是该处的纸面内容，1440×900 下镜内落在空白点阵 | 1440×900 | **fail** | demo-review-inv2-anchor-1440.png |
| inv3 | 按住停在 m2 批注正中心 (998,878)，对镜圈内 #d8332a 像素计数；再做移除检验 | **fail**：真实遮罩批注就在镜心下方（遮罩半径 96.8px），但被不透明 `.hb-glass` 盖住；克隆里被强制可见的批注距镜心 396px（在 121px 镜圈外）。严格 #d8332a 扫描：**镜圈内 0 个红像素**（唯一新增红点是图例勾）。移除检验：仅用 JS 把 `.hb-clone` 改 border-box → 克隆批注距镜心 0.8px，同扫描镜圈内 **2205** 个红像素 | 1440×900 | **fail** | demo-review-inv3-note-1440.png、demo-review-removaltest-fixed-1440.png |
| inv4 | 读镜圈 box-shadow；按住扫过六个角/边点，逐点读纸面 rect 与 scrollWidth | 镜圈阴影 `inset 0 0 0 1px rgba(255,255,255,.35), inset 0 0 22px rgba(18,18,20,.1)`；`border-radius:50%`、`overflow:hidden`；六点纸面 rect 恒 [0,0,1425,1116]、scrollWidth 恒 1425 | 1440×900 | **pass** | demo-review-inv4-sweep-1440.png |
| inv5 | 禁 JS 重载；正常重载后 Tab 到 reveal-all 按空格；按住 m2 后释放 | 无 JS 时 `no-js` 保留、三条批注全 visible 且 mask none、镜柄 display none；键盘 Tab 可聚焦、空格触发 reveal-all（`is-revealed`、aria-pressed true）；读过 m2 后图例「1 / 3」且圆点保留 `is-found` | 1440×900 | **pass** | demo-review-inv5-revealall/nojs/tick-1440.png |

**核心缺陷与移除检验**：`src/lens.js` 的 `_ensureClone()` 用 `sheet.getBoundingClientRect().width/height`（纸面 **border-box**）当作克隆的内联 `width/minHeight`，而克隆是 content-box（`.hb-sheet` 带 72px、窄屏 20px 左右内边距），克隆内容因此比真实纸面宽 144px、高 216px；因样张行 `margin-top:auto` 底对齐，克隆里的样张整体下移 216px（克隆局部坐标）。后果：镜下内容与纸面不对位（inv2 fail），且被强制可见的红墨落在镜圈外、真实遮罩层又被不透明镜片盖住（inv3 fail）。在浏览器里只改这一处（克隆 `box-sizing:border-box`，不动源码）即可让 m2 批注回到镜心、镜圈内出现 2205 个红墨像素——身份随之变大，反证该缺陷正是核心关系所在。

**同视口原站对照（1440×900，同片段＝抬起镜片态）**：亲自打开 `https://metic.studio/en`，按住页面 → `html` 加 `lens-held`，逐条 `.secret-ink` 的 `--sr` 变为 132.5px 且 visible；截帧显示镜片玻璃内出现红色手写「Pick me up.」（#ff3e3e；严格红像素扫描镜圈内 1181 个）。同一状态下本 demo 镜圈内 0 个红像素——原站核心承诺（镜下浮出红墨）在 demo 里未兑现。窄屏 390×844 两侧 `scrollWidth` 均等于视口（无横向溢出）；demo 窄屏镜半径 88px 与原站量级一致。附注（复核 #2 厘清）：原站可见玻璃按亮度剖面为 r≈120（内容边界 120、圈环 122~134、140 外回纸色），与记录的 242px（r121）相容；而镜片 `<canvas>` 元素本身是 324×324（r=162）。第 1 轮记的 ~265px 与第 2 轮记的 242px 是两次测量口径不同，现已写明。另：`.loupe-*` 选择器名在 2026-10-13 的线上构建中 0 命中（镜片实为 canvas），属未定论项，行为结论不变。

实现者自查（**不等于**独立用户操作复核，以下为原文保留）：`file://` 打开 demo，控制台 0 错误；实测镜心与指针重合、克隆 transform 与公式吻合（translate3d(-848.647px, -1016.65px, 0) scale(1.6)）、`--hb-r` 96.8px = 0.8×121；远离镜片时各批注遮罩中心落在自身盒外（如 −315.5px / −543.8px）故不可见；移动镜片时纸面 rect 恒为 [0, 0, 1425]；reveal-all 与 no-JS 路径下墨迹 visibility visible 且遮罩 none；390×844 无横向溢出、镜半径 88px；reduced-motion 下过渡与勾选动画均为 0。以上我复测为真的有：镜心与指针重合、纸面 rect 恒定、reveal-all/no-JS 下墨迹可见、窄屏无横向溢出。但「镜下浮出红墨」只是源码/DOM 层推断，实测在 1440×900 不成立，故 `rendered_ok` 与 `user_review.passed` 保持 false，等待针对性修复后再次复核。

### 第 2 轮独立复核（2026-10-13 · 未参与实现与修订的独立子代理）

- 复核者：独立子代理 `loupe-review-r2`（Hermes 浏览器会话，Chromium + CDP；未参与本条目实现，也未参与第 1 轮复核或本次修订，未读旧实现）
- 对象：未入库草稿，直接 `file://` 打开 `demo/index.html`（不走画廊）；视口：桌面 1440×900、窄屏 390×844；原站对照用同一视口、同一片段（按住不动抬起镜片态）亲自实测
- **结论：通过——5/5 不变量实测 pass，控制台 0 错误（含资源加载错误监听），`verification.user_review` 与本 README 一并更新，`rendered_ok` 置 true。**
- 本轮自截 demo 实拍 21 张，全部 `shots/demo-r2-*.png`（公开 `shots/`，文件名以 `demo` 开头）；原站对照帧放 `shots/private/orig-loupe-review2-rest-1440.png`、`orig-loupe-review2-held-note-1440.png`（`publishable: false`，不进 demo 与封面）。像素统计用本机 PIL 直接读 PNG。

| invariant_id | 实际动作 | 用户所见（本轮实测） | 视口 | 结果 | demo 实拍 |
| --- | --- | --- | --- | --- | --- |
| inv1 | 静止读数 → 按镜柄拖过 (1100,300)(900,420)(760,470)(430,300) → 释放后 100ms/800ms 复读；另做「空白处按住 400ms」「50ms 内单击」「50ms 内拖动」三次对照 | 静止镜心恰在镜位 (1309,116)、opacity 0、无克隆、批注 hidden；按住后 `is-lifting`＋`hb-held`、镜心逐点与指针重合；释放后 100ms 内退类、回镜位、opacity 1→0.32→0、批注重新 hidden 且遮罩变量清空；按住 400ms 抬起、50ms 内单击/拖动都不抬起（不吞滚动）；0 错误 | 1440×900（并复测 390×844） | **pass** | demo-r2-inv1-rest / -held / -released-1440.png、demo-r2-narrow-rest / -held-390.png |
| inv2 | 4 个指针位置 × 6 个纸面元素，按 `cloneC = 镜心 + 1.6×(纸面C − 镜心)` 核偏差；镜片正对 m1/m2/m3 中心读克隆内批注中心到镜心距离；再做像素级：静止帧/镜下帧穿镜心 12 条扫描线按候选 k 重采样比差 | DOM 最大偏差 0.51px（多数 ≤0.1px）；正对 m1/m2/m3 时克隆内批注中心距镜心 1.8/0.8/1.4px；像素拟合在 **k=1.6** 平均绝对差最小（10.7~16.5，k=1.1 为 53~60）——锚在指针、倍数 1.6 双向确认 | 1440×900 | **pass** | demo-r2-lens-rest-1440.png、demo-r2-lens-held-712 / -760-1440.png、demo-r2-scrolljump-held-1440.png |
| inv3 | 镜片正对 m1(606,711)/m2(998,878)/m3(785,732) 真实中心逐条截图，PIL 数镜圈（r=120.95）内近 #d8332a 像素；再移到 (250,150) 与拖动途中 (430,300) 复测；移除检验只在浏览器注入 `.hb-clone{box-sizing:content-box!important}`；窄屏 r=88px 复测 | 镜圈内红墨 **1980 / 1805 / 1384**；同一坐标静止帧 0；远离批注 0；拖动途中 0；镜圈外圈带仅 2~6 像素（裁剪抗锯齿）；窄屏镜圈内 1776、静止帧 0。移除检验：克隆盒 2280×1785.6→2510.4×2131.2，克隆内 m2 距镜心 0.8px→**396.5px**，红墨 1805→**0**；去掉注入后复原 | 1440×900（并复测 390×844） | **pass** | demo-r2-inv3-note-m1 / -m2 / -m3-1440.png、demo-r2-inv3-away-1440.png、demo-r2-removaltest-before / -boxsizing-1440.png、demo-r2-narrow-held-390.png |
| inv4 | 读 `.hb-glass`/`.hb-rim` 计算样式；按住扫过 (20,860)(1425,880)(720,880)(20,20)(1400,20)(720,60)(400,600)(1050,300)，每步读纸面 rect、scrollWidth/Height、标题与样张 rect；再快速跳滚到页底回顶重测 | 镜片 `border-radius:50%`、`overflow:hidden`、底色为纸色 rgb(244,244,242)（不透明，读作地面）、`inset 0 0 0 1px rgba(255,255,255,.35), inset 0 0 22px rgba(18,18,20,.1)`，镜径 241.91px；八个扫描点纸面 rect 恒 [0,0,1425,1116]、scrollWidth 恒 1425、scrollHeight 恒 2283、标题/样张 rect 全等——镜片不推动纸面 | 1440×900 | **pass** | demo-r2-inv4-sweep-1440.png、demo-r2-scrolljump-bottom-1440.png、demo-r2-scrolljump-held-1440.png |
| inv5 | 关闭 JS 重载后数红墨；正常重载后 Tab 到「Reveal all notes」按空格；reveal-all 打开时再按住镜片读图例；模拟 `prefers-reduced-motion:reduce` 读过渡并重做按住 | 无 JS：批注静止位置 1467/1415 红墨像素（全屏 2887）、镜柄不渲染（镜位区 0 红像素）；键盘：焦点序＝wordmark→Reveal all notes→镜柄，空格后 `aria-pressed=true`、`is-revealed`、三条批注 visible 且 mask none；reveal-all 下按住 m2 打勾（1 / 3）；reduced-motion：过渡 0s、按住仍抬起且镜下红墨 2036 像素；释放后图例与 is-found 保留 | 1440×900 | **pass** | demo-r2-inv5-nojs-1440.png、demo-r2-inv5-revealall-1440.png、demo-r2-inv5-revealall-held-1440.png、demo-r2-inv5-reducedmotion-held-1440.png |

**同视口原站对照（1440×900，同片段＝按住不动抬起镜片）**：亲自打开 `https://metic.studio/en`，在纸面上按住不动 → `html` 依次得到 `has-loupe` / `loupe-held` / `loupe-live`；`.secret-ink`（当前构建 15 个）由 `hidden` 变 `visible`，`--sr=95.8px`、`--sx/--sy=34.6px/47.2px`，遮罩为 `radial-gradient(95.8px at 34.6px 47.2px, #000 97%, transparent 100%)`（与第 1 轮记录的 95.8px 一致）。镜圈内红色像素（#ff3e3e，容差 ±45，r=121）：静止帧 501 → 按住后 1768，新增约 1267；本 demo 同状态（镜心正对 m2）镜圈内 1875、静止帧 0。两者都是「纸面上读不到、只在镜圈内浮出的红墨」。原站可见玻璃的亮度剖面显示内容边界在 r≈120、圈环 122~134、140 外回到纸色，与 `--sr/0.79` 推出的 r≈121 相容；但镜片 canvas 元素本身是 324×324 CSS px，记录尺度时应区分「可见玻璃 r≈121」与「canvas 元素 324px」。

**诚实性检查（本轮 findings）**：原站选择器名不可重现——SPEC ev1/ev2/ev3 记的 `.loupe-hit/.loupe-glass/.loupe-page/.loupe-view` 在 2026-10-13 的线上构建里查不到（0 个命中），镜片实际是一个 `<canvas class="pointer-events-none fixed left-0 top-0 z-[105] max-w-none will-change-transform">`（324×324 CSS px），状态类是 html 上的 `has-loupe`/`lens-held`/`loupe-held`/`loupe-live`（`loupe-held` 确实存在），`--sr/--sx/--sy` 与 95.8px 复核一致；这些选择器名可能是当时构建或近似描述，今天无法重现，列为未定论项。代码行数：README/SPEC 写 `src/lens.css 409 行`，实测 416 行（修订补的因果注释块使其变长），`src/lens.js 241`、`demo/index.html 185` 一致。`shots/demo.png` 与本轮自截静止帧字节完全一致 → 确为 demo 实拍而非原站图片顶替。未发现无证据宣称、private 证据声明公开、entrypoints/files 不存在或 tokens 编造值；`--hb-zoom 1.6`、`--hb-reveal 0.8`、`--hb-grid 16px`、`--hb-ease cubic-bezier(.23,1,.32,1)` 与实测吻合（镜径 241.91px、`--hb-r 96.8px = 0.8×120.95`）。方法注记：`Emulation.setDeviceMetricsOverride` 在本会话中会被静默重置（有一批帧回到默认 1280×577），此后所有截图都先校验 PNG 尺寸再分析——跨帧像素对比在视口不一致时会得出发散结论，本轮曾因此误判一次。

**本轮未验证项（不变）**：真实触摸硬件；原站触摸分支（第 1 轮合成触摸未移动镜片，本轮未复测）；极小视口下镜片覆盖交互元素时的点击穿透；原站的对比度与无障碍树。

## 独立实现声明

依据行为与测量独立实现，不搬运原站代码、关键帧文本、图片、字体文件、视频或品牌文案；字体替代按字重/字宽/字形/换行比较后选择 OFL 面并登记来源与许可；素材替换保留设计角色。本声明不自动构成法律上的 clean-room 认证。
