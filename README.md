# City Bites

City Bites helps New Yorkers make more informed dining choices by turning official NYC restaurant inspection records into clear, plain-language information.

The long-term goal is bigger than showing a letter grade. City Bites is intended to help people understand **what inspectors found, how serious the findings were, what happened after an inspection, and what the public data still cannot explain**.

## Product purpose

City Bites is built around a simple idea:

> Give people clear food-safety facts, explain them in everyday language, and let diners make their own choices.

City Bites does **not** tell people where they should or should not eat. It provides context so they can decide for themselves.

## Current MVP

The current version:

- Searches live NYC restaurant inspection records by restaurant name or ZIP code
- Filters results by borough, cuisine, and inspection grade
- Explains inspection findings in plain language
- Shows inspection score, grade, date, action, and violations
- Identifies findings marked critical
- Links each restaurant result to its exact NYC Open Data record and a map
- Explains the official NYC A, B, and C grading system
- Includes the data story **Same Score. Different Fate.**
- Includes a broader five-violation comparison chart
- Tracks a pending FOIL investigation into two score-50 inspections with different enforcement outcomes
- Supports desktop and mobile layouts, keyboard navigation, dark mode, and light mode
- Deploys automatically from GitHub `main` to Vercel

## How NYC restaurant grades work

NYC restaurant inspection points are violation points, so **lower is better**.

- **A:** 0–13 points
- **B:** 14–27 points
- **C:** 28 or more points

NYC does **not** use official D or F restaurant grades. City Bites should preserve the real NYC grading system rather than invent additional letter grades.

Other useful statuses can include things such as **Grade Pending**, temporary closure, reopening, or other enforcement actions shown in the official data.

Official reference: [NYC Health — Letter Grading for Restaurants](https://www.nyc.gov/site/doh/business/food-operators/letter-grading-for-restaurants.page)

## What a score of 50 means

A score of 50 is a very poor inspection score because it is far above the 28-point threshold for the C range.

But the score alone does **not** automatically explain whether a restaurant will remain open or be temporarily closed. The specific violations, public-health hazards, conditions found during the inspection, corrections made during the inspection, and enforcement decisions all matter.

That is the question that led to the central City Bites data story.

## Data story: Same Score. Different Fate.

City Bites examined **initial inspections that scored exactly 50**.

In the research set:

- **99** initial inspections scored exactly 50
- **89** stayed open
- **10** ended in closure

This showed that a score of 50 did **not** always lead to the same enforcement outcome.

### Don Alex — Corona, Queens

- Inspection studied: **February 5, 2024**
- Published score: **50**
- Findings: **12**
- Marked critical: **7**
- Outcome of that inspection: **Stayed open**

The February 5, 2024 inspection is used because it is the historical score-50 case being studied. It should **not** be described as Don Alex's latest inspection unless current official data confirms that.

As of August 2026, public-facing business sources strongly indicate that Don Alex is operating. Its website advertises restaurant hours, reservations, and online ordering. Current operating status should still be rechecked when presented as a live fact.

Restaurant website: [Don Alex](https://donalexrestaurantnyc.com/)

### La Dinastia — Upper West Side, Manhattan

- Inspection studied: **June 3, 2025**
- Published score: **50**
- Findings: **6**
- Marked critical: **4**
- Outcome of that inspection: **Closed by DOHMH**

La Dinastia later reopened. As of August 2026, its official website says it is open for dine-in, delivery, and pickup every day. The exact reopening date has not yet been confirmed from the records collected for this project.

Restaurant website: [La Dinastia](https://www.ladinastia72.com/)

### Why the comparison matters

Don Alex had **more total findings and more findings marked critical**, yet stayed open during the studied inspection. La Dinastia had fewer findings but was closed.

City Bites does **not** claim that the public dataset proves why those outcomes differed.

The lesson is:

> **One inspection score does not always tell the whole enforcement story.**

## Broader pattern chart

City Bites also compared selected violation types among **initial inspections scoring 41–60**.

Five selected violations appeared more often in inspections that ended in closure than in inspections that stayed open:

| Violation type | Closed | Stayed open | Difference |
| --- | ---: | ---: | ---: |
| Evidence/live mice | 71.1% | 42.1% | +29.0 percentage points |
| Live roaches | 37.7% | 17.7% | +20.0 percentage points |
| Pest-management record problems | 27.0% | 6.9% | +20.1 percentage points |
| Pest-harboring conditions | 91.8% | 75.2% | +16.6 percentage points |
| Inadequate hot/cold holding equipment | 8.8% | 4.5% | +4.3 percentage points |

These are **patterns, not proof of causation**. City Bites should never imply that one violation automatically caused a closure unless the underlying official records support that conclusion.

## FOIL investigation

**FOIL** means **Freedom of Information Law**.

A FOIL request was submitted to the NYC Department of Health and Mental Hygiene to request records that may explain why the two score-50 inspections led to different outcomes.

- Acknowledged: **August 7, 2026**
- Control number: **2026FR01025**
- Assigned bureau: **Food Safety and Community Sanitation**
- Status: **Pending**

Until the records arrive, City Bites should clearly say that the reason for the different outcomes is **not yet known from the public data**.

## How often NYC restaurants are inspected

NYC Health says every restaurant is scheduled for an **unannounced inspection at least once a year**.

Restaurants can be inspected more often when follow-up, reinspection, complaints, compliance checks, or other circumstances require it.

Official reference: [NYC Health — The Inspection Process](https://www.nyc.gov/site/doh/business/food-operators/the-inspection-process.page)

## Phase 2 vision

The next major version of City Bites should expand from an MVP into a broader public food-safety information tool.

### Expand restaurant coverage

- Include many more NYC restaurants
- Continue using official NYC Open Data as the primary inspection source
- Make larger result sets easy to browse
- Keep search and filters simple for everyday users

### Show the full official grade and status picture

Support and explain:

- A
- B
- C
- Grade Pending
- Temporary closure when present in official records
- Reopened status or later inspection activity when supported by official records

Do **not** create fake D or F grades. If City Bites eventually introduces its own risk labels, they must be clearly separated from official NYC grades and carefully explained.

### Give diners more inspection context

Each restaurant should eventually make it easy to see:

- Current official grade/status
- Latest inspection date
- Inspection score
- Plain-language violation descriptions
- Which findings were marked critical
- Enforcement action
- Closure and reopening history when available
- Previous inspections and score history
- Links to the official source records

The goal is to help someone answer:

> **What was found here, how serious was it, how recent is it, and what happened afterward?**

### Preserve historical context

A historical inspection used in a data story must never be presented as if it automatically describes a restaurant's current condition.

City Bites should clearly distinguish:

- **Historical case-study inspection**
- **Latest inspection record**
- **Current operating status**

This protects both diners and restaurant owners from misleading conclusions.

## Product principles

City Bites should continue to follow these rules as it grows:

1. **Use official data first.** Prefer NYC Health and NYC Open Data for inspection facts.
2. **Explain without exaggerating.** Translate technical violations into plain language without making them sound more or less serious than the source record.
3. **Do not confuse correlation with causation.** A pattern in violations does not prove why an enforcement decision happened.
4. **Keep dates visible.** Restaurant conditions can change, so users need to know when an inspection occurred.
5. **Separate current status from history.** Historical cases are valuable, but they are not automatically the latest condition.
6. **Let diners choose.** City Bites informs; it does not make the dining decision for the user.
7. **Keep the interface accessible.** Maintain keyboard navigation, responsive layouts, readable text, and light/dark mode.
8. **Verify before publishing strong claims.** Closure reasons, reopening dates, and current operating status should be supported by reliable records.

## Annual data maintenance

City Bites uses **two kinds of freshness**:

1. **Live restaurant search data.** Normal restaurant searches query NYC Open Data at the time of the search, so those results are not limited to a once-a-year static file.
2. **Annual research review.** At least once every year, Nova and Python should recalculate and review the research statistics, historical case-study facts, violation categories, official grading/status rules, and public-facing freshness dates.

### Annual schedule

- **Cadence:** Once every year
- **Review date:** August 9
- **Timezone:** America/New_York
- **Last completed review:** August 9, 2026
- **Next scheduled review:** August 9, 2027

The schedule is also stored in machine-readable form at [`data/annual-update-schedule.json`](data/annual-update-schedule.json).

The Python review script is stored at [`scripts/annual_data_review.py`](scripts/annual_data_review.py). It pulls official NYC DOHMH data, groups violation rows into inspection-level records, recomputes the score-50 counts and selected 41–60 point violation comparisons, and writes a review snapshot to `data/annual_research_snapshot.json` when run.

### Required annual review steps

- Run the Python annual-review script against the official NYC dataset.
- Compare the newly calculated statistics with the currently published City Bites numbers.
- Investigate meaningful changes before replacing public claims.
- Recheck the Don Alex and La Dinastia historical records and any statements about current operating/reopening status.
- Recheck NYC grading, closure, and inspection-process rules for policy changes.
- Review plain-language violation mappings in case NYC wording or schema changed.
- Update the README, research snapshot, and the app's visible **Data freshness** notice.
- Commit approved changes to GitHub `main`.
- Verify that the automatic Vercel production deployment completes successfully.

The production app displays both the **last annual research review date** and the **next scheduled annual review date**. This should not be confused with the live restaurant-search feed, which continues to query NYC Open Data when users search.

## Data source

City Bites uses the [DOHMH New York City Restaurant Inspection Results](https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j/about_data) dataset.

Inspection data measures food-safety conditions found during inspections. It does **not** rate taste, service, price, atmosphere, or whether a restaurant is open at this exact moment.

Additional official resources:

- [NYC Food Establishment Inspections / ABCEats](https://www.nyc.gov/site/doh/services/restaurant-grades.page)
- [NYC Restaurant Letter Grading](https://www.nyc.gov/site/doh/business/food-operators/letter-grading-for-restaurants.page)
- [NYC Restaurant Inspection Process](https://www.nyc.gov/site/doh/business/food-operators/the-inspection-process.page)
- [NYC311 Restaurant Inspection Information](https://portal.311.nyc.gov/article/?kanumber=KA-02955)

## Run locally

This project requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

## Build for Vercel

```bash
npx next build
```

The production site is configured for Vercel through `vercel.json` and deploys from the `main` branch through Vercel's Git integration.

Production site: [City Bites](https://city-bites-blue.vercel.app)

## Long-term direction

City Bites should be allowed to grow beyond the original assignment.

The intended future is a trustworthy, easy-to-understand NYC restaurant inspection companion that gives the public **more context than a single letter grade**, while staying careful, fair, transparent, and grounded in official records.

## Creator

Built by **Crystal Watson** as a public-facing data product that makes restaurant inspection information easier to understand and use.

© 2026 Crystal Watson. All rights reserved.
