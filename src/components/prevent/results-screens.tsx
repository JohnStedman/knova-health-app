import { useState } from "react";
import { releasedCareNote, releasedResults, useDemo } from "@/lib/prevent-store";
import { Card, Pill, Tabs } from "./ui";
import { Head, type Nav } from "./screen-layout";
const FILTERS = ["All", "Action", "Monitor", "In range"] as const;
export function Results({ go }: Nav) {
  const [query, setQuery] = useState("");
  const s = useDemo(); const [f, setF] = useState<(typeof FILTERS)[number]>("All"); const [open, setOpen] = useState<string | null>(null);
  const list = releasedResults(s).filter((r) => r.category !== "Hormones" && r.category !== "Clinician-directed").filter((r) => `${r.name} ${r.category}`.toLowerCase().includes(query.toLowerCase())).filter((r) => f === "All" || (f === "In range" ? r.status === "in-range" : r.status === f.toLowerCase()));
  return (<>
    <Head eyebrow="Understand your results" title="Your results" sub="Clinician-reviewed. Values and ranges are illustrative." />
    <label className="pv-label">Search markers<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by marker or category" /></label>
    <Tabs items={FILTERS} value={f} onChange={setF} label="Filter results" />
    <p className="pv-small pv-muted" role="status">{list.length} reviewed markers</p>
    <div className="pv-result-grid">{list.map((r) => <Card key={r.id}><button className="pv-row" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)}>
      <span><b>{r.name}</b><br /><span className="pv-big">{r.value}</span> <span className="pv-muted">{r.unit}</span></span><Pill status={r.status} /></button>
      {open === r.id && <div className="pv-small"><p>Range: {r.range}</p><p><b>Clinician note (sample):</b> {r.note}</p></div>}</Card>)}</div>
    {!list.length && <Card><h3>No matching results</h3><p>Try another marker or show all results.</p><button className="pv-btn" onClick={() => { setQuery(""); setF("All"); }}>Clear filters</button></Card>}
    <p className="pv-small pv-muted">Not a diagnostic algorithm. Values and ranges are illustrative.</p>
    <div className="pv-btns"><button className="pv-btn" onClick={() => go("hormones")}>Hormones & screening</button><button className="pv-btn" onClick={() => go("biological")}>Biological age</button><button className="pv-btn" onClick={() => go("care-summary")}>Care summary</button></div>
  </>);
}

export function Hormones() {
  const s = useDemo(); const hs = releasedResults(s).filter((r) => r.category === "Hormones"); const cd = releasedResults(s).filter((r) => r.category === "Clinician-directed");
  return (<>
    <Head eyebrow="Understand your results" title="Hormones & Screening" />
    {hs.map((r) => <Card key={r.id}><div className="pv-row-static"><span><b>{r.name}</b><br /><span className="pv-big">{r.value}</span> {r.unit}</span><Pill status={r.status} /></div><p className="pv-small pv-muted">{r.range} · {r.note}</p></Card>)}
    <Card tone="warn"><h3>Clinician-directed markers</h3>
      <p className="pv-small">PSA, CEA, CA19-9 and CA125 are only ordered when your clinician directs them. They are not general screening tests and cannot diagnose cancer on their own.</p>
      {cd.length ? cd.map((r) => <p key={r.id}><b>{r.name}</b>: {r.value}</p>) : <p className="pv-small pv-muted">No clinician-directed markers released.</p>}
    </Card>
  </>);
}

export function Biological({ go }: Nav) {
  return (<>
    <Head eyebrow="Understand your results" title="Biological Age" />
    <Card tone="pastel"><div className="pv-stats"><div className="pv-stat"><b>46</b>Chronological</div><div className="pv-stat pv-stat-ok"><b>43</b>Illustrative composite</div></div>
      <p className="pv-small">Illustrative composite from sample biomarkers, sleep and activity. Not a validated score, diagnosis or guaranteed outcome.</p></Card>
    <Card><h3>Contributing context</h3><ul className="pv-list"><li>Cardiometabolic markers — favourable (sample)</li><li>Sleep — focus area</li><li>Activity — steady</li></ul></Card>
    <button className="pv-btn" onClick={() => go("trajectory")}>View age trajectory</button>
  </>);
}

export function CareSummary({ go }: Nav) {
  const s = useDemo();
  return (<>
    <Head eyebrow="Understand your results" title="Released care summary" sub="Only content your clinician explicitly released." />
    <Card><h3>Clinician note (sample)</h3><p>{releasedCareNote(s) ?? "Awaiting clinician review and release. No draft note is shown."}</p></Card>
    <Card><h3>Released results</h3><ul className="pv-list">{releasedResults(s).map((r) => <li key={r.id}>{r.name}: {r.value} {r.unit}</li>)}</ul></Card>
    <div className="pv-btns"><button className="pv-btn" onClick={() => go("plan")}>View your action plan</button><button className="pv-btn" onClick={() => go("care")}>Message care team</button></div>
  </>);
}

