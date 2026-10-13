# 可抛掷的糖环页脚（Ring Pop® Candy / ringpopcandy.com）

- 发现类别：theme（仅用于发现与检索，不预设亮点）
- 来源：[Awwwards](https://www.awwwards.com/sites/ring-pop-r-candy) → [原站](https://ringpopcandy.com/)
- 作者：Manufactur ｜ 获奖信息：**Awwwards Nominee（收录于 2026-09-29），非获奖／非 Site of the Day**，故 `award_date` 留空
- 实际访问：2026-10-11 15:57–16:20 (CST, UTC+08:00) ｜ 路由与视口：`/` 首页，桌面 1440×900 与窄屏 390×844
- 规格：`schema_version: 2`；当前状态：**已通过独立操作复核并入库（`user_review.passed` / `rendered_ok` 均为 true，`console_errors: 0`）**

## 设计判断与亮点排序

来源站是 Ring Pop 的 Shopify 品牌站，产品承诺是「可以戴在手上的糖」。整站的语气是派对：高饱和色块、超大标题、横冲直撞的场合词。按辨识度、设计作用、证据充分性、可迁移性排序后留下三条：

| 亮点 id/排序 | 具体设计关系 | 为什么有效（解释判断） | 必要依赖 | 证据 id |
| --- | --- | --- | --- | --- |
| h1 / 1 | 页脚是一整块饱和色场，7 个糖环对象自色场上方画外落下来、落地互撞压叠后静置，并一直可以被抓起、拖动、带惯性抛掷再落回 | 把「可穿戴的糖」翻译成可操作的物理反馈；这是全站唯一让产品本身变成玩具的位置，移除物理后页脚立刻退化为普通电商页脚 | 色场必须裁切对象；对象要有独立剪影与透明背景；尺寸占色场宽 15%–24%；逐帧重力积分与拖拽速度采样 | ev1 ev2 ev6 |
| h2 / 2 | 首页 5 块全幅收藏面板中前 4 块被 pin 住，后一块自下而上覆盖前一块，接缝带出向上阴影，z-index 递增 | 首页的叙事骨架：一块面板＝一个「世界」，滚动即换幕，配合超大标题讲完「一种口味一个场合」 | 至少 2 块连续同构面板；`pinSpacing:false`；接缝阴影；巨型展示字体；主题图形的 scrub 视差 | ev3 ev4 |
| h3 / 3 | 首屏之下的横向循环带：`A RING FOR EVERY THING.` 后面无限滚动场合词 | 把产品从「糖」扩写成「任何值得庆祝的场合」，是从品牌主张过渡到商品列表的桥梁；更像节奏铺垫 | Flickity wrapAround＋轨道克隆；恒定速度 rAF 步进；指针按下暂停 | ev5 |

**移除检验**：保留全部颜色与字号、只移除 h1 的物理——页脚剩下一堆静止图片，「产品会玩」这层身份消失；保留全部颜色与字号、只移除 h2 的堆叠——仍留下五块高饱和面板与巨型标题，视觉身份大体还在。两者都强，但 h1 在移除检验下更不可替代，且 Awwwards 列出的 Elements 里 Draggable Candy Footer 排第一，故 h1 定为本次实现对象。h2/h3 只做分析，不实现（实现范围与选择理由见下）。

## 本次片段与不可丢的关系

- 选中亮点：h1
- 实现范围与选择理由：一个完整的「色场页脚 + 可抛掷糖环」片段——整块饱和色场页脚（字标、三列菜单、法务行）＋ 7 个原创糖环对象，包含 ①进入视口后自色场上方画外下落、②落地回弹与互撞压叠静置、③抓取—拖动—惯性抛掷—被重力拉回—再次静置的闭环、④reduce-motion／无 JS／窄屏／隐藏标签页的降级与暂停。选它而非 h2，除了移除检验，还有一层实现理由：h2 的核心是 250px 展示字体，本机没有同性格字体，硬替就会变成「拿 system-ui 当等价替代」；h1 的核心是对象形态与物理反馈，可以用原创 SVG 精确保留设计角色。
- 不实现：首页其余区块（hero 轮播、巨幅文案、testimonials、newsletter、品牌时间线）；原站的 GSAP / ScrollTrigger / Draggable / InertiaPlugin / Flickity 依赖。

| 不变量 id | 必须保留的关系 | 如何操作/对照验收 |
| --- | --- | --- |
| inv1 | 对象只存在于页脚色场内并被色场裁切，不越界 | 读取对象层 `overflow` 与对象包围盒：对象 AABB 底边贴住色场底边而不外溢 |
| inv2 | 7 件糖环各有「环形带＋顶端主体」独立剪影、透明背景、不同色族与尺寸 | 把糖环 SVG 光栅化到 canvas，检查环心 alpha=0（是环）、宝石中心 alpha=255、整体不透明占比约四成 |
| inv3 | 进入色场后对象自上方画外下落，落地互撞、压叠、遮挡后静置 | 连续采样 7 件 transform：y 从画外一路增大后收敛；部分对象停在地板、部分被别的对象托住 |
| inv4 | 每件可被抓取举起、拖动跟随、释放后带惯性、被重力拉回并再次静置 | 真实指针事件：按下（`is-dragging` 为真）→ 拖动（transform 跟随）→ 松开（惯性位移）→ 等待（回到地板并恢复 `is-settled`） |
| inv5 | 静置可反复再次触发；对象在文案之上（命中先命中对象），空白处点击仍能落到菜单 | `document.elementsFromPoint` 返回对象在前；对象层空白处 `pointer-events:none` 让点击穿透到菜单 |

不变量写入 `selected_fragment.invariants`，每项为 `{id, description}`；独立复核的每条 case 用 `invariant_id` 对应，不靠字体数值或动画数量冒充关系保真。

## 体验路径与证据状态

体验地图（`页面位置 → 用户动作 → 可见变化 → 作用`）：

| 位置 | 用户动作 | 可见变化 | 作用 |
| --- | --- | --- | --- |
| 首屏（0–900） | 进入页面 | 整屏 hero 轮播 + 巨幅标题「PUT YOUR COLORS WHERE YOUR MOUTH IS」，逐词揭示 | 建立派对语气与「颜色」主题 |
| 循环带（≈900–1865） | 正常下滚 | `A RING FOR EVERY THING.` 后的场合词横向循环，速度恒定 | 把糖扩写成「任何场合」 |
| 收藏面板（1865–6538） | 连续下滚 | 前 4 块面板被钉住，后一块自下而上覆盖前一块，接缝浮出阴影；主题图形带轻微视差 | 首页叙事骨架：滚动＝换幕 |
| 中段（6538–8811） | 下滚 | 证言、品牌长文、newsletter，普通滚动，无 pin | 信任与转化 |
| 页脚（10486–11307） | 滚到页脚 | 7 个糖环从色场上方落下、回弹、互相压叠后停住 | 用物理玩具收尾，兑现「可穿戴的糖」 |
| 页脚 | 在糖环上按下并拖动、松开 | 糖环被举起跟随指针，松开后继续滑行，再被拉回地板停住 | 把「糖」变成可反复玩的实体 |
| 页脚 | 回滚再下滚 | 对象保持已静置的布局，不重放坠落（重放需重新加载/再投放） | 一次性入场 + 常驻可玩 |
| 窄屏 390×844 | 重新加载 | 面板降到 784–811px（低于视口）导致 pin 锚点从 `bottom bottom` 变 `top top+=headerHeight`；标题 250px→64px；糖环仍 7 件 | 断点只改锚点与字号，不改机制 |

| 证据 id | 用户动作 → 所见变化 | 结论与状态 | 路由 / 元素 / 视口 | 文件 / 是否可公开 |
| --- | --- | --- | --- | --- |
| ev1 | 滚到页脚 → 7 件自上方画外落下，y 从 −385/−563 增大到 546 附近后停住 | observed | `/` ／ `[data-candy-item]`×7 ／ 1440×900 | `shots/private/original-focus-before.png`、`original-focus-after-rest.png`；false |
| ev2 | 在糖环中心按下并拖到左上再松开 → 举起→继续滑行→回到地板 | observed | `/` 页脚 ／ 第 1 个糖环 ／ 1440×900 | `shots/private/original-focus-mid.png`、`original-focus-after-drag.png`；false |
| ev3 | 分 1500→5700 段滚过 → 前 4 块 pin 在 −19/−36/−104/65，接缝出现 `rgba(0,0,0,.25) 0 -30px 40px` | observed | `/` ／ `section.as-stacking-section`×5 ／ 1440×900 | `shots/private/original-stacking-mid.png`；false |
| ev4 | — | source-supported：`mfr-stacking-sections.min.js` 显示 zIndex 递增 + `pin:true/pinSpacing:false` + `toggleClass` 接缝阴影 | 公开脚本 | 无文件；false |
| ev5 | 滚到循环带 → 轨道 transform 非零、结构为 Flickity 克隆轨道 | source-supported：`MFRCarouselMarquee.min.js` 用 wrapAround＋rAF 常量步进，按下暂停 | `/` ／ `.flickity-slider` ／ 1440×900 | `shots/private/original-marquee.png`；false |
| ev6 | — | source-supported：`MFRFooterCandiesV3.min.js` 的常量 G=.55／AIR=.985／E=.38／FLOOR_F=.6／SLIDE_FRICTION=.85／MAX_STEP=18，Draggable＋InertiaPlugin，进入视口延迟 300ms | 公开脚本 | 无文件；false |
| ev7 | 切 390×844 重新加载 → 面板 784–811px、pin 锚点改为 `top top+=headerHeight`、标题 64px | observed | `/` 窄屏 ／ 同上区块 ／ 390×844 | `shots/private/original-narrow.png`；false |
| ev8 | 本片段 demo：滚到色场 → 7 件自上方下落，4 秒内 7/7 静置 | observed | demo ／ `[data-sweet]`×7 ／ 1440×900 | `shots/demo-before.png`、`shots/demo.png`；true（自有 demo 实拍） |
| ev9 | demo：按下「芒果橙」拖到左上再松开 → 举起 (314,636)→(224,402)，松开后回落到 (254,625) | observed | demo ／ `[data-flavour="mango"]` ／ 1440×900 | `shots/demo-mid.png`、`shots/demo-after.png`；true |
| ev10 | demo 窄屏：7 件仍全部静置于色场内，无横向溢出 | observed | demo ／ 色场与 7 件 ／ 390×844 | `shots/demo-narrow.png`；true |
| ev11 | demo 模拟 reduce-motion：不启动 rAF，直接呈现静置态 | observed | demo ／ 实例 state ／ 1440×900 | `shots/demo-reduced.png`；true |
| ev12 | demo 禁用脚本：文案与 7 件糖环仍静态可见 | observed | demo ／ `[data-sweet]` ／ 1440×900 | `shots/demo-nojs.png`；true |

- 源码声明只能支持机制解释，不能自动升级为用户实际看见：ev4/ev5/ev6 均只记为 `source-supported`，其中 ev5 因未持续采样位移，连「循环带在动」都只算源码支持。
- 本条目无静态占位动效：`motion_catalog` 四条都对应实际存在的行为。
- 原站证据与 demo 用同视口（1440×900）对照；原站首屏图（`private/original-site.png`）不作为片段对照，对照只用页脚前后帧与堆叠接缝帧。
- 原站截图未确认再发布条件，全部放 `shots/private/`（Git 忽略）并设 `publishable: false`；画廊封面只用 demo 实拍 `shots/demo.png`。

## 机制与实现 / API

入口：`src/throwable-sweets.js`（行为）、`src/throwable-sweets.css`（样式与可调变量）、`src/sweet-shapes.js`（原创糖环 SVG 工厂）。demo 里 7 件糖环的 SVG 是**把工厂的输出直接内联进 HTML**，这样无 JS／断网时形状依然在；工厂保留给复用者生成新口味。

最小使用示例（不只引用 demo 内联代码）：

```html
<footer class="sweets-band" data-sweets-band>
  <div class="sweets-band__inner"><!-- 字标 / 菜单 / 法务行 --></div>
  <div class="sweets-field" data-sweets-field>
    <button class="sweet" type="button" data-sweet style="--x:4%;--w:24%;--r:-18deg">…SVG…</button>
    <!-- 其余对象；--x 是静置水平位置，--w 是相对尺度，--r 是 JS 路径的初始朝向 -->
  </div>
</footer>
<script src="../src/throwable-sweets.js"></script>
```

```js
// 需要手动控制时（页面没有 data-sweets-band 的属性自动挂载）
const inst = ThrowableSweets.mount(document.querySelector('.sweets-band'), { gravity: 0.55 });
inst.reset();          // 重新投放
inst.settleNow();      // 立即静置
inst.setOptions({ bounce: 0.5 });
inst.readout();        // { count, settled, gravity, bounce, width, height, running, reducedMotion }
inst.destroy();
```

- 每帧流程：睡眠对象跳过 → 其余做重力/空气阻尼/滑移衰减积分 → 碰撞前按旋转包围盒算地板线与左右边界 → 触地回弹与摩擦 → 逐对圆近似接触（软位置修正 + 法向冲量 + 切向自转）→ 近静止接触转阻尼并计入静置计时 → 达到阈值进入睡眠（不再积分、不再重绘）→ 睡眠对象只在有明显运动的邻居接触时被唤醒。
- 调参：CSS 变量 `--sweets-band-bg/--sweets-band-ink/--sweets-font-*/--sweets-band-min-height`；行为参数集中在 `src/throwable-sweets.js` 的 `DEFAULTS`（重力、空气阻尼、恢复系数、两种摩擦、最大步长、接触/唤醒阈值、静置帧数、投放延迟），也可运行时 `setOptions()` 覆盖。
- 断点、无 JS、离线、reduced-motion、离屏处理：窄屏只是等比缩小对象并重算包围盒；无 JS 时对象以未旋转的静置态贴在色场底边、文案照常可读；无外部依赖故离线无影响；`prefers-reduced-motion: reduce` 时不启动 rAF、直接呈现终态且拖拽不抛掷；`IntersectionObserver` 与 `visibilitychange` 让色场离开视口或标签页隐藏时暂停 rAF。
- 依赖：无（`deps: []`）。原站用 GSAP＋ScrollTrigger＋Draggable＋InertiaPlugin＋Flickity，本片段全部自写。
- 体量：src 手写核心共 794 行（`throwable-sweets.js` 524 / `throwable-sweets.css` 179 / `sweet-shapes.js` 91），超出 PROMPT 的 400–600 行提示；超出部分集中在自写物理求解、指针速度采样与四类降级路径，未用生成素材或压缩代码掩盖复杂度。

## 素材替代与适用边界

| 设计角色 | 独立替代素材 / 字体 | 保留的轮廓、尺度与层级 | 来源 / 许可 / 已知损失 |
| --- | --- | --- | --- |
| 糖环主体（7 张透明位图照片） | 原创 SVG：椭圆环带＋顶端水滴宝石＋高光切面，7 组色族 | 环形轮廓、上下方向、圆润体积、透明背景、重心偏下、单件占色场宽 15%–24%、可互相遮挡 | 自绘，无外部素材；损失：原站是真实摄影（塑料质感/真实高光），本片段是矢量插画，材质更平，切面造型与原作不同 |
| 展示/正文字体（Ringold、Greed Standard） | 系统字体（Trebuchet MS／DejaVu Sans），按字重与换行关系调字号字距 | 只保留字重层级与换行关系 | 字体文件不可得也不可搬运；损失：圆角字形与负字距的展示感无法等价复现，故片段核心刻意不放在排版上 |
| 色场与文案 | 新品牌 GLOSSLOOP 与自拟文案；色场 #3b1fa8 替换原站 #2b6ffc | 整块饱和色场＋白字压色场的层级 | 原站色值仅作 token 记录，不复用其品牌文案 |

适用任务：给落地页／电商页脚或任何「收尾区块」加一个可玩的物理层，前提是已有明确的实体主体（糖、球、扭蛋、贴纸、筹码）。必要条件：一个被裁切的色场容器＋一组带透明背景与独立剪影的对象，对象占容器宽 15%–25% 最稳。不适用：对象是细长文字或线条（圆形近似会失真）、页脚下方画外空间不足（下落起点被裁掉看不见）、页面已有滚动劫持（需在同一 rAF 里自行调度）。已知取舍与已验证风险见 `dont_copy`：圆形近似带来的压叠间隙分布与原站旋转包围盒方案不完全一致；对象层空白处指针穿透是本片段的可用性改良而非照抄；未做性能与无障碍对照，因此不评价原站在这些维度是否失败。

## 独立操作复核与未验证项

- 复核者：**未参与实现的独立复核子代理**（Hermes · deepseek-v4.1-flash），2026-10-11 16:35（CST）。复核只读 demo/src、不改实现；自己实拍 demo 帧存 `shots/demo-review-*.png`；原站自行访问并处理后 cookie 条后重采样。
- 复核做法：先直开 file:// demo（本条目复核时尚未入库，故不经画廊），在 1440×900 与 390×844 两个视口走「正常滚到色场 → 抓取—拖动—释放 → 多点反复抛掷 → 点击空白/菜单 → 回滚/再投放 → 快速跳滚 → 窄屏」，逐条不变量做一次针对性操作；再做移除检验与四类降级路径；最后同视口对照原站页脚。

| invariant_id | 实际动作 | 用户所见 | 视口 | pass / fail / unverified | demo 实拍 / 录像 |
| --- | --- | --- | --- | --- | --- |
| inv1 | 读色场/对象层计算样式；触发「再投放」取下落中段帧；把一件拖到色场左上极限；逐件比对包围盒与边界 | 两容器 `overflow:hidden`；静置后 7 件 AABB 底边全部贴色场底边(1496)、左右不越界；下落中对象 y 为负、色场顶边上方 15px 命中测试返回 `section.lede`（上方被裁切、点不到）；拖到极限仍在色场内 (116,165) | 1440×900 | **pass** | `shots/demo-review-inv1-clip-boundary.png`、`demo-review-inv1-midfall-clip.png` |
| inv2 | 把 7 个 SVG 逐个光栅化到 canvas 采样像素；读 7 件尺度与朝向 | 7/7 环内孔 alpha=0、宝石中心 alpha=255、不透明占比≈0.406；宝石色分属红/橙/绿/粉/青/紫/黄七族；占色场宽 15%–24%、旋转 −36°…34° 各不相同；均为「环带+顶端水滴宝石」 | 1440×900 | **pass** | `shots/demo-review-desktop-settled.png` |
| inv3 | 注入逐帧记录器 +「再投放」，采样 7 件 y 至静置；静置后逐件中心命中测试；对照原站页脚 | y 从 −721/−649/… 单调增大到 531/638/578/661/545/686/628 并收敛 7/7 静置；6/7 对象在自身中心为最上层、blush 被别的对象盖住（压叠/遮挡）；底边贴色场底线。原站同视口页脚同为白字蓝底、糖环自上方下落压叠、底边被裁切 | 1440×900 | **pass** | `shots/demo-review-inv3-occlusion.png` |
| inv4 | CDP 真实指针 press→多次 move→release，随后按 ~0.12s 采样位移 | 按下即 `is-dragging`、跟随到 (195,294)；松开瞬间保留 vx=7.73 / vy=−11.82，之后继续位移到 y≈97（惯性），再被重力拉回、回弹，最后回落并恢复 `is-settled`（y≈514） | 1440×900 | **pass** | `shots/demo-review-inv4-drag-mid.png`、`demo-review-inv4-after-release.png` |
| inv5 | 读 z-index/`pointer-events`；对象中心与菜单链接分别 `elementsFromPoint` 并对菜单派发真实点击；静置后连续再次抓取两次 | 对象层 z-index:2 > 文案层 1，对象中心 stack[0]=`button.sweet`；对象层空白处 `pointer-events:none`，菜单链接处命中 `<a>` 且真实点击触发；静置的「浆果红」被连续再次抓取两次并重新 `is-settled`（静置非终点） | 1440×900 | **pass** | `shots/demo-review-inv5-hittest.png` |
| inv3（第二视口） | 390×844 重新加载并滚到色场采样几何 | 7 件仍全部静置于色场（色场 390×783），无横向溢出（`body.scrollWidth`=`innerWidth`=390），对象宽 72–121px；窄屏下抓取—抛出—回落同样可用 | 390×844 | **pass** | `shots/demo-review-narrow.png` |

- 控制台结果：独立复测 5 次前台重载均为 **0 条错误**（`console_errors: 0`）；复核另跑 reduce-motion / 禁用脚本两态亦无错误。
- 移除检验（临时、不改源码）：`setOptions({gravity:0})` 后再投放 → 7 件停在色场上方画外、0 可见，页脚退化为纯色场＋纯文案。保留全部颜色与字号、只移除物理求解，该片段的「可玩实体」身份消失，支持 h1 为主关系。
- 降级路径：`prefers-reduced-motion: reduce` → `state.running=false`、7 件直接以静置态呈现；禁用脚本 → 文案与 7 件 SVG 仍静态可读（7/7 底边贴色场底边）；`document.hidden=true` 派发 `visibilitychange` → `running` 由 `true` 变 `false`（隐藏即暂停）。键盘方向键微调亦复测通过（ArrowLeft 使 x 117→105）。
- 对照条件：原站与 demo 同为 1440×900，对照对象同为「页脚对象层」，状态为静置前后/下落中；未拿原站首屏与 demo 的其它幕比较。原站截图未确认再发布条件，本复核自采的原站帧只存于本地 scratch，不写进本条目。
- 仍保留的未验证项：①原站循环带的速度连续性（只有源码支持）；②原站糖环之间旋转包围盒级的堆叠细节；③本片段 `IntersectionObserver` 的「离开视口即暂停」分支在本 demo 布局下仍无法自然触发（页脚恒占视口 15% 以上）；④任何性能/无障碍对照。以上不影响五个核心不变量的实测 pass。
- **入库门槛**：五个核心不变量逐条实测 pass 且独立对照完成，`user_review.passed=true`、`reviewer` 已填，`rendered_ok` 一并置 `true`；`console_errors` 独立复测为整数 `0`。`source_observed` 与 `mechanism_preserved` 维持 `true`。

## 独立实现声明

依据行为观察与测量独立实现，不搬运原站代码、关键帧文本、图片、字体文件、视频或品牌文案；demo 使用新品牌 GLOSSLOOP 与自拟文案，糖环为原创 SVG，素材替换保留设计角色（轮廓/方向/体积/透明/重心/相对尺度/遮挡位置）。本声明不自动构成法律上的 clean-room 认证。
