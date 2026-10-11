#!/usr/bin/env python3
"""new_entry.py — 从 templates/entry 脚手架生成一条新条目，保证目录与 schema 一致。

用法：
    python3 scripts/new_entry.py "studio-naam" --category motion --title "Studio Naam"
    python3 scripts/new_entry.py "kinetic-type" --category typography --date 2026-10-12

只创建目录与占位文件，不填内容。生成后必须：
    1) 去真实站点取证（截图 / getComputedStyle / getAnimations）
    2) 写好 SPEC.json 与 README.md、demo/
    3) python3 scripts/build_gallery.py
"""
from __future__ import annotations

import argparse
import datetime
import json
import pathlib
import re
import shutil
import sys

CATEGORIES = ["motion", "typography", "commerce", "portfolio",
              "navigation", "webgl", "theme"]


def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "-", s)
    return re.sub(r"-{2,}", "-", s).strip("-")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--category", required=True, choices=CATEGORIES)
    ap.add_argument("--title", default="")
    ap.add_argument("--date", default=datetime.date.today().isoformat())
    ap.add_argument("--lib", default=None)
    args = ap.parse_args()

    lib = pathlib.Path(args.lib).resolve() if args.lib else \
        pathlib.Path(__file__).resolve().parent.parent
    tmpl = lib / "templates" / "entry"
    if not tmpl.is_dir():
        print(f"ERROR: 缺少模板目录 {tmpl}", file=sys.stderr)
        return 1

    slug = slugify(args.slug)
    if not slug:
        print("ERROR: slug 不合法", file=sys.stderr)
        return 1
    eid = f"{args.date}-{slug}"
    dest = lib / "entries" / eid
    if dest.exists():
        print(f"ERROR: 已存在 {dest}", file=sys.stderr)
        return 1

    shutil.copytree(tmpl, dest)
    spec_f = dest / "SPEC.json"
    spec = json.loads(spec_f.read_text(encoding="utf-8"))
    spec["id"] = eid
    spec["date"] = args.date
    spec["category"] = args.category
    spec["source"]["title"] = args.title or slug
    spec_f.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n",
                      encoding="utf-8")

    print(f"已创建 {dest}")
    for p in sorted(dest.rglob("*")):
        print("   ", p.relative_to(dest))
    print("\n下一步：取证 → 填 SPEC.json / README.md / demo → python3 scripts/build_gallery.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
