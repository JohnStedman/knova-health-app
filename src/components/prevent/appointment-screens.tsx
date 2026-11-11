import { useState } from "react";
import { advanceConsultation, buildIcs, cancelBooking, consultationBooking, downloadText, saveBooking, startConsultation, update, useDemo, validateBooking, type Booking } from "@/lib/prevent-store";
import { announce, Card, Check, Modal } from "./ui";
import { Head, fmtDate, type Nav } from "./screen-layout";
export function Bookings({ go, openBooking }: Nav) {
  const [cancel, setCancel] = useState<Booking | null>(null);
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
        <button className="pv-btn" onClick={() => setCancel(b)}>Cancel</button>
        <button className="pv-btn" onClick={() => downloadText("knova-demo-event.ics", buildIcs(b), "text/calendar")}>Demo .ics</button>
      </div>}
    </Card>)}
    {cancel && <Modal title="Cancel this appointment?" onClose={() => setCancel(null)}><p>{cancel.service} · {fmtDate(cancel.date)} at {cancel.time}. Your cancelled appointment will remain in your history.</p><div className="pv-btns"><button className="pv-btn" onClick={() => setCancel(null)}>Keep appointment</button><button className="pv-btn pv-btn-danger" onClick={() => { update(state => cancelBooking(state, cancel.id)); setCancel(null); announce("Demo booking cancelled."); }}>Confirm cancellation</button></div></Modal>}
    <Card><h3>Preparation</h3><ul className="pv-list"><li>Complete intake</li><li>Follow the preparation instructions supplied for your ordered tests</li><li>Write down your questions</li></ul></Card>
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

export function Consult({ go }: Nav) {
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

