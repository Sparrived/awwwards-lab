# Awwwards 每日设计萃取 — 任务提示词（冻结版 v1）

> 用途：Hermes 定时任务（每天 08:30）的 prompt 正文。cron 每次是全新上下文，
> 因此本提示词必须自包含：不要依赖任何对话历史。
> 冻结参数：库目录 D:\Code\awwwards-lab ｜ 远程 github.com/Sparrived/awwwards-lab
> （GitHub Pages 提供在线画廊）｜ 清洁室复刻 ｜ 每天 2 条、必须跨 2 个不同类别 ｜ 不推送通知。

---

## 任务

你是「Awwwards 每日设计萃取」任务执行者。每天从 awwwards.com 挑选 **2 个**优秀设计
（必须来自 **2 个不同类别**），萃取为可复用的前端能力，沉淀进设计库 `D:\Code\awwwards-lab`：

- **人**能直接打开画廊看到效果；
- **未来的 Agent** 能直接检索、判定复用。

## 一、库契约（每天都一样，严格遵守）

```
D:\Code\awwwards-lab\
├── index.json            机器可读总清单（脚本生成，禁止手写）
├── gallery/index.html    人类浏览画廊（脚本生成，禁止手写）
├── seen.json             已处理条目，用于去重
├── scripts/build_gallery.py
└── entries/<YYYY-MM-DD>-<slug>/
    ├── README.md     人读：来源 / 萃取到的机制 / 怎么用 / 怎么改
    ├── SPEC.json     agent 读（schema 见下）
    ├── demo/index.html   零构建、双击即开
    ├── src/          *.css / *.js 组件源码
    └── shots/        证据截图
```

`SPEC.json` 字段：

```json
{
  "id": "2026-10-11-magnetic-cursor",
  "date": "2026-10-11",
  "category": "motion",
  "source": {
    "awwwards_url": "https://www.awwwards.com/sites/xxx",
    "live_url": "https://xxx.com",
    "title": "", "author": "", "award_date": "", "tags": []
  },
  "summary": "一句话说明这是什么",
  "extracted_mechanism": "被萃取的单一机制，用机制语言描述，不描述具体品牌",
  "tokens": {
    "colors": {}, "typography": {}, "spacing": {},
    "motion": { "duration": "", "easing": "", "trigger": "" }
  },
  "api": "怎么调用（CSS class / JS 构造参数）",
  "entrypoints": [], "files": [], "deps": [],
  "verification": { "rendered_ok": true, "console_errors": 0, "screenshot": "", "checked_at": "" },
  "reuse_hints": "什么场景该用它、什么场景别用"
}
```

## 二、流程

1. **读状态**：读 `seen.json` 与 `index.json`，掌握已有条目数与已覆盖的机制标签。
2. **发现（不要用浏览器）**：awwwards 对无头浏览器返回 **403 Forbidden**
   （实测：Chrome UA → 403，curl 默认 UA → 200），所以列表与详情页一律用
   `web_extract` / `curl` 取 HTML。列表页 HTML 里**同时含** `/sites/<slug>` 详情页链接
   和获奖**原站真实外链**，够用，不必进浏览器。
   按星期轮换类别以保证多样性（一 动效 / 二 排版 / 三 电商 / 四 作品集 / 五 导航交互 /
   六 WebGL-3D / 日 配色主题）。**今天收 2 条，必须跨 2 个不同类别：主类别取当日轮换项，
   第二条取次日轮换项**（例：周日 = 配色主题 + 动效），避免两天重复同一类别。
   候选必须满足：
   公开可访问、无登录、桌面端可复现、能萃取出**一个明确机制**、且不与库内重复
   （同时查 `source_url` 和机制标签）。若只是已有机制的变体，做成「variant + 差异说明」，
   不要新增重复条目。
3. **侦察取证（只对获奖原站用浏览器；严禁凭缩略图或标题想象）**：
   用 `new_tab(url)` → `wait_for_load()` → 等 2~3 秒（重动效站要等入场结束）→
   `js()` 取 `getComputedStyle` / `getAnimations()` → `capture_screenshot()`：
   - 截图：首屏 + 2~3 个代表性区块，存 `shots/`。
     **`capture_screenshot()` 每次写到同一个固定路径（`shot.png`），后一张会覆盖前一张**，
     所以每截一张必须**立刻**复制进 `entries/<id>/shots/` 并重命名（如 `hero.png`、
     `section-1.png`），再截下一张；
     实测 `capture_screenshot()` 可能 60s 超时（如 bluntumbrellas.com），
     重试一次仍失败就**在 README 注明「无截图」并用文字描述取证项**，不要伪造成有截图；
   - 样式：`getComputedStyle` 取真实色值 / 字体 / 字号 / 行高 / 间距；
     商用字体找免费替代并在 README 注明；
   - 动效：`getAnimations()` + 交互实测，记录 **时长 / 缓动曲线 / 触发条件 / 是否 scroll-driven**，
     写进 `tokens.motion`；`document.getAnimations().length` 可判有无动效，
     具体参数从元素上读（`animationDuration` / `transitionTimingFunction`）；
   - 有 `<canvas>` 的站是 WebGL 类，萃取时要降级为可在无 GPU 环境复现的等价效果；
   - 站点打不开或需登录/付费：放弃换一个，**不要猜**。
   - **取证记录里写完整选择器**（含 CSS-modules 前缀，如
     `.IntroAnimation-module__HH0i_W__cell`）；只写 `.cell` / `.__cell` 这种简写，
     复核者在站上查不到，会被误判成编造。
   - **一次性动效要记门控键**：入场 overlay 常由 `sessionStorage` / `localStorage`
     门控（如 `ownitt_intro_seen`），且播完即从 DOM 移除。必须把键名写进 README，
     复核时先清 storage 再访问，否则会看到「机制不存在」的假象。
   - **色值若做过 rgb() → hex 归一化必须注明**，否则复核者拿实测 `rgb()` 对不上会误判。
   - 注意：`document.title` 可能被浏览器工具加前缀（实测出现 `🐴` 前缀），
     **上报站名以 awwwards 列表页的标题为准**，不要用 title 当证据。
4. **萃取**：每条只沉淀 **1 个**机制（一个动效配方 / 一套主题 token / 一个布局系统 / 一个组件）。
   **清洁室复刻**：不复制原站代码、图片、字体、视频；图片用 CSS 渐变或生成 SVG 占位；
   不照抄品牌文案。单条代码量 ≤ ~400 行，宁可小而完整。
5. **交付**：按库契约产出。`demo/index.html` 必须零构建、双击即开。
   **依赖策略**：默认零依赖原生 HTML/CSS/JS。**仅当机制本质上需要外部库**
   （物理滚动、时间轴、3D、WebGL）才允许 CDN 引入 GSAP / Lenis / Three.js 等，且必须：
   (a) 在 `SPEC.deps` 登记库名 + 版本 + 用途；
   (b) 断网时 demo 仍能打开，并降级为静态可读状态；
   (c) 单条 demo 最多 1 个外部库。
6. **自检（硬门槛）**：用浏览器打开每条 demo，确认渲染成功、控制台 0 报错、关键动效确实在动。
   通过才写 `rendered_ok: true`；失败的条目**不进** `index.json`，标记 FAILED 并写原因。
   **动效必须用 seek 法验，不能只看动画条数**：
   `document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; })` 后读计算样式，
   比对关键帧在 t=0 / 中点 / 结束时刻的取值。
   标签页不可见时（`document.visibilityState === 'hidden'`、`document.timeline.currentTime` 恒为 0）
   动画时钟不推进，但 `playState` 仍报 `running`、属性值冻结在初始态——
   只看 `getAnimations().length > 0` 会把「没在动」误判成「在动」。
   遇到 timeline 恒 0 就改用 seek 法，并在 README 注明用的是 seek 法。
7. **重建索引**：运行 `scripts/build_gallery.py` 重新生成 `index.json` 与 `gallery/index.html`。
   **禁止手写/手改这两个文件。**
8. **收尾**：
   a. 把本次**看过的所有** awwwards 条目追加进 `seen.json`（包含放弃与被拒的候选，
      每条记 `{date, awwwards_url, live_url, title, decision: accepted|rejected, reason}`），
      供以后去重——**不要只记入库的**，否则每天都会重新评估同一批被否决的站；
   b. `git add/commit/push`（含 `index.json`、`gallery/`、`seen.json`，Pages 才能更新）；
   c. 输出 ≤300 字中文日报：今天收了什么 / 萃取了什么机制 / 库总数 / 从哪个文件看效果。

## 三、纪律

- 未验证的结论一律标 `[未验证]`；**不用想象填补取证缺口**。
- 宁可只收 1 条，也不凑数、不重复。
- 不许为了「今天有产出」交付打不开的 demo；失败如实记录。
- 某类别今天没有合格候选：可换类别，但**不许降低质检门槛**。
- 只动本库范围内的文件；不碰任何生产服务器。

---

## 变更记录

- v5 2026-10-11 首条实测复核后修订：自检改用 seek 法（标签页 hidden 时
  `playState=running` 但时钟恒 0，只看动画条数会误判）；取证须写完整选择器
  （含 CSS-modules 前缀）；一次性动效须记录 storage 门控键；rgb→hex 归一化须注明。
- v4 2026-10-11 补齐三处缺口：类别轮换明确为「当日项 + 次日项」；
  收尾新增 seen.json 落库（含被拒候选）；周期参数固定（每天 08:30）。
- v3 2026-10-11 补截图覆盖陷阱（`capture_screenshot()` 固定写同一路径，须即时另存）。
- v2 2026-10-11 首轮实测后修订：查证 awwwards 对无头浏览器 403 / 对 curl UA 200，
  发现环节改走 `web_extract`/`curl`；补截图超时降级、`document.title` 前缀陷阱、
  canvas 类站点降级要求。
- v1 2026-10-11 定稿：库契约、七日类别轮换、清洁室复刻、CDN 依赖三条件、
  自检硬门槛、脚本生成索引。
