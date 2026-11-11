import { useState } from "react";
import { releasedCareNote, releasedResults, useDemo, type Result } from "@/lib/prevent-store";
import { Button } from "@/components/ui/button";
import { Card, Modal, Pill, Tabs } from "./ui";
import { Head, FullAction, type Nav } from "./screen-layout";
const FILTERS = ["All", "Action", "Monitor", "In range"] as const;
export function Results({ go }: Nav) {
  const s = useDemo();
  const [query, setQuery] = useState("");
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = useState<Result | null>(null);
  const [filters, setFilters] = useState(false);
  const list = releasedResults(s)
    .filter((r) => r.category !== "Hormones" && r.category !== "Clinician-directed")
    .filter((r) => `${r.name} ${r.category}`.toLowerCase().includes(query.toLowerCase()))
    .filter(
      (r) =>
        f === "All" || (f === "In range" ? r.status === "in-range" : r.status === f.toLowerCase()),
    );
  return (
    <>
      <Head
        eyebrow="Reviewed report"
        title="Result details"
        sub="Current results, normal ranges and clinician context."
      />
      <div className="pv-results-table" role="table" aria-label="Reviewed biomarkers">
        <div className="pv-table-row pv-table-head" role="row">
          <span role="columnheader">Biomarker</span>
          <span role="columnheader">Your result</span>
          <span role="columnheader">Normal range</span>
        </div>
        {list.map((r) => (
          <div className="pv-table-row" role="row" key={r.id}>
            <span role="cell">
              <Button variant="prototype" className="pv-marker-link" onClick={() => setOpen(r)}>
                <i className={`pv-status-dot pv-dot-${r.status}`} />
                <strong>{r.name}</strong>
              </Button>
            </span>
            <span role="cell">
              {r.value} {r.unit}
            </span>
            <span role="cell">{r.range.replace("Illustrative ", "")}</span>
          </div>
        ))}
        {!list.length && (
          <div className="pv-empty">
            <h3>No matching results</h3>
            <p>Try another marker or show all results.</p>
            <Button
              className="pv-btn"
              onClick={() => {
                setQuery("");
                setF("All");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      <Card>
        <h3>Clinician note</h3>
        <p className="pv-small pv-muted">
          {releasedCareNote(s) ?? "Awaiting clinician review and release. No draft note is shown."}
        </p>
        <p className="pv-small pv-muted">
          Values and ranges are illustrative, not a diagnostic algorithm.
        </p>
      </Card>
      <FullAction onClick={() => go("plan")}>View your personal plan</FullAction>
      <FullAction onClick={() => go("care")}>Ask the care team</FullAction>
      <details className="pv-wide pv-extra-options">
        <summary>More result options</summary>{" "}
        <div className="pv-result-tools pv-wide">
          <Button
            className="pv-text-link"
            onClick={() => setFilters(!filters)}
            aria-expanded={filters}
          >
            Search & filter markers
          </Button>
          <span className="pv-small pv-muted" role="status">
            {list.length} reviewed markers
          </span>
        </div>
        {filters && (
          <div className="pv-wide">
            <label className="pv-label">
              Search markers
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by marker or category"
              />
            </label>
            <Tabs items={FILTERS} value={f} onChange={setF} label="Filter results" />
          </div>
        )}
        <div className="pv-btns pv-wide">
          <Button variant="prototype" className="pv-mini-btn" onClick={() => go("hormones")}>
            Hormones & screening
          </Button>
          <Button variant="prototype" className="pv-mini-btn" onClick={() => go("biological")}>
            Biological age
          </Button>
          <Button variant="prototype" className="pv-mini-btn" onClick={() => go("care-summary")}>
            Care summary
          </Button>
        </div>
      </details>
      {open && (
        <Modal title={open.name} onClose={() => setOpen(null)}>
          <span className="pv-big">
            {open.value} {open.unit}
          </span>
          <Pill status={open.status} />
          <p>Range: {open.range}</p>
          <p>
            <b>Clinician note (sample):</b> {open.note}
          </p>
          <div className="pv-btns">
            <Button
              className="pv-btn"
              onClick={() => {
                setOpen(null);
                go("plan");
              }}
            >
              View plan
            </Button>
            <Button
              className="pv-btn"
              onClick={() => {
                setOpen(null);
                go("care");
              }}
            >
              Ask the care team
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function Hormones({ go }: Nav) {
  const s = useDemo();
  const hs = releasedResults(s).filter((r) => r.category === "Hormones");
  const cd = releasedResults(s).filter((r) => r.category === "Clinician-directed");
  const [open, setOpen] = useState<Result | null>(null);
  return (
    <>
      <Head
        eyebrow="Expanded tests"
        title="Hormones & screening"
        sub="Cortisol, testosterone and clinician-directed screening markers."
      />
      <Card>
        <h3>Hormones</h3>
        {hs.map((r) => (
          <div className="pv-metric" key={r.id}>
            <Button variant="prototype" className="pv-marker-link" onClick={() => setOpen(r)}>
              <span>
                <strong>{r.name}</strong>
                <small>{r.range}</small>
              </span>
            </Button>
            <b>
              {r.value} {r.unit}
            </b>
          </div>
        ))}
      </Card>
      <Card>
        <h3>Clinician-directed screening</h3>
        {cd.length ? (
          cd.map((r) => (
            <div className="pv-metric" key={r.id}>
              <Button variant="prototype" className="pv-marker-link" onClick={() => setOpen(r)}>
                <span>
                  <strong>{r.name}</strong>
                  <small>Clinically indicated only</small>
                </span>
              </Button>
              <b>
                {r.value} {r.unit}
              </b>
            </div>
          ))
        ) : (
          <>
            <p className="pv-small pv-muted">No clinician-directed markers released.</p>
            {["PSA", "CEA", "CA19-9", "CA125"].map((name) => (
              <div className="pv-metric" key={name}>
                <span>
                  <strong>{name}</strong>
                  <small>Clinician-directed only</small>
                </span>
                <span className="pv-small pv-muted">Not released</span>
              </div>
            ))}
          </>
        )}
      </Card>
      <p className="pv-small pv-muted pv-wide">
        PSA, CEA, CA19-9 and CA125 are only ordered when your clinician directs them. They are not
        general screening tests and cannot diagnose cancer on their own.
      </p>
      <FullAction onClick={() => go("plan")}>View your personal plan</FullAction>
      <FullAction onClick={() => go("care")}>Ask the care team</FullAction>
      {open && (
        <Modal title={open.name} onClose={() => setOpen(null)}>
          <p>
            {open.value} {open.unit} · {open.range}
          </p>
          <p>{open.note}</p>
          <Pill status={open.status} />
        </Modal>
      )}
    </>
  );
}
export function Biological({ go }: Nav) {
  const [explain, setExplain] = useState(false);
  return (
    <>
      <Head
        eyebrow="Reviewed result"
        title="Your biological age"
        sub="An illustrative composite based on sample biomarkers and health signals."
      />
      <Card tone="pastel" className="pv-feature pv-bio">
        <strong>Your Biological Age</strong>
        <div className="pv-age">
          43<span>years</span>
        </div>
        <div className="pv-age-note">3 years younger</div>
        <small>than the sample chronological age of 46</small>
        <p className="pv-small">Not a validated score, diagnosis or guaranteed outcome.</p>
      </Card>
      <Card>
        <h3>Summary</h3>
        {[
          ["Metabolic Health", "Cardiometabolic sample markers", "Favourable"],
          ["Inflammation", "Reviewed marker context", "Low (sample)"],
          ["Recovery & Resilience", "Sleep and activity", "Focus area"],
        ].map(([title, sub, status]) => (
          <div className="pv-metric" key={title}>
            <Button
              className="pv-marker-link"
              onClick={() => go(title === "Recovery & Resilience" ? "plan" : "results")}
            >
              <span>
                <strong>{title}</strong>
                <small>{sub}</small>
              </span>
            </Button>
            <span className="pv-small pv-summary-value">{status}</span>
          </div>
        ))}
      </Card>
      <FullAction onClick={() => go("trajectory")}>View age trajectory</FullAction>
      <FullAction secondary onClick={() => setExplain(true)}>
        Understand this estimate
      </FullAction>
      {explain && (
        <Modal title="Biological age concept" onClose={() => setExplain(false)}>
          <p>
            Illustrative composite from sample biomarkers, sleep and activity. No validated
            biological-age calculation is connected. Not a diagnosis or guaranteed outcome.
          </p>
          <Button
            className="pv-btn"
            onClick={() => {
              setExplain(false);
              go("results");
            }}
          >
            Review source markers
          </Button>
        </Modal>
      )}
    </>
  );
}
export function CareSummary({ go }: Nav) {
  const s = useDemo();
  const note = releasedCareNote(s);
  const results = releasedResults(s);
  return (
    <>
      <Head
        eyebrow="Reviewed care"
        title="Your care summary."
        sub={`${s.profile.name} · participant preview. Only explicitly released material from the workflow appears here.`}
      />
      <div className="pv-summary-status pv-wide">
        {results.length ? (
          <>
            <h3>Reviewed report available</h3>
            <p>{results.length} reviewed sample markers released.</p>
            <Button variant="prototype" className="pv-text-link" onClick={() => go("results")}>
              View released results
            </Button>
          </>
        ) : (
          <>
            <h3>Report being reviewed</h3>
            <p>Your new report is held until clinician validation and follow-up are complete.</p>
          </>
        )}
      </div>
      {note ? (
        <Card className="pv-wide">
          <h3>Released consultation summary</h3>
          <p className="pv-small">{note}</p>
        </Card>
      ) : (
        <p className="pv-small pv-muted pv-wide">
          No consultation summary has been released. Draft scribe content is not shown here.
        </p>
      )}
      <FullAction secondary onClick={() => go("consult")}>
        Go to consultation
      </FullAction>
      <details className="pv-wide pv-extra-options">
        <summary>Care follow-up</summary>
        <div className="pv-btns">
          <Button variant="prototype" className="pv-mini-btn" onClick={() => go("plan")}>
            View your action plan
          </Button>
          <Button variant="prototype" className="pv-mini-btn" onClick={() => go("care")}>
            Message care team
          </Button>
        </div>
      </details>
    </>
  );
}
