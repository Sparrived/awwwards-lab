# Awwwards Lab

每天从 [awwwards.com](https://www.awwwards.com/) 挑选 2 个优秀设计（跨 2 个不同类别），
**清洁室复刻**为可复用的前端能力，沉淀进本库。

- 人看效果：开 `gallery/index.html`（或 GitHub Pages）
- Agent 复用：读 `index.json`，按 `extracted_mechanism` / `tokens` / `tags` 检索

在线画廊：https://sparrived.github.io/awwwards-lab/

## 结构

```
├── index.json            机器可读总清单（由脚本生成）
├── gallery/index.html    人类浏览画廊（由脚本生成）
├── seen.json             已处理条目，用于去重
├── PROMPT.md             每日任务提示词（冻结版）
├── scripts/
│   ├── build_gallery.py  重建 index.json + gallery/index.html
│   └── new_entry.py      从模板脚手架一条新条目
├── templates/
│   ├── entry/            单条条目模板（SPEC.json / README / demo / src）
│   └── gallery_shell.html  画廊页外壳
└── entries/<日期>-<slug>/
```

## 给 Agent 用

```bash
# 检索：找"磁吸光标"类机制
python3 -c "import json;d=json.load(open('index.json'));\
print('\n'.join(f\"{e['id']}\t{e['extracted_mechanism']}\" for e in d['entries']))"

# 取一条的 token 与调用方式
python3 -c "import json;d=json.load(open('index.json'));\
e=[x for x in d['entries'] if x['id']=='<id>'][0];print(json.dumps(e['tokens'],ensure_ascii=False,indent=2));print(e['api'])"
```

`SPEC.json` 的 `tokens` 是设计值的唯一真源（真实测量得来），`api` 说明怎么调用，
`reuse_hints` 说明什么场景该用 / 别用。`deps` 为空表示零依赖。

## 日常维护

```bash
python3 scripts/new_entry.py "slug" --category motion   # 建条目骨架
# （取证、写 demo、填 SPEC.json）
python3 scripts/build_gallery.py                        # 重建索引与画廊
git add -A && git commit -m "entry: <id>" && git push
```

**`index.json` 与 `gallery/index.html` 禁止手改** —— 它们由 `build_gallery.py` 覆盖生成。
自检未通过（`verification.rendered_ok != true`）的条目不会进索引，会列在画廊底部「未入库」区。

## 类别

`motion` · `typography` · `commerce` · `portfolio` · `navigation` · `webgl` · `theme`
（按星期轮换，保证多样性）

## 清洁室原则

不复制原站的代码、图片、字体、视频或品牌文案；图片以 CSS 渐变或生成 SVG 占位；
商用字体一律换成免费替代并在条目 README 注明。

## 环境依赖（本机 WSL）

- **无头 Chromium 需要 3 个缺失的系统库**。本机 Ubuntu 26.04 未装 `libnspr4` / `libnss3` /
  `libasound2` 且 sudo 需密码，已用免 root 方式修复：
  `apt-get download` 三个 deb → `dpkg-deb -x` 解到
  `~/.hermes/tools/chromium-libs/lib/` → `patchelf --force-rpath` 给 chrome 及其
  NSS 库写 RPATH（必须用 **DT_RPATH**，`DT_RUNPATH` 不沿依赖链传递，
  `libnspr4.so` 会找不到 `libplc4.so`）。
  若 `hermes tools` 重装 Chromium 导致再次报 `libnspr4.so: cannot open shared object file`，
  重跑上述 patchelf 步骤即可（库文件已在 `chromium-libs/lib/` 持久保留）。
  更省事的替代：有 sudo 时直接 `sudo apt-get install -y libnss3 libnspr4 libasound2t64`。
- **awwwards 拒绝无头浏览器**：列表与详情页用 `curl` / `web_extract`（curl 默认 UA → 200，
  Chrome UA → 403）。浏览器只用于对获奖**原站**取证。

