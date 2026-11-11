// Central typed demo store for the Knova review prototype.
// Fictional data only. Isolated Demo storage and explicitly opted-in account storage.
import { useSyncExternalStore } from "react";

export const SCREENS = [
  { id: "home", n: 1, group: "Get started", title: "Home & next steps", sub: "Tasks, appointments, health summary" },
  { id: "journey", n: 2, group: "Get started", title: "Onboarding & timeline", sub: "History, clinician review, testing and follow-up" },
  { id: "profile", n: 3, group: "Get started", title: "Profile & preferences", sub: "Identity, consent and settings" },
  { id: "documents", n: 4, group: "Get started", title: "Documents & uploads", sub: "Reports, GP summaries and prior history" },
  { id: "mhr", n: 5, group: "Get started", title: "My Health Record", sub: "Planned national clinical-information integration" },
  { id: "bookings", n: 6, group: "Your appointment", title: "Bookings", sub: "Appointments, preparation and rechecks" },
  { id: "consult", n: 7, group: "Your appointment", title: "Telehealth consultation", sub: "Device checks, waiting, in-portal care and phone fallback" },
  { id: "results", n: 8, group: "Understand your results", title: "Result Details", sub: "Reviewed biomarkers, ranges and clinician note" },
  { id: "hormones", n: 9, group: "Understand your results", title: "Hormones & Screening", sub: "Cortisol, testosterone and clinician-directed markers" },
  { id: "biological", n: 10, group: "Understand your results", title: "Biological Age", sub: "Illustrative composite and context" },
  { id: "care-summary", n: 11, group: "Understand your results", title: "Released care summary", sub: "Only explicitly released clinical content" },
  { id: "plan", n: 12, group: "Act and follow up", title: "Personal action plan", sub: "Priorities, completion and reflections" },
  { id: "care", n: 13, group: "Act and follow up", title: "Care-team conversation", sub: "Local demo messages and follow-up" },
  { id: "integrations", n: 14, group: "Act and follow up", title: "Connected Devices", sub: "WHOOP, Apple Watch/Apple Health, Android/Health Connect, Oura" },
  { id: "trajectory", n: 15, group: "Act and follow up", title: "Age Trajectory", sub: "Timeframe selectors, trends and context" },
] as const;
export type ScreenId = (typeof SCREENS)[number]["id"];
export const isScreenId = (v: string): v is ScreenId => SCREENS.some((s) => s.id === v);

export type ResultStatus = "action" | "monitor" | "in-range";
export interface Result {
  id: string; name: string; value: string; unit: string; range: string; status: ResultStatus;
  category: "Cardiometabolic" | "Nutrients" | "Lifestyle" | "Hormones" | "Clinician-directed";
  note: string; released: boolean;
}
export interface Booking { id: string; service: string; date: string; time: string; mode: "Telehealth" | "CHG clinic"; status: "confirmed" | "cancelled" }
export interface Doc { id: string; name: string; kind: string; status: string; content: string }
export interface Upload { id: string; name: string; type: string; size: number }
export type Provider = "WHOOP" | "Apple Health" | "Health Connect" | "Oura";
export interface DeviceState { connected: boolean; lastSync?: string | undefined; perms: { sleep: boolean; activity: boolean; heart: boolean } }
export interface Message { id: string; from: "you" | "care"; text: string; at: string }

export interface DemoState {
  profile: { name: string; reminders: boolean; resultAlerts: boolean; shareGp: boolean; research: boolean };
  intake: { goals: string[]; history: string; consent: boolean; saved: boolean };
  docs: Doc[];
  mhrSharing: boolean;
  bookings: Booking[];
  consult: { bookingId?: string; identity: boolean; privacy: boolean; device: boolean; phase: "checks" | "waiting" | "call" | "ended"; muted: boolean; camera: boolean; phone: boolean };
  careNote: string;
  careNoteReleased: boolean;
  theme: "light" | "dark";
  results: Result[];
  plan: { actions: { id: string; title: string; done: boolean }[]; reflection: string };
  messages: Message[];
  devices: Record<Provider, DeviceState>;
  range: 3 | 6 | 12;
}

export const STORAGE_KEY = "prevent-demo";
export const VERSION = 4;

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const addDays = (now: Date, n: number) => { const d = new Date(now); d.setDate(d.getDate() + n); return ymd(d); };

const r = (id: string, name: string, value: string, unit: string, range: string, status: ResultStatus, category: Result["category"], note: string, extra: Partial<Result> = {}): Result =>
  ({ id, name, value, unit, range, status, category, note, released: true, ...extra });

export function createDefaultState(now = new Date()): DemoState {
  const dev = (connected: boolean): DeviceState => ({ connected, lastSync: connected ? "Demo sync · earlier today" : undefined, perms: { sleep: true, activity: true, heart: false } });
  return {
    profile: { name: "Alex", reminders: true, resultAlerts: true, shareGp: false, research: false },
    intake: { goals: [], history: "", consent: false, saved: false },
    docs: [
      { id: "d1", name: "Clinician-reviewed report (sample)", kind: "Report", status: "Reviewed by clinician (demo)", content: "KNOVA SAMPLE REPORT — FICTIONAL\nParticipant: Alex (demo)\nReviewed biomarkers: ApoB 0.73 g/L, HbA1c 5.7%, Vitamin D 82 nmol/L.\nAll values illustrative. Not for clinical use." },
      { id: "d2", name: "GP summary (sample)", kind: "GP summary", status: "Received · sample only", content: "SAMPLE GP SUMMARY — FICTIONAL\nNo real patient data. Generated for internal prototype review." },
    ],
    mhrSharing: false,
    bookings: [{ id: "b1", service: "Clinician consultation", date: addDays(now, 7), time: "10:30", mode: "Telehealth", status: "confirmed" }],
    consult: { identity: false, privacy: false, device: false, phase: "checks", muted: false, camera: true, phone: false },
    careNote: "Thanks for meeting today, Alex. We discussed your sleep routine, a walking plan and an HbA1c recheck in about 3 months. (Fictional sample summary.)",
    careNoteReleased: true,
    theme: "light",
    results: [
      r("apob", "ApoB", "0.73", "g/L", "Illustrative < 0.90", "in-range", "Cardiometabolic", "Within the illustrative reference range. Discuss context with your clinician."),
      r("hba1c", "HbA1c", "5.7", "%", "Illustrative < 5.7", "monitor", "Cardiometabolic", "At the upper edge of the illustrative range; your clinician suggested a recheck."),
      r("vitd", "Vitamin D", "82", "nmol/L", "Illustrative 50–150", "in-range", "Nutrients", "Within the illustrative range."),
      r("ferritin", "Ferritin", "68", "ug/L", "Illustrative 30–300", "in-range", "Nutrients", "Within the illustrative range."),
      r("sleep", "Sleep score", "58", "/100", "Illustrative 70+", "action", "Lifestyle", "Sleep routine is a focus area in your action plan."),
      r("ldl", "LDL cholesterol", "2.4", "mmol/L", "Illustrative < 3.0", "in-range", "Cardiometabolic", "Within the illustrative range."),
      r("hdl", "HDL cholesterol", "1.4", "mmol/L", "Illustrative > 1.0", "in-range", "Cardiometabolic", "Within the illustrative range."),
      r("tg", "Triglycerides", "1.6", "mmol/L", "Illustrative < 1.7", "monitor", "Cardiometabolic", "Near the upper illustrative limit."),
      r("b12", "Vitamin B12", "420", "pmol/L", "Illustrative 150–700", "in-range", "Nutrients", "Within the illustrative range."),
      r("glucose", "Fasting glucose", "5.1", "mmol/L", "Illustrative 3.6–6.0", "in-range", "Cardiometabolic", "Within the illustrative range."),
      r("egfr", "eGFR", "92", "mL/min", "Illustrative > 60", "in-range", "Nutrients", "Within the illustrative range."),
      r("crp", "hs-CRP", "0.8", "mg/L", "Illustrative < 1.0", "in-range", "Cardiometabolic", "Within the illustrative range."),
      r("cortisol", "Morning cortisol", "410", "nmol/L", "Illustrative 140–690", "in-range", "Hormones", "Timing of collection matters; context reviewed by clinician."),
      r("testo", "Total testosterone", "16.2", "nmol/L", "Illustrative 8–29", "in-range", "Hormones", "Interpreted alongside SHBG and free testosterone."),
      r("ftesto", "Free testosterone", "0.31", "nmol/L", "Illustrative 0.2–0.6", "in-range", "Hormones", "Calculated value; illustrative."),
      r("shbg", "SHBG", "38", "nmol/L", "Illustrative 15–55", "in-range", "Hormones", "Binding protein context."),
    ],
    plan: {
      actions: [
        { id: "a1", title: "Consistent sleep window (7–8 hrs)", done: false },
        { id: "a2", title: "3 × 30-min brisk walks this week", done: false },
        { id: "a3", title: "Add fibre to two meals daily", done: false },
        { id: "a4", title: "Book HbA1c recheck in 3 months", done: false },
      ],
      reflection: "",
    },
    messages: [{ id: "m0", from: "care", text: "Hi Alex, this is a demo care-team thread. Messages here stay on this device and are not monitored.", at: "Demo" }],
    devices: { WHOOP: dev(false), "Apple Health": dev(true), "Health Connect": dev(false), Oura: dev(false) },
    range: 6,
  };
}

/** Parse stored JSON; any invalid/corrupt/old payload falls back to defaults. */
export function loadState(raw: string | null, now = new Date()): { state: DemoState; recovered: boolean } {
  if (!raw) return { state: createDefaultState(now), recovered: false };
  try {
    const parsed = JSON.parse(raw);
    const s = parsed?.state;
    if (parsed?.version !== VERSION || !s || !Array.isArray(s.results) || !Array.isArray(s.bookings) || !s.profile || !s.devices || typeof s.careNote !== "string"
      || typeof s.profile.name !== "string" || !s.intake || !Array.isArray(s.intake.goals) || typeof s.intake.history !== "string"
      || !s.plan || !Array.isArray(s.plan.actions) || typeof s.plan.reflection !== "string" || !Array.isArray(s.messages)
      || !Array.isArray(s.docs) || !s.consult || !["checks", "waiting", "call", "ended"].includes(s.consult.phase)
      || !["light", "dark"].includes(s.theme) || ![3, 6, 12].includes(s.range)
      || ["WHOOP", "Apple Health", "Health Connect", "Oura"].some(provider => !s.devices[provider]?.perms)
      || s.plan.actions.some((action: DemoState["plan"]["actions"][number]) => !action || typeof action.title !== "string" || typeof action.done !== "boolean")
      || s.results.some((result: Result) => !result || typeof result.name !== "string" || typeof result.value !== "string" || typeof result.category !== "string")
      || s.bookings.some((booking: Booking) => !booking || typeof booking.date !== "string" || typeof booking.time !== "string"))
      throw new Error("invalid");
    return { state: { ...createDefaultState(now), ...s, docs: s.docs.map((doc: Doc) => ({ ...doc, content: typeof doc.content === "string" ? doc.content.replace(/\bPREVENT\b/g, "KNOVA") : "Sample document unavailable." })) }, recovered: false };
  } catch {
    return { state: createDefaultState(now), recovered: true };
  }
}
export const serialize = (state: DemoState) => JSON.stringify({ version: VERSION, state });

export interface WorkspacePort {
  load(userId: string, signal: AbortSignal): Promise<{ user_id: string; state: unknown; state_version: number } | null>;
  save(userId: string, state: DemoState, signal: AbortSignal): Promise<void>;
}
export type CloudAccount = { id: string; email: string };
export type SyncSnapshot = {
  user: CloudAccount | null; mode: "demo" | "cloud"; phase: "idle" | "loading" | "ready" | "pending" | "saving" | "saved" | "error";
  error: string | null; savedAt: string | null; epoch: number;
};

/** Account-owned sync lifecycle. All state/race rules stay in this central store. */
export class WorkspaceSync {
  private value: SyncSnapshot = { user: null, mode: "demo", phase: "idle", error: null, savedAt: null, epoch: 0 };
  private watchers = new Set<Listener>();
  private port: WorkspacePort | undefined;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private abort = new AbortController();
  private loaded = false;
  private dirty = false;
  private writing = false;
  private change = 0;
  constructor(private readonly state: { read(): DemoState; replace(s: DemoState): void; demo(): void }, private readonly delay = 700) {}
  snapshot = () => this.value;
  subscribe = (fn: Listener) => { this.watchers.add(fn); return () => { this.watchers.delete(fn); }; };
  private status(patch: Partial<SyncSnapshot>) { this.value = { ...this.value, ...patch }; this.watchers.forEach(fn => fn()); }
  setPort(port: WorkspacePort) { this.port = port; }
  authError(error: string) { this.status({ error }); }
  private invalidate() {
    clearTimeout(this.timer); this.abort.abort(); this.abort = new AbortController();
    this.loaded = false; this.dirty = false; this.change++;
    this.status({ epoch: this.value.epoch + 1, savedAt: null, error: null });
  }
  account(user: CloudAccount | null) {
    if (user?.id && user.id === this.value.user?.id) { this.status({ user }); return; }
    this.invalidate(); this.status({ user, mode: "demo", phase: "idle" }); this.state.demo();
  }
  disable() {
    this.invalidate(); this.status({ mode: "demo", phase: "idle" }); this.state.demo();
  }
  async enable() {
    if (!this.value.user || !this.port || this.value.phase === "loading") return;
    this.invalidate();
    this.status({ mode: "cloud", phase: "loading" });
    // Never import the shared device's demo edits into an account implicitly.
    this.state.replace(createDefaultState());
    const epoch = this.value.epoch, userId = this.value.user.id;
    try {
      const row = await this.port.load(userId, this.abort.signal);
      if (epoch !== this.value.epoch) return;
      if (row) {
        const decoded = loadState(JSON.stringify({ version: row.state_version, state: row.state }));
        if (row.user_id !== userId || decoded.recovered) throw new Error("Invalid saved workspace; no data was overwritten.");
        this.state.replace(decoded.state);
      }
      this.loaded = true;
      this.status({ phase: "ready", error: null });
      // A missing row is not called saved; first change creates it via owner RLS.
    } catch (error) {
      if (epoch === this.value.epoch) this.status({ phase: "error", error: error instanceof Error ? error.message : "Workspace load failed." });
    }
  }
  canEdit() { return this.value.mode === "demo" || this.loaded; }
  changed() {
    if (this.value.mode !== "cloud" || !this.loaded) return;
    this.dirty = true; this.change++;
    this.status({ phase: "pending", error: null });
    clearTimeout(this.timer); this.timer = setTimeout(() => { void this.flush(); }, this.delay);
  }
  async retry() {
    if (!this.loaded) await this.enable();
    else { this.status({ error: null }); await this.flush(); }
  }
  async flush() {
    if (this.writing || !this.dirty || !this.loaded || this.value.mode !== "cloud" || !this.value.user || !this.port) return;
    this.writing = true; this.dirty = false;
    const epoch = this.value.epoch, change = this.change, id = this.value.user.id;
    const snapshot = JSON.parse(serialize(this.state.read())).state as DemoState;
    this.status({ phase: "saving" });
    let failed = false;
    try {
      await this.port.save(id, snapshot, this.abort.signal);
      if (epoch === this.value.epoch) this.status({ phase: change === this.change ? "saved" : "pending", savedAt: new Date().toISOString(), error: null });
    } catch (error) {
      failed = true;
      if (epoch === this.value.epoch) {
        this.dirty = true;
        this.status({ phase: "error", error: error instanceof Error ? error.message : "Save failed. Changes remain in this tab only." });
      }
    } finally {
      this.writing = false;
      if (this.dirty && (!failed || epoch !== this.value.epoch)) {
        clearTimeout(this.timer); this.timer = setTimeout(() => { void this.flush(); }, this.delay);
      }
    }
  }
}

// ---------- Booking ----------
export const nextBooking = (s: DemoState, now = new Date()) => s.bookings.filter((b) => b.status === "confirmed" && b.date >= now.toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" })).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
export function consultationBooking(s: DemoState): Booking | undefined {
  if (s.consult.bookingId) return s.bookings.find((b) => b.id === s.consult.bookingId && b.status === "confirmed" && b.mode === "Telehealth");
  return s.bookings.filter((b) => b.status === "confirmed" && b.mode === "Telehealth").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
}
export function startConsultation(s: DemoState, id: string): DemoState {
  const b = s.bookings.find((b) => b.id === id && b.status === "confirmed" && b.mode === "Telehealth");
  if (!b) return s;
  return { ...s, consult: { ...createDefaultState().consult, bookingId: b.id } };
}
export function saveBooking(s: DemoState, booking: Booking): DemoState {
  const exists = s.bookings.some((b) => b.id === booking.id);
  return { ...s, bookings: exists ? s.bookings.map((b) => b.id === booking.id ? booking : b) : [...s.bookings, booking] };
}
export function cancelBooking(s: DemoState, id: string): DemoState {
  const selected = consultationBooking(s)?.id === id;
  return { ...s, bookings: s.bookings.map((b) => b.id === id ? { ...b, status: "cancelled" } : b), consult: selected ? { ...createDefaultState().consult, bookingId: id } : s.consult };
}
export function advanceConsultation(s: DemoState, phase: DemoState["consult"]["phase"]): DemoState {
  if (!consultationBooking(s)) return s;
  if (phase === "waiting" && !(s.consult.identity && s.consult.privacy && s.consult.device)) return s;
  if (phase === "call" && s.consult.phase !== "waiting") return s;
  if (phase === "ended" && s.consult.phase !== "call") return s;
  return { ...s, consult: { ...s.consult, phase }, careNoteReleased: phase === "ended" ? true : s.careNoteReleased };
}
export const releasedCareNote = (s: DemoState) => s.careNoteReleased ? s.careNote : null;
export interface BookingInput { service: string; date: string; time: string; mode: string }
export type BookingErrors = Partial<Record<"service" | "date" | "time" | "mode", string>>;
export function validateBooking(i: BookingInput, now = new Date()): BookingErrors {
  const e: BookingErrors = {};
  if (!["Clinician consultation", "Blood test & recheck", "Results review"].includes(i.service)) e.service = "Choose a service.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(i.date)) e.date = "Choose a date.";
  else if (i.date <= ymd(now)) e.date = "Choose a future date.";
  if (!["09:00", "10:30", "13:00", "15:30"].includes(i.time)) e.time = "Choose a time.";
  if (i.mode !== "Telehealth" && i.mode !== "CHG clinic") e.mode = "Choose Telehealth or CHG clinic.";
  return e;
}
export function buildIcs(b: Booking): string {
  const dt = `${b.date.replace(/-/g, "")}T${b.time.replace(":", "")}00`;
  const [h = 0, m = 0] = b.time.split(":").map(Number);
  const end = `${b.date.replace(/-/g, "")}T${String(h + (m + 30 >= 60 ? 1 : 0)).padStart(2, "0")}${String((m + 30) % 60).padStart(2, "0")}00`;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Knova Demo//EN",
    "BEGIN:VTIMEZONE", "TZID:Australia/Adelaide",
    "BEGIN:STANDARD", "DTSTART:19700405T030000", "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU", "TZOFFSETFROM:+1030", "TZOFFSETTO:+0930", "TZNAME:ACST", "END:STANDARD",
    "BEGIN:DAYLIGHT", "DTSTART:19701004T020000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=1SU", "TZOFFSETFROM:+0930", "TZOFFSETTO:+1030", "TZNAME:ACDT", "END:DAYLIGHT",
    "END:VTIMEZONE", "BEGIN:VEVENT", `UID:${b.id}@prevent-demo.invalid`, `DTSTAMP:${dt}`,
    `DTSTART;TZID=Australia/Adelaide:${dt}`, `DTEND;TZID=Australia/Adelaide:${end}`,
    `SUMMARY:DEMO ONLY - ${b.service} (${b.mode})`,
    "DESCRIPTION:Fictional prototype event. No real appointment has been made.",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

// ---------- Results ----------
export const releasedResults = (s: DemoState) => s.results.filter((r) => r.released);
export function summaryCounts(s: DemoState) {
  const rel = releasedResults(s).filter((r) => r.category !== "Hormones" && r.category !== "Clinician-directed");
  return { action: rel.filter((r) => r.status === "action").length, monitor: rel.filter((r) => r.status === "monitor").length, inRange: rel.filter((r) => r.status === "in-range").length };
}

// ---------- Store ----------
type Listener = () => void;
let current: DemoState | null = null;
let uploads: Upload[] = [];
let recoveredFlag = false;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

function ensure(): DemoState {
  if (!current) {
    let raw: string | null = null;
    try { raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null; } catch { raw = null; }
    const res = loadState(raw);
    current = res.state; recoveredFlag = res.recovered;
  }
  return current;
}
export function update(fn: (s: DemoState) => DemoState) {
  if (!workspaceSync.canEdit()) return;
  current = fn(ensure());
  if (workspaceSync.snapshot().mode === "demo") {
    try { window.localStorage.setItem(STORAGE_KEY, serialize(current)); } catch { /* storage unavailable */ }
  } else workspaceSync.changed();
  emit();
}
export function resetDemo() {
  if (workspaceSync.snapshot().mode !== "demo") return;
  current = createDefaultState(); uploads = [];
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  emit();
}
export const wasRecovered = () => (ensure(), recoveredFlag);
export function useDemo(): DemoState {
  return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), ensure, ensure);
}
export const workspaceSync = new WorkspaceSync({
  read: ensure,
  replace: (state) => { current = state; uploads = []; emit(); },
  demo: () => {
    let raw: string | null = null;
    try { raw = window.localStorage.getItem(STORAGE_KEY); } catch { /* unavailable */ }
    const decoded = loadState(raw); current = decoded.state; recoveredFlag = decoded.recovered; uploads = []; emit();
  },
});
export function useCloudAccount() { return useSyncExternalStore(workspaceSync.subscribe, workspaceSync.snapshot, workspaceSync.snapshot); }
// Session-only uploads: kept in memory, never persisted, never sent anywhere.
export const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "text/plain"];
export const MAX_BYTES = 5 * 1024 * 1024;
export function validateUpload(f: { type: string; size: number }): string | null {
  if (!ALLOWED_TYPES.includes(f.type)) return "Only PDF, PNG, JPEG or plain text sample files.";
  if (f.size > MAX_BYTES) return "File is larger than 5 MB.";
  return null;
}
export const getUploads = () => uploads;
export function addUpload(u: Upload) { uploads = [...uploads, u]; emit(); }
export function useUploads() { return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), getUploads, getUploads); }

export function downloadText(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
