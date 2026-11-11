import { describe, expect, it } from "vitest";
import {
  SCREENS, loadState, serialize, createDefaultState, validateBooking, summaryCounts, addDays, buildIcs, releasedResults,
  advanceConsultation, cancelBooking, consultationBooking, nextBooking, releasedCareNote, saveBooking, startConsultation,
} from "@/lib/prevent-store";

const now = new Date("2026-10-23T10:00:00");

describe("Knova prototype rules", () => {
  it("keeps the approved 15-screen order and ids", () => {
    expect(SCREENS.map((s) => s.id)).toEqual(["home", "journey", "profile", "documents", "mhr", "bookings", "consult", "results", "hormones", "biological", "care-summary", "plan", "care", "integrations", "trajectory"]);
  });

  it("recovers safely from corrupted or wrong-version storage", () => {
    expect(loadState("{not json", now).recovered).toBe(true);
    expect(loadState(JSON.stringify({ version: 1, state: {} }), now).recovered).toBe(true);
    const ok = loadState(serialize(createDefaultState(now)), now);
    expect(ok.recovered).toBe(false);
    expect(ok.state.profile.name).toBe("Alex");
  });

  it("home summary shows 1 action / 2 monitor / 9 in range", () => {
    expect(summaryCounts(createDefaultState(now))).toEqual({ action: 1, monitor: 2, inRange: 9 });
  });

  it("validates bookings with required fields and a future-date guard", () => {
    expect(Object.keys(validateBooking({ service: "", date: "", time: "", mode: "" }, now)).sort()).toEqual(["date", "mode", "service", "time"]);
    expect(validateBooking({ service: "Results review", date: "2026-10-23", time: "10:30", mode: "Telehealth" }, now).date).toBe("Choose a future date.");
    expect(validateBooking({ service: "Results review", date: addDays(now, 3), time: "10:30", mode: "CHG clinic" }, now)).toEqual({});
  });

  it("demo ICS uses Australia/Adelaide timezone", () => {
    expect(buildIcs({ id: "x", service: "S", date: "2026-11-02", time: "10:30", mode: "Telehealth", status: "confirmed" })).toContain("DTSTART;TZID=Australia/Adelaide:20261102T103000");
  });

  it("participant app ships only released sample results", () => {
    const st = createDefaultState(now);
    expect(releasedResults(st).length).toBe(st.results.length);
  });

  it("rescheduling updates both Upcoming care and the selected consultation", () => {
    const st = startConsultation(createDefaultState(now), "b1", now);
    const original = st.bookings[0];
    if (!original) throw new Error("Missing fixture");
    const changed = saveBooking(st, { ...original, date: "2026-11-12", time: "15:30" });
    expect(nextBooking(changed, now)).toMatchObject({ date: "2026-11-12", time: "15:30" });
    expect(consultationBooking(changed, now)).toMatchObject({ date: "2026-11-12", time: "15:30" });
  });

  it("cancelled appointments disappear from Upcoming care and cannot enter a consultation", () => {
    const st = cancelBooking(startConsultation(createDefaultState(now), "b1", now), "b1");
    expect(nextBooking(st, now)).toBeUndefined();
    expect(consultationBooking(st, now)).toBeUndefined();
    expect(startConsultation(st, "b1", now)).toBe(st);
    expect(advanceConsultation(st, "waiting", now)).toBe(st);
  });

  it("joining one booking does not accidentally select a different appointment", () => {
    const st = createDefaultState(now);
    const changed = saveBooking(st, { id: "b2", service: "Results review", date: "2026-11-20", time: "13:00", mode: "Telehealth", status: "confirmed" });
    expect(consultationBooking(startConsultation(changed, "b2", now), now)?.id).toBe("b2");
  });

  it("clinic appointments cannot enter telehealth", () => {
    const st = createDefaultState(now);
    const original = st.bookings[0];
    if (!original) throw new Error("Missing fixture");
    const changed = saveBooking(st, { ...original, mode: "CHG clinic" });
    expect(consultationBooking(changed, now)).toBeUndefined();
    expect(startConsultation(changed, "b1", now)).toBe(changed);
  });

  it("requires all three device/privacy checks before the waiting room", () => {
    const st = createDefaultState(now);
    expect(advanceConsultation(st, "waiting", now)).toBe(st);
    const ready = { ...st, consult: { ...st.consult, identity: true, privacy: true, device: true } };
    expect(advanceConsultation(ready, "waiting", now).consult.phase).toBe("waiting");
    expect(advanceConsultation(ready, "call", now)).toBe(ready);
  });

  it("hides unreleased results and excludes them from health counts", () => {
    const st = createDefaultState(now);
    st.results = st.results.map((r) => ({ ...r, released: false }));
    expect(releasedResults(st)).toEqual([]);
    expect(summaryCounts(st)).toEqual({ action: 0, monitor: 0, inRange: 0 });
  });

  it("hides a draft care note until the simulated clinician releases it", () => {
    const st = createDefaultState(now);
    st.careNoteReleased = false;
    expect(releasedCareNote(st)).toBeNull();
    st.consult = { ...st.consult, identity: true, privacy: true, device: true };
    const ended = advanceConsultation(advanceConsultation(advanceConsultation(st, "waiting", now), "call", now), "ended", now);
    expect(releasedCareNote(ended)).toBe(st.careNote);
  });

  it("preserves 12 reviewed result markers excluding hormones", () => {
    const st = createDefaultState(now);
    expect(releasedResults(st).filter((r) => r.category !== "Hormones" && r.category !== "Clinician-directed")).toHaveLength(12);
  });
});
