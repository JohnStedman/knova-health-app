import { useState } from "react";
import { update, useDemo, type DemoState, type Provider } from "@/lib/prevent-store";
import { Button } from "@/components/ui/button";
import { Icon } from "./app-navigation";
import { announce, Card, Eyebrow, Modal, Switch, Tabs } from "./ui";
import { Head, FullAction, type Nav } from "./screen-layout";
export function Plan({ go, openBooking }: Nav) {
  const s = useDemo();
  const [ref, setRef] = useState(s.plan.reflection);
  const [action, setAction] = useState<string | null>(null);
  const done = s.plan.actions.filter((a) => a.done).length;
  const selected = s.plan.actions.find((a) => a.id === action);
  const toggle = (id: string, value: boolean) =>
    update((st) => ({
      ...st,
      plan: {
        ...st.plan,
        actions: st.plan.actions.map((a) => (a.id === id ? { ...a, done: value } : a)),
      },
    }));
  return (
    <>
      <Head
        eyebrow="Participant journey"
        title="Your next steps."
        sub="Practical priorities, progress and follow-up in one place."
      />
      <Card tone="pastel" className="pv-feature">
        <Eyebrow>Plan progress</Eyebrow>
        <h2>
          {done} of {s.plan.actions.length} actions complete
        </h2>
        <div
          className="pv-progress"
          role="progressbar"
          aria-label="Action plan progress"
          aria-valuemin={0}
          aria-valuemax={s.plan.actions.length}
          aria-valuenow={done}
        >
          <span style={{ width: `${(done / Math.max(1, s.plan.actions.length)) * 100}%` }} />
        </div>
        <p>Fictional plan for internal workflow review.</p>
      </Card>
      <Card>
        <h3>Priority actions</h3>
        {s.plan.actions.map((a, i) => (
          <div className="pv-wire-row pv-plan-row" key={a.id}>
            <input
              type="checkbox"
              aria-label={a.title}
              checked={a.done}
              onChange={(e) => toggle(a.id, e.target.checked)}
            />
            <div>
              <strong>{a.title}</strong>
              <small>
                {["Sleep & recovery", "Metabolic health", "Nutrition", "Care coordination"][i]}
              </small>
            </div>
            <Button
              className="pv-mini-btn"
              onClick={() => setAction(a.id)}
              aria-label={`Open ${a.title}`}
            >
              Open
            </Button>
          </div>
        ))}
      </Card>
      <FullAction secondary onClick={() => openBooking()}>
        Book a follow-up
      </FullAction>
      <FullAction onClick={() => go("care")}>Message your care team</FullAction>
      <details className="pv-wide pv-extra-options">
        <summary>Plan preferences</summary>
        <div className="pv-btns">
          <Button variant="prototype" className="pv-text-link" onClick={() => setAction("reflection")}>
            Personal reflections
          </Button>
          <Button variant="prototype" className="pv-text-link" onClick={() => go("integrations")}>
            Connected devices
          </Button>
        </div>
      </details>
      {action && (
        <Modal title={selected?.title ?? "Personal reflection"} onClose={() => setAction(null)}>
          {selected && (
            <>
              <p className="pv-small">
                Fictional priority. Review your agreed plan with the care team; this is not
                personalised medical advice.
              </p>
              <Button variant="prototype" className="pv-btn" onClick={() => toggle(selected.id, !selected.done)}>
                {selected.done ? "Reopen action" : "Mark complete"}
              </Button>
            </>
          )}
          <label className="pv-label">
            Reflection
            <textarea rows={3} value={ref} onChange={(e) => setRef(e.target.value)} />
          </label>
          <Button
            className="pv-btn"
            onClick={() => {
              update((st) => ({ ...st, plan: { ...st.plan, reflection: ref } }));
              announce("Reflection saved in your selected workspace.");
              setAction(null);
            }}
          >
            Save reflection
          </Button>
        </Modal>
      )}
    </>
  );
}
export function Care({ openBooking }: Nav) {
  const s = useDemo();
  const [t, setT] = useState("");
  const [compose, setCompose] = useState(false);
  const [thread, setThread] = useState(false);
  const messages = (
    <div className="pv-thread" aria-live="polite">
      {s.messages.map((m) => (
        <p key={m.id} className={`pv-msg pv-msg-${m.from}`}>
          {m.text}
        </p>
      ))}
    </div>
  );
  return (
    <>
      <Head
        eyebrow="Participant journey"
        title="A connected conversation."
        sub="Ask a question, review the plan and coordinate your next appointment."
      />
      <Card>
        <h3>Sample care-team thread</h3>
        {messages}
      </Card>
      <FullAction secondary onClick={() => setCompose(true)}>
        Write a demo message
      </FullAction>
      <FullAction secondary onClick={() => setThread(true)}>
        Open full care conversation
      </FullAction>
      <FullAction secondary onClick={() => openBooking()}>
        Book a review
      </FullAction>
      <p className="pv-small pv-muted pv-wide">
        Not monitored · fictional prototype only. For urgent concerns call 000.
      </p>
      {compose && (
        <Modal title="Write a demo message" onClose={() => setCompose(false)}>
          <p className="pv-small">Nothing is sent to a clinician.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!t.trim()) return;
              update((st) => ({
                ...st,
                messages: [
                  ...st.messages,
                  {
                    id: `m${Date.now()}`,
                    from: "you",
                    text: t.trim(),
                    at: new Date().toISOString(),
                  },
                ],
              }));
              setT("");
              setCompose(false);
              announce("Message saved in your selected workspace. No one will reply.");
            }}
          >
            <label className="pv-label">
              Message
              <textarea rows={3} value={t} onChange={(e) => setT(e.target.value)} />
            </label>
            <Button variant="prototype" className="pv-btn pv-btn-primary" type="submit">
              Send (local)
            </Button>
          </form>
        </Modal>
      )}
      {thread && (
        <Modal title="Care-team conversation" onClose={() => setThread(false)}>
          {messages}
          <Button
            className="pv-btn"
            onClick={() => {
              setThread(false);
              setCompose(true);
            }}
          >
            Write a demo message
          </Button>
        </Modal>
      )}
    </>
  );
}
const PROVIDERS: Provider[] = ["WHOOP", "Apple Health", "Health Connect", "Oura"];
const PROVIDER_COPY = [
  "Recovery · strain · sleep · HRV",
  "Heart rate · workouts · steps",
  "Activity · body metrics · steps",
  "Readiness · sleep · temperature",
];
export function Integrations() {
  const s = useDemo();
  const [provider, setProvider] = useState<Provider | null>(null);
  const d = provider ? s.devices[provider] : null;
  const set = (p: Provider, value: Partial<DemoState["devices"][Provider]>) =>
    update((st) => ({ ...st, devices: { ...st.devices, [p]: { ...st.devices[p], ...value } } }));
  return (
    <>
      <Head
        eyebrow="Wearable integrations"
        title="Connected devices"
        sub="Daily recovery, sleep and activity context between clinical assessments."
      />
      <Card tone="pastel" className="pv-feature">
        <Eyebrow>Sync status</Eyebrow>
        <h2>{PROVIDERS.filter((p) => s.devices[p].connected).length} integrations connected</h2>
        <p>Simulated sleep, recovery, activity and readiness trends. No live data is imported.</p>
      </Card>
      <div className="pv-device-list pv-wide">
        {PROVIDERS.map((p, i) => (
          <Button
            className="pv-booking-row"
            key={p}
            onClick={() => setProvider(p)}
            aria-label={`Manage ${p}`}
          >
            <span className="pv-tool-icon">
              <Icon name="integrations" size={18} />
            </span>
            <span>
              <strong>
                {p === "Apple Health"
                  ? "Apple Watch"
                  : p === "Health Connect"
                    ? "Android / Health Connect"
                    : p === "Oura"
                      ? "Oura Ring"
                      : p}
              </strong>
              <small>{PROVIDER_COPY[i]}</small>
            </span>
            <span className="pv-pill">
              {s.devices[p].connected ? "Demo connected" : "Disconnected"}
            </span>
          </Button>
        ))}
      </div>
      <p className="pv-small pv-muted pv-wide">
        Wearable information supports trends and coaching only, not diagnosis or clinical decisions.
        No OAuth or real health data.
      </p>
      {provider && d && (
        <Modal title={provider} onClose={() => setProvider(null)}>
          <p className="pv-small">No wearable account is connected and no live data is imported.</p>
          {d.connected && (
            <>
              <p className="pv-small">Last simulated sync: {d.lastSync}</p>
              {(["sleep", "activity", "heart"] as const).map((k) => (
                <Switch
                  key={k}
                  label={`Share ${k}`}
                  checked={d.perms[k]}
                  onChange={(v) => set(provider, { perms: { ...d.perms, [k]: v } })}
                />
              ))}
            </>
          )}
          <div className="pv-btns">
            <Button
              className="pv-btn"
              onClick={() => {
                set(provider, {
                  connected: !d.connected,
                  lastSync: d.connected ? undefined : "Just now (simulated)",
                });
                announce(`${provider} ${d.connected ? "disconnected" : "connected"} (simulated).`);
              }}
            >
              {d.connected ? "Disconnect" : "Connect"}
            </Button>
            {d.connected && (
              <Button
                className="pv-btn"
                onClick={() => {
                  set(provider, {
                    lastSync:
                      new Date().toLocaleTimeString("en-AU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) + " (simulated)",
                  });
                  announce(`${provider} synced (simulated).`);
                }}
              >
                Sync now
              </Button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
export const TRAJ: Record<3 | 6 | 12, number[]> = {
  3: [44.2, 43.9, 43.6, 43.4],
  6: [45.1, 44.6, 44.2, 43.9, 43.6, 43.4, 43.2],
  12: [46.0, 45.8, 45.4, 45.1, 44.8, 44.6, 44.2, 43.9, 43.6, 43.4, 43.2, 43.1, 43.0],
};
export function Trajectory({ go }: Nav) {
  const s = useDemo();
  const data = TRAJ[s.range];
  const W = 320,
    H = 180,
    min = 42,
    max = 47;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 245 + 45,
    y: H - 30 - ((v - min) / (max - min)) * 120,
    v,
  }));
  return (
    <>
      <Tabs
        items={["3 months", "6 months", "12 months"] as const}
        value={`${s.range} months` as "3 months" | "6 months" | "12 months"}
        onChange={(v) => update((st) => ({ ...st, range: parseInt(v) as 3 | 6 | 12 }))}
        label="Timeframe"
      />
      <Head
        eyebrow="Progress over time"
        title="Age trajectory"
        sub="Direction of travel matters more than a single result."
      />
      <Card>
        <h3>Biological Age Over Time</h3>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="pv-chart"
          role="img"
          aria-label={`Illustrative trend over ${s.range} months from ${data[0]} to ${data[data.length - 1]}`}
        >
          <path d="M35 15v140h265" fill="none" stroke="var(--pv-line)" />
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="var(--pv-azure)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3" fill="var(--pv-azure)" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--pv-ink)" fontSize="9">
                {p.v}
              </text>
            </g>
          ))}
        </svg>
      </Card>
      <Card tone="pastel" className="pv-trajectory-progress">
        <h3>Sample progress</h3>
        <p className="pv-small">
          {data[0]} → {data[data.length - 1]} over {s.range} months in this illustrative series.
        </p>
        <p className="pv-small">Not a validated score, diagnosis or guaranteed outcome.</p>
      </Card>
      <Card>
        <div className="pv-metric">
          <span>
            <strong>Improved sleep quality</strong>
            <small>Wearable-supported trend</small>
          </span>
          <span className="pv-small">Sample context</span>
        </div>
        <div className="pv-metric">
          <span>
            <strong>Consistent exercise</strong>
            <small>Weekly activity trend</small>
          </span>
          <span className="pv-small">Sample context</span>
        </div>
      </Card>
      <p className="pv-small pv-muted pv-wide">
        Illustrative only · trends do not replace clinical review.
      </p>
      <FullAction onClick={() => go("results")}>Review marker results</FullAction>
    </>
  );
}
