"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ApiRow = {
  camis: string;
  dba: string;
  boro?: string;
  building?: string;
  street?: string;
  zipcode?: string;
  cuisine_description?: string;
  inspection_date: string;
  action?: string;
  score?: string;
  grade?: string;
  violation_description?: string;
  critical_flag?: string;
};

type Restaurant = {
  camis: string;
  name: string;
  borough: string;
  address: string;
  zipcode: string;
  cuisine: string;
  inspectionDate: string;
  action: string;
  score: number | null;
  grade: string;
  violations: { description: string; critical: boolean }[];
};

const API = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
const PAGE_SIZE = 6;

const cuisines = [
  "American", "Bakery Products/Desserts", "Caribbean", "Chinese", "Coffee/Tea",
  "Dominican", "French", "Indian", "Italian", "Japanese", "Jewish/Kosher",
  "Korean", "Latin American", "Mediterranean", "Mexican", "Pizza", "Seafood",
  "Soul Food", "Spanish", "Thai",
];

const evidence = {
  donAlex: {
    name: "Don Alex",
    place: "Corona, Queens",
    date: "February 5, 2024",
    outcome: "Stayed open",
    score: 50,
    critical: 7,
    violations: [
      "Cold food was held above the required safe temperature.",
      "Evidence of mice or live mice was found.",
      "Evidence of rats or live rats was found.",
      "Filth flies or other food-, refuse-, or sewage-associated flies were present.",
      "Food, supplies, or equipment were not protected from contamination.",
      "Live roaches were present.",
      "A required hand-washing facility was missing, blocked, inaccessible, or lacked proper water, soap, or hand drying.",
      "Drainage, sewage disposal, condensation, or liquid-waste handling was inadequate.",
      "Conditions allowed rodents, insects, or other pests to harbor.",
      "Non-food-contact surfaces or equipment were unsuitable, unclean, or difficult to clean.",
      "A pesticide or another toxic chemical was improperly labeled, used, stored, or secured.",
      "Single-use items were missing, reused, or not protected from contamination.",
    ],
    officialUrl: "https://data.cityofnewyork.us/resource/43nn-pn8j.json?$where=camis%3D%2750106885%27%20AND%20inspection_date%3D%272024-02-05T00%3A00%3A00.000%27&$order=violation_description",
  },
  laDinastia: {
    name: "La Dinastia",
    place: "Upper West Side, Manhattan",
    date: "June 3, 2025",
    outcome: "Closed by DOHMH",
    score: 50,
    critical: 4,
    violations: [
      "Cold food was held above the required safe temperature.",
      "Evidence of mice or live mice was found.",
      "Food, supplies, or equipment were not protected from contamination.",
      "Live roaches were present.",
      "Conditions allowed rodents, insects, or other pests to harbor.",
      "Non-food-contact surfaces or equipment were unsuitable, unclean, or difficult to clean.",
    ],
    officialUrl: "https://data.cityofnewyork.us/resource/43nn-pn8j.json?$where=camis%3D%2750032768%27%20AND%20inspection_date%3D%272025-06-03T00%3A00%3A00.000%27&$order=violation_description",
  },
};

function escapeSocrata(value: string) {
  return value.replaceAll("'", "''").replaceAll("%", "");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function recordUrl(restaurant: Restaurant) {
  const where = `camis='${restaurant.camis}' AND inspection_date='${restaurant.inspectionDate}'`;
  const params = new URLSearchParams({ "$where": where, "$order": "violation_description" });
  return `${API}?${params.toString()}`;
}

function simplifyViolation(description: string) {
  const text = description.toLowerCase();
  if (text.includes("non-food contact surface") || text.includes("nonfood contact surface")) return "A surface or piece of equipment that does not touch food was not properly made, sealed, placed, or kept clean.";
  if (text.includes("food contact surface") && (text.includes("washed") || text.includes("sanitized") || text.includes("clean"))) return "A surface that touches food was not properly cleaned, rinsed, sanitized, maintained, or used.";
  if (text.includes("cold tcs food") || text.includes("cold potentially hazardous")) return "Food that must stay cold was held above the required safe temperature.";
  if (text.includes("hot tcs food") || text.includes("hot potentially hazardous")) return "Food that must stay hot was held below the required safe temperature.";
  if (text.includes("evidence of mice") || text.includes("live mice")) return "Evidence of mice or live mice was found.";
  if (text.includes("evidence of rats") || text.includes("live rat")) return "Evidence of rats or live rats was found.";
  if (text.includes("live roach")) return "Live roaches were found.";
  if (text.includes("filth flies") || text.includes("food/refuse/sewage-associated")) return "Flies connected with food, trash, or sewage were found.";
  if (text.includes("harborage") || text.includes("conditions conducive")) return "Conditions could allow rodents, insects, or other pests to live or hide there.";
  if (text.includes("hand washing facility") || text.includes("handwashing facility")) return "A required hand-washing area was missing, blocked, inaccessible, or not properly supplied.";
  if (text.includes("not protected from potential source of contamination") || text.includes("food protected from contamination")) return "Food, supplies, or equipment were not properly protected from contamination.";
  if (text.includes("sewage") || text.includes("drainage") || text.includes("backflow")) return "Drainage, sewage, backflow prevention, condensation, or liquid-waste handling was inadequate.";
  if (text.includes("pesticide") || text.includes("toxic chemical")) return "A pesticide or another toxic chemical was improperly labeled, used, stored, or secured.";
  if (text.includes("personal cleanliness")) return "A food worker did not follow required personal-cleanliness practices.";
  if (text.includes("single service") || text.includes("single-use")) return "Single-use items were missing, reused, or not protected from contamination.";
  return description;
}

function mapUrl(restaurant: Restaurant) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name}, ${restaurant.address}, New York, NY ${restaurant.zipcode}`)}`;
}

function groupLatest(rows: ApiRow[]): Restaurant[] {
  const grouped = new Map<string, Restaurant>();
  for (const row of rows) {
    const existing = grouped.get(row.camis);
    if (!existing) {
      grouped.set(row.camis, {
        camis: row.camis,
        name: row.dba || "Unnamed restaurant",
        borough: row.boro || "New York City",
        address: [row.building, row.street].filter(Boolean).join(" "),
        zipcode: row.zipcode || "",
        cuisine: row.cuisine_description || "Not listed",
        inspectionDate: row.inspection_date,
        action: row.action || "No action listed",
        score: row.score ? Number(row.score) : null,
        grade: row.grade || "Not graded",
        violations: [],
      });
    }
    const current = grouped.get(row.camis)!;
    if (row.inspection_date === current.inspectionDate && row.violation_description && !current.violations.some(v => v.description === row.violation_description)) {
      current.violations.push({ description: simplifyViolation(row.violation_description), critical: row.critical_flag === "Critical" });
    }
  }
  return [...grouped.values()].sort((a, b) => (a.score ?? 999) - (b.score ?? 999) || a.name.localeCompare(b.name));
}

function gradeMessage(restaurant: Restaurant) {
  if (restaurant.grade === "A") return "Strong inspection result";
  if (restaurant.grade === "B") return "Some concerns were found";
  if (restaurant.grade === "C") return "More serious concerns were found";
  return "Review the full record";
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1);
  return (
    <nav className="pagination" aria-label="Restaurant result pages">
      <button onClick={() => onPage(1)} disabled={page === 1}>First</button>
      <button onClick={() => onPage(page - 1)} disabled={page === 1}>Previous</button>
      <div className="page-numbers">
        {pages.map((n, i) => <span key={n}>{i > 0 && pages[i - 1] !== n - 1 ? <i>…</i> : null}<button className={n === page ? "current" : ""} onClick={() => onPage(n)} aria-current={n === page ? "page" : undefined}>{n}</button></span>)}
      </div>
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}>Next</button>
      <button onClick={() => onPage(totalPages)} disabled={page === totalPages}>Last</button>
    </nav>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [borough, setBorough] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [grade, setGrade] = useState("A");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [light, setLight] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [lastSearch, setLastSearch] = useState("Recent A-grade restaurants");
  const searchId = useRef(0);

  const totalPages = Math.max(1, Math.ceil(restaurants.length / PAGE_SIZE));
  const visibleRestaurants = useMemo(() => restaurants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [restaurants, page]);

  useEffect(() => {
    const update = () => setShowBackToTop(window.scrollY > 500);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  async function searchRestaurants(next?: { query?: string; borough?: string; cuisine?: string; grade?: string }) {
    const requestId = ++searchId.current;
    const q = next?.query ?? query;
    const b = next?.borough ?? borough;
    const c = next?.cuisine ?? cuisine;
    const g = next?.grade ?? grade;
    setLoading(true);
    setError("");
    setPage(1);
    try {
      const conditions = ["grade IS NOT NULL"];
      if (g !== "all") conditions.push(`grade='${escapeSocrata(g)}'`);
      if (b) conditions.push(`boro='${escapeSocrata(b)}'`);
      if (c) conditions.push(`cuisine_description='${escapeSocrata(c)}'`);
      if (q.trim()) {
        const safe = escapeSocrata(q.trim().toUpperCase());
        conditions.push(/^\d{5}$/.test(safe) ? `zipcode='${safe}'` : `upper(dba) like '%${safe}%'`);
      }
      const params = new URLSearchParams({
        "$select": "camis,dba,boro,building,street,zipcode,cuisine_description,inspection_date,action,score,grade,violation_description,critical_flag",
        "$where": conditions.join(" AND "),
        "$order": "inspection_date DESC",
        "$limit": "1200",
      });
      const response = await fetch(`${API}?${params.toString()}`);
      if (!response.ok) throw new Error("The NYC data service did not answer.");
      const rows = (await response.json()) as ApiRow[];
      const grouped = groupLatest(rows).slice(0, 120);
      if (requestId !== searchId.current) return;
      setRestaurants(grouped);
      setLastSearch(q.trim() ? `Results for “${q.trim()}”` : `${g === "all" ? "Graded" : `${g}-grade`} restaurants${b ? ` in ${b}` : ""}${c ? ` · ${c}` : ""}`);
      if (!grouped.length) setError("No matching restaurants were found. Try a shorter name, another borough, or all grades.");
    } catch {
      if (requestId !== searchId.current) return;
      setRestaurants([]);
      setError("NYC Open Data is taking too long to answer. Please try again in a moment.");
    } finally {
      if (requestId === searchId.current) setLoading(false);
    }
  }

  useEffect(() => { searchRestaurants({ query: "", borough: "", cuisine: "", grade: "A" }); }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const values = {
      query: String(form.get("query") || ""),
      borough: String(form.get("borough") || ""),
      cuisine: String(form.get("cuisine") || ""),
      grade: String(form.get("grade") || "A"),
    };
    setQuery(values.query); setBorough(values.borough); setCuisine(values.cuisine); setGrade(values.grade);
    searchRestaurants(values);
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  }

  function clearSearch() {
    setQuery(""); setBorough(""); setCuisine(""); setGrade("A");
    searchRestaurants({ query: "", borough: "", cuisine: "", grade: "A" });
  }

  return (
    <main className={light ? "site light" : "site"} id="top">
      <header className="nav-wrap">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="City Bites home"><span className="brand-mark">CB</span><span>City Bites</span></a>
          <div className="nav-links">
            <a href="#find">Find a restaurant</a>
            <a href="#understand">Understand grades</a>
            <a href="#story">The investigation</a>
            <button className="theme-button" onClick={() => setLight(!light)} aria-label={`Switch to ${light ? "dark" : "light"} mode`}><span aria-hidden="true">{light ? "☾" : "☀"}</span> {light ? "Dark" : "Light"}</button>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-copy">
          <p className="kicker"><span /> NYC restaurant inspection guide</p>
          <h1>Find a place to eat<br /><em>with more confidence.</em></h1>
          <p className="dek">City Bites turns complicated public inspection records into clear, useful information—so you can compare restaurants before you choose.</p>
          <a className="primary-button" href="#find">Find a restaurant <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-promise" aria-label="What City Bites helps with">
          <p>Search</p><strong>5</strong><span>boroughs</span>
          <div /><p>Understand</p><strong>A–C</strong><span>inspection grades</span>
          <div /><p>Compare</p><strong>clear</strong><span>safety findings</span>
        </div>
      </section>

      <section className="finder section" id="find">
        <div className="finder-heading">
          <div><p className="kicker"><span /> Start here</p><h2>What are you<br />hungry for?</h2></div>
          <p>Search a restaurant name or ZIP code, then narrow the results by borough, cuisine, or inspection grade.</p>
        </div>
        <form className="search-panel" onSubmit={submitSearch}>
          <label className="search-field"><span>Restaurant name or ZIP code</span><div><span aria-hidden="true">⌕</span><input name="query" value={query} onChange={e => setQuery(e.target.value)} placeholder="Try Sylvia’s or 10027" /></div></label>
          <label><span>Borough</span><select name="borough" value={borough} onChange={e => setBorough(e.target.value)}><option value="">All boroughs</option>{["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"].map(item => <option key={item}>{item}</option>)}</select></label>
          <label><span>Cuisine</span><select name="cuisine" value={cuisine} onChange={e => setCuisine(e.target.value)}><option value="">All cuisines</option>{cuisines.map(item => <option key={item}>{item}</option>)}</select></label>
          <label><span>Latest listed grade</span><select name="grade" value={grade} onChange={e => setGrade(e.target.value)}><option value="A">A only</option><option value="B">B only</option><option value="C">C only</option><option value="all">All grades</option></select></label>
          <button className="search-button" type="submit">Search restaurants <span aria-hidden="true">→</span></button>
          <button className="clear-button" type="button" onClick={clearSearch}>Clear</button>
        </form>
        <div className="search-note"><span aria-hidden="true">ⓘ</span><p><strong>Food safety, made easier.</strong> City Bites uses official NYC inspection data. It does not rate taste, service, price, or atmosphere—and a listing does not confirm today’s hours.</p></div>
      </section>

      <section className="results section" id="results" aria-live="polite">
        <div className="results-heading">
          <div><p className="kicker"><span /> Live NYC Open Data</p><h2>{lastSearch}</h2></div>
          {!loading && <p><strong>{restaurants.length}</strong> restaurant{restaurants.length === 1 ? "" : "s"} found</p>}
        </div>
        {!loading && restaurants.length > PAGE_SIZE && <Pagination page={page} totalPages={totalPages} onPage={setPage} />}
        {loading && <div className="loading-card"><span /><p>Checking the latest listed inspection records…</p></div>}
        {error && <div className="empty-state"><strong>No plates on this table yet.</strong><p>{error}</p></div>}
        {!loading && visibleRestaurants.length > 0 && <div className="result-grid">
          {visibleRestaurants.map(restaurant => (
            <article className="result-card" key={restaurant.camis}>
              <div className="result-card-top"><div className={`grade grade-${restaurant.grade.toLowerCase()}`} aria-label={`Grade ${restaurant.grade}`}>{restaurant.grade}</div><div><span>{restaurant.cuisine}</span><h3>{restaurant.name}</h3><p>{restaurant.address}<br />{restaurant.borough}, NY {restaurant.zipcode}</p></div></div>
              <div className="inspection-summary"><div><span>Latest listed inspection</span><strong>{formatDate(restaurant.inspectionDate)}</strong></div><div><span>Score</span><strong>{restaurant.score ?? "—"}</strong></div></div>
              <p className="signal"><span aria-hidden="true">{restaurant.grade === "A" ? "✓" : "!"}</span><strong>{gradeMessage(restaurant)}</strong></p>
              {restaurant.violations.length ? <details><summary>Plain-language findings <span>+</span></summary><ul>{restaurant.violations.slice(0, 4).map(v => <li key={v.description}><b className={v.critical ? "critical-dot" : ""} />{v.description}</li>)}</ul>{restaurant.violations.length > 4 && <p>Plus {restaurant.violations.length - 4} more finding{restaurant.violations.length - 4 === 1 ? "" : "s"} in the official record.</p>}</details> : <p className="no-findings">No violation descriptions are attached to this listed inspection.</p>}
              <div className="card-actions"><a href={recordUrl(restaurant)} target="_blank" rel="noreferrer">Official record ↗</a><a href={mapUrl(restaurant)} target="_blank" rel="noreferrer">Map & hours ↗</a></div>
            </article>
          ))}
        </div>}
        {!loading && restaurants.length > PAGE_SIZE && <Pagination page={page} totalPages={totalPages} onPage={setPage} />}
        <p className="results-disclaimer">Results show up to 120 restaurants from the newest matching graded inspection records returned by NYC Open Data. Always confirm the posted grade and current operating status at the restaurant.</p>
      </section>

      <section className="grade-guide section" id="understand">
        <div className="grade-copy"><p className="kicker"><span /> Read the grade</p><h2>A letter can tell you<br />where to look closer.</h2><p>NYC inspection points are violations—not rewards. A lower score is better. The grade summarizes food-safety conditions found during an inspection, not whether the food tastes good.</p><a href="https://www.nyc.gov/site/doh/business/food-operators/letter-grading-for-restaurants.page" target="_blank" rel="noreferrer">How NYC grades restaurants ↗</a></div>
        <div className="grade-scale">
          <article><strong>A</strong><div><span>0–13 points</span><h3>Strongest range</h3><p>Fewest violation points in the NYC grading scale.</p></div></article>
          <article><strong>B</strong><div><span>14–27 points</span><h3>More concerns</h3><p>Review the findings and how recent the inspection is.</p></div></article>
          <article><strong>C</strong><div><span>28+ points</span><h3>Highest concern range</h3><p>Look carefully at violations and enforcement actions.</p></div></article>
        </div>
      </section>

      <section className="story section" id="story">
        <div className="story-intro"><p className="kicker"><span /> Why context matters</p><h2>Same score.<br /><em>Different fate.</em></h2><p>This real comparison is one lesson inside City Bites—not the whole app. It shows why diners should read the grade, findings, date, and enforcement action together.</p></div>
        <div className="comparison-grid">
          {[evidence.donAlex, evidence.laDinastia].map((item, index) => <article className={index ? "teal" : "coral"} key={item.name}><div className="comparison-top"><span>{item.place}</span><b>{item.outcome}</b></div><strong className="big-score">{item.score}</strong><h3>{item.name}</h3><p>{item.date}</p><div className="comparison-metrics"><span><strong>{item.violations.length}</strong> findings</span><span><strong>{item.critical}</strong> marked critical</span></div><details><summary>See every finding in plain English <span>+</span></summary><ol>{item.violations.map(v => <li key={v}>{v}</li>)}</ol><a href={item.officialUrl} target="_blank" rel="noreferrer">Open this exact official record ↗</a></details></article>)}
        </div>
        <div className="investigation-status">
          <div><span className="status-pill">Investigation in progress</span><h3>We asked DOHMH what the public data cannot explain.</h3></div>
          <div><p>A FOIL request was submitted and acknowledged on <strong>August 7, 2026</strong>. It was assigned control number <strong>2026FR01025</strong> and sent to Food Safety and Community Sanitation.</p><p>We are waiting for records that may explain why the two 50-point inspections led to different outcomes. City Bites will not claim to know the reason until the records arrive.</p><a href="https://www.nyc.gov/site/doh/about/ogc-foil.page" target="_blank" rel="noreferrer">Current DOHMH records-request page ↗</a></div>
        </div>
      </section>

      <section className="purpose section"><p className="kicker"><span /> Built for the public</p><h2>Clear facts.<br />Better questions.<br /><em>More confident choices.</em></h2><p>City Bites is for diners, families, community members, journalists, and researchers who want inspection information they can actually understand and use.</p><a className="primary-button" href="#find">Search restaurants ↑</a></section>

      <footer><div><span className="brand-mark">CB</span><strong>City Bites</strong></div><p>Public inspection data, made easier.</p><p>© 2026 Crystal Watson. All rights reserved.</p></footer>
      <a className={`back-to-top ${showBackToTop ? "visible" : ""}`} href="#top" aria-label="Back to the top of the page" title="Back to top"><span aria-hidden="true">↑</span></a>
    </main>
  );
}
