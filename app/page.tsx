"use client";

import { useEffect, useState } from "react";

const officialRecordUrl = (camis: string, inspectionDate: string) => {
  const query = new URLSearchParams({
    "$select": "dba,building,street,boro,zipcode,inspection_date,score,action,violation_description,critical_flag",
    "$where": `camis='${camis}' AND inspection_date='${inspectionDate}'`,
    "$order": "violation_description",
  });
  return `https://data.cityofnewyork.us/resource/43nn-pn8j.json?${query.toString()}`;
};

const restaurantEvidence = {
  donAlex: {
    date: "February 5, 2024",
    address: "106-26 Corona Avenue, Corona, Queens",
    outcome: "The official action field says violations were cited; it does not record a closure.",
    officialUrl: officialRecordUrl("50106885", "2024-02-05T00:00:00.000"),
    violations: [
      ["Critical", "Cold food was held above the required safe temperature."],
      ["Critical", "Evidence of mice or live mice was found."],
      ["Critical", "Evidence of rats or live rats was found."],
      ["Critical", "Filth flies or other food-, refuse-, or sewage-associated flies were present."],
      ["Critical", "Food, supplies, or equipment were not protected from contamination."],
      ["Critical", "Live roaches were present."],
      ["Critical", "A required hand-washing facility was missing, blocked, inaccessible, or lacked proper water, soap, or hand drying."],
      ["Not critical", "Drainage, back-flow prevention, sewage disposal, condensation, or liquid-waste handling was inadequate."],
      ["Not critical", "Conditions allowed rodents, insects, or other pests to harbor."],
      ["Not critical", "Non-food-contact surfaces or equipment were unsuitable, unclean, or difficult to clean."],
      ["Not critical", "Pesticide or another toxic chemical was improperly labeled, used, stored, or secured."],
      ["Not critical", "Single-use items were missing, reused, or not protected from contamination."],
    ],
  },
  laDinastia: {
    date: "June 3, 2025",
    address: "145 West 72nd Street, Manhattan",
    outcome: "The official action field says the establishment was closed by DOHMH.",
    officialUrl: officialRecordUrl("50032768", "2025-06-03T00:00:00.000"),
    violations: [
      ["Critical", "Cold food was held above the required safe temperature."],
      ["Critical", "Evidence of mice or live mice was found."],
      ["Critical", "Food, supplies, or equipment were not protected from contamination."],
      ["Critical", "Live roaches were present."],
      ["Not critical", "Conditions allowed rodents, insects, or other pests to harbor."],
      ["Not critical", "Non-food-contact surfaces or equipment were unsuitable, unclean, or difficult to clean."],
    ],
  },
};

const lenses = {
  score: {
    eyebrow: "The headline number",
    title: "50 points each",
    body: "The inspection score creates the impression that these restaurants were in the same position. It is the beginning of the story—not the conclusion.",
  },
  violations: {
    eyebrow: "What was cited",
    title: "12 codes vs. 6 codes",
    body: "Don Alex had twice as many distinct violation codes in the reviewed records, including more marked critical. Yet it remained open while La Dinastia was closed.",
  },
  limits: {
    eyebrow: "What the data leaves out",
    title: "A score cannot explain an outcome",
    body: "A public inspection row does not capture the inspector’s complete reasoning, conditions observed on site, corrections made, or every enforcement detail. That missing context is the real investigation.",
  },
};

type Lens = keyof typeof lenses;

export default function Home() {
  const [lens, setLens] = useState<Lens>("score");
  const [light, setLight] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const updateBackToTop = () => setShowBackToTop(window.scrollY > 450);
    updateBackToTop();
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    return () => window.removeEventListener("scroll", updateBackToTop);
  }, []);

  const scrollToStory = () =>
    document.getElementById("comparison")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className={light ? "site light" : "site"}>
      <header className="nav-wrap">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="City Bites home">
            <span className="brand-mark">CB</span>
            <span>City Bites</span>
          </a>
          <div className="nav-links">
            <a href="#comparison">The comparison</a>
            <a href="#investigation">The investigation</a>
            <button className="theme-button" onClick={() => setLight(!light)} aria-label={`Switch to ${light ? "dark" : "light"} mode`}>
              {light ? "Moon" : "Sun"} <span aria-hidden="true">{light ? "◐" : "◒"}</span>
            </button>
          </div>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <p className="kicker"><span /> A New York City restaurant inspection story</p>
          <h1>Same score.<br /><em>Different fate.</em></h1>
          <p className="dek">Two restaurants received the same alarming inspection score. One was closed. The other stayed open. City Bites asks what a single number can—and cannot—tell us.</p>
          <button className="primary-button" onClick={scrollToStory}>See the two restaurants <span aria-hidden="true">↓</span></button>
        </div>
        <aside className="hero-stat" aria-label="Story summary">
          <span className="stat-label">Shared score</span>
          <strong>50</strong>
          <span className="stat-rule" />
          <p>One number.<br />Two outcomes.</p>
        </aside>
        <div className="scroll-note">Scroll to investigate <span>↓</span></div>
      </section>

      <section className="comparison section" id="comparison">
        <div className="section-heading">
          <p className="kicker"><span /> The comparison</p>
          <h2>At first glance,<br />they look the same.</h2>
          <p>Both inspection records show a score of 50. But the enforcement outcomes tell two very different stories.</p>
        </div>

        <div className="restaurant-grid">
          <article className="restaurant-card coral">
            <div className="card-topline"><span>Queens</span><span className="status open">Stayed open</span></div>
            <div className="score-row"><span>Inspection score</span><strong>50</strong></div>
            <h3>Don Alex</h3>
            <p>Corona, Queens · February 5, 2024</p>
            <div className="metrics">
              <div><strong>12</strong><span>distinct violation codes</span></div>
              <div><strong>7</strong><span>marked critical</span></div>
            </div>
            <p className="outcome"><span aria-hidden="true">✓</span> Restaurant remained open</p>
          </article>

          <div className="versus" aria-hidden="true"><span>same score</span><strong>VS</strong><span>opposite outcomes</span></div>

          <article className="restaurant-card teal">
            <div className="card-topline"><span>Manhattan</span><span className="status closed">Closed</span></div>
            <div className="score-row"><span>Inspection score</span><strong>50</strong></div>
            <h3>La Dinastia</h3>
            <p>West 72nd Street, Manhattan · June 3, 2025</p>
            <div className="metrics">
              <div><strong>6</strong><span>distinct violation codes</span></div>
              <div><strong>4</strong><span>marked critical</span></div>
            </div>
            <p className="outcome"><span aria-hidden="true">×</span> Closed by DOHMH</p>
          </article>
        </div>
        <p className="surprise"><span>The surprise:</span> The restaurant with more cited problems stayed open.</p>
      </section>

      <section className="evidence section" id="evidence" aria-labelledby="evidence-title">
        <div className="section-heading evidence-heading">
          <p className="kicker"><span /> The exact findings</p>
          <h2 id="evidence-title">See what inspectors<br />actually cited.</h2>
          <p>No code numbers or letters. These are plain-English summaries of every violation description attached to each score-50 inspection in the official dataset.</p>
        </div>
        <div className="evidence-grid">
          {([
            ["Don Alex", restaurantEvidence.donAlex, "coral"],
            ["La Dinastia", restaurantEvidence.laDinastia, "teal"],
          ] as const).map(([name, record, color]) => (
            <article className={`evidence-card ${color}`} key={name}>
              <div className="evidence-card-heading">
                <div><p>{record.date}</p><h3>{name}</h3><span>{record.address}</span></div>
                <strong>50</strong>
              </div>
              <p className="recorded-outcome">{record.outcome}</p>
              <ul className="violation-list">
                {record.violations.map(([flag, description]) => (
                  <li key={description}>
                    <span className={flag === "Critical" ? "critical" : "not-critical"}>{flag}</span>
                    <p>{description}</p>
                  </li>
                ))}
              </ul>
              <a className="official-record" href={record.officialUrl} target="_blank" rel="noreferrer">
                Open this exact official record <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
        <p className="evidence-note">Source checked against the NYC DOHMH restaurant-inspection dataset. The two inspections occurred on different dates; this comparison asks why the same score can accompany different recorded actions, not whether the cases were simultaneous.</p>
      </section>

      <section className="lens-section section" aria-labelledby="lens-title">
        <div className="lens-copy">
          <p className="kicker"><span /> Context lens</p>
          <h2 id="lens-title">Change the lens.<br />Change the story.</h2>
          <p>Tap each layer to see why an inspection score should never be read alone.</p>
          <div className="lens-controls" role="group" aria-label="Choose a context lens">
            {(Object.keys(lenses) as Lens[]).map((key, index) => (
              <button key={key} className={lens === key ? "active" : ""} onClick={() => setLens(key)} aria-pressed={lens === key}>
                <span>0{index + 1}</span>{key === "score" ? "Score" : key === "violations" ? "Violations" : "Limits"}
              </button>
            ))}
          </div>
        </div>
        <article className="lens-panel" aria-live="polite">
          <p>{lenses[lens].eyebrow}</p>
          <h3>{lenses[lens].title}</h3>
          <div className={`lens-visual ${lens}`}>
            {lens === "score" && <><strong>50</strong><span>Don Alex</span><i /><strong>50</strong><span>La Dinastia</span></>}
            {lens === "violations" && <><span>Don Alex</span><b style={{"--w":"100%"} as React.CSSProperties}>12</b><span>La Dinastia</span><b style={{"--w":"50%"} as React.CSSProperties}>6</b></>}
            {lens === "limits" && <div className="question-mark">?</div>}
          </div>
          <p className="lens-body">{lenses[lens].body}</p>
        </article>
      </section>

      <section className="investigation section" id="investigation">
        <div className="investigation-copy">
          <p className="kicker"><span /> The unanswered question</p>
          <h2>The dataset shows<br />what happened.<br /><em>Not why.</em></h2>
        </div>
        <div className="steps">
          <article><span>01</span><div><h3>Public record</h3><p>Compare score, violations, critical flags, and recorded action.</p></div></article>
          <article><span>02</span><div><h3>Find the gap</h3><p>The visible fields do not fully explain the different enforcement outcomes.</p></div></article>
          <article><span>03</span><div><h3>Request context</h3><p>Use a Freedom of Information Law request to seek the underlying inspection and enforcement records.</p></div></article>
        </div>
      </section>

      <section className="takeaway section">
        <p className="kicker"><span /> The takeaway</p>
        <blockquote>“A restaurant score is a signal.<br /><em>Context makes it a story.</em>”</blockquote>
        <p>Use inspection data as a starting point. Look at recent grades, violation details, enforcement actions, and dates before drawing a conclusion.</p>
        <div className="source-links">
          <a href="#evidence">See the exact findings ↑</a>
          <a href="https://www.nyc.gov/site/doh/about/ogc-foil.page" target="_blank" rel="noreferrer">Current DOHMH records-request page ↗</a>
        </div>
      </section>

      <footer><span>City Bites</span><p>A public-data story by Crystal Watson</p><p>© 2026 Crystal Watson. All rights reserved.</p></footer>
      <a
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        href="#top"
        aria-label="Back to the top of the page"
        title="Back to top"
      >
        <span aria-hidden="true">↑</span>
      </a>
    </main>
  );
}
