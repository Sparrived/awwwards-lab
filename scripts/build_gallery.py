#!/usr/bin/env python3
"""扫描条目规格，生成索引和画廊；只做结构校验，不替代真实体验复核。

v2 条目须有亮点、完整片段、可追溯证据和独立操作记录。
历史条目保留旧门槛，但显式标为 legacy-self-report，不补造新验收。
运行：python3 scripts/build_gallery.py [--lib DIR]
"""
from __future__ import annotations

import argparse
import datetime
import json
import pathlib
import sys
from urllib.parse import quote, urlparse

REQUIRED = ["id", "date", "category", "source", "summary",
            "extracted_mechanism", "tokens", "verification"]
SHOT_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}
EVIDENCE_EXT = SHOT_EXT | {".mp4", ".webm"}
EVIDENCE_STATUS = {"observed", "source-supported", "inferred", "unknown"}


def text(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def http_url(value: object) -> bool:
    if not isinstance(value, str):
        return False
    try:
        parsed = urlparse(value)
        return parsed.scheme in {"http", "https"} and bool(parsed.netloc)
    except ValueError:
        return False


def local_file(entry: pathlib.Path, relative: object) -> pathlib.Path | None:
    """只接受条目内部的相对文件，拒绝绝对路径、越界和符号链接逃逸。"""
    if not text(relative) or any(c in relative for c in "\\:?#\x00"):
        return None
    path = pathlib.PurePosixPath(relative)
    if path.is_absolute() or ".." in path.parts:
        return None
    try:
        target = (entry / path).resolve()
        if not target.is_relative_to(entry.resolve()) or not target.is_file():
            return None
        return target
    except (OSError, ValueError):
        return None


def public_file(entry: pathlib.Path, relative: object) -> pathlib.Path | None:
    target = local_file(entry, relative)
    if not target:
        return None
    if "private" in pathlib.PurePosixPath(relative).parts or "private" in target.relative_to(entry.resolve()).parts:
        return None
    return target


def entry_url(directory: str, relative: str) -> str:
    return "../" + quote(f"entries/{directory}/{relative}", safe="/")


def demo_shot(entry: pathlib.Path, ver: dict) -> str | None:
    """封面只选 demo 实拍，不再用原站图片掩盖复现质量。"""
    candidate = ver.get("screenshot")
    target = public_file(entry, candidate)
    if target and target.suffix.lower() in SHOT_EXT and target.stem.startswith("demo"):
        return candidate
    shots = entry / "shots"
    if shots.is_dir():
        for f in sorted(shots.iterdir()):
            if f.stem.startswith("demo") and f.suffix.lower() in SHOT_EXT:
                relative = f.relative_to(entry).as_posix()
                if public_file(entry, relative):
                    return relative
    return None


def validate_v2(spec: dict, entry: pathlib.Path) -> list[str]:
    """机器只核对声明、引用与文件存在；不声称能自动判断设计保真。"""
    errors: list[str] = []
    ver = spec["verification"]
    source = spec["source"]
    for key in ("awwwards_url", "live_url"):
        if not http_url(source.get(key)):
            errors.append(f"source.{key} 须为 HTTP(S) 来源")
    for key in ("observed_at", "route"):
        if not text(source.get(key)):
            errors.append(f"缺少 source.{key}")
    for key in ("strength", "expression", "composition", "api", "reuse_hints"):
        if not text(spec.get(key)):
            errors.append(f"缺少 {key}")
    if any(not isinstance(spec["tokens"].get(k), dict)
           for k in ("colors", "typography", "spacing", "motion")):
        errors.append("tokens 须保留四个对象容器")

    evidence = spec.get("evidence")
    ev_by_id: dict[str, dict] = {}
    if not isinstance(evidence, list) or not evidence:
        errors.append("缺少 evidence 证据记录")
    else:
        for ev in evidence:
            if not isinstance(ev, dict) or not text(ev.get("id")):
                errors.append("证据须有 id")
                continue
            eid = ev["id"]
            if eid in ev_by_id:
                errors.append(f"证据 id 重复: {eid}")
            ev_by_id[eid] = ev
            if not isinstance(ev.get("status"), str) or ev["status"] not in EVIDENCE_STATUS:
                errors.append(f"证据 {eid} 状态无效")
            if not text(ev.get("claim")) or not text(ev.get("method")):
                errors.append(f"证据 {eid} 缺少结论或方法")
            artifacts = ev.get("artifacts", [])
            if not isinstance(artifacts, list):
                errors.append(f"证据 {eid} artifacts 须为数组")
                continue
            for artifact in artifacts:
                if not local_file(entry, artifact):
                    errors.append(f"证据 {eid} 文件不存在或越界: {artifact}")
                elif ev.get("publishable") is True and not public_file(entry, artifact):
                    errors.append(f"证据 {eid} 私有文件不能声明为公开")
            if ev.get("status") == "observed":
                if not all(text(ev.get(k)) for k in ("route", "target", "action", "viewport")):
                    errors.append(f"观察证据 {eid} 缺少路由、元素、操作或视口")
                if not any((f := local_file(entry, a)) and f.suffix.lower() in EVIDENCE_EXT
                           for a in artifacts):
                    errors.append(f"观察证据 {eid} 缺少实拍帧或录像")

    highlights = spec.get("highlights")
    by_highlight: dict[str, dict] = {}
    if not isinstance(highlights, list) or not highlights:
        errors.append("缺少亮点排序 highlights")
    else:
        for h in highlights:
            if not isinstance(h, dict) or not text(h.get("id")):
                errors.append("亮点须有 id")
                continue
            hid = h["id"]
            if hid in by_highlight:
                errors.append(f"亮点 id 重复: {hid}")
            by_highlight[hid] = h
            if not text(h.get("name")) or not text(h.get("why_it_matters")):
                errors.append(f"亮点 {hid} 缺少名称或设计作用")
            if type(h.get("rank")) is not int or h["rank"] < 1:
                errors.append(f"亮点 {hid} 须有正整数 rank")
            refs = h.get("evidence_ids")
            if not isinstance(refs, list) or not refs or any(
                not isinstance(eid, str) or eid not in ev_by_id for eid in refs
            ):
                errors.append(f"亮点 {hid} 证据引用缺失或悬空")

    fragment = spec.get("selected_fragment")
    invariant_ids: set[str] = set()
    if not isinstance(fragment, dict):
        errors.append("缺少 selected_fragment")
    else:
        selected = fragment.get("highlight_id")
        highlight = by_highlight.get(selected) if isinstance(selected, str) else None
        if not highlight:
            errors.append("片段 highlight_id 未指向有效亮点")
        else:
            refs = highlight.get("evidence_ids", [])
            if not isinstance(refs, list) or not any(
                isinstance(eid, str) and ev_by_id.get(eid, {}).get("status") == "observed"
                for eid in refs
            ):
                errors.append("选中亮点至少需要一项实际观察证据")
        if not text(fragment.get("scope")) or not text(fragment.get("rationale")):
            errors.append("片段缺少范围或选择理由")
        invariants = fragment.get("invariants")
        if not isinstance(invariants, list) or not invariants:
            errors.append("缺少核心不变量 invariants")
        else:
            for inv in invariants:
                if not isinstance(inv, dict) or not text(inv.get("id")) or not text(inv.get("description")):
                    errors.append("不变量须有 id 与 description")
                elif inv["id"] in invariant_ids:
                    errors.append(f"不变量 id 重复: {inv['id']}")
                else:
                    invariant_ids.add(inv["id"])

    catalog = spec.get("motion_catalog")
    if not isinstance(catalog, list):
        errors.append("motion_catalog 须为数组；静态作品用 []")
    else:
        for motion in catalog:
            if not isinstance(motion, dict) or not isinstance(motion.get("status"), str) or motion["status"] not in EVIDENCE_STATUS:
                errors.append("动效须注明证据状态")
                continue
            if not all(text(motion.get(k)) for k in ("name", "target", "trigger", "driver")):
                errors.append("动效缺少名称、目标、触发或驱动方式")
            if not isinstance(motion.get("states"), list) or len(motion["states"]) < 2 or any(
                not isinstance(state, dict) or not text(state.get("name")) or not text(state.get("description"))
                for state in motion.get("states", [])
            ):
                errors.append("动效至少记录两个 {name, description} 关键状态")
            refs = motion.get("evidence_ids", [])
            if not isinstance(refs, list) or not refs or any(
                not isinstance(eid, str) or eid not in ev_by_id for eid in refs
            ):
                errors.append("动效证据引用缺失或悬空")
            elif motion["status"] == "observed" and not any(
                ev_by_id[eid].get("status") == "observed" for eid in refs
            ):
                errors.append("已观察动效不能只有源码/推断证据")

    for key in ("source_observed", "mechanism_preserved"):
        if ver.get(key) is not True:
            errors.append(f"verification.{key} 未通过")
    if type(ver.get("console_errors")) is not int or ver["console_errors"] != 0:
        errors.append("控制台检查须明确为整数 0")
    if not text(ver.get("checked_at")):
        errors.append("缺少验收时间 checked_at")
    shot = public_file(entry, ver.get("screenshot"))
    if not shot or shot.suffix.lower() not in SHOT_EXT or not shot.stem.startswith("demo"):
        errors.append("verification.screenshot 须指向可公开且存在的 demo 实拍")

    review = ver.get("user_review")
    covered: set[str] = set()
    if not isinstance(review, dict) or review.get("passed") is not True or not text(review.get("reviewer")):
        errors.append("独立 user_review 未通过或缺少复核者")
    else:
        cases = review.get("cases")
        if not isinstance(cases, list) or not cases:
            errors.append("缺少独立用户操作记录 cases")
        else:
            for case in cases:
                if not isinstance(case, dict):
                    errors.append("操作记录须为对象")
                    continue
                iid = case.get("invariant_id")
                if not isinstance(iid, str) or iid not in invariant_ids:
                    errors.append("操作记录引用无效不变量")
                if case.get("result") != "pass":
                    errors.append(f"不变量 {iid} 未通过操作复核")
                if not all(text(case.get(k)) for k in ("action", "observation", "viewport")):
                    errors.append(f"不变量 {iid} 缺少实际操作、所见或视口")
                artifacts = case.get("artifacts")
                if not isinstance(artifacts, list) or not artifacts or any(
                    not (f := public_file(entry, a)) or f.suffix.lower() not in EVIDENCE_EXT
                    for a in artifacts
                ):
                    errors.append(f"不变量 {iid} 缺少有效 demo 操作证据文件")
                elif any("private" in pathlib.PurePosixPath(a).parts or not pathlib.PurePosixPath(a).name.startswith("demo") for a in artifacts):
                    errors.append(f"不变量 {iid} 操作证据须为可公开的 demo 实拍而非原站图片")
                if isinstance(iid, str) and case.get("result") == "pass":
                    covered.add(iid)
            if invariant_ids - covered:
                errors.append("操作复核未覆盖全部不变量: " + ", ".join(sorted(invariant_ids - covered)))
    for key in ("entrypoints", "files"):
        paths = spec.get(key)
        if not isinstance(paths, list) or not paths or any(not local_file(entry, p) for p in paths):
            errors.append(f"{key} 须列出存在且不越界的条目文件")
    deps = spec.get("deps", [])
    if not isinstance(deps, list) or any(
        not text(d) and (not isinstance(d, dict) or not text(d.get("name"))) for d in deps
    ):
        errors.append("deps 须为库名字符串或含 name 的对象数组")
    return errors


def load_entries(lib: pathlib.Path) -> tuple[list[dict], list[dict]]:
    entries: list[dict] = []
    failed: list[dict] = []
    edir = lib / "entries"
    if not edir.is_dir():
        return entries, failed
    for d in sorted(edir.iterdir()):
        if not d.is_dir() or d.name.startswith("."):
            continue
        links = {"dir": d.name}
        for key, relative in (("demo", "demo/index.html"), ("readme", "README.md"), ("spec", "SPEC.json")):
            if local_file(d, relative):
                links[key] = entry_url(d.name, relative)

        def reject(reason: str) -> None:
            failed.append({**links, "reason": reason})

        try:
            spec = json.loads((d / "SPEC.json").read_text(encoding="utf-8"))
            # JSON 数值溢出/孤立代理码不能破坏整库 JSON 或 UTF-8 输出。
            json.dumps(spec, ensure_ascii=False, allow_nan=False).encode("utf-8")
        except (OSError, ValueError) as exc:
            reject(f"SPEC.json 读取失败: {ascii(str(exc))}")
            continue
        if not isinstance(spec, dict):
            reject("SPEC.json 根节点须为对象")
            continue
        missing = [k for k in REQUIRED if not spec.get(k)]
        if missing:
            reject("SPEC.json 缺字段: " + ", ".join(missing))
            continue
        if not isinstance(spec["source"], dict) or not isinstance(spec["tokens"], dict) or not isinstance(spec["verification"], dict):
            reject("source / tokens / verification 须为对象")
            continue
        version = spec.get("schema_version", 1)
        if type(version) is not int or version not in (1, 2):
            reject("不支持的 schema_version；使用整数 2")
            continue
        ver = spec["verification"]
        if version == 1 and (any(k in spec for k in ("highlights", "selected_fragment", "evidence"))
                             or any(k in ver for k in ("source_observed", "mechanism_preserved", "user_review"))):
            reject("含 v2 字段的条目必须声明 schema_version: 2，不能回退旧门槛")
            continue
        if ver.get("rendered_ok") is not True:
            reject("未通过验收: " + str(ver.get("note") or "rendered_ok != true"))
            continue
        if "demo" not in links:
            reject("缺少 demo/index.html")
            continue
        if version == 2:
            if "readme" not in links:
                reject("v2 条目缺少 README.md 分析与复核报告")
                continue
            errors = validate_v2(spec, d)
            if errors:
                reject("v2 验收缺项: " + "；".join(errors))
                continue
        shot = demo_shot(d, ver)
        entries.append({
            "id": spec["id"], "date": spec["date"], "schema_version": version,
            "verification_tier": "v2-reviewed" if version == 2 else "legacy-self-report",
            "category": spec.get("category", ""), "source": spec["source"],
            "title": spec["source"].get("title", spec["id"]),
            "author": spec["source"].get("author", ""),
            "tags": spec["source"].get("tags", []) or [],
            "dir": f"entries/{d.name}", **{k: v for k, v in links.items() if k != "dir"},
            "source_url": spec["source"].get("live_url", ""),
            "awwwards_url": spec["source"].get("awwwards_url", ""),
            "shot": entry_url(d.name, shot) if shot else None,
            "shot_kind": "demo" if shot else None,
            "summary": spec["summary"], "strength": spec.get("strength", ""),
            "expression": spec.get("expression", ""), "composition": spec.get("composition", ""),
            "highlights": spec.get("highlights", []) or [],
            "selected_fragment": spec.get("selected_fragment", {}) or {},
            "evidence": spec.get("evidence", []) or [],
            "motion_catalog": spec.get("motion_catalog", []) or [],
            "extracted_mechanism": spec["extracted_mechanism"], "dont_copy": spec.get("dont_copy", ""),
            "tokens": spec["tokens"], "api": spec.get("api", ""),
            "entrypoints": spec.get("entrypoints", []) or [], "files": spec.get("files", []) or [],
            "deps": spec.get("deps", []) or [], "reuse_hints": spec.get("reuse_hints", ""),
            "repro_notes": spec.get("repro_notes", ""), "variant_of": spec.get("variant_of"),
            "verification": ver,
        })
    entries.sort(key=lambda e: (str(e["date"]), str(e["id"])), reverse=True)
    return entries, failed


def build(lib: pathlib.Path) -> int:
    shell_f = lib / "templates" / "gallery_shell.html"
    if not shell_f.is_file():
        print(f"ERROR: 缺少 {shell_f}", file=sys.stderr)
        return 1
    shell = shell_f.read_text(encoding="utf-8")
    entries, failed = load_entries(lib)
    stamp = datetime.datetime.now().astimezone().replace(microsecond=0).isoformat()
    index_f = lib / "index.json"
    if index_f.is_file():
        try:
            old = json.loads(index_f.read_text(encoding="utf-8"))
            if old.get("schema_version") == 2 and old.get("entries") == entries and old.get("failed") == failed and old.get("generated_at"):
                stamp = old["generated_at"]
        except (OSError, ValueError, AttributeError):
            pass
    index = {"schema_version": 2, "generated_at": stamp, "generator": "scripts/build_gallery.py",
             "count": len(entries), "entries": entries, "failed": failed}
    payload = json.dumps(index, ensure_ascii=False, allow_nan=False).replace("</", "<\\/")
    out = shell.replace("__DATA__", payload).replace("__COUNT__", str(len(entries))).replace("__GENERATED__", stamp)
    index_f.write_text(json.dumps(index, ensure_ascii=False, allow_nan=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    (lib / "gallery").mkdir(parents=True, exist_ok=True)
    (lib / "gallery" / "index.html").write_text(out, encoding="utf-8", newline="\n")
    legacy = sum(e["verification_tier"] == "legacy-self-report" for e in entries)
    print(f"index.json 条目 {len(entries)}（旧版自检 {legacy}） 未入库 {len(failed)}")
    print("gallery/index.html 已重建；海报使用 demo 实拍")
    for item in failed:
        print(f"  ! {item['dir']}: {item['reason']}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lib", default=None, help="库根目录，默认取脚本的上一级")
    args = ap.parse_args()
    lib = pathlib.Path(args.lib).resolve() if args.lib else pathlib.Path(__file__).resolve().parent.parent
    if not lib.is_dir():
        print(f"ERROR: 库目录不存在 {lib}", file=sys.stderr)
        return 1
    return build(lib)


if __name__ == "__main__":
    raise SystemExit(main())
