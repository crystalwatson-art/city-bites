# City Bites — Nova Handoff

This file is the continuity source for future Nova sessions working on City Bites.

## Standing maintenance rule

Before any annual research update is published, Nova and Python must follow this order:

**Clean → Validate → Analyze → Flag surprises → Brief Crystal → Publish reviewed changes**

No changed annual statistic, case-study fact, current-status statement, or freshness date should be published directly from raw data.

## Clean-first requirements

Python must clean and validate newly pulled official NYC DOHMH inspection data before analysis. At minimum:

- Normalize text and whitespace without changing source meaning.
- Validate required fields, dates, and numeric scores.
- Remove exact duplicate rows and report what was removed.
- Do not invent or silently fill missing values.
- Check missingness, malformed rows, action/status labels, critical-flag labels, and schema changes.
- Group violation-level rows into inspection-level records correctly before calculating inspection statistics.

## Surprise rule

If the cleaned data reveals a meaningful surprise, Nova must tell Crystal before changed claims are published.

Surprises include:

- Changes in score-50 inspection counts or closure outcomes.
- Meaningful changes in selected violation percentages/patterns.
- New or changed DOHMH action/status labels.
- Unexpected data-quality issues or schema changes.
- New evidence affecting Don Alex or La Dinastia.
- Changes in NYC grading, inspection, closure, or reopening rules.
- New FOIL records that change the interpretation of the score-50 case study.

The surprise must be checked against official evidence and explained to Crystal in plain language before publication.

## Annual schedule

- Cadence: yearly
- Date: February 15
- Time target: 9:00 AM America/New_York
- Last completed review: August 9, 2026
- Next scheduled review: February 15, 2027

A recurring ChatGPT task named **City Bites Annual Review** is enabled for this yearly review.

## Portfolio synchronization rule

City Bites is a featured portfolio project. An approved City Bites upgrade is **not fully complete** until the matching City Bites entry in Crystal's portfolio has been reviewed and updated when relevant.

After City Bites changes are approved and deployed:

- Review the City Bites project description in the portfolio.
- Update features, research findings, screenshots or previews, milestones, data-source notes, and technology notes when they changed.
- Confirm the live City Bites link still works.
- Keep historical case-study facts separate from current restaurant conditions.
- Do not copy new annual research statistics or surprising findings into the portfolio until the clean → validate → analyze → brief Crystal → publish process is complete.
- Verify the portfolio accurately represents the latest verified public City Bites version.

The portfolio repository is `crystalwatson-art/Crystal-Portfolio`.

## Saved maintenance files

- `README.md` — product vision, roadmap, and annual maintenance documentation
- `DATA_MAINTENANCE.md` — detailed clean-first publication policy
- `data/annual-update-schedule.json` — machine-readable annual schedule and publication gate
- `scripts/annual_data_review.py` — Python cleaning, validation, analysis, baseline comparison, and surprise detection
- `data/annual_research_snapshot.json` — annual reviewed output when generated

## Freshness model

City Bites has two kinds of freshness:

1. Restaurant search results query NYC Open Data live when a user searches.
2. Research statistics, historical case-study claims, policy wording, and public freshness dates receive a formal annual review.

The production app should clearly distinguish live search data from annually reviewed research facts.

## Product direction

City Bites is intended to grow beyond the original assignment into a trustworthy NYC restaurant food-safety information tool. It should expand restaurant coverage, preserve official NYC A/B/C grading and official statuses, explain violations in plain language, show inspection histories and enforcement context, distinguish historical inspections from current conditions, and help diners make their own informed choices without overstating what the evidence proves.

## Deployment continuity

GitHub `main` is the source of truth. Vercel is connected to the City Bites repository and should deploy production updates automatically from `main`. After approved maintenance changes, verify the production deployment and live site, then review the matching portfolio project entry before considering the overall update complete.
