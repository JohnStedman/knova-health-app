import { useState } from "react";
import {
  advanceConsultation,
  bookingStatus,
  canJoinBooking,
  upcomingBookings,
  buildIcs,
  cancelBooking,
  consultationBooking,
  nextBooking,
  downloadText,
  saveBooking,
  startConsultation,
  update,
  useDemo,
  validateBooking,
  type Booking,
} from "@/lib/prevent-store";
import { Button } from "@/components/ui/button";
import consultationPhoto from "@/assets/prevent-reference-portrait.png";
import { Icon } from "./app-navigation";
import { announce, Card, Check, Eyebrow, Modal } from "./ui";
import { Head, fmtDate, FullAction, type Nav } from "./screen-layout";
export function Bookings({ go, openBooking }: Nav) {
  const [cancelId, setCancel] = useState<string | null>(null);
  const [detailId, setDetail] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const s = useDemo();
  const next = nextBooking(s);
  const bookings = all ? s.bookings : upcomingBookings(s);
  const detail = s.bookings.find(b => b.id === detailId);
  const cancel = s.bookings.find(b => b.id === cancelId);
  const status = detail ? bookingStatus(detail) : null;
  const fullDate = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-AU", {
    timeZone: "Australia/Adelaide", weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return (
    <>
      <Head
        eyebrow="Upcoming care"
        title="Your care schedule"
        sub="Confirm, reschedule or prepare for your next appointment."
      />
      <Card tone="pastel" className="pv-feature">
        <Eyebrow>Next appointment</Eyebrow>
        <h2>{next?.service ?? "No upcoming appointments"}</h2>
        <p>
          {next
            ? `${fmtDate(next.date)} · ${next.time} · ${next.mode} · Adelaide time`
            : "Book your next clinician conversation."}
        </p>
      </Card>
      <div className="pv-section-title">
        <h2>{all ? "All appointments" : "Upcoming"}</h2>
        <Button variant="prototype" className="pv-text-link" onClick={() => setAll(!all)}>
          {all ? "Show upcoming" : "View all"}
        </Button>
      </div>
      {!bookings.length && <p className="pv-small pv-wide">{all ? "No appointment history yet. Book a sample assessment below." : "No upcoming appointments. Book a sample assessment below or select View all for your history."}</p>}
      <div className="pv-booking-list pv-wide">
        {bookings.map((b) => (
          <Button
            className="pv-booking-row"
            key={b.id}
            onClick={() => setDetail(b.id)}
            aria-label={`View appointment ${b.service}`}
          >
            <span className="pv-tool-icon">
              <Icon name={b.mode === "Telehealth" ? "consult" : "bookings"} size={18} />
            </span>
            <span>
              <strong>{b.service}</strong>
              <small>
                {fmtDate(b.date)} · {b.time} · {b.mode}
              </small>
            </span>
            <span
              className={`pv-pill ${bookingStatus(b) === "Confirmed" ? "pv-pill-in-range" : bookingStatus(b) === "Past" ? "pv-pill-monitor" : "pv-pill-action"}`}
            >
              {bookingStatus(b)}
            </span>
          </Button>
        ))}
      </div>
      <FullAction secondary onClick={() => openBooking()}>
        Book an assessment
      </FullAction>
      {detail && (
        <Modal title={detail.service} onClose={() => setDetail(null)}>
          <div className="pv-appointment-detail">
            <div className="pv-appointment-meta">
              <p>{fullDate(detail.date)} · {detail.time} Australia/Adelaide · {detail.mode}</p>
              <span className={`pv-pill ${status === "Confirmed" ? "pv-pill-in-range" : status === "Past" ? "pv-pill-monitor" : "pv-pill-action"}`}>{status}</span>
              <p className="pv-small">Fictional appointment — no live availability reserved.</p>
              {status === "Past" && <p>This sample appointment is in the past and cannot be joined. Reschedule it to a future date or book a new sample appointment.</p>}
              {status === "Cancelled" && <p>This sample appointment was cancelled and cannot be joined.</p>}
            </div>
            {detail.status === "confirmed" && (
              <div className="pv-appointment-actions" role="group" aria-label="Appointment actions">
                {canJoinBooking(detail) && <Button variant="prototype" className="pv-btn pv-btn-primary" onClick={() => {
                  update(st => startConsultation(st, detail.id));
                  setDetail(null);
                  go("consult");
                }}>Join (simulated)</Button>}
                <Button variant="prototype" className="pv-btn" onClick={() => {
                  const current = s.bookings.find(b => b.id === detailId);
                  if (!current || current.status !== "confirmed") return;
                  setDetail(null);
                  openBooking(current);
                }}>Reschedule</Button>
                <Button variant="prototype" className="pv-btn" onClick={() => {
                  const current = s.bookings.find(b => b.id === detailId);
                  if (!current || current.status !== "confirmed") return;
                  setDetail(null);
                  setCancel(current.id);
                }}>Cancel</Button>
                {status === "Confirmed" && <Button variant="prototype" className="pv-btn" onClick={() => downloadText("knova-demo-event.ics", buildIcs(detail), "text/calendar")}>Add to calendar</Button>}
              </div>
            )}
            {status === "Confirmed" && <section className="pv-appointment-preparation" aria-labelledby="appointment-preparation-title">
              <h3 id="appointment-preparation-title">Before your appointment</h3>
              <ul className="pv-list">
                <li>Complete intake</li>
                <li>Follow the preparation instructions supplied for your ordered tests</li>
                <li>Write down your questions</li>
              </ul>
              <p className="pv-small">Add to calendar downloads a sample event only; it does not reserve a real appointment.</p>
            </section>}
          </div>
        </Modal>
      )}
      {cancel && (
        <Modal title="Cancel this appointment?" onClose={() => setCancel(null)}>
          <p>
            {cancel.service} · {fmtDate(cancel.date)} at {cancel.time}. Your cancelled appointment
            will remain in your history.
          </p>
          <div className="pv-btns">
            <Button variant="prototype" className="pv-btn" onClick={() => setCancel(null)}>
              Keep appointment
            </Button>
            <Button
              className="pv-btn pv-btn-danger"
              onClick={() => {
                update((state) => {
                  const current = state.bookings.find(b => b.id === cancelId);
                  return current?.status === "confirmed" ? cancelBooking(state, current.id) : state;
                });
                setCancel(null);
                announce("Demo booking cancelled.");
              }}
            >
              Confirm cancellation
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function BookingForm({ edit, onDone }: { edit?: Booking | undefined; onDone: () => void }) {
  const state = useDemo();
  const [f, setF] = useState({
    service: edit?.service ?? "",
    date: edit?.date ?? "",
    time: edit?.time ?? "",
    mode: edit?.mode ?? "",
  });
  const [e, setE] = useState<Partial<Record<"service" | "date" | "time" | "mode", string>>>({});
  const fld = (k: keyof typeof f) => ({
    value: f[k],
    onChange: (ev: { target: { value: string } }) => setF({ ...f, [k]: ev.target.value }),
    "aria-invalid": !!e[k],
  });
  return (
    <form
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const errs = validateBooking(f);
        setE(errs);
        if (Object.keys(errs).length) return;
        const current = edit ? state.bookings.find(b => b.id === edit.id) : undefined;
        if (edit && (!current || current.status !== "confirmed")) {
          setE({ service: "This appointment is no longer confirmed. Close and reopen your bookings." });
          return;
        }
        const b: Booking = {
          id: edit?.id ?? `b${Date.now()}`,
          service: f.service,
          date: f.date,
          time: f.time,
          mode: f.mode as Booking["mode"],
          status: "confirmed",
        };
        update((st) => {
          const latest = edit ? st.bookings.find(item => item.id === edit.id) : undefined;
          return edit && latest?.status !== "confirmed" ? st : saveBooking(st, b);
        });
        announce(
          edit
            ? "Demo booking rescheduled."
            : "Demo booking confirmed. No real appointment was made.",
        );
        onDone();
      }}
    >
      <label className="pv-label">
        Service
        <select {...fld("service")}>
          <option value="">Select…</option>
          <option>Clinician consultation</option>
          <option>Blood test & recheck</option>
          <option>Results review</option>
        </select>
      </label>
      {e.service && <p className="pv-error">{e.service}</p>}
      <label className="pv-label">
        Date
        <input type="date" {...fld("date")} />
      </label>
      {e.date && <p className="pv-error">{e.date}</p>}
      <label className="pv-label">
        Time (Australia/Adelaide)
        <select {...fld("time")}>
          <option value="">Select…</option>
          {["09:00", "10:30", "13:00", "15:30"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      {e.time && <p className="pv-error">{e.time}</p>}
      <fieldset className="pv-fieldset">
        <legend>Location</legend>
        {["Telehealth", "CHG clinic"].map((m) => (
          <label key={m} className="pv-check">
            <input
              type="radio"
              name="mode"
              checked={f.mode === m}
              onChange={() => setF({ ...f, mode: m })}
            />{" "}
            {m}
          </label>
        ))}
      </fieldset>
      {e.mode && <p className="pv-error">{e.mode}</p>}
      <Button variant="prototype" className="pv-btn pv-btn-primary" type="submit">
        {edit ? "Save new time" : "Confirm demo booking"}
      </Button>
    </form>
  );
}

export function Consult({ go }: Nav) {
  const s = useDemo();
  const c = s.consult;
  const set = (p: Partial<typeof c>) =>
    update((st) => ({ ...st, consult: { ...st.consult, ...p } }));
  const ready = c.identity && c.privacy && c.device;
  const appointment = consultationBooking(s);
  const [fallback, setFallback] = useState(false);
  if (!appointment)
    return (
      <>
        <Head
          eyebrow="Your video appointment"
          title="Meet your clinician."
          sub="Fictional in-app consultation · recording off."
        />
        <Card>
          <h3>No confirmed telehealth appointment</h3>
          <p>Past, cancelled and clinic appointments cannot enter a consultation. View your history to reschedule a past sample appointment.</p>
          <FullAction secondary onClick={() => go("bookings")}>
            View bookings
          </FullAction>
        </Card>
      </>
    );
  const phase = {
    checks: "Your consultation room",
    waiting: "Waiting for your clinician",
    call: "Consultation in progress",
    ended: "Consultation complete",
  }[c.phase];
  return (
    <>
      <Head
        eyebrow="Your video appointment"
        title="Meet your clinician."
        sub="Fictional in-app consultation · recording off."
      />
      <Card className="pv-consult-preview">
        <div className="pv-video" aria-label="Simulated video area">
          {c.camera && (
            <img
              src={consultationPhoto}
              width="768"
              height="1024"
              alt="Reference placeholder participant in the simulated consultation"
            />
          )}
          <span className="pv-video-tag">Simulated consultation · recording off</span>
          <span className="pv-video-self">
            {c.camera ? "Camera preview · simulated" : "Camera off"}
          </span>
          <div className="pv-video-caption">
            <h2>{phase}</h2>
            <p>
              Fictional clinician · {appointment.service}
              <br />
              {fmtDate(appointment.date)} · {appointment.time} Adelaide time
            </p>
          </div>
        </div>
        <div className="pv-btns">
          <Button
            className="pv-btn"
            aria-pressed={c.muted}
            onClick={() => set({ muted: !c.muted })}
          >
            {c.muted ? "Unmute" : "Mute microphone"}
          </Button>
          <Button
            className="pv-btn"
            aria-pressed={!c.camera}
            onClick={() => set({ camera: !c.camera })}
          >
            {c.camera ? "Camera off" : "Camera on"}
          </Button>
          {c.phase === "call" && (
            <Button
              className="pv-btn pv-btn-danger"
              onClick={() => update((st) => advanceConsultation(st, "ended"))}
            >
              End call
            </Button>
          )}
        </div>
      </Card>
      <Card>
        <h3>
          {c.phase === "checks"
            ? "Prepare & join"
            : c.phase === "waiting"
              ? "Waiting room"
              : c.phase === "call"
                ? "Your consultation"
                : "Call ended"}
        </h3>
        {c.phase === "checks" && (
          <>
            <Check
              label="I confirm my identity (demo)"
              checked={c.identity}
              onChange={(v) => set({ identity: v })}
            />
            <Check
              label="I have completed the simulated microphone, camera and connection checks."
              checked={c.device}
              onChange={(v) => set({ device: v })}
            />
            <Check
              label="I'm in a private space and consent to a telehealth consult. Recording remains off."
              checked={c.privacy}
              onChange={(v) => set({ privacy: v })}
            />
            <Button
              className="pv-btn pv-btn-primary pv-btn-wide"
              disabled={!ready}
              onClick={() => update((st) => advanceConsultation(st, "waiting"))}
            >
              Save checks & enter waiting room
            </Button>
          </>
        )}
        {c.phase === "waiting" && (
          <>
            <p>Your clinician will join shortly (simulated).</p>
            <Button
              className="pv-btn pv-btn-primary"
              onClick={() => update((st) => advanceConsultation(st, "call"))}
            >
              Start simulated call
            </Button>
          </>
        )}
        {c.phase === "call" && (
          <p className="pv-small">Simulated — no camera, microphone or call is used.</p>
        )}
        {c.phase === "ended" && (
          <>
            <p>Only your clinician's released summary is available.</p>
            <Button
              className="pv-btn"
              onClick={() =>
                set({ phase: "checks", identity: false, privacy: false, device: false })
              }
            >
              Restart demo
            </Button>
          </>
        )}
        <div className="pv-btns">
          <Button variant="prototype" className="pv-btn" onClick={() => go("care-summary")}>
            View care summary
          </Button>
          <Button variant="prototype" className="pv-btn" onClick={() => go("bookings")}>
            Appointment details
          </Button>
        </div>
        <Button variant="prototype" className="pv-text-link" onClick={() => setFallback(true)}>
          Phone fallback
        </Button>
      </Card>
      {fallback && (
        <Modal title="Phone fallback" onClose={() => setFallback(false)}>
          <p>No telephone call is made.</p>
          <Button variant="prototype" className="pv-btn" onClick={() => set({ phone: !c.phone })}>
            {c.phone ? "Phone fallback requested (simulated)" : "Request a call instead"}
          </Button>
        </Modal>
      )}
    </>
  );
}
