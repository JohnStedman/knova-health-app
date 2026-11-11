import { useState } from "react";
import { addUpload, downloadText, nextBooking, releasedResults, resetDemo, update, useDemo, useUploads, validateUpload } from "@/lib/prevent-store";
import { announce, Card, Check, Modal, Switch, Tabs } from "./ui";
import { Head, Row, type Nav } from "./screen-layout";
const GOALS = ["Heart health", "Energy & sleep", "Metabolic health", "Longevity planning"];
export function Journey({ go }: Nav) {
  const s = useDemo(); const [g, setG] = useState(s.intake.goals); const [h, setH] = useState(s.intake.history); const [c, setC] = useState(s.intake.consent); const [err, setErr] = useState("");
  const steps = [["Health history", s.intake.saved], ["Clinician review", s.intake.saved && !!nextBooking(s)], ["Testing", releasedResults(s).length > 0], ["Follow-up", s.plan.actions.some((a) => a.done)]] as const;
  const done = steps.filter((x) => x[1]).length;
  return (<>
    <Head eyebrow="Onboarding" title="Your journey" sub={`${done} of 4 stages complete`} />
    <div className="pv-progress" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={4} aria-label="Journey progress"><span style={{ width: `${done * 25}%` }} /></div>
    <Card><ol className="pv-timeline">{steps.map(([t, d]) => <li key={t} className={d ? "done" : ""}>{t}</li>)}</ol></Card>
    <Card><h3>Health intake (demo)</h3>
      <fieldset className="pv-fieldset"><legend>Your goals</legend>
        {GOALS.map((x) => <Check key={x} label={x} checked={g.includes(x)} onChange={(v) => setG(v ? [...g, x] : g.filter((y) => y !== x))} />)}
      </fieldset>
      <label className="pv-label">Brief history (fictional only)<textarea value={h} onChange={(e) => setH(e.target.value)} rows={3} placeholder="Do not enter real health information" /></label>
      <Check label="Required: I understand this is a fictional prototype and consent to demo data being stored on this device." checked={c} onChange={setC} />
      {err && <p className="pv-error" role="alert">{err}</p>}
      <button className="pv-btn pv-btn-primary" onClick={() => {
        if (!c) return setErr("Prototype consent is required to save intake.");
        if (!g.length) return setErr("Choose at least one goal.");
        setErr(""); update((st) => ({ ...st, intake: { goals: g, history: h, consent: c, saved: true } })); announce("Demo intake saved. Next step updated.");
      }}>Save demo intake</button>
      {s.intake.saved && <button className="pv-btn" onClick={() => go("bookings")}>Next: book clinician review</button>}
    </Card>
  </>);
}

export function Profile({ go }: Nav) {
  const [confirm, setConfirm] = useState(false);
  const s = useDemo(); const p = s.profile; const set = (k: keyof typeof p, v: string | boolean) => update((st) => ({ ...st, profile: { ...st.profile, [k]: v } }));
  return (<>
    <Head eyebrow="Profile" title="Profile & preferences" />
    <Card><label className="pv-label">Display name (demo)<input value={p.name} maxLength={30} onChange={(e) => set("name", e.target.value || "Alex")} /></label>
      <p className="pv-small pv-muted">No login. This prototype has no accounts or security; never enter real details.</p></Card>
    <Card><h3>Required prototype consent</h3><p className="pv-small">{s.intake.consent ? "✓ Given during intake (demo storage on this device)." : "Not yet given — complete intake."}</p></Card>
    <Card><h3>Notifications (simulated)</h3>
      <Switch label="Appointment reminders" checked={p.reminders} onChange={(v) => set("reminders", v)} />
      <Switch label="Result release alerts" checked={p.resultAlerts} onChange={(v) => set("resultAlerts", v)} />
    </Card>
    <Card><h3>More</h3>
      <Row onClick={() => go("documents")}><span>Documents & uploads</span></Row>
      <Row onClick={() => go("mhr")}><span>My Health Record (planned)</span></Row>
      <Row onClick={() => go("integrations")}><span>Connected devices</span></Row>
    </Card>
    <Card><h3>Optional sharing</h3><p className="pv-small pv-muted">Optional — not required to use Knova. Nothing is actually shared.</p>
      <Switch label="Share summary with my GP" checked={p.shareGp} onChange={(v) => set("shareGp", v)} />
      <Switch label="De-identified research" checked={p.research} onChange={(v) => set("research", v)} />
    </Card>
    <Card><h3>About this demo</h3><p className="pv-small">Fictional data; no live services. Bookings, consultations, My Health Record and devices are simulated. Data stays in this browser.</p>
      {confirm ? <div className="pv-btns"><button className="pv-btn" onClick={() => setConfirm(false)}>Keep data</button><button className="pv-btn pv-btn-danger" onClick={() => { resetDemo(); setConfirm(false); announce("Demo data reset."); }}>Confirm reset</button></div>
        : <button className="pv-btn" onClick={() => setConfirm(true)}>Reset demo</button>}</Card>
  </>);
}

export function Documents() {
  const s = useDemo(); const ups = useUploads(); const [err, setErr] = useState(""); const [view, setView] = useState<string | null>(null);
  const doc = s.docs.find((d) => d.id === view);
  return (<>
    <Head eyebrow="Records" title="Documents & uploads" />
    {s.docs.map((d) => <Card key={d.id}><h3>{d.name}</h3><p className="pv-small pv-muted">{d.kind} · {d.status}</p>
      <div className="pv-btns"><button className="pv-btn" onClick={() => setView(d.id)}>View</button><button className="pv-btn" onClick={() => downloadText(`${d.id}-sample.txt`, d.content)}>Download sample</button></div></Card>)}
    <Card><h3>Attach prior results (sample files only)</h3>
      <p className="pv-small pv-muted">PDF/PNG/JPEG/TXT up to 5 MB. Kept in this browser tab only; never uploaded or sent to a clinician.</p>
      <label className="pv-btn pv-file">Choose sample file<input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={(e) => {
        const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
        const v = validateUpload(f); if (v) { setErr(v); return; }
        setErr(""); addUpload({ id: `${Date.now()}`, name: f.name, type: f.type, size: f.size }); announce(`${f.name} attached for this session only.`);
      }} /></label>
      {err && <p className="pv-error" role="alert">{err}</p>}
      {ups.map((u) => <div key={u.id} className="pv-row-static"><span>{u.name}</span><span className="pv-small pv-muted">Session only · not sent for review</span></div>)}
    </Card>
    {doc && <Modal title={doc.name} onClose={() => setView(null)}><pre className="pv-pre">{doc.content}</pre></Modal>}
  </>);
}

const MHR_TABS = ["Overview", "Documents", "Medicines", "Access"] as const;
export function Mhr() {
  const s = useDemo(); const [t, setT] = useState<(typeof MHR_TABS)[number]>("Overview");
  return (<>
    <Head eyebrow="National record" title="My Health Record" />
    <div className="pv-banner">Planned integration · not connected. Sample records only.</div>
    <Tabs items={MHR_TABS} value={t} onChange={setT} label="My Health Record sections" />
    <Card>
      {t === "Overview" && <><h3>Overview (sample)</h3><p>Allergies: none recorded (sample). Immunisations: 3 sample entries.</p></>}
      {t === "Documents" && <ul className="pv-list"><li>Shared health summary — sample</li><li>Pathology report — sample</li><li>Event summary — sample</li></ul>}
      {t === "Medicines" && <ul className="pv-list"><li>No sample medicines dispensed</li></ul>}
      {t === "Access" && <><ul className="pv-list"><li>Sample access log: Demo clinic viewed overview</li><li>Sample access log: Participant viewed documents</li></ul>
        <Switch label="Illustrative sharing preference" hint="Not connected — no data is accessed or shared." checked={s.mhrSharing} onChange={(v) => update((st) => ({ ...st, mhrSharing: v }))} /></>}
    </Card>
    <p className="pv-small pv-muted">No ADHA connection, data-residency or compliance claims are made by this prototype.</p>
  </>);
}

