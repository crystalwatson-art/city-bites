# City Bites

City Bites helps New Yorkers find places to dine with more confidence by turning official NYC restaurant inspection records into clear, plain-language information.

## What it does

- Searches live NYC restaurant inspection records by restaurant name or ZIP code
- Filters results by borough, cuisine, and inspection grade
- Explains inspection findings in plain language
- Links each result to its exact NYC Open Data record and a map
- Explains how NYC grades A, B, and C relate to inspection scores
- Compares two real 50-point inspections with different enforcement outcomes
- Tracks the pending FOIL investigation into that difference
- Supports desktop and mobile layouts, keyboard navigation, dark mode, and light mode

## Data source

City Bites uses the [DOHMH New York City Restaurant Inspection Results](https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j/about_data) dataset. Inspection information measures food-safety conditions; it does not rate taste, service, price, atmosphere, or current business hours.

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

The production site is configured for Vercel through `vercel.json`.

## Creator

Built by Crystal Watson as a public-facing data product that makes restaurant inspection information easier to understand and use.
