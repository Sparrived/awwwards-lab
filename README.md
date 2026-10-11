# Awwwards Lab

每天从 [Awwwards](https://www.awwwards.com/) 发现优秀设计，先理解其亮点与设计关系，再独立实现一个**最小完整体验片段**。

每日目标 2 个不同来源、优先跨发现类别；质量不足可少收或零收。类别是搜索入口，不是作品的标准答案。

- 人看效果：[本地画廊](<gallery/index.html>) / [在线画廊](https://sparrived.github.io/awwwards-lab/)。封面默认展示 demo 实拍，不用原站截图掩盖复现落差。
- Agent 检索：[总索引](<index.json>) 保留亮点、片段、不变量、完整证据、来源访问记录和分项验收；[任务提示词](<PROMPT.md>) 是每日执行契约。

## 结构

```text
├── PROMPT.md                  每日任务 V1：先体验、排序、实现，再独立复核
├── index.json                 生成的机器索引（禁止手改）
├── gallery/index.html         生成的画廊（禁止手改）
├── seen.json                  候选与决策，用于去重
├── scripts/
│   ├── new_entry.py            从模板创建 v2 草稿
│   └── build_gallery.py        校验规格并生成索引/画廊
├── templates/
│   ├── entry/                 与 Prompt 同步的 v2 规格与报告骨架
│   └── gallery_shell.html     画廊外壳
└── entries/<日期>-<slug>/
    ├── README.md              判断、范围、证据、API、边界和复核
    ├── SPEC.json              唯一原始规格（schema_version: 2）
    ├── demo/index.html        零构建，file:// 可打开
    ├── src/                   独立实现及原创/合法替代素材
    └── shots/                 demo 实拍与允许公开的证据
        └── private/           不公开的证据，Git 忽略
```

## 给 Agent 用

```python
import json
from pathlib import Path
index = json.loads(Path('index.json').read_text(encoding='utf-8'))
for entry in index['entries']:
    print(entry['id'], entry['verification_tier'], entry['extracted_mechanism'])
    print(entry['highlights'], entry['selected_fragment'])
    # evidence_ids 在同一 entry 的 evidence 数组中解析。
```

[条目规格模板](<templates/entry/SPEC.json>) 使用 `schema_version: 2`。字段职责：

- `highlights`：有证据的亮点排序，包含 `id/rank/name/why_it_matters/dependencies/evidence_ids`。
- `selected_fragment`：选中的亮点、范围、理由、不变量、遗漏和素材替代。
- `invariants`：每项为 `{id, description}`，通常 3–5 个与片段有关的关系，不以参数数量充数。
- `evidence`：每项有 `id/claim/status/method/route/target/action/viewport/artifacts/publishable`；观察、源码支持、推断与未知分别记录。
- `motion_catalog`：只记录有依据的行为；静态作品用 `[]`。滚动/物理机制不强填时长或 easing。
- `tokens`：与片段有关的已测参数，保留 colors/typography/spacing/motion 四个子对象。
- `api/entrypoints/reuse_hints`：怎么调用、怎么迁移、依赖哪些素材/输入/场景。
- `verification`：开发检查和独立操作记录；结构校验不自动证明记录真实。

## 版本化入库门槛

| 规格 | 门槛 | 画廊标记 |
| --- | --- | --- |
| 未声明版本或 v1 | 保留历史 rendered_ok 自报及 demo 存在检查 | 旧版自检 · 未按 v2 复核 |
| v2 | 亮点/范围/证据/不变量完整、实拍存在、分项通过、独立操作覆盖全部不变量 | v2 复核记录通过 |

新条目必须用 v2。含新字段而不声明版本会被拒绝；不能删版本回退旧门槛。历史条目不自动补造新验收，只有实际重做后才迁移。

v2 需要 `rendered_ok/source_observed/mechanism_preserved/user_review.passed` 都严格为布尔 true，控制台结果为整数 0，有验收时间、复核者、demo 实拍和可追溯引用。每个独立操作 case 包含：

```json
{
  "invariant_id": "inv1", "action": "实际操作",
  "observation": "用户看见的结果", "viewport": "1440x900",
  "result": "pass", "artifacts": ["shots/demo-mid.png"]
}
```

`fail` 或 `unverified` 不能入库。生成器核查字段、引用和文件存在，不能替代真实浏览、判断画面是否保真或认证复核独立性；禁止伪造通过记录。

## 日常流程

```bash
python3 scripts/new_entry.py "slug" --category motion
# 先按 PROMPT 分析亮点、选定完整片段，再实现。
# 未参与实现的子代理直接打开草稿 demo，模拟用户操作并对照证据。
# 所有分项通过后填写 verification；不要先入库再倒填通过记录。
python3 scripts/build_gallery.py
# 最后从画廊打开条目、检查筛选/证据/预览；失败则回退并重建。
git diff --check
git diff
# 只暂存本次变更；按模块使用 Conventional Commits，类型/作用域外用中文。
# 示例：feat(entry): 萃取叠层海报的滚动换幕片段
# 提交、推送按项目授权进行；不假称本地构建已更新远程 Pages。
```

未通过条目保留在索引 `failed` 与画廊底部，提供草稿 demo/规格/报告入口便于复核，但不会计为入库。生成器重复运行内容不变时沿用时间戳。

## 独立实现与证据发布

不搬运原站代码、关键帧文本、图片、字体文件、视频或品牌文案。用原创主体、新摄影、原创 SVG 或有明确许可的素材替代；保留轮廓、尺度、层级、字体性格及行为关系，不能用任意占位图宣称萃取成功。本项目的独立实现约束不自动构成法律 clean-room 认证。

原站截图不进入 demo 或默认海报；未经确认可再发布条件的原站证据放 `shots/private/` 并设 `publishable: false`，不会生成公开证据链接。署名不是授权。确可公开的证据设 true 并在报告写明依据；发布前检查 staged diff，历史已跟踪图片不因新增忽略规则自动变为私有。

## 环境说明

列表与详情优先用 HTTP/网页提取；浏览器用于获奖原站和 demo 实际体验。Awwwards 可能对无头浏览器返回 403，不能把历史观察当成永久规则。Canvas 2D、WebGL、CSS、GSAP 等按真实机制区分。

本机 WSL 历史上曾需补 `libnspr4/libnss3/libasound2` 与中文字体；有环境故障先诊断当前环境，再按批准策略修复，不将旧处方当作所有执行器的前置步骤。浏览器或子代理不可用只能部分复核并保留草稿，不以源码审阅冒充真实操作。
