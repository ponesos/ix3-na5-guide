#!/usr/bin/env python3
"""Parse a saved MOTOR-TALK forum/thread HTML dump into forum.json (metadata only).

Primary board: https://www.motor-talk.de/forum/bmw-ix3-neue-klasse-na5-b1240.html

Does not store post bodies or nicknames. Prefer --html when the live site blocks bots.

Usage:
  python3 scripts/sync-motor-talk.py --html /path/to/saved-board.html
  python3 scripts/sync-motor-talk.py --html scripts/fixtures/motor-talk-na5-sample.html --no-translate
  ./scripts/sync-data.sh
"""

from __future__ import annotations

import argparse
import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from datetime import date
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "data" / "vehicles" / "na5-ix3" / "forum.json"
SOURCE = {
    "id": "motor-talk-na5",
    "name": "MOTOR-TALK · BMW iX3 Neue Klasse (NA5)",
    "url": "https://www.motor-talk.de/forum/bmw-ix3-neue-klasse-na5-b1240.html",
    "forumId": "1240",
    "lang": "de",
}
BASE = "https://www.motor-talk.de"


def translate_de_to_ko(text: str, enable: bool) -> str:
    if not enable or not text.strip():
        return text
    q = urllib.parse.urlencode({"q": text[:450], "langpair": "de|ko"})
    url = f"https://api.mymemory.translated.net/get?{q}"
    req = urllib.request.Request(url, headers={"User-Agent": "ix3-na5-guide/1.0"})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=20, context=ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        out = (data.get("responseData") or {}).get("translatedText") or ""
        if not out or "MYMEMORY WARNING" in out.upper():
            return text
        return unescape(out).strip()
    except Exception:
        return text


def summary_from_title(title_ko: str, title_orig: str) -> str:
    base = title_ko if title_ko != title_orig else title_orig
    return f"MOTOR-TALK 스레드 요약: {base}. 본문은 원문 링크에서 확인하세요."


def parse_int(raw: str | None) -> int | None:
    if raw is None:
        return None
    digits = re.sub(r"[^\d]", "", raw)
    return int(digits) if digits else None


def normalize_date(raw: str | None) -> str:
    if not raw:
        return date.today().isoformat()
    raw = raw.strip()
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", raw)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    m = re.search(r"(\d{1,2})\.(\d{1,2})\.(\d{4})", raw)
    if m:
        d, mo, y = int(m.group(1)), int(m.group(2)), m.group(3)
        return f"{y}-{mo:02d}-{d:02d}"
    return date.today().isoformat()


def absolutize(href: str) -> str:
    href = href.strip().split("?")[0]
    if href.startswith("http"):
        return href
    if not href.startswith("/"):
        href = "/" + href
    return BASE + href


def parse_threads(html: str) -> list[dict]:
    items: list[dict] = []
    seen: set[str] = set()

    # Fixture markup
    for block in re.finditer(
        r'<div class="threadbit([^"]*)">\s*'
        r'<a class="title" href="([^"]+)">([^<]+)</a>\s*'
        r'(?:<span class="replies">([^<]*)</span>\s*)?'
        r'(?:<span class="views">([^<]*)</span>\s*)?'
        r'(?:<span class="time">([^<]*)</span>\s*)?',
        html,
        re.I | re.S,
    ):
        classes, href, title, replies, views, when = block.groups()
        title = unescape(re.sub(r"\s+", " ", title)).strip()
        m = re.search(r"-t(\d+)\.html", href)
        if not m:
            continue
        tid = m.group(1)
        if tid in seen:
            continue
        seen.add(tid)
        items.append(
            {
                "id": f"mt-{tid}",
                "titleOriginal": title,
                "url": absolutize(href),
                "replies": parse_int(replies) or 0,
                "views": parse_int(views) or 0,
                "lastActivityAt": normalize_date(when),
                "pinned": "sticky" in (classes or "").lower(),
            }
        )

    # Live MOTOR-TALK thread links
    for m in re.finditer(
        r'href="((?:https://www\.motor-talk\.de)?/forum/[^"]+-t(\d+)\.html)"[^>]*>([^<]{5,200})',
        html,
        re.I,
    ):
        href, tid, title = m.group(1), m.group(2), unescape(re.sub(r"\s+", " ", m.group(3))).strip()
        if tid in seen or len(title) < 5:
            continue
        window = html[m.end() : m.end() + 600]
        pages = [int(p) for p in re.findall(r"[?&]page=(\d+)", window + html[max(0, m.start() - 200) : m.end()])]
        replies = max(0, (max(pages) - 1) * 20) if pages else 0
        nums = re.findall(r">\s*([\d.]+)\s*<", window)
        if nums and not replies:
            replies = parse_int(nums[0]) or 0
        date_m = re.search(r"(\d{1,2}\.\d{1,2}\.\d{4}|\d{4}-\d{2}-\d{2})", window)
        seen.add(tid)
        items.append(
            {
                "id": f"mt-{tid}",
                "titleOriginal": title,
                "url": absolutize(href),
                "replies": replies,
                "views": 0,
                "lastActivityAt": normalize_date(date_m.group(1) if date_m else None),
                "pinned": False,
            }
        )

    return items


def enrich(items: list[dict], translate: bool, existing: dict[str, dict]) -> list[dict]:
    out = []
    for i, item in enumerate(items):
        prev = existing.get(item["id"], {})
        title_orig = item["titleOriginal"]
        if translate:
            title_ko = translate_de_to_ko(title_orig, True)
            time.sleep(0.35)
        else:
            title_ko = prev.get("titleKo") or title_orig
        if title_ko == title_orig and prev.get("titleKo"):
            title_ko = prev["titleKo"]
        summary = prev.get("summaryKo")
        if not summary or summary.startswith("MOTOR-TALK 스레드 요약:"):
            if translate:
                summary = translate_de_to_ko(
                    f"Kurze Zusammenfassung des Forumsthemas: {title_orig}",
                    True,
                )
                time.sleep(0.35)
            if not summary or summary == title_orig:
                summary = summary_from_title(title_ko, title_orig)
        out.append(
            {
                "id": item["id"],
                "titleOriginal": title_orig,
                "titleKo": title_ko,
                "summaryKo": summary,
                "url": item["url"],
                "lastActivityAt": item["lastActivityAt"],
                "replies": item.get("replies") or 0,
                "views": item.get("views") or 0,
                "pinned": bool(item.get("pinned")),
            }
        )
        print(f"[{i + 1}/{len(items)}] {item['id']} · {title_ko[:40]}")
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description="Sync MOTOR-TALK forum HTML → forum.json")
    ap.add_argument("--html", required=True, help="Path to saved board/listing HTML")
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--no-translate", action="store_true")
    ap.add_argument("--limit", type=int, default=40)
    args = ap.parse_args()

    html = Path(args.html).read_text(encoding="utf-8", errors="ignore")
    parsed = parse_threads(html)
    if not parsed:
        raise SystemExit(f"No threads found in {args.html}")

    existing: dict[str, dict] = {}
    if args.out.exists():
        try:
            prev_doc = json.loads(args.out.read_text(encoding="utf-8"))
            existing = {i["id"]: i for i in prev_doc.get("items", [])}
        except Exception:
            pass

    items = enrich(parsed[: args.limit], translate=not args.no_translate, existing=existing)
    today = date.today().isoformat()
    doc = {
        "vehicleId": "na5-ix3",
        "status": "ready",
        "updatedAt": today,
        "syncedAt": today,
        "sourceNoteKo": (
            "해외 1차 소스: MOTOR-TALK BMW iX3 Neue Klasse (NA5) 보드. "
            "제목·댓글 규모·짧은 한글 요약만 제공합니다. 본문·닉네임은 옮기지 않습니다."
        ),
        "source": SOURCE,
        "items": items,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(items)} threads → {args.out}")
    print("Next: ./scripts/sync-data.sh")


if __name__ == "__main__":
    main()
