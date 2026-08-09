#!/usr/bin/env python3
"""Annual City Bites research-data review.

Maintenance rule:
    clean -> validate -> analyze -> flag surprises -> review -> publish

This script pulls official NYC DOHMH restaurant-inspection rows from Socrata,
cleans and validates them before analysis, recomputes the score-50 case-study
counts and selected 41-60 point violation-pattern percentages, compares the
results with the currently published research baseline, and writes a dated JSON
snapshot for human review.

It intentionally does NOT rewrite the production UI or README by itself.
Unexpected results must be reviewed with Crystal before changed public claims
are published.
"""

from __future__ import annotations

import json
import re
import time
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

# Published August 9, 2026 research values. They are a comparison baseline,
# not permanent truth. Any meaningful change should be surfaced for review.
PUBLISHED_BASELINE = {
    "score_50": {"total": 99, "closed": 10, "stayed_open": 89},
    "selected_violation_gaps": {
        "Evidence/live mice": 29.0,
        "Live roaches": 20.0,
        "Pest-management records": 20.1,
        "Pest-harboring conditions": 16.6,
        "Hot/cold holding equipment": 4.3,
    },
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
        request = Request(url, headers={"User-Agent": "City-Bites-Annual-Review/1.1"})
        with urlopen(request, timeout=60) as response:
            page = json.load(response)

        rows.extend(page)
        if len(page) < PAGE_SIZE:
            break

        offset += PAGE_SIZE
        time.sleep(0.25)

    return rows


def normalize_text(value: Any) -> str:
    """Normalize whitespace without changing the meaning of source text."""
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def clean_rows(rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Clean source rows before any analysis and return a QA report.

    Cleaning is intentionally conservative. We normalize whitespace, validate
    required fields, validate the requested score range and date shape, and
    remove exact duplicate violation rows. We do not guess missing values or
    silently rewrite source categories.
    """
    cleaned: list[dict[str, Any]] = []
    seen: set[tuple[str, ...]] = set()

    dropped_missing_required = 0
    dropped_invalid_score = 0
    dropped_invalid_date = 0
    duplicate_rows_removed = 0
    action_labels: set[str] = set()
    critical_labels: set[str] = set()

    for raw in rows:
        row = {
            key: normalize_text(raw.get(key))
            for key in (
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
            )
        }

        if not row["camis"] or not row["inspection_date"] or not row["inspection_type"] or not row["score"]:
            dropped_missing_required += 1
            continue

        try:
            score = int(float(row["score"]))
        except (TypeError, ValueError):
            dropped_invalid_score += 1
            continue

        if not 41 <= score <= 60:
            dropped_invalid_score += 1
            continue
        row["score"] = str(score)

        try:
            datetime.fromisoformat(row["inspection_date"].replace("Z", "+00:00"))
        except ValueError:
            dropped_invalid_date += 1
            continue

        signature = tuple(
            row[key]
            for key in (
                "camis",
                "inspection_date",
                "inspection_type",
                "action",
                "score",
                "violation_code",
                "violation_description",
                "critical_flag",
            )
        )
        if signature in seen:
            duplicate_rows_removed += 1
            continue
        seen.add(signature)

        if row["action"]:
            action_labels.add(row["action"])
        if row["critical_flag"]:
            critical_labels.add(row["critical_flag"])
        cleaned.append(row)

    qa = {
        "raw_rows": len(rows),
        "clean_rows": len(cleaned),
        "duplicate_rows_removed": duplicate_rows_removed,
        "dropped_missing_required": dropped_missing_required,
        "dropped_invalid_score": dropped_invalid_score,
        "dropped_invalid_date": dropped_invalid_date,
        "action_labels_seen": sorted(action_labels),
        "critical_labels_seen": sorted(critical_labels),
        "cleaning_rules": [
            "Normalize repeated whitespace and trim text fields",
            "Require CAMIS, inspection date, inspection type, and score",
            "Validate score as numeric and within the requested 41-60 range",
            "Validate inspection date as ISO-formatted date/time",
            "Remove exact duplicate violation rows",
            "Do not impute missing values or invent source categories",
        ],
    }
    return cleaned, qa


def inspection_key(row: dict[str, Any]) -> tuple[str, str, str]:
    return (row.get("camis", ""), row.get("inspection_date", ""), row.get("inspection_type", ""))


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

        if row.get("score"):
            record["score"] = int(row["score"])
        if row.get("action"):
            record["actions"].add(row["action"])
        if row.get("violation_description"):
            record["violations"].add(row["violation_description"])

    values = list(inspections.values())
    closed_group = [item for item in values if is_closed(item["actions"])]
    stayed_group = [item for item in values if not is_closed(item["actions"])]

    score50 = [item for item in values if item["score"] == 50]
    score50_closed = [item for item in score50 if is_closed(item["actions"])]
    score50_stayed = [item for item in score50 if not is_closed(item["actions"])]

    context = []
    for label, terms in SELECTED_VIOLATIONS.items():
        closed_hits = sum(
            1 for item in closed_group
            if any(matches_selected_violation(v, terms) for v in item["violations"])
        )
        stayed_hits = sum(
            1 for item in stayed_group
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
        "inspection_count": len(values),
        "closed_inspection_count": len(closed_group),
        "stayed_open_inspection_count": len(stayed_group),
        "score_50": {
            "total": len(score50),
            "closed": len(score50_closed),
            "stayed_open": len(score50_stayed),
        },
        "selected_violation_comparison": context,
    }


def flag_surprises(summary: dict[str, Any], qa: dict[str, Any]) -> list[str]:
    """Flag changes that deserve Crystal's attention before publication."""
    surprises: list[str] = []

    current50 = summary["score_50"]
    for key, old_value in PUBLISHED_BASELINE["score_50"].items():
        new_value = current50[key]
        if new_value != old_value:
            surprises.append(f"Score-50 {key} changed from {old_value} to {new_value}.")

    old_gaps = PUBLISHED_BASELINE["selected_violation_gaps"]
    for item in summary["selected_violation_comparison"]:
        old_gap = old_gaps.get(item["label"])
        new_gap = item["percentage_point_difference"]
        if old_gap is not None and abs(new_gap - old_gap) >= 1.0:
            surprises.append(
                f"{item['label']} gap changed from {old_gap:.1f} to {new_gap:.1f} percentage points."
            )

    malformed = (
        qa["dropped_missing_required"]
        + qa["dropped_invalid_score"]
        + qa["dropped_invalid_date"]
    )
    if malformed:
        surprises.append(f"Data cleaning removed {malformed} malformed source row(s); review why.")

    if qa["duplicate_rows_removed"]:
        surprises.append(
            f"Data cleaning removed {qa['duplicate_rows_removed']} exact duplicate row(s); verify source behavior."
        )

    return surprises


def main() -> None:
    raw_rows = fetch_rows()
    clean_data, qa = clean_rows(raw_rows)
    summary = summarize(clean_data)
    surprises = flag_surprises(summary, qa)

    snapshot = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "review_date": date.today().isoformat(),
        "source": API,
        "scope": "Initial inspections scoring 41-60",
        "workflow": ["clean", "validate", "analyze", "flag surprises", "human review", "publish"],
        "quality_report": qa,
        **summary,
        "surprises": surprises,
        "publication_gate": (
            "Do not replace public research claims when surprises are present until Crystal has been briefed "
            "and the changed results have been checked against the official source."
        ),
        "review_warning": (
            "Keyword categories are a reproducible aid, not a substitute for human review. "
            "Before publishing changed statistics, inspect source wording and confirm that NYC schema, "
            "action labels, and relevant policies have not changed."
        ),
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {OUTPUT_PATH}")
    print(json.dumps(snapshot["quality_report"], indent=2))
    print(json.dumps(snapshot["score_50"], indent=2))
    if surprises:
        print("SURPRISES — REVIEW BEFORE PUBLISHING:")
        for surprise in surprises:
            print(f"- {surprise}")
    else:
        print("No threshold-level surprises detected in the research snapshot.")


if __name__ == "__main__":
    main()
