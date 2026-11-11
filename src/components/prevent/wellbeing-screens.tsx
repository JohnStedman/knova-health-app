import { useState } from "react";
import { update, useDemo, type DemoState, type Provider } from "@/lib/prevent-store";
import { announce, Card, Check, Switch, Tabs } from "./ui";
import { Head, type Nav } from "./screen-layout";
export function Plan({ go, openBooking }: Nav) {
  const s = useDemo(); const [ref, setRef] = useState(s.plan.reflection); const done = s.plan.actions.filter((a) => a.done).length;
  return (<>
    <Head eyebrow="Act and follow up" title="Personal action plan" sub={`${done} of ${s.plan.actions.length} complete`} />
    <Card>{s.plan.actions.map((a) => <Check key={a.id} label={a.title} checked={a.done} onChange={(v) => update((st) => ({ ...st, plan: { ...st.plan, actions: st.plan.actions.map((x) => x.id === a.id ? { ...x, done: v } : x) } }))} />)}</Card>
    <Card><label className="pv-label">Reflection<textarea rows={3} value={ref} onChange={(e) => setRef(e.target.value)} /></label>
      <button className="pv-btn" onClick={() => { update((st) => ({ ...st, plan: { ...st.plan, reflection: ref } })); announce("Reflection saved on this device."); }}>Save reflection</button></Card>
    <div className="pv-btns"><button className="pv-btn pv-btn-primary" onClick={() => openBooking()}>Book recheck</button><button className="pv-btn" onClick={() => go("integrations")}>Connected devices</button></div>
  </>);
}

export function Care() {
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
export function Integrations() {
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
export function Trajectory() {
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

