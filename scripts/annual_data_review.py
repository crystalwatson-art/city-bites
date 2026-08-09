#!/usr/bin/env python3
"""Annual City Bites research-data review.

This script pulls official NYC DOHMH restaurant-inspection rows from Socrata,
recomputes the score-50 case-study counts and the selected 41-60 point
violation-pattern percentages, and writes a dated JSON snapshot for review.

It intentionally does not rewrite the production UI by itself. The generated
snapshot should be reviewed before claims, dates, or case-study language are
published to City Bites.
"""

from __future__ import annotations

import json
import time
from collections import defaultdict
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API = "https://data.cityofnewyork.us/resource/43nn-pn8j.json"
PAGE_SIZE = 50000
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "data" / "annual_research_snapshot.json"

SELECTED_VIOLATIONS = {
    "Evidence/live mice": ("mice",),
    "Live roaches": ("roach",),
    "Pest-management records": ("pest management", "extermination"),
    "Pest-harboring conditions": ("harbor", "harbour", "conditions conducive"),
    "Hot/cold holding equipment": ("hot holding", "cold holding", "holding equipment"),
}


def fetch_rows() -> list[dict[str, Any]]:
    """Fetch initial inspections scoring 41-60, paging until exhausted."""
    rows: list[dict[str, Any]] = []
    offset = 0

    while True:
        params = {
            "$select": ",".join(
                [
                    "camis",
                    "dba",
                    "boro",
                    "inspection_date",
                    "inspection_type",
                    "action",
                    "score",
                    "violation_code",
                    "violation_description",
                    "critical_flag",
                ]
            ),
            "$where": "upper(inspection_type) like '%INITIAL%' AND score between 41 and 60",
            "$order": "inspection_date ASC, camis ASC",
            "$limit": str(PAGE_SIZE),
            "$offset": str(offset),
        }
        url = f"{API}?{urlencode(params)}"
        request = Request(url, headers={"User-Agent": "City-Bites-Annual-Review/1.0"})
        with urlopen(request, timeout=60) as response:
            page = json.load(response)

        rows.extend(page)
        if len(page) < PAGE_SIZE:
            break

        offset += PAGE_SIZE
        time.sleep(0.25)

    return rows


def inspection_key(row: dict[str, Any]) -> tuple[str, str, str]:
    return (
        row.get("camis", ""),
        row.get("inspection_date", ""),
        row.get("inspection_type", ""),
    )


def is_closed(action_values: set[str]) -> bool:
    combined = " ".join(action_values).lower()
    return "closed by dohmh" in combined or "establishment closed" in combined


def matches_selected_violation(description: str, terms: tuple[str, ...]) -> bool:
    text = description.lower()
    return any(term in text for term in terms)


def summarize(rows: list[dict[str, Any]]) -> dict[str, Any]:
    inspections: dict[tuple[str, str, str], dict[str, Any]] = {}

    for row in rows:
        key = inspection_key(row)
        record = inspections.setdefault(
            key,
            {
                "camis": row.get("camis", ""),
                "dba": row.get("dba", ""),
                "boro": row.get("boro", ""),
                "inspection_date": row.get("inspection_date", ""),
                "inspection_type": row.get("inspection_type", ""),
                "score": None,
                "actions": set(),
                "violations": set(),
            },
        )

        if row.get("score") not in (None, ""):
            try:
                record["score"] = int(float(row["score"]))
            except (TypeError, ValueError):
                pass

        if row.get("action"):
            record["actions"].add(str(row["action"]))
        if row.get("violation_description"):
            record["violations"].add(str(row["violation_description"]))

    values = list(inspections.values())
    closed_group = [item for item in values if is_closed(item["actions"])]
    stayed_group = [item for item in values if not is_closed(item["actions"])]

    score50 = [item for item in values if item["score"] == 50]
    score50_closed = [item for item in score50 if is_closed(item["actions"])]
    score50_stayed = [item for item in score50 if not is_closed(item["actions"])]

    context = []
    for label, terms in SELECTED_VIOLATIONS.items():
        closed_hits = sum(
            1
            for item in closed_group
            if any(matches_selected_violation(v, terms) for v in item["violations"])
        )
        stayed_hits = sum(
            1
            for item in stayed_group
            if any(matches_selected_violation(v, terms) for v in item["violations"])
        )

        closed_pct = (closed_hits / len(closed_group) * 100) if closed_group else 0.0
        stayed_pct = (stayed_hits / len(stayed_group) * 100) if stayed_group else 0.0

        context.append(
            {
                "label": label,
                "closed_count": closed_hits,
                "closed_total": len(closed_group),
                "closed_percent": round(closed_pct, 1),
                "stayed_open_count": stayed_hits,
                "stayed_open_total": len(stayed_group),
                "stayed_open_percent": round(stayed_pct, 1),
                "percentage_point_difference": round(closed_pct - stayed_pct, 1),
                "match_terms": list(terms),
            }
        )

    return {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "review_date": date.today().isoformat(),
        "source": API,
        "scope": "Initial inspections scoring 41-60",
        "inspection_count": len(values),
        "closed_inspection_count": len(closed_group),
        "stayed_open_inspection_count": len(stayed_group),
        "score_50": {
            "total": len(score50),
            "closed": len(score50_closed),
            "stayed_open": len(score50_stayed),
        },
        "selected_violation_comparison": context,
        "review_warning": (
            "Keyword categories are a reproducible aid, not a substitute for human review. "
            "Before publishing changed statistics, inspect source wording and confirm that "
            "NYC schema/action labels have not changed."
        ),
    }


def main() -> None:
    rows = fetch_rows()
    snapshot = summarize(rows)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")
    print(json.dumps(snapshot["score_50"], indent=2))


if __name__ == "__main__":
    main()
