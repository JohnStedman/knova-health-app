import { useState } from "react";
import { SCREENS, nextBooking, releasedResults, useDemo, type ScreenId } from "@/lib/prevent-store";
import { Icon, SCREEN_LABELS } from "./app-navigation";
import { Modal } from "./ui";

export function SearchDialog({ go, close }: { go: (id: ScreenId) => void; close: () => void }) {
  const [query, setQuery] = useState("");
  const matches = SCREENS.filter(screen => `${screen.title} ${screen.sub} ${SCREEN_LABELS[screen.id]}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <Modal title="Find what you need" onClose={close}><label className="pv-label">Search your app<input autoFocus type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Results, appointments, documents…" /></label><div className="pv-search-results" aria-live="polite">{matches.length ? matches.map(screen => <button className="pv-row" key={screen.id} onClick={() => { close(); go(screen.id); }}><Icon name={screen.id} /><span><b>{SCREEN_LABELS[screen.id]}</b><small>{screen.sub}</small></span><Icon name="arrow" /></button>) : <p className="pv-muted">No matching sections. Try “results”, “care” or “documents”.</p>}</div></Modal>;
}

export function UpdatesDialog({ go, close }: { go: (id: ScreenId) => void; close: () => void }) {
  const state = useDemo();
  const booking = nextBooking(state);
  const items: { id: ScreenId; title: string; detail: string }[] = [];
  if (!state.intake.saved) items.push({ id: "journey", title: "Complete your health history", detail: "Help your clinician prepare for your conversation." });
  if (booking) items.push({ id: "bookings", title: "Your next appointment", detail: `${booking.service} · ${booking.date} at ${booking.time} · Adelaide time` });
  const count = releasedResults(state).length;
  if (count) items.push({ id: "results", title: `${count} reviewed results are available`, detail: "Explore your sample findings and clinician notes." });
  const remaining = state.plan.actions.filter(action => !action.done).length;
  if (remaining) items.push({ id: "plan", title: `${remaining} actions to work on`, detail: "Take the next small step in your personal plan." });
  return <Modal title="Your updates" onClose={close}><p className="pv-small pv-muted">Updates from your sample care journey.</p>{items.length ? items.map(item => <button className="pv-row" key={item.id} onClick={() => { close(); go(item.id); }}><span className="pv-tool-icon"><Icon name={item.id} /></span><span><b>{item.title}</b><small>{item.detail}</small></span><Icon name="arrow" /></button>) : <p>You’re all caught up.</p>}</Modal>;
}
