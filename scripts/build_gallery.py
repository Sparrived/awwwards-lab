#!/usr/bin/env python3
"""build_gallery.py — 扫描 entries/*/SPEC.json，生成 index.json 与 gallery/index.html。

契约：这两个文件只由本脚本生成，禁止手写/手改。
自检未通过（verification.rendered_ok != true）或结构缺项的条目不会进 index，
但会出现在 index.json 的 failed[] 与画廊底部的「未入库」区。

用法：
    python3 scripts/build_gallery.py            # 自动定位库根目录（脚本的上一级）
    python3 scripts/build_gallery.py --lib DIR
"""
from __future__ import annotations

import argparse
import datetime
import json
import pathlib
import sys

REQUIRED = ["id", "date", "category", "source", "summary",
            "extracted_mechanism", "tokens", "verification"]
SHOT_PRIORITY = ("hero", "preview", "main", "cover", "shot")
SHOT_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif")


def pick_shot(entry_dir: pathlib.Path) -> str | None:
    shots = entry_dir / "shots"
    if not shots.is_dir():
        return None
    files = [f for f in sorted(shots.iterdir())
             if f.is_file() and f.suffix.lower() in SHOT_EXT]
    if not files:
        return None
    for key in SHOT_PRIORITY:
        for f in files:
            if key in f.stem.lower():
                return f.name
    return files[0].name


def load_entries(lib: pathlib.Path) -> tuple[list[dict], list[dict]]:
    entries: list[dict] = []
    failed: list[dict] = []
    edir = lib / "entries"
    if not edir.is_dir():
        return entries, failed

    for d in sorted(edir.iterdir()):
        if not d.is_dir() or d.name.startswith("."):
            continue
        spec_f = d / "SPEC.json"
        if not spec_f.is_file():
            failed.append({"dir": d.name, "reason": "缺少 SPEC.json"})
            continue
        try:
            spec = json.loads(spec_f.read_text(encoding="utf-8"))
        except Exception as e:  # noqa: BLE001
            failed.append({"dir": d.name, "reason": f"SPEC.json 解析失败: {e}"})
            continue

        missing = [k for k in REQUIRED if not spec.get(k)]
        if missing:
            failed.append({"dir": d.name, "reason": "SPEC.json 缺字段: " + ", ".join(missing)})
            continue

        ver = spec.get("verification") or {}
        if ver.get("rendered_ok") is not True:
            reason = ver.get("note") or ver.get("failure_reason") or "rendered_ok != true（自检未通过）"
            failed.append({"dir": d.name, "reason": f"未通过自检: {reason}"})
            continue

        demo = d / "demo" / "index.html"
        if not demo.is_file():
            failed.append({"dir": d.name, "reason": "缺少 demo/index.html"})
            continue

        shot = pick_shot(d)
        rel = f"entries/{d.name}"
        entries.append({
            "id": spec["id"],
            "date": spec["date"],
            "category": spec.get("category", ""),
            "title": (spec.get("source") or {}).get("title", spec["id"]),
            "author": (spec.get("source") or {}).get("author", ""),
            "tags": (spec.get("source") or {}).get("tags", []) or [],
            "dir": rel,
            "demo": f"../{rel}/demo/index.html",
            "readme": f"../{rel}/README.md",
            "source_url": (spec.get("source") or {}).get("live_url", ""),
            "awwwards_url": (spec.get("source") or {}).get("awwwards_url", ""),
            "shot": f"../{rel}/shots/{shot}" if shot else None,
            "summary": spec["summary"],
            "extracted_mechanism": spec["extracted_mechanism"],
            "tokens": spec["tokens"],
            "api": spec.get("api", ""),
            "entrypoints": spec.get("entrypoints", []) or [],
            "files": spec.get("files", []) or [],
            "deps": spec.get("deps", []) or [],
            "reuse_hints": spec.get("reuse_hints", ""),
            "variant_of": spec.get("variant_of"),
            "verification": ver,
        })

    entries.sort(key=lambda e: (str(e["date"]), str(e["id"])), reverse=True)
    return entries, failed


def build(lib: pathlib.Path) -> int:
    entries, failed = load_entries(lib)
    now = datetime.datetime.now().astimezone().replace(microsecond=0).isoformat()

    index = {
        "generated_at": now,
        "generator": "scripts/build_gallery.py",
        "count": len(entries),
        "entries": entries,
        "failed": failed,
    }
    (lib / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    shell_f = lib / "templates" / "gallery_shell.html"
    if not shell_f.is_file():
        print(f"ERROR: 缺少 {shell_f}", file=sys.stderr)
        return 1
    shell = shell_f.read_text(encoding="utf-8")
    payload = json.dumps({"generated_at": now, "entries": entries, "failed": failed},
                         ensure_ascii=False)
    # 防止 JSON 里的 </script> 提前闭合脚本标签
    payload = payload.replace("</", "<\\/")
    out = (shell.replace("__DATA__", payload)
                .replace("__COUNT__", str(len(entries)))
                .replace("__GENERATED__", now))
    gdir = lib / "gallery"
    gdir.mkdir(parents=True, exist_ok=True)
    (gdir / "index.html").write_text(out, encoding="utf-8")

    print(f"index.json        条目 {len(entries)}  未入库 {len(failed)}")
    print(f"gallery/index.html 已重建 @ {now}")
    for f in failed:
        print(f"  ! 未入库 {f['dir']}: {f['reason']}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lib", default=None, help="库根目录，默认取本脚本的上一级")
    args = ap.parse_args()
    lib = pathlib.Path(args.lib).resolve() if args.lib else \
        pathlib.Path(__file__).resolve().parent.parent
    if not lib.is_dir():
        print(f"ERROR: 库目录不存在 {lib}", file=sys.stderr)
        return 1
    return build(lib)


if __name__ == "__main__":
    raise SystemExit(main())
