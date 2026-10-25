import { useCallback, useEffect, useRef, useState } from "react";
import { isScreenId, SCREENS, update, useDemo, wasRecovered, type Booking, type ScreenId } from "@/lib/prevent-store";
import { BookingForm, SCREEN_COMPONENTS, type Nav } from "./screens";
import { announce, Announcer, Modal } from "./ui";

const TABS: { id: ScreenId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { id: "bookings", label: "Bookings", icon: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" },
  { id: "results", label: "Results", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { id: "profile", label: "Profile", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" },
];
const isTab = (id: ScreenId) => TABS.some((t) => t.id === id);
const readHash = (): ScreenId => {
  const h = window.location.hash.replace(/^#(screen=)?/, "");
  const q = new URLSearchParams(window.location.search).get("screen") ?? "";
  return isScreenId(h) ? h : isScreenId(q) ? q : "home";
};

const Logo = () => (<svg width="24" height="24" viewBox="0 0 32 32" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M16 27s-11-6.5-11-14.5A6 6 0 0 1 16 9a6 6 0 0 1 11 3.5C27 20.5 16 27 16 27z" /><path d="M7 16h5l2-4 3 7 2-3h6" /></svg>);

export function PreventApp() {
  const s = useDemo();
  const [screen, setScreen] = useState<ScreenId>("home");
  const [menu, setMenu] = useState(false);
  const [booking, setBooking] = useState<{ edit?: Booking | undefined } | null>(null);
  const depth = useRef(0);
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    setScreen(readHash());
    if (wasRecovered()) announce("Saved demo data was invalid and has been reset.");
    const on = () => { setScreen(readHash()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const go = useCallback((id: ScreenId) => {
    setMenu(false);
    if (window.location.hash !== `#${id}`) { depth.current += 1; window.location.hash = id; }
    setScreen(id); window.scrollTo(0, 0);
  }, []);
  const back = () => { if (depth.current > 0) { depth.current -= 1; window.history.back(); } else go("home"); };
  const nav: Nav = { go, openBooking: (edit) => setBooking({ edit }) };
  const meta = SCREENS.find((s) => s.id === screen) ?? SCREENS[0];
  const Comp = SCREEN_COMPONENTS[screen];
  const groups = [...new Set(SCREENS.map((s) => s.group))];

  return (<div className="pv-stage" data-theme={s.theme}><div className="pv-shell">
    <a className="pv-skip" href="#pv-main">Skip to content</a>
    <header className="pv-header">
      <div className="pv-header-in">
        {isTab(screen) ? <span className="pv-brand-sm"><Logo /> Prevent</span>
          : <button className="pv-back" onClick={back} aria-label="Back">‹ <span>{meta.title}</span></button>}
        <span className="pv-demo-chip">Demo</span>
        <button className="pv-icon" aria-label={s.theme === "dark" ? "Use light mode" : "Use dark mode"} title={s.theme === "dark" ? "Use light mode" : "Use dark mode"} onClick={() => update((st) => ({ ...st, theme: st.theme === "dark" ? "light" : "dark" }))}>{s.theme === "dark" ? "☀" : "☾"}</button>
        <button className="pv-icon" onClick={() => setMenu(true)} aria-label="Open menu" aria-haspopup="dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>
    </header>
    <main id="pv-main" ref={main} tabIndex={-1} className="pv-content"><Comp {...nav} /><p className="pv-small pv-muted">Fictional demo only. Employers never see individual results.</p></main>
    <nav className="pv-bottomnav" aria-label="Main">
      <div className="pv-bottomnav-in">{TABS.map((t) => <button key={t.id} aria-current={screen === t.id ? "page" : undefined} onClick={() => go(t.id)}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>{t.label}</button>)}</div>
    </nav>
    {menu && <Modal title="Menu" onClose={() => setMenu(false)}>
      <nav aria-label="All sections" className="pv-menu">{groups.map((g) => <div key={g}><h3>{g}</h3>
        {SCREENS.filter((s) => s.group === g).map((s) => <button key={s.id} aria-current={s.id === screen ? "page" : undefined} onClick={() => go(s.id)}><b>{s.title}</b><small>{s.sub}</small></button>)}</div>)}</nav>
    </Modal>}
    {booking && <Modal title={booking.edit ? "Reschedule appointment" : "Book an appointment"} onClose={() => setBooking(null)}>
      <p className="pv-small pv-muted">Simulated booking — no real appointment is made.</p>
      <BookingForm edit={booking.edit} onDone={() => { setBooking(null); go("bookings"); }} /></Modal>}
    <Announcer />
  </div></div>);
}
