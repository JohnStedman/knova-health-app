import { useState, type ReactNode } from "react";
import {
  addUpload, advanceConsultation, buildIcs, cancelBooking, consultationBooking, downloadText, nextBooking, releasedCareNote, releasedResults, resetDemo, saveBooking, startConsultation, summaryCounts, update, useDemo, useUploads,
  validateBooking, validateUpload, type Booking, type DemoState, type Provider, type ScreenId,
} from "@/lib/prevent-store";
import { announce, Card, Check, Eyebrow, Modal, Pill, Switch, Tabs } from "./ui";

export interface Nav { go: (id: ScreenId) => void; openBooking: (edit?: Booking) => void }
const fmtDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
const Head = ({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) => (
  <header className="pv-screen-head"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1>{sub && <p className="pv-muted">{sub}</p>}</header>
);
const Row = ({ children, onClick, label }: { children: ReactNode; onClick: () => void; label?: string }) => (
  <button className="pv-row" onClick={onClick} aria-label={label}>{children}<span aria-hidden>›</span></button>
);

function Home({ go, openBooking }: Nav) {
  const s = useDemo(); const c = summaryCounts(s); const nb = nextBooking(s);
  return (<>
    <Head eyebrow="Participant journey" title={`Welcome back, ${s.profile.name}.`} sub="A clearer picture. A practical next step." />
    <Card tone="pastel">
      <Eyebrow>Your next step</Eyebrow>
      <h2>{s.intake.saved ? "Your intake is saved. Get ready for your consult." : "Prepare for your clinician conversation."}</h2>
      <p>Complete your history, add prior results and bring your questions.</p>
      <button className="pv-btn pv-btn-primary" onClick={() => go("journey")}>Explore your journey ↗</button>
    </Card>
    <Card><h3>To-do</h3>
      <Row onClick={() => go("journey")}><span>{s.intake.saved ? "✓ " : ""}Complete health intake</span></Row>
      <Row onClick={() => go("documents")}><span>Add previous results</span></Row>
    </Card>
    <Card><h3>Upcoming care</h3>
      {nb ? <Row onClick={() => go("bookings")}><span><b>{nb.service}</b><br /><span className="pv-muted">{fmtDate(nb.date)} · {nb.time} ACST/ACDT · {nb.mode}</span></span></Row>
        : <button className="pv-btn" onClick={() => openBooking()}>Book an appointment</button>}
    </Card>
    <Card><h3>Health summary</h3>
      <div className="pv-stats">
        <button onClick={() => go("results")} className="pv-stat pv-stat-action"><b>{c.action}</b>Action</button>
        <button onClick={() => go("results")} className="pv-stat pv-stat-monitor"><b>{c.monitor}</b>Monitor</button>
        <button onClick={() => go("results")} className="pv-stat pv-stat-ok"><b>{c.inRange}</b>In range</button>
      </div><p className="pv-small pv-muted">Illustrative counts from released results only.</p>
    </Card>
  </>);
}

const GOALS = ["Heart health", "Energy & sleep", "Metabolic health", "Longevity planning"];
function Journey({ go }: Nav) {
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

function Profile({ go }: Nav) {
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
    <Card><h3>Optional sharing</h3><p className="pv-small pv-muted">Optional — not required to use Prevent. Nothing is actually shared.</p>
      <Switch label="Share summary with my GP" checked={p.shareGp} onChange={(v) => set("shareGp", v)} />
      <Switch label="De-identified research" checked={p.research} onChange={(v) => set("research", v)} />
    </Card>
    <Card><h3>About this demo</h3><p className="pv-small">Fictional data; no live services. Bookings, consultations, My Health Record and devices are simulated. Data stays in this browser.</p>
      {confirm ? <div className="pv-btns"><button className="pv-btn" onClick={() => setConfirm(false)}>Keep data</button><button className="pv-btn pv-btn-danger" onClick={() => { resetDemo(); setConfirm(false); announce("Demo data reset."); }}>Confirm reset</button></div>
        : <button className="pv-btn" onClick={() => setConfirm(true)}>Reset demo</button>}</Card>
  </>);
}

function Documents() {
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
function Mhr() {
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

function Bookings({ go, openBooking }: Nav) {
  const s = useDemo();
  return (<>
    <Head eyebrow="Your appointment" title="Bookings" sub="Demo only — no real appointment or notification." />
    <button className="pv-btn pv-btn-primary" onClick={() => openBooking()}>New booking</button>
    {s.bookings.map((b) => <Card key={b.id}>
      <h3>{b.service} {b.status === "cancelled" && <span className="pv-pill pv-pill-action">Cancelled</span>}</h3>
      <p className="pv-small">{fmtDate(b.date)} · {b.time} Australia/Adelaide · {b.mode}</p>
      {b.status === "confirmed" && <div className="pv-btns">
        {b.mode === "Telehealth" && <button className="pv-btn" onClick={() => { update((st) => startConsultation(st, b.id)); go("consult"); }}>Join (simulated)</button>}
        <button className="pv-btn" onClick={() => openBooking(b)}>Reschedule</button>
        <button className="pv-btn" onClick={() => { update((st) => cancelBooking(st, b.id)); announce("Demo booking cancelled."); }}>Cancel</button>
        <button className="pv-btn" onClick={() => downloadText("prevent-demo-event.ics", buildIcs(b), "text/calendar")}>Demo .ics</button>
      </div>}
    </Card>)}
    <Card><h3>Preparation</h3><ul className="pv-list"><li>Complete intake</li><li>Fast for 10 hours before blood tests</li><li>Write down your questions</li></ul></Card>
  </>);
}

export function BookingForm({ edit, onDone }: { edit?: Booking | undefined; onDone: () => void }) {
  const [f, setF] = useState({ service: edit?.service ?? "", date: edit?.date ?? "", time: edit?.time ?? "", mode: edit?.mode ?? "" });
  const [e, setE] = useState<Partial<Record<"service" | "date" | "time" | "mode", string>>>({});
  const fld = (k: keyof typeof f) => ({ value: f[k], onChange: (ev: { target: { value: string } }) => setF({ ...f, [k]: ev.target.value }), "aria-invalid": !!e[k] });
  return (
    <form noValidate onSubmit={(ev) => {
      ev.preventDefault(); const errs = validateBooking(f); setE(errs); if (Object.keys(errs).length) return;
      const b: Booking = { id: edit?.id ?? `b${Date.now()}`, service: f.service, date: f.date, time: f.time, mode: f.mode as Booking["mode"], status: "confirmed" };
      update((st) => saveBooking(st, b));
      announce(edit ? "Demo booking rescheduled." : "Demo booking confirmed. No real appointment was made."); onDone();
    }}>
      <label className="pv-label">Service<select {...fld("service")}><option value="">Select…</option><option>Clinician consultation</option><option>Blood test & recheck</option><option>Results review</option></select></label>{e.service && <p className="pv-error">{e.service}</p>}
      <label className="pv-label">Date<input type="date" {...fld("date")} /></label>{e.date && <p className="pv-error">{e.date}</p>}
      <label className="pv-label">Time (Australia/Adelaide)<select {...fld("time")}><option value="">Select…</option>{["09:00", "10:30", "13:00", "15:30"].map((t) => <option key={t}>{t}</option>)}</select></label>{e.time && <p className="pv-error">{e.time}</p>}
      <fieldset className="pv-fieldset"><legend>Location</legend>{["Telehealth", "CHG clinic"].map((m) => <label key={m} className="pv-check"><input type="radio" name="mode" checked={f.mode === m} onChange={() => setF({ ...f, mode: m })} /> {m}</label>)}</fieldset>{e.mode && <p className="pv-error">{e.mode}</p>}
      <button className="pv-btn pv-btn-primary" type="submit">{edit ? "Save new time" : "Confirm demo booking"}</button>
    </form>
  );
}

function Consult({ go }: Nav) {
  const s = useDemo(); const c = s.consult; const set = (p: Partial<typeof c>) => update((st) => ({ ...st, consult: { ...st.consult, ...p } }));
  const ready = c.identity && c.privacy && c.device;
  const appointment = consultationBooking(s);
  if (!appointment) return <><Head eyebrow="Your appointment" title="Telehealth consultation" /><Card><h3>No confirmed telehealth appointment</h3><p>A cancelled appointment cannot enter a consultation.</p><button className="pv-btn" onClick={() => go("bookings")}>View bookings</button></Card></>;
  return (<>
    <Head eyebrow="Your appointment" title="Telehealth consultation" sub="Simulated — no camera, microphone or call is used." />
    <div className="pv-banner">{appointment.service} · {fmtDate(appointment.date)} · {appointment.time} Australia/Adelaide</div>
    {c.phase === "checks" && <Card><h3>Before you join</h3>
      <Check label="I confirm my identity (demo)" checked={c.identity} onChange={(v) => set({ identity: v })} />
      <Check label="I'm in a private space and consent to a telehealth consult" checked={c.privacy} onChange={(v) => set({ privacy: v })} />
      <Check label="Device check passed (simulated)" checked={c.device} onChange={(v) => set({ device: v })} />
      <button className="pv-btn pv-btn-primary" disabled={!ready} onClick={() => update((st) => advanceConsultation(st, "waiting"))}>Enter waiting room</button>
    </Card>}
    {c.phase === "waiting" && <Card tone="pastel"><h3>Waiting room</h3><p>Your clinician will join shortly (simulated).</p><button className="pv-btn pv-btn-primary" onClick={() => update((st) => advanceConsultation(st, "call"))}>Start simulated call</button></Card>}
    {c.phase === "call" && <Card><div className="pv-video" aria-label="Simulated video area">{c.camera ? "Clinician (simulated video)" : "Camera off"}</div>
      <div className="pv-btns"><button className="pv-btn" aria-pressed={c.muted} onClick={() => set({ muted: !c.muted })}>{c.muted ? "Unmute" : "Mute"}</button>
        <button className="pv-btn" aria-pressed={!c.camera} onClick={() => set({ camera: !c.camera })}>{c.camera ? "Camera off" : "Camera on"}</button>
        <button className="pv-btn pv-btn-danger" onClick={() => update((st) => advanceConsultation(st, "ended"))}>End call</button></div></Card>}
    {c.phase === "ended" && <Card><h3>Call ended</h3><p>Your clinician's released summary is in your care summary.</p><div className="pv-btns"><button className="pv-btn" onClick={() => go("care-summary")}>Care summary</button><button className="pv-btn" onClick={() => set({ phase: "checks", identity: false, privacy: false, device: false })}>Restart demo</button></div></Card>}
    <Card><h3>Phone fallback</h3><button className="pv-btn" onClick={() => set({ phone: !c.phone })}>{c.phone ? "Phone fallback requested (simulated)" : "Request a call instead"}</button><p className="pv-small pv-muted">No call is placed.</p></Card>
  </>);
}

const FILTERS = ["All", "Action", "Monitor", "In range"] as const;
function Results({ go }: Nav) {
  const s = useDemo(); const [f, setF] = useState<(typeof FILTERS)[number]>("All"); const [open, setOpen] = useState<string | null>(null);
  const list = releasedResults(s).filter((r) => r.category !== "Hormones" && r.category !== "Clinician-directed").filter((r) => f === "All" || (f === "In range" ? r.status === "in-range" : r.status === f.toLowerCase()));
  return (<>
    <Head eyebrow="Understand your results" title="Result Details" sub="Clinician-reviewed. Values and ranges are illustrative." />
    <Tabs items={FILTERS} value={f} onChange={setF} label="Filter results" />
    {list.map((r) => <Card key={r.id}><button className="pv-row" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)}>
      <span><b>{r.name}</b><br /><span className="pv-big">{r.value}</span> <span className="pv-muted">{r.unit}</span></span><Pill status={r.status} /></button>
      {open === r.id && <div className="pv-small"><p>Range: {r.range}</p><p><b>Clinician note (sample):</b> {r.note}</p></div>}</Card>)}
    <p className="pv-small pv-muted">Not a diagnostic algorithm. Values and ranges are illustrative.</p>
    <div className="pv-btns"><button className="pv-btn" onClick={() => go("hormones")}>Hormones & screening</button><button className="pv-btn" onClick={() => go("biological")}>Biological age</button><button className="pv-btn" onClick={() => go("care-summary")}>Care summary</button></div>
  </>);
}

function Hormones() {
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

function Biological({ go }: Nav) {
  return (<>
    <Head eyebrow="Understand your results" title="Biological Age" />
    <Card tone="pastel"><div className="pv-stats"><div className="pv-stat"><b>46</b>Chronological</div><div className="pv-stat pv-stat-ok"><b>43</b>Illustrative composite</div></div>
      <p className="pv-small">Illustrative composite from sample biomarkers, sleep and activity. Not a validated score, diagnosis or guaranteed outcome.</p></Card>
    <Card><h3>Contributing context</h3><ul className="pv-list"><li>Cardiometabolic markers — favourable (sample)</li><li>Sleep — focus area</li><li>Activity — steady</li></ul></Card>
    <button className="pv-btn" onClick={() => go("trajectory")}>View age trajectory</button>
  </>);
}

function CareSummary({ go }: Nav) {
  const s = useDemo();
  return (<>
    <Head eyebrow="Understand your results" title="Released care summary" sub="Only content your clinician explicitly released." />
    <Card><h3>Clinician note (sample)</h3><p>{releasedCareNote(s) ?? "Awaiting clinician review and release. No draft note is shown."}</p></Card>
    <Card><h3>Released results</h3><ul className="pv-list">{releasedResults(s).map((r) => <li key={r.id}>{r.name}: {r.value} {r.unit}</li>)}</ul></Card>
    <div className="pv-btns"><button className="pv-btn" onClick={() => go("plan")}>View your action plan</button><button className="pv-btn" onClick={() => go("care")}>Message care team</button></div>
  </>);
}

function Plan({ go, openBooking }: Nav) {
  const s = useDemo(); const [ref, setRef] = useState(s.plan.reflection); const done = s.plan.actions.filter((a) => a.done).length;
  return (<>
    <Head eyebrow="Act and follow up" title="Personal action plan" sub={`${done} of ${s.plan.actions.length} complete`} />
    <Card>{s.plan.actions.map((a) => <Check key={a.id} label={a.title} checked={a.done} onChange={(v) => update((st) => ({ ...st, plan: { ...st.plan, actions: st.plan.actions.map((x) => x.id === a.id ? { ...x, done: v } : x) } }))} />)}</Card>
    <Card><label className="pv-label">Reflection<textarea rows={3} value={ref} onChange={(e) => setRef(e.target.value)} /></label>
      <button className="pv-btn" onClick={() => { update((st) => ({ ...st, plan: { ...st.plan, reflection: ref } })); announce("Reflection saved on this device."); }}>Save reflection</button></Card>
    <div className="pv-btns"><button className="pv-btn pv-btn-primary" onClick={() => openBooking()}>Book recheck</button><button className="pv-btn" onClick={() => go("integrations")}>Connected devices</button></div>
  </>);
}

function Care() {
  const s = useDemo(); const [t, setT] = useState("");
  return (<>
    <Head eyebrow="Act and follow up" title="Care-team conversation" />
    <div className="pv-banner">Not monitored · local demo only. For urgent concerns call 000.</div>
    <Card><div className="pv-thread" aria-live="polite">{s.messages.map((m) => <p key={m.id} className={`pv-msg pv-msg-${m.from}`}>{m.text}</p>)}</div>
      <form onSubmit={(e) => { e.preventDefault(); if (!t.trim()) return; update((st) => ({ ...st, messages: [...st.messages, { id: `m${Date.now()}`, from: "you", text: t.trim(), at: new Date().toISOString() }] })); setT(""); announce("Message saved locally. No one will reply."); }}>
        <label className="pv-label">Message<textarea rows={2} value={t} onChange={(e) => setT(e.target.value)} /></label><button className="pv-btn pv-btn-primary" type="submit">Send (local)</button></form></Card>
  </>);
}

const PROVIDERS: Provider[] = ["WHOOP", "Apple Health", "Health Connect", "Oura"];
function Integrations() {
  const s = useDemo(); const set = (p: Provider, d: Partial<DemoState["devices"][Provider]>) => update((st) => ({ ...st, devices: { ...st.devices, [p]: { ...st.devices[p], ...d } } }));
  return (<>
    <Head eyebrow="Act and follow up" title="Connected Devices" sub="Simulated — no OAuth or real health data." />
    <p className="pv-small pv-muted">Wearables support trends and coaching only, not diagnosis or clinical decisions.</p>
    {PROVIDERS.map((p) => { const d = s.devices[p]; return <Card key={p}><div className="pv-row-static"><b>{p === "Apple Health" ? "Apple Watch / Apple Health" : p === "Health Connect" ? "Android / Health Connect" : p}</b><span className="pv-small">{d.connected ? "Connected (demo)" : "Not connected"}</span></div>
      {d.connected && <><p className="pv-small pv-muted">Last simulated sync: {d.lastSync}</p>
        {(["sleep", "activity", "heart"] as const).map((k) => <Switch key={k} label={`Share ${k}`} checked={d.perms[k]} onChange={(v) => set(p, { perms: { ...d.perms, [k]: v } })} />)}</>}
      <div className="pv-btns"><button className="pv-btn" onClick={() => { set(p, { connected: !d.connected, lastSync: d.connected ? undefined : "Just now (simulated)" }); announce(`${p} ${d.connected ? "disconnected" : "connected"} (simulated).`); }}>{d.connected ? "Disconnect" : "Connect"}</button>
        {d.connected && <button className="pv-btn" onClick={() => { set(p, { lastSync: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }) + " (simulated)" }); announce(`${p} synced (simulated).`); }}>Sync now</button>}</div></Card>; })}
  </>);
}

export const TRAJ: Record<3 | 6 | 12, number[]> = { 3: [44.2, 43.9, 43.6, 43.4], 6: [45.1, 44.6, 44.2, 43.9, 43.6, 43.4, 43.2], 12: [46.0, 45.8, 45.4, 45.1, 44.8, 44.6, 44.2, 43.9, 43.6, 43.4, 43.2, 43.1, 43.0] };
function Trajectory() {
  const s = useDemo(); const data = TRAJ[s.range]; const W = 320, H = 140, min = 42, max = 47;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * (W - 20) + 10},${H - 10 - ((v - min) / (max - min)) * (H - 20)}`).join(" ");
  return (<>
    <Head eyebrow="Act and follow up" title="Age Trajectory" />
    <Tabs items={["3 months", "6 months", "12 months"] as const} value={`${s.range} months` as "3 months"} onChange={(v) => update((st) => ({ ...st, range: parseInt(v) as 3 | 6 | 12 }))} label="Timeframe" />
    <Card><svg viewBox={`0 0 ${W} ${H}`} className="pv-chart" role="img" aria-label={`Illustrative trend over ${s.range} months from ${data[0]} to ${data[data.length - 1]}`}>
      <defs><linearGradient id="pvg" x1="0" x2="1"><stop offset="0" stopColor="var(--pv-teal)" /><stop offset="1" stopColor="var(--pv-azure)" /></linearGradient></defs>
      <polyline points={pts} fill="none" stroke="url(#pvg)" strokeWidth="3" strokeLinecap="round" />
    </svg><p className="pv-small">{data[0]} → {data[data.length - 1]} (illustrative)</p></Card>
    <p className="pv-small pv-muted">Illustrative only. Not a validated score, diagnosis or guaranteed outcome.</p>
  </>);
}

export const SCREEN_COMPONENTS: Record<ScreenId, (n: Nav) => ReactNode> = {
  home: Home, journey: Journey, profile: Profile, documents: Documents, mhr: Mhr, bookings: Bookings, consult: Consult,
  results: Results, hormones: Hormones, biological: Biological, "care-summary": CareSummary, plan: Plan, care: Care, integrations: Integrations, trajectory: Trajectory,
};

