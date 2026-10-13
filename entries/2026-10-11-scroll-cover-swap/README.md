# ORVE 封面换幕 · 滚动消费的封面（scroll-consumed cover）

- 发现类别：motion（仅用于发现与检索，不预设亮点）
- 来源：[Awwwards](https://www.awwwards.com/sites/ownitt-2) → [原站](https://ownitt.fr/)
- 作者：Ownitt ｜ 获奖信息：**未核实为获奖**——Awwwards 详情页标题为 “Ownitt - Awwwards Nominee”，`award_date` 留空
- 实际访问：2026-10-11 16:00 (CST, UTC+08:00) ｜ 路由：`https://ownitt.fr/` 首页根路由（首访状态；见下方“复核条件”）
- 规格：`schema_version: 2`；当前状态：**已通过第 2 轮独立复核（5/5 不变量实测 pass）**，`rendered_ok` 与 `user_review.passed` 为 true

## 设计判断与亮点排序

Ownitt 是一家法国巴斯克地区的品牌与创意机构，首页是一条很长的自述型叙事。首访时，页面用一屏浅色“品牌印章”当封面：只要一个记号、一个字标、一句定位、一串地名。我的判断是：这个站点最强的设计手法不是某一枚特效，而是**把滚动当成时间轴来切场景**——封面是一次空间事件，中段是钉住的文本舞台，深色首屏则是“页在动”的底色。

排序依据是辨识度、设计作用、证据充分性与可迁移性；工程难度只影响实现范围，不倒推“最好写的就最好”。

| 亮点 id / 排序 | 具体设计关系 | 为什么有效（解释判断） | 必要依赖 | 证据 id |
| --- | --- | --- | --- | --- |
| h1 / 1 | 一屏封面被滚动消费：品牌记号绕固定中心放大到吞满视口，纵向标签是持续自走的循环带（与滚动无关），滚动提示提前退场，幕布在封面后半段铺满（原站 p≈0.556 起）；滚满一屏即换幕（封面退出文档流、滚动基点回顶） | 尺度变化本身承担品牌主张（“我在任何尺寸上都是同一个记号”）；节奏把“还有多少”量化——但量化只由**提示退场、幕布铺满、滚满一屏即换幕**这三个信号承担；**自走带不承担量化**（它是持续的环境动势）。这是判断，不是转化率事实 | 径向对称单色记号、固定中心锚点、封面高度=一屏、纸/幕高对比、提示早期退场 | ev1 ev2 ev3 ev4 |
| h2 / 2 | 深色章节的钉住文本舞台：一屏舞台在数倍滚动占位里变为 fixed，句首逐词爬升不透明度，随后相邻文本块交叉淡出 | 让“读一段宣言”变成有进度感的事件，而不是等打字机结束；证明全站“滚动=时间轴”的一致性 | 一屏舞台 + 数倍滚动占位、可逐词寻址的文本、各段长度接近 | ev5 |
| h3 / 3 | 深色首屏图的滚动视差（位移 0→174.96px 对应滚动 0→900px，约 0.194×）＋ 固定标签下的纵向关键词轨按 27px 逐行步进 | 维持“页在动”的语气并塞进一串业务词，但不改变结构；辨识度最低的辅效 | 可裁切满幅背景图、固定宽度标签槽、关键词长度相近 | ev6 ev7 |

**移除检验**：若保留全部颜色与字号、只移除 h1 的“记号放大 + 封面消费”，首屏立刻退化成一个静态徽记页——用户读不到“记号是主角”这件事，h1 成立为第一萃取价值。对 h2 做同样检验：若文本只做一次淡入入场，页面结构基本不变，只是失去进度感，因此它排在 h1 之后。h3 移除后页面辨识度几乎不变，仅剩气质差异，故列第三。h2 与 h1 共享驱动方式（滚动映射）但构图与触发不同，不是同一亮点的变体；h3 已标注为可迁移性中等。

## 本次片段与不可丢的关系

- 选中亮点：h1
- 实现范围：只做“封面 → 换幕”这一段——一屏浅色品牌封面（字标 / 径向记号 / 说明行 / 固定高度标签窗 / 滚动提示 / 整屏幕布），加上它下面的深色章节当后幕；实现封面内四种滚动映射与滚满一屏后的消费。
- 选择理由：这是整站辨识度的入口，天然含前幕/后幕两个状态与明确触发（滚满一屏），素材可完全原创，规模符合“小而完整”的预算。
- 不实现：原站首页其余区块、入场动画（门扇/颗粒/字标入场）、首屏摄影与品牌字体文件、钉住的文本舞台与首屏视差、以及“封面只出现一次、之后永久跳过”的持久化策略。

| 不变量 id | 必须保留的关系 | 如何操作/对照验收 |
| --- | --- | --- |
| inv1 | 封面是一屏浅色纸上的单一居中纵列：记号、字标、说明行、标签窗、滚动提示自下而上叠放，深色墨压在浅色纸上 | 打开 demo 看首屏构图与堆叠顺序；用命中测试确认层序（字标在下 → 记号 → 说明行/标签窗 → 提示 → 幕布） |
| inv2 | 记号绕自身中心连续放大，从约 49px 长到吞满视口（近指数加速、约 31 倍），中心锚点不漂移 | 从 0 正常滚到一屏，观察记号尺寸与中心位置 |
| inv3 | 纵向标签在固定高度窗口内是一台**持续自走的循环带**（约 12.9px/s，与滚动位置无关，轨末重复首两行做无缝回绕） | 不做任何滚动输入、保持 scrollY=0 连续采样轨位移（应持续匀速推进）；滚动时位移不随滚动位置变化 |
| inv4 | 滚动提示在封面早期（约前 1/3 行程）淡出，不贯穿全程 | 前段滚动观察提示不透明度 |
| inv5 | 滚满一屏后封面被消费：幕布落满 → 封面移出文档流 → 后幕接管且滚动基点回顶；换幕后上滚封面不复活 | 滚满一屏看换幕；回滚、复位按钮 |

不变量写入 `selected_fragment.invariants`，每项为 `{id, description}`；独立复核的每条 case 用 `invariant_id` 对应。不靠字体数值或动画数量冒充关系保真。

## 体验路径与证据状态

| 证据 id | 用户动作 → 所见变化 | 结论与状态 | 路由 / 元素 / 视口 | 文件 / 是否可公开 |
| --- | --- | --- | --- | --- |
| ev1 | 首访打开首页 → 一屏浅色“品牌印章”：字标、径向记号、小字距大写说明行 + 大号斜体强调、固定高度标签窗、滚动提示 | observed（纸 rgb(244,241,234)、墨 rgb(10,10,11)、封面高=一屏） | `https://ownitt.fr/` / 封面区块及其子元素 / 1440x900 | `shots/private/original-site.png`、`original-focus-before.png`；publishable: false |
| ev2 | 把滚动从 0 推进到一屏 → 记号 49px 长到 1514px（≈31×，中段起加速，中心固定）、标签轨在零输入下自走 12.9px/s（与滚动无关）、提示 1→0（原站 0–160px ≈ 前 18%；demo 0–306px）、幕布 0→1（原站 500→900px，p≈0.556 起；demo veilOnset 0.86） | observed（逐档实测几何与不透明度） | 同上 / 记号组、标签轨、提示、幕布 / 1440x900 | `shots/private/original-focus-mid.png`；publishable: false |
| ev3 | 继续滚过一屏 → 封面与其中元素从 DOM 消失，文档高度 32000→30200，`scrollY` 被重置为 0，深色章节成为首屏 | observed（相邻档位高度/滚动位置/元素存在性对比） | 同上 / 封面容器与 documentElement / 1440x900 | `shots/private/original-focus-after.png`；publishable: false |
| ev4 | 窄屏 390×844 重载 → 同一套居中纵列，字号按断点缩小（标签行 17px），无横向溢出 | observed | 同上 / 封面纵列与 documentElement / 390x844 | `shots/private/original-cover-narrow.png`；publishable: false |
| ev5 | 滚到深色章节 → 舞台 computed position 由 relative 变 fixed 并保持（约 4100–6500），句首各词不透明度逐词爬升，随后文本块交叉淡出 | observed（逐档读 position 与不透明度） | 同上 / 宣言舞台、句首词、文本块 / 1440x900 | `shots/private/original-manifesto-pinned.png`；publishable: false |
| ev6 | 深色首屏滚动 → 背景图容器位移 0→174.96px（约 0.194×）后夹紧；关键词轨以 27px 逐行步进 | observed | 同上 / 首屏背景图容器、关键词轨 / 1440x900 | `shots/private/original-hero-parallax.png`；publishable: false |
| ev7 | 深色首屏存在“固定标签 + 可切换备选文本”的结构 | source-supported（结构存在；合成 MouseEvent 与 CDP 真实鼠标移动均未触发切换） | 同上 / 固定标签、关键词轨、备选文本块 / 1440x900 | 无（未取得可见变化） |

- 源码声明只能支持机制解释，不能自动升级为用户实际看见；ev7 因此停在 source-supported，没有进任何亮点的不变量。
- 原站证据全部为**未确认再发布条件**，放 `shots/private/`（Git 忽略）并设 `publishable: false`；画廊封面只用 demo 实拍。
- 原站与 demo 的对照条件：同视口（1440×900）、同片段（封面第一屏 → 滚满一屏的换幕）、同关键状态（首屏 / 行程中段 / 换幕后）。
- demo 的滚动映射用同一进度区间逐档实测（见“实现/API”的自测记录）；截图只是证据帧，行为结论以逐档读取的几何/样式为准。

## 机制与实现 / API

构图、素材、触发、反馈如何共同工作：封面高度即行程总长；滚动位置 `p = scrollY / 封面高度` 同时驱动四条互不干扰的映射——记号放大（`markOnset` 之后指数加速）、标签自走（`tickerSpeed` 常驻 rAF 循环，与滚动无关）、提示淡出（`hintFade`）、幕布落下（`veilOnset`）。`p ≥ 1` 时触发一次消费：幕布先落满，随后封面 `display:none`、移出文档流，滚动基点设回后幕顶部，于是“翻过封面”成为不可回退的空间事件。

```html
<!-- 最小使用示例（API 位于 src/） -->
<link rel="stylesheet" href="src/fonts.css">
<link rel="stylesheet" href="src/cover.css">
<div class="orve-cover" data-orve-cover data-orve-chapter="#chapitre">
  <div class="orve-cover__stage">
    <div class="orve-cover__wordmark">ORVE</div>
    <div class="orve-cover__mark" data-orve-mark><svg viewBox="0 0 100 100"><path d="…" fill="currentColor"/></svg></div>
    <div class="orve-cover__below">
      <p class="orve-cover__tagline">…<span class="accent">…</span></p>
      <div class="orve-cover__ticker" data-orve-ticker><ul class="orve-cover__track" data-orve-track><li>…</li></ul></div>
    </div>
  </div>
  <div class="orve-cover__hint" data-orve-hint><span class="label">DÉFILER</span><span class="line"><i class="dot"></i></span></div>
  <span class="orve-cover__veil" data-orve-veil></span>
</div>
<main class="orve-chapter" id="chapitre">…</main>
<script src="src/cover.js"></script>
```

```js
// 手动初始化 / 复位 / 销毁
const cover = new OrveCover.Cover(document.querySelector('[data-orve-cover]'), { markScaleMax: 31 });
cover.reset();    // 恢复封面并把滚动带回封面顶部
cover.destroy();  // 解绑滚动/尺寸/可见性监听与消费定时器
```

- 调参：CSS 变量集中在 `src/cover.css` 的 `:root`（纸/墨/幕色、字号、纵列宽、窗口高、`--orve-mark-scale-max` 等）；行为参数在 `src/cover.js` 的 `DEFAULTS`（`markScaleMax / markOnset / markAccel / tickerSpeed / hintFade / veilOnset / settle`）。
- 断点：`max-width: 40rem` 收窄纵列并缩小记号初始尺寸与字号；实测 390×844 下无横向溢出。
- 无 JS：封面按普通区块（`.is-live` 才 sticky）正常滚走，不消费、不落幕；内联 SVG 记号与全部文案仍在，基础内容可见。
- reduced-motion：不绑定滚动映射、不消费，封面静态呈现；演示页的走动小点与放大全部停用。
- 离屏/隐藏标签页：映射由滚动事件 + rAF 触发，隐藏时不排帧；回到前台补一次更新（`visibilitychange`），避免停在中间状态。
- 依赖：无（零依赖，不引入 GSAP 等库；映射用原生滚动 + rAF）。字体为本条目自托管的 Playfair Display（SIL OFL 1.1），不是第三方运行时依赖。
- 自测记录（实现者，非独立复核）：1440×900 下 `p` 逐档 `0→1` 时记号 scale 实测 1 → 1.12 → 2.07 → 4.32 → 8.13 → 13.73 → 21.30 → 31.00；轨位移在零输入下 10.32px/0.8s（=12.9px/s）持续匀速推进（自走循环带，与滚动位置无关）；提示 1 → 0；幕布 0 → 0.206 → 1.0；`p≥1` 后封面 `display:none`、`scrollY=0`、文档高度 1908 → 1008；上滚封面不复活；复位按钮可恢复。控制台错误 0。

## 素材替代与适用边界

| 设计角色 | 独立替代素材 / 字体 | 保留的轮廓、尺度与层级 | 来源 / 许可 / 已知损失 |
| --- | --- | --- | --- |
| 品牌记号（径向对称单色徽记，需放大到满屏） | 自写原创 SVG：8 支由中心收细到尖端的火花臂，viewBox 100×100，单色 `currentColor` | 径向对称、单色、中心锚点、可无级放大轮廓不糊 | 本条目录原创；造型与字面细节同原站不同，不声称等价 |
| 字标（原站为自有 SVG 字标） | 原创文字字标 ORVE | 占纵列顶部、先绘制会被放大记号覆盖的层级 | 本条目录原创；非定制字形，字面宽度不同 |
| 高对比商业衬线（原站 IvyPresto Display） | Orve Display = Playfair Display | 高对比衬线性格、斜体反差、字面率偏大 | SIL OFL 1.1，见 `src/fonts/OFL.txt`；不是像素等价替代 |
| 纵向地名列表 | 自拟六个专业词（Typographie / Mouvement / Systèmes / Éditions / Signalétique / Interface） | 固定高度窗口内的纵向短标签列表，自走循环推进（与滚动无关） | 本条目录原创；语义从地名变为业务词 |
| 后幕（深色章节） | 自拟标题与正文的深色章节 | 整屏墨色、大号衬线标题 + 正文、纸/幕对比 | 本条目录原创；不使用原站摄影，后幕视觉密度低于原站 |

适用任务：品牌站首访、活动页开场、作品集开场、新版本封面等“首屏需要一个可被翻过去的封面”的场景。
必要条件：可无级放大且轮廓不糊的主体、一段可量化的行程（一屏高度最直觉）、与封面形成明暗对比的后幕（否则落幕会有亮度跳变）。
不适用：内容型长页（封面会拦住索引与分享锚点）、需要保留浏览器返回语义的页面（消费后回滚不复原封面）、必须打印/静态导出的页面。
`dont_copy`（适用边界与取舍，不是批评原作）：①“封面只出现一次、之后永久跳过”的持久化策略适合真实访客，但会让复核/A-B/截图脚本下次打开看不到片段——本次改为进程内一次性 + 复位按钮；②行程长度写死为正好一屏，与视口高度绑定，内容长短变化时量化感失真，复用时应参数化；③放大到 31 倍时边缘会有缩放采样痕迹，是放大策略的副产品，不是可复用优点。未验证：低端设备帧率、对比度与无障碍、原站是否做 reduced-motion 降级——未测就不写成“原站失败”。

## 独立复核与未验证项

### 第 2 轮（当前结论）：未参与实现的独立复核 · **通过**

复核者：**Hermes 独立复核子代理（第 2 轮；未参与本条实现，也未参与第 1 轮修订）** ｜ 时间：2026-10-13 13:46（CST）｜ 方式：直接以 `file://` 打开 `demo/index.html`（不入库、不经画廊），并**自行首访原站**（`https://ownitt.fr/`）重测第 1 轮改写的那条关系。
结论：**5 条不变量全部实测 pass**（含自己重测原站纵向列表那条），据此 `verification.user_review.passed` 与 `rendered_ok` 置 true；`console_errors` 独立复测为 0。

**复核口径与环境记录（环境问题与设计结论分开）**
- 本环境标签页默认后台、rAF 冻结（`document.hidden` 为真、`requestAnimationFrame` 不回调）→ 必须先 `Emulation.setFocusEmulationEnabled(enabled:true)` + `Page.bringToFront` 转前台，否则滚动映射完全不更新。这是环境缺口，不是 demo 缺陷。
- **与第 1 轮的记录不同：本环境 `Input.dispatchMouseEvent(mouseWheel)` 实测可用**（一次 `deltaY=240` 得 `scrollY=240`），故本轮把「真实滚轮」当主路径覆盖（9×110px 逐段推进到底 + 反向回滚复测可逆性），`window.scrollTo` 只用于逐档取样。
- 原站首访：清 `localStorage.ownitt_intro_seen` 与 `sessionStorage` 后 `Page.reload(ignoreCache:true)`，等入场约 11s，否则会跳过封面拿到无关取样；封面区块是内联 `position:fixed` 的一屏钉住层，扫描用 `window.lenis.scrollTo(y,{immediate:true})`。原站每帧右下角有 cookie 同意卡（本轮既未接受也未拒绝），不影响封面几何但遮挡右下角。
- 逐档取样每档等 0.3–0.4s 再读，避免读到上一帧样式。

**逐条不变量（每条一个独立 case；动作 → 所见 → 视口 → 判定 → 本轮实拍）**

| invariant_id | 实际动作 | 用户所见（实测） | 视口 | 判定 | 本轮实拍 |
| --- | --- | --- | --- | --- | --- |
| inv1 | 直开 demo 读首屏纵列几何/三色/`elementsFromPoint` 命中顺序；再在 550/700/800 复测命中顺序验证放大后的层序；窄屏重复；随后自行首访原站同批取样对照 | demo：整屏浅色纸（rgb(241,237,226)）上单一居中纵列，五个元素 cx 全 = 712.5（窄屏 195）；墨 rgb(11,11,12)、幕布 rgb(11,11,12)；z 序 记号 1 < 说明行 2 < 提示 6 < 幕布 10。命中顺序 字标→记号→说明行/标签窗→提示→幕布；记号放大到 296/673/1044px 时「字标中心」命中返回记号本身，「说明行/标签窗中心」仍返回说明行/标签窗 → 放大后的记号压在字标之上、却在说明行之下。原站同视口同构：纸 rgb(244,241,234)=#F4F1EA、墨 rgb(10,10,11)、纵列 317–346px、记号 49×49、标签窗 144px；窄屏 390×844 记号 28×28、无横向溢出 | 1440x900（+390x844） | **pass** | `shots/demo-r2-inv1-before.png`、`demo-r2-narrow-inv1-before.png` |
| inv2 | 真实滚轮 9×110px 推到底 + 中途反向回滚；另逐档 0→899 读记号包围盒与中心；窄屏重复；原站逐档读 `[class*=asteriskGroup]` 包围盒与 computed matrix | demo：49px→1519px（=31×）连续单调、后段近指数加速，中心恒 (712.5,364.7) 不漂移；真实滚轮回滚可逆（scrollY 550/440/330/220 对应 294.6/137/63.1/49px）；窄屏 28→861.6px、中心恒 (195,336.6)。原站：49px→6186px 包围盒，matrix 反推 scale≈91.7（并叠加约 170° 自转），中心恒 (715,450)——同为绕固定中心连续放大至吞满视口，差别只在倍率与是否叠加自转 | 1440x900（+390x844） | **pass** | `shots/demo-r2-inv2-mid450.png`、`demo-r2-inv2-mid700.png`、`demo-r2-inv2-nearfull830.png`、`demo-r2-inv2-realwheel-{mid,rollback,late}.png` |
| inv3（重点） | demo：保持 scrollY=0、零输入连续采样轨位移 4s；再在 scrollY 恒定 400/800 各采样 2s；0↔899 跳滚读连续性；trackY=233 逼近循环长度观察回绕；窄屏重复。原站：自行首访，零输入、scrollY 恒 0 采样 12s；scrollY 恒定 400/800 各 3s；0/400/800 跳滚看是否随滚动偏移 | demo：零输入 12.89px/s；400/800 同为 12.88/12.89px/s；跳滚下只随时间推进、无按滚动的跳变；越过循环长度 240px 时由 −239.24 回到 −0.96 继续推进、无夹紧，回绕瞬间窗口顶行仍是重复行的 `Typographie`（无缝）；窄屏 12.92px/s。**原站：零输入、scrollY 恒 0 每 0.5s 稳定推进 −6.666/−6.667px = 13.33px/s（12s 共 −64.6→−223.1px）；400/800 同为 13.33px/s；跳滚瞬间位移连续、不随滚动位置偏移；约 −240px 处回绕（12 行 = 6 城 ×2 拷贝）后继续、无夹紧** → 确为持续自走的循环带，不是滚动擦洗 | 1440x900（+390x844） | **pass** | `shots/demo-r2-inv3-selfrun-a.png`、`demo-r2-inv3-selfrun-b.png`（同一 scrollY=0、相隔 9s：轨位移 −7.95px → −125.34px） |
| inv4 | 真实滚轮逐段推进 + 逐档 scrollTo 读提示 opacity 全曲线；上滚复测可逆；窄屏重复；原站同视口逐档 0→300（步长 20） | demo：1@0 → 0.673@100 → 0.346@200 → 0.02@300 → **0@306** 并保持 0（一屏约 34% 行程内淡完，不贯穿封面）；真实滚轮 0.641@110 → 0.281@220 → 0@330，上滚回到 0.641/1；窄屏 0@287。原站：1@0 → 0.527@100 → 0.072@140 → **0@160**（约前 18%） | 1440x900（+390x844） | **pass** | `shots/demo-r2-inv4-hintfading270.png` |
| inv5 | 真实滚轮 9×110px 推到底触发换幕，读封面 display/文档高度/scrollY；换幕后真实滚轮上滚 −500、`scrollBy(0,-400)`、手动派发 scroll 事件确认不复活；点旁侧面板「复位封面」确认恢复；窄屏重复；原站推到 900px 对照 | demo：p≥1 时幕布先满（880px 时 0.841，换幕瞬间置 1），随后封面 `display:none` 移出文档流、文档高度 1908→1008、scrollY 同帧回 0、深色章节成为首屏；换幕后三种上滚方式下封面始终不复活；复位按钮恢复（display block、docH 1908、自走带重新运行）；窄屏同样（docH 1789→945）。原站：约 900px 处封面包裹从 DOM 消失、scrollHeight 32000→30200、scrollY 重置为 0、深色 hero 成为首屏 | 1440x900（+390x844） | **pass** | `shots/demo-r2-inv5-after.png`、`demo-r2-inv5-reset.png`、`demo-r2-narrow-inv5-after.png` |

**重点：原站那条关系的独立复测（第 1 轮改写对象）**

原站纵向列表在**零输入、`scrollY` 恒 0** 时仍持续移动，因此是自走循环带，不是滚动擦洗——**第 1 轮的证伪结论本轮独立复现**（我测得 13.33px/s，与其记录的 12.85px/s 同量级，差约 4%）。判据是三条：① 零输入且 `scrollY` 恒 0 时位移持续匀速推进；② `scrollY` 恒定在 400/800 时速率相同，且在 0/400/800 之间跳滚时位移只随时间连续推进、没有按滚动量产生的偏移；③ 位移在约 −240px 处回绕（轨内 12 行 = 6 个城市 ×2 份拷贝）后继续，无夹紧、无停顿。demo 侧的对应实现（常驻 rAF、`tickerSpeed=12.9`、轨末重复两行做无缝回绕）在同样四条判据下与之一致。
同视口同片段对照帧：`shots/demo-r2-inv3-selfrun-a.png` / `demo-r2-inv3-selfrun-b.png` 是同一 scrollY=0 下相隔 9s 的 demo 实拍，标签窗内可见行由 `Typographie/Mouvement/Systèmes/Éditions` 变为 `Éditions/Signalétique/Interface/Typographie`；原站同关键状态对照帧见 `shots/private/reviewer-r2-original-*.png`（不公开）。

**诚实性检查（本轮复核者独立执行）**
- `verification.screenshot` 的 `shots/demo.png` 与实现者此前的 `demo-before/mid/after/narrow*.png` 经查看确为 demo（ORVE）实拍，未拿原站图顶替；`shots/private/original-*` 等确为原站（ownitt）证据，且位于 `.gitignore` 忽略的 `shots/private/`、evidence 中 `publishable:false`——不存在「private 证据声明公开」。
- `entrypoints`/`files` 所列 9 个文件全部存在；`src/fonts/OFL.txt` 为 Playfair Display 的 SIL OFL 1.1 原文（含 Reserved Font Name）。
- tokens 抽验未发现编造值：`paper #F4F1EA`（原站 rgb(244,241,234)）、`ink #0A0A0B`（rgb(10,10,11)）、`coverHeight 900`、`tickerItem 22.32px/行高 40px`、`taglineMain 15.84px/字距 2.85px`、`italicAccent 34.56px`、`scrollLabel 9px/500/字距 3.42px`、`tickerWindow 144px/轨 480px`、`centerColumn 317/346px`、`stackGaps 40/39/28px` 全部复现。
- `console.error` + `window.onerror` + `unhandledrejection` 在完整交互（真实滚轮推到换幕、回滚、复位、窄屏、面板展开）后计数为 **0**（独立复测）。
- `deps: []` 与源码一致（`src/cover.js` 无第三方引用）；API 描述与代码一致：`window.OrveCover = {Cover, markSvg, instances}`、`data-orve-*` 钩子、`reset/destroy/consume`、`DEFAULTS` 的七个参数均可对上级。

**遗留待修正（不影响 5 条不变量判定，但属复核者实测与原站读数不符或残留旧读数，需实现者处理）**
1. `tokens.motion.veil` 的「行程约 860 → 900px（最后约 5% 封面行程）」，以及 README h1 行的「最后 5% 行程落下整屏幕布」、`evidence.ev2` 的「幕布 0→0.30–0.84（860–900px）」——**对原站不可复现**。我实测 `[class*=darkVeil]` 的不透明度从约 **500px（p≈0.556）** 开始出现：500→0.0002、600→0.068、700→0.258、800→0.565、875→0.880、899→0.995，即幕布是在封面行程的**后半段（约后 44%）匀速铺满**，不是最后 5%。demo 的 `veilOnset=0.86`（最后约 14%）也晚于原站。`repro_notes` 已把它标为「待统一」，本轮确认原站读数应按 ~0.56 起落。
2. `tokens.motion.hintFade` 的「行程约 0 → 320px」——对原站不可复现：原站滚动提示实测 1@0 → 0.527@100 → 0.072@140 → **0@160**（约前 18% 行程）；320px 更接近 demo 自己的 `hintFade=0.34`（306px）。README h1 行与 ev2 的「约前 1/3 行程」对原站偏大。
3. `motion_catalog` 第一条的 after 状态写「scrollY≈一屏：记号约 1514px（≈31×）」——按原站实测，1514px（scale≈31）出现在 scrollY≈600px（行程 2/3），到 899px 时原站记号组包围盒已达 6186px（matrix 反推 scale≈91.7，另伴随约 170° 自转）。**31× 是 demo 的参数，不应写成原站的一屏终值**（demo 的 1519px@899 属实）。
4. demo 侧残留旧读数（实拍见 `shots/demo-r2-stale-panel.png`）：`demo/index.html` 旁侧面板仍写「列表擦洗 / 前 55% 进度，夹紧不循环」，与改后的自走实现直接矛盾；`src/cover.css` 的 `--orve-ticker-span: 0.55`（注释「列表擦洗用掉的封面进度」）在 `src/cover.js` 中已无任何引用，是死参数。二者都在 `demo/`、`src/`（本轮复核者按任务边界不可改），需实现者清理。
5. `inv1` 文字里「品牌记号、字标、说明行、纵向标签窗、滚动提示自下而上叠放」的枚举顺序与实际（自上而下：字标 → 记号 → 说明行 → 标签窗 → 提示）不符，属措辞笔误（`composition` 段写的是正确的自上而下顺序）；`inv3` 的「轨末重复首两行」是 demo 的实现细节，原站是整份拷贝（12 行 = 6 城 ×2），建议改成不指认具体实现。
6. README 开头「当前状态：**v2 草稿**（除独立用户复核外全部达标）」需随本轮通过同步更新（该行不在复核者可写范围内）。
7. 第 1 轮遗留的重复证据帧：`shots/demo-review-inv3-track-clamped.png` 与 `demo-review-inv2-mid.png` 字节相同（md5 `49b32814…`），`shots/demo-review-inv5-reset.png` 与 `demo-before.png` 相同（md5 `262b90e7…`）——即第 1 轮表里 inv2/inv3 两项的「独立实拍」实际是同一张图。该轮记录已作废，此处仅提示后续不要把同一帧当作两个 case 的证据。
8. 原站标签窗有竖向渐隐遮罩（`mask-image: linear-gradient(transparent 0%, #000 32%, #000 68%, transparent 100%)`），demo 的标签窗只有 `overflow:hidden`、无边缘渐隐——属可选视觉细节，不在不变量内。

**降级与移除检验（本轮复核者独立执行，不改任何源码文件）**
- **移除检验**（运行时改参数或临时隐藏元素）：把实例 `opts.markScaleMax` 置 1 后滚到 850px，记号恒 49px，首屏退化成静态小徽记（`shots/demo-r2-removal-noscale.png`）→ h1 的辨识度确实几乎全压在「记号放大」上，排序判断成立。把幕布元素临时 `display:none` 后滚到 880px，换幕照旧发生但画面变成「封面直接消失」，失去收束感（`shots/demo-r2-removal-noveil.png`）→ 幕布是换幕的可见收束信号而非装饰。把 `opts.tickerSpeed` 置 0 后 1.2s 内轨位移为 0 → 标签带的持续动势确实由该自走参数提供（`shots/demo-r2-inv3-selfrun-*.png` 为有速度时的对照）。（另注：把 `veilOnset` 设为 ≥1 时 `(p−veilOnset)/(1−veilOnset)` 的分母变号，幕布会恒为不透明——复用调参时需注意取值域。）
- **reduced-motion**：`prefers-reduced-motion: reduce` 下 `html.orve-reduced` 生效、实例数 0、封面 `position:relative` 正常滚走不消费、记号 `transform:none`（桌面恒 49px、窄屏 28px）、幕布 `display:none`、提示小点 `animation:none`、内联 SVG 与全部文案仍在（`shots/demo-r2-reduced-motion.png`）。
- **无 JS**：禁用脚本执行后 `window.OrveCover` 不存在、封面 `position:relative`、内联 SVG 记号与文案（ORVE / ATELIER DE TYPOGRAPHIE ET DE MOUVEMENT / 8 行标签）仍可见、滚到 600px 时封面按普通区块滚走（不消费、幕布 0）（`shots/demo-r2-nojs.png`）。
- **窄屏 390×844**：单列居中（cx=195）、无横向溢出、记号 28→861.6px、提示淡出、换幕后 docH 1789→945、复位可恢复，与桌面同一套关系（`shots/demo-r2-narrow-*.png`）。
- 隐藏标签页/离屏暂停只验证了代码路径，见下方未验证项。

**未验证项与覆盖缺口（如实标注）**
- **真实隐藏标签页**：本环境无法把标签页真正置为 hidden（`setFocusEmulationEnabled(false)` 后 `document.hidden` 仍为 false），因此只用「临时把 `document.hidden` 定义为 true 并派发 `visibilitychange`」验证了代码路径（自走循环停帧 `loopFrame=0`、回前台恢复 12.9px/s 并补一次映射），**真实离屏/隐藏暂停未实测**。
- 真实触控/惯性滚动、低端设备帧率、无障碍对比度、原站是否做 reduced-motion 降级仍未测；原站自走速率只在 1440×900 做长采样，未在窄屏复测。
- 原站 `documentElement.scrollHeight` 在不同加载间会波动（本轮测到 32000 / 31100 / 15035；换幕前那次为 32000，与 `ev3` 的 32000→30200 一致）。
- 本轮另写的原站对照帧在 `shots/private/reviewer-r2-original-{cover,mid,mark-heavy,veil,after}-1440.png` 与 `reviewer-r2-original-narrow.png`（git 忽略、不公开）：原站证据按库约定只能放 `private/`，故文件名未以 `demo` 开头（它们不是 demo 实拍）；本轮新增的 demo 复核帧为 `shots/demo-r2-*.png`（可公开）。
- 本轮只复核 `2026-10-11-scroll-cover-swap` 这一条目；未改动 `demo/`、`src/`、`PROMPT.md`、`scripts/`、`templates/`，只写 `SPEC.json` 的 `verification`（user_review + rendered_ok）、本节 README 与自己的截图。

### 第 1 轮记录（已作废，保留以示证伪与修订过程）

> **状态：第 1 轮未通过 → 已修订 → 待第 2 轮复核。** 第 1 轮由未参与实现的独立子代理执行，判 inv3 fail：
> 原站纵向列表在零输入、`scrollY` 恒 0 下仍以约 12.85px/s 连续自走，是自走跑马灯，初稿的「滚动擦洗 + 末行夹紧」读数被证伪。
> 据此已重写 `inv3` 与 `evidence.ev2`、把 `src/cover.js` 的轨道改为常驻 rAF 自走循环（`tickerSpeed: 12.9`），
> 并重置 `verification.user_review`。下表为第 1 轮原始记录（**已作废，不再代表当前实现**，保留以示证伪与修订过程）；
> 复核 #1 的实拍 `shots/demo-review-*.png` 同样属于旧版实现。

复核者：**Hermes 独立复核子代理（未参与本条实现）** ｜ 复核时间：2026-10-11（CST）｜ 方式：直接以 `file://` 打开 `demo/index.html`（不入库、不经画廊）。

复核环境记录（环境问题与设计结论分开）：
- 无头标签页里 rAF 被冻结（`document.hidden=true`、`document.timeline.currentTime` 恒 0、`requestAnimationFrame` 不回调），工作区须先用 CDP `Emulation.setFocusEmulationEnabled` + `Page.bringToFront` 把标签页转前台，否则本条的滚动映射（依赖 rAF 节流）完全不更新——这是环境缺口，不是 demo 缺陷。
- CDP `Input.dispatchMouseEvent(mouseWheel)` 与 `Input.synthesizeScrollGesture` 在本环境不产生滚动（前者 IPC 超时、后者 no-op），故改用 `window.scrollTo` 真实驱动同一条 scroll→rAF 链路；「真实滚轮」这一项的覆盖存在缺口，在此如实标注。
- 原站对照由复核者自行首访（清 `localStorage.ownitt_intro_seen`）取样，未把实现者的 `shots/private/` 当作唯一依据。

| invariant_id | 实际动作 | 用户所见（实测） | 视口 | pass / fail / unverified | 复核实拍 |
| --- | --- | --- | --- | --- | --- |
| inv1 | 直开 demo 读首屏纵列几何 + 三色 + 中心命中顺序；对照原站首访封面 | 单一居中纵列（字标/mark/说明行/标签窗/提示 cx 全 = 712.5）；纸 rgb(241,237,226)、墨 rgb(11,11,12)、幕 rgb(10,10,11)；命中 字标→mark→说明行/标签窗→提示→幕布。原站同构（纸 rgb(244,241,234)） | 1440x900（+390x844） | **pass** | `shots/demo-review-inv1-before.png`、`demo-review-narrow-inv1-before.png` |
| inv2 | 逐档 0→899 读 mark 宽度与中心坐标；对照原站逐档 | markW 49→1513.7（≈31×）连续单调；中心恒 (712.5,364.7) 不漂移。原站 49→1528@600→5369@880，中心恒 (715,450)。附注：原站另叠加约 170° 自转，demo 只放大（不在不变量内） | 1440x900（+390x844） | **pass** | `shots/demo-review-inv2-mid.png`、`demo-review-inv2-mark-mostly-full.png` |
| inv3 | demo：滚动读轨位移 + 固定 scrollY 连续采样；原站：不动任何输入、scrollY 恒 0 连续采样 4s | demo 侧确为滚动映射：轨 0→−176 后夹紧（窄屏 0→−132），固定 scrollY 下采样不变、非自走循环。**但原站 citiesTrack 在 scrollY 恒为 0 时仍以约 12px/s 连续自走（−39.1→−87.3/4s），是自走跑马灯，未见「577→999 后夹紧」** | 1440x900（+390x844） | **fail** | `shots/demo-review-inv3-track-clamped.png` |
| inv4 | 前段逐档读提示 opacity；对照原站 scrollHint 父级 | demo 提示 1→0.608@120→0.216@240→0@306–360（淡出 0–306px = 一屏 34%，前三分之一内）。原站 1→0.526@100→0@200（约前 22%） | 1440x900 | **pass** | `shots/demo-review-inv4-hint-fading.png` |
| inv5 | 滚满一屏触发消费后读状态；上滚 + 手动 scroll 事件验不复活；点复位；对照原站滚过一屏 | demo：cover→display:none（移出文档流），docH 1908→1008，scrollY 同帧回 0，幕布 opacity→1；上滚/手动事件下不复活；复位可恢复。原站约 900px 处封面移出 DOM、docH 32000→30200、scrollY 回 0 | 1440x900 | **pass** | `shots/demo-review-inv5-after.png`、`demo-review-inv5-reset.png` |

**第 1 轮结论：inv1 / inv2 / inv4 / inv5 实测 pass，inv3 fail。** 因存在 fail，`verification.user_review.passed` 与 `rendered_ok` 保持 **false**，本轮不申请入库（已作废，见本节开头的修订说明）。

inv3 fail 的依据（同视口、同片段、同关键状态对照）：原站纵向列表（`AsteriskHero-module__…__citiesTrack`）在 `scrollY` 恒为 0、无任何滚动输入时仍以约 12px/s 连续移动，说明它是**自走跑马灯**而非「滚动擦洗 + 末行夹紧」；SPEC 的 `inv3` 与 `evidence.ev2`（「轨顶 577→999 后在末行夹紧」）把持续自走误读为滚动映射，此声明不可复现。demo 自身「滚动映射 + 夹紧 + 不自走」的行为实现无误，但它保留的是一个**原作并不存在的关系**——对照（§五.2 要求）不通过。修订方向：要么把原站的真实关系（自走循环，可带轻微滚动偏移）作为不变量重写并重新取证，要么明确声明这是刻意的设计取舍并降级 inv3 的措辞。

额外降级与移除检验（复核者独立执行）：
- **移除检验**：运行时把实例 `opts.markScaleMax` 置 1（不改源码文件）后滚到 850——mark 恒为 49px，首屏退化为静态小徽记，识别度明显下降。证实 h1 的身份几乎全压在「记号放大」上，排序判断成立。实拍 `shots/demo-review-removal-noscale.png`。
- **reduced-motion**：`prefers-reduced-motion: reduce` 下 `html.orve-reduced`、实例数 0、mark 恒 49px 不消费、提示小点动画 `none`——静态封面 + 正常滚走。实拍 `shots/demo-review-reduced-motion.png`。
- **无 JS**：脚本禁用后封面 `position: relative`（不 sticky/不 is-live）、文案与内联 SVG 记号仍在、正常滚走不消费。实拍 `shots/demo-review-nojs.png`。
- **窄屏 390×844**：单列居中（cx=195）、无横向溢出（0）、轨 0→−132 夹紧、mark 28→283.8、提示淡出——与桌面同一套关系。实拍 `shots/demo-review-narrow-*.png`。
- **console 错误**：复核者独立复测完整交互链接（0→1000 滚动 + 复位）后 `console.error` 计数为 **0**。

诚实性检查（复核者）：
- 未发现「关键帧原文复刻」等无证据宣称（README/SPEC 明确声明不复制关键帧文本）。
- `shots/demo*.png`（实现者）经查看确为 demo（ORVE）实拍，未拿原站图片顶替；原站证据均在 `shots/private/`、`publishable: false`，`.gitignore` 含 `/entries/*/shots/private/`。
- `entrypoints`/`files` 所列文件（`demo/index.html`、`src/cover.js`、`src/cover.css`、`src/fonts.css`、两个 `PlayfairDisplay*.ttf`、`OFL.txt`、`README.md`、`SPEC.json`）全部存在；`src/fonts/OFL.txt` 为 Playfair Display 的 SIL OFL 1.1 许可原文（含 Reserved Font Name）。
- `tokens.colors.paper = #F4F1EA`、`ink = #0A0A0B`、`coverHeight = 900` 与复核者对原站的首访实测一致（rgb(244,241,234) / rgb(10,10,11) / 900px），非编造。
- 复核者自行访问原站产生的对照帧已放入 `shots/private/`（`reviewer-original-*.png`，非公开），未混入公开 demo 实拍。

未验证项与具体阻塞：inv3 的对照不通过是本轮唯一阻塞；原站真实滚动间距/自走速率仅在 1440×900 单视口做了长采样，未在窄屏重复测量自走速率。低端设备帧率、无障碍对比度、原站是否做 reduced-motion 降级仍未测。原站证据（`shots/private/`）未取得再发布许可，`publishable: false`。

## 独立实现声明

依据行为与测量独立实现，不搬运原站代码、关键帧文本、图片、字体文件、视频或品牌文案；素材替换保留设计角色（径向记号、字标层级、衬线性格、纵向列表的窗口与自走循环、纸/墨/幕对比）。本声明不自动构成法律上的 clean-room 认证。
