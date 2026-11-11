import { useState } from "react";
import {
  addUpload,
  downloadText,
  nextBooking,
  releasedResults,
  resetDemo,
  update,
  useDemo,
  useCloudAccount,
  useUploads,
  validateUpload,
} from "@/lib/prevent-store";
import { Button } from "@/components/ui/button";
import { CloudAccountSection } from "./cloud-account";
import { Icon } from "./app-navigation";
import { announce, Card, Check, Modal, Switch, Tabs } from "./ui";
import { Head, WireRow, FullAction, SectionTitle, type Nav } from "./screen-layout";
const GOALS = ["Heart health", "Energy & sleep", "Metabolic health", "Longevity planning"];
export function Journey({ go, openBooking }: Nav) {
  const s = useDemo();
  const [intake, setIntake] = useState(false);
  const [g, setG] = useState(s.intake.goals);
  const [h, setH] = useState(s.intake.history);
  const [c, setC] = useState(s.intake.consent);
  const [err, setErr] = useState("");
  return (
    <>
      <Head
        eyebrow="Participant journey"
        title="Know what happens next."
        sub="A connected care pathway from your story to your follow-up."
      />
      <Card>
        <h3>Your care timeline</h3>
        <WireRow
          title="1. Your history"
          sub={
            s.intake.saved
              ? "History and consent saved"
              : "Questionnaire, previous records and consent"
          }
          onClick={() => setIntake(true)}
        />
        <WireRow
          title="2. Meet your clinician"
          sub={nextBooking(s) ? "Onboarding conversation booked" : "Onboarding conversation"}
          action="Book"
          onClick={() => openBooking()}
        />
        <WireRow
          title="3. Complete agreed tests"
          sub="Scope, preparation and appointments"
          onClick={() => go("bookings")}
        />
        <WireRow
          title="4. Review results"
          sub={`${releasedResults(s).length} released markers · sources and context`}
          onClick={() => go("results")}
        />
        <WireRow
          title="5. Act and follow up"
          sub="Personal plan and repeat review"
          onClick={() => go("plan")}
        />
      </Card>
      <FullAction secondary onClick={() => setIntake(true)}>
        Complete health intake
      </FullAction>
      <FullAction secondary onClick={() => go("profile")}>
        Explore your profile
      </FullAction>
      {intake && (
        <Modal title="Health intake (demo)" onClose={() => setIntake(false)}>
          <fieldset className="pv-fieldset">
            <legend>Your goals</legend>
            {GOALS.map((x) => (
              <Check
                key={x}
                label={x}
                checked={g.includes(x)}
                onChange={(v) => setG(v ? [...g, x] : g.filter((y) => y !== x))}
              />
            ))}
          </fieldset>
          <label className="pv-label">
            Brief history (fictional only)
            <textarea
              value={h}
              onChange={(e) => setH(e.target.value)}
              rows={3}
              placeholder="Do not enter real health information"
            />
          </label>
          <Check
            label="Required: I understand this is a fictional prototype. Sample data is stored in the selected Demo or account workspace."
            checked={c}
            onChange={setC}
          />
          {err && (
            <p className="pv-error" role="alert">
              {err}
            </p>
          )}
          <Button
            className="pv-btn pv-btn-primary"
            onClick={() => {
              if (!c) return setErr("Prototype consent is required to save intake.");
              if (!g.length) return setErr("Choose at least one goal.");
              setErr("");
              update((st) => ({
                ...st,
                intake: { goals: g, history: h, consent: c, saved: true },
              }));
              setIntake(false);
              announce("Demo intake saved. Next step updated.");
            }}
          >
            Save demo intake
          </Button>
          {s.intake.saved && (
            <Button
              className="pv-btn"
              onClick={() => {
                setIntake(false);
                go("bookings");
              }}
            >
              Next: book clinician review
            </Button>
          )}
        </Modal>
      )}
    </>
  );
}

export function Profile({ go }: Nav) {
  const sync = useCloudAccount();
  const s = useDemo();
  const p = s.profile;
  const [panel, setPanel] = useState<"details" | "sharing" | "notifications" | null>(null);
  const [confirm, setConfirm] = useState(false);
  const set = (k: keyof typeof p, v: string | boolean) =>
    update((st) => ({ ...st, profile: { ...st.profile, [k]: v } }));
  return (
    <>
      <Head
        eyebrow="Participant journey"
        title="Your profile. Your controls."
        sub="Keep your history, documents and preferences connected."
      />
      <Card tone="pastel" className="pv-feature">
        <div className="pv-profile-summary">
          <span className="pv-profile-avatar">{p.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>{p.name}</strong>
            <small>Knova · fictional participant</small>
            <small>Internal product concept</small>
          </div>
        </div>
      </Card>
      <Card>
        <h3>Your details and preferences</h3>
        <WireRow
          title="Personal details"
          sub="Fictional profile and regular GP"
          action="Edit"
          onClick={() => setPanel("details")}
        />
        <WireRow
          title="Documents"
          sub="Reports and historical uploads"
          onClick={() => go("documents")}
        />
        <WireRow
          title="Connected devices"
          sub="WHOOP, Apple, Android and Oura"
          onClick={() => go("integrations")}
        />
        <WireRow
          title="My Health Record"
          sub="Clinical documents and access controls"
          onClick={() => go("mhr")}
        />
        <WireRow
          title="Sharing and privacy"
          sub="Participant-controlled concept"
          action="Manage"
          onClick={() => setPanel("sharing")}
        />
        <WireRow
          title="Notifications"
          sub="Appointment and results reminders"
          onClick={() => setPanel("notifications")}
        />
      </Card>
      <FullAction onClick={() => go("care")}>Open care team</FullAction>
      <details className="pv-profile-extras pv-wide">
        <summary>Cloud account & app preferences</summary>
        <div className="pv-profile-settings">
          <CloudAccountSection />
          <Card>
            <h3>About this demo</h3>
            <p className="pv-small">
              Fictional data only. Bookings, consultations, My Health Record and devices are
              simulated. Demo mode stays in this browser; optional account saving stores sample
              workspace changes in CHG_Prevent.
            </p>
            <Switch
              label="Dark mode"
              checked={s.theme === "dark"}
              onChange={(v) => update((st) => ({ ...st, theme: v ? "dark" : "light" }))}
            />
            <p className="pv-small">
              {s.intake.consent
                ? "Prototype consent given during sample intake."
                : "Prototype consent not yet given — complete intake."}
            </p>
            {sync.mode === "demo" &&
              (confirm ? (
                <div className="pv-btns">
                  <Button variant="prototype" className="pv-btn" onClick={() => setConfirm(false)}>
                    Keep data
                  </Button>
                  <Button
                    className="pv-btn pv-btn-danger"
                    onClick={() => {
                      resetDemo();
                      setConfirm(false);
                      announce("Demo data reset.");
                    }}
                  >
                    Confirm reset
                  </Button>
                </div>
              ) : (
                <Button variant="prototype" className="pv-btn" onClick={() => setConfirm(true)}>
                  Reset demo
                </Button>
              ))}
          </Card>
        </div>
      </details>
      {panel && (
        <Modal
          title={
            panel === "details"
              ? "Personal details"
              : panel === "sharing"
                ? "Sharing and privacy"
                : "Notifications (simulated)"
          }
          onClose={() => setPanel(null)}
        >
          {panel === "details" ? (
            <>
              <label className="pv-label">
                Display name (demo)
                <input
                  value={p.name}
                  maxLength={30}
                  onChange={(e) => set("name", e.target.value || "Alex")}
                />
              </label>
              <p className="pv-small">
                Fictional display name only. Account access is separate; never enter real health
                details.
              </p>
            </>
          ) : panel === "sharing" ? (
            <>
              <p className="pv-small">
                Optional — not required to use Knova. Nothing is actually shared. Employers never
                see individual results.
              </p>
              <Switch
                label="Share summary with my GP"
                checked={p.shareGp}
                onChange={(v) => set("shareGp", v)}
              />
              <Switch
                label="De-identified research"
                checked={p.research}
                onChange={(v) => set("research", v)}
              />
            </>
          ) : (
            <>
              <Switch
                label="Appointment reminders"
                checked={p.reminders}
                onChange={(v) => set("reminders", v)}
              />
              <Switch
                label="Result release alerts"
                checked={p.resultAlerts}
                onChange={(v) => set("resultAlerts", v)}
              />
            </>
          )}
        </Modal>
      )}
    </>
  );
}

export function Documents({ go }: Nav) {
  const s = useDemo();
  const ups = useUploads();
  const [err, setErr] = useState("");
  const [view, setView] = useState<string | null>(null);
  const doc = s.docs.find((d) => d.id === view);
  return (
    <>
      <Head
        eyebrow="Participant journey"
        title="Your document library."
        sub="Reviewed examples and earlier results, ready for your care conversation."
      />
      <Card>
        <h3>Reviewed sample documents</h3>
        {s.docs.map((d) => (
          <WireRow
            key={d.id}
            title={d.name}
            sub={`${d.kind} · ${d.status}`}
            action="Open"
            onClick={() => setView(d.id)}
          />
        ))}
      </Card>
      <Card>
        <h3>Previous records</h3>
        {ups.length ? (
          ups.map((u) => (
            <div key={u.id} className="pv-wire-row">
              <div>
                <strong>{u.name}</strong>
                <small>Session only · not sent for review</small>
              </div>
              <Icon name="documents" size={16} />
            </div>
          ))
        ) : (
          <p className="pv-small pv-muted">No sample history attached yet.</p>
        )}
        {err && (
          <p className="pv-error" role="alert">
            {err}
          </p>
        )}
      </Card>
      <label className="pv-btn pv-btn-wide pv-btn-secondary pv-file">
        Upload prior results
        <Icon name="arrow" size={12} />
        <input
          type="file"
          aria-label="Upload prior results"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            const v = validateUpload(f);
            if (v) {
              setErr(v);
              return;
            }
            setErr("");
            addUpload({ id: `${Date.now()}`, name: f.name, type: f.type, size: f.size });
            announce(`${f.name} attached for this session only.`);
          }}
        />
      </label>
      <FullAction onClick={() => go("mhr")}>Explore My Health Record</FullAction>
      <p className="pv-small pv-muted pv-wide">
        Sample files only · PDF/PNG/JPEG/TXT up to 5 MB. Kept in this browser tab; never uploaded or
        sent to a clinician.
      </p>
      {doc && (
        <Modal title={doc.name} onClose={() => setView(null)}>
          <pre className="pv-pre">{doc.content}</pre>
          <Button
            className="pv-btn"
            onClick={() => downloadText(`${doc.id}-sample.txt`, doc.content)}
          >
            Download sample
          </Button>
        </Modal>
      )}
    </>
  );
}

const MHR_TABS = ["Overview", "Documents", "Medicines", "Access"] as const;
const RECORDS = [
  "Pathology report",
  "Diagnostic imaging report",
  "Shared health summary",
  "Discharge summary",
];
export function Mhr() {
  const s = useDemo();
  const [t, setT] = useState<(typeof MHR_TABS)[number]>("Overview");
  const [doc, setDoc] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const records = RECORDS.filter(
    (name) =>
      filter === "All" ||
      (filter === "Pathology"
        ? name.includes("Pathology")
        : filter === "Imaging"
          ? name.includes("imaging")
          : filter === "Summaries"
            ? name.includes("summary")
            : false),
  );
  return (
    <>
      <Head
        eyebrow="Australian national health record"
        title="My Health Record"
        sub="Clinical documents, medicines and access controls within the participant app."
      />
      <div className="pv-banner pv-wide">
        <strong>Illustrative concept screen</strong>
        <br />
        Planned integration · not connected. Sample records only.
      </div>
      <Card tone="pastel" className="pv-feature">
        <div className="pv-record-top">
          <div>
            <h2>National record summary</h2>
            <p>Fictional demonstration · no live record</p>
          </div>
          <span className="pv-pill">Not connected</span>
        </div>
        <div className="pv-profile-summary">
          <span className="pv-profile-avatar">{s.profile.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>{s.profile.name}</strong>
            <small>Fictional participant</small>
            <small>No identity verification or ADHA connection</small>
          </div>
        </div>
      </Card>
      <Tabs items={MHR_TABS} value={t} onChange={setT} label="My Health Record sections" />
      <div className="pv-record-panel pv-wide" role="tabpanel" aria-label={t}>
        {t === "Overview" && (
          <>
            <div className="pv-record-stats">
              {[
                ["documents", "12", "Clinical documents"],
                ["plan", "3", "Current medicines"],
                ["results", "1", "Allergy or reaction"],
                ["care", "8", "Immunisation records"],
              ].map(([icon, value, label]) => (
                <Card key={label}>
                  <Icon name={icon ?? "documents"} size={20} />
                  <b>{value}</b>
                  <small>{label} · sample</small>
                </Card>
              ))}
            </div>
            <SectionTitle title="Recently added" onClick={() => setT("Documents")} />
            <div className="pv-record-docs">
              {RECORDS.filter((x) => x !== "Shared health summary").map((name) => (
                <Card key={name}>
                  <WireRow
                    icon="documents"
                    title={name}
                    sub="Fictional concept document"
                    onClick={() => setDoc(name)}
                  />
                </Card>
              ))}
            </div>
            <Card tone="pastel">
              <h3>Clinical information stays separate</h3>
              <p className="pv-small">
                Individual records are never included in employer or insurance reporting. No
                national-record data is accessed.
              </p>
              <div className="pv-btns">
                <Button variant="prototype" className="pv-mini-btn" onClick={() => setT("Access")}>
                  View access history
                </Button>
                <Button variant="prototype" className="pv-mini-btn" onClick={() => setT("Access")}>
                  Manage sharing
                </Button>
              </div>
            </Card>
          </>
        )}
        {t === "Documents" && (
          <>
            <Tabs
              items={["All", "Pathology", "Imaging", "Summaries", "Letters"]}
              value={filter}
              onChange={setFilter}
              label="Filter record documents"
            />
            <div className="pv-record-docs">
              {records.map((name) => (
                <Card key={name}>
                  <WireRow
                    icon="documents"
                    title={name}
                    sub="Fictional concept document"
                    action="Open"
                    onClick={() => setDoc(name)}
                  />
                </Card>
              ))}
            </div>
            {!records.length && (
              <p className="pv-small">No fictional documents in this category.</p>
            )}
          </>
        )}
        {t === "Medicines" && (
          <>
            <Card>
              <h3>Current medicines (sample)</h3>
              <p>No sample medicines dispensed.</p>
            </Card>
            <Card tone="warn">
              <h3>Allergies and immunisations</h3>
              <p className="pv-small">
                Allergies: none recorded (sample). Immunisations: 3 sample entries.
              </p>
            </Card>
          </>
        )}
        {t === "Access" && (
          <>
            <Card>
              <h3>Recent access history (sample)</h3>
              <div className="pv-wire-row">
                <div>
                  <strong>Demo clinic</strong>
                  <small>Viewed fictional overview</small>
                </div>
              </div>
              <div className="pv-wire-row">
                <div>
                  <strong>{s.profile.name}</strong>
                  <small>Viewed sample documents</small>
                </div>
              </div>
            </Card>
            <Card tone="pastel">
              <h3>Your sharing controls</h3>
              <Switch
                label="Illustrative sharing preference"
                hint="Not connected — no data is accessed or shared."
                checked={s.mhrSharing}
                onChange={(v) => update((st) => ({ ...st, mhrSharing: v }))}
              />
            </Card>
            <div className="pv-banner">
              Employer access blocked · individual records are never shown to employers.
            </div>
          </>
        )}
      </div>
      <p className="pv-small pv-muted pv-wide">
        No ADHA connection, data-residency or compliance claims are made by this prototype.
      </p>
      {doc && (
        <Modal title={doc} onClose={() => setDoc(null)}>
          <p>Fictional national-record concept. No document was retrieved from My Health Record.</p>
          <Button
            className="pv-btn"
            onClick={() =>
              downloadText(
                "knova-record-concept.txt",
                `FICTIONAL NATIONAL-RECORD CONCEPT\n${doc}\nNo live record accessed.`,
              )
            }
          >
            Download concept sample
          </Button>
        </Modal>
      )}
    </>
  );
}
