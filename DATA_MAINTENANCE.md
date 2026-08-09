# City Bites Data Maintenance Policy

City Bites must never publish annual research updates directly from raw data.

## Required order

**Clean → Validate → Analyze → Flag surprises → Brief Crystal → Publish reviewed changes**

## Before any annual update

Nova and Python must first clean the newly pulled official NYC DOHMH inspection data.

The cleaning and validation review must include:

- Normalize text and whitespace without changing the meaning of official source wording.
- Confirm required fields are present for the analysis.
- Validate inspection dates and numeric scores.
- Remove exact duplicate rows and report how many were removed.
- Do not guess or silently fill missing values.
- Review unexpected missing values, malformed records, new source labels, or schema changes.
- Group violation-level rows correctly into inspection-level records before calculating inspection statistics.
- Preserve the distinction between historical case-study inspections, latest inspection records, and current operating status.

## Surprise rule

A **surprise** is any meaningful result that differs from what City Bites currently publishes or expects, including:

- A changed count of score-50 inspections or closure outcomes.
- A meaningful change in the selected violation percentages or their relative pattern.
- A new or changed DOHMH action/status label.
- A change in the source data structure or field meanings.
- Unexpected duplicate, missing, malformed, or inconsistent records.
- New evidence that changes the Don Alex or La Dinastia case-study context.
- A change in NYC grading, inspection, closure, or reopening rules.
- A new FOIL response or record that changes the explanation of the two score-50 cases.

If a surprise is found, **Crystal must be briefed before the changed claim is published in the app or README.** The finding should be checked against the official source and explained in plain language.

## When no meaningful surprise is found

After the data passes cleaning and validation, Nova and Python may prepare the annual research snapshot, update the documented review dates, and carry forward verified statistics. The GitHub changes should then be deployed through the normal `main` → Vercel workflow and the production site should be checked after deployment.

## Saved maintenance assets

- Annual schedule: `data/annual-update-schedule.json`
- Python review: `scripts/annual_data_review.py`
- Annual output: `data/annual_research_snapshot.json`
- Public project roadmap: `README.md`

## Core promise

City Bites should be current **and** careful. Fresh data is useful only when it has been cleaned, checked, understood, and presented without overstating what the evidence proves.
