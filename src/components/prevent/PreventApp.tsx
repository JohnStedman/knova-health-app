import { useCallback, useEffect, useRef, useState } from "react";
import { isScreenId, update, useDemo, useCloudAccount, workspaceSync, wasRecovered, type Booking, type ScreenId } from "@/lib/prevent-store";
import { startAccountConnection } from "@/lib/external-supabase";
import { Button } from "@/components/ui/button";
import { BookingForm, SCREEN_COMPONENTS, type Nav } from "./screens";
import { announce, Announcer, Modal } from "./ui";
import { Brand, Icon, Navigation, SCREEN_LABELS } from "./app-navigation";
import { SearchDialog, UpdatesDialog } from "./app-tools";

const TABS: ScreenId[] = ["home", "bookings", "results", "profile"];
const readHash = (): ScreenId => {
  const hash = window.location.hash.replace(/^#(screen=)?/, "");
  const query = new URLSearchParams(window.location.search).get("screen") ?? "";
  return isScreenId(hash) ? hash : isScreenId(query) ? query : "home";
};

export function PreventApp() {
  const state = useDemo();
  const sync = useCloudAccount();
  useEffect(() => startAccountConnection(), []);
  useEffect(() => { setBooking(null); setTool(null); }, [sync.epoch]);
  const [screen, setScreen] = useState<ScreenId>("home");
  const [tool, setTool] = useState<"menu" | "search" | "updates" | null>(null);
  const [booking, setBooking] = useState<{ edit?: Booking | undefined } | null>(null);
  const main = useRef<HTMLElement>(null);
  const depth = useRef(0);
  const mounted = useRef(false);
  useEffect(() => {
    setScreen(readHash());
    if (wasRecovered()) announce("Saved demo data was invalid and has been reset.");
    const onHash = () => { setScreen(readHash()); window.scrollTo(0, 0); };
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setTool("search"); }
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("hashchange", onHash); window.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => {
    document.title = `${SCREEN_LABELS[screen]} · Knova`;
    if (mounted.current) main.current?.focus({ preventScroll: true });
    mounted.current = true;
  }, [screen]);
  const go = useCallback((id: ScreenId) => {
    setTool(null);
    if (window.location.hash !== `#${id}`) { depth.current += 1; window.location.hash = id; }
    setScreen(id); window.scrollTo(0, 0);
  }, []);
  const back = () => { if (depth.current > 0) { depth.current -= 1; window.history.back(); } else go("home"); };
  const nav: Nav = { go, openBooking: edit => setBooking({ edit }) };
  const Screen = SCREEN_COMPONENTS[screen];
  const initials = state.profile.name.trim().slice(0, 1).toUpperCase() || "A";
  const activeTab = ["hormones", "biological", "trajectory", "care-summary"].includes(screen) ? "results" : screen === "consult" ? "bookings" : screen;
  return <div className="pv-stage" data-theme={state.theme}><div className="pv-shell">
    <a className="pv-skip" href="#pv-main" onClick={event => { event.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <aside className="pv-sidebar" aria-label="Knova workspace">
      <button className="pv-brand-button" aria-label="Knova home" onClick={() => go("home")}><Brand /></button>
      <span className="pv-workspace-label">MY HEALTH SPACE</span>
      <Navigation screen={screen} go={go} />
      <div className="pv-sidebar-footer"><span className="pv-demo-chip">{sync.mode === "cloud" ? "Cloud · sample data" : "Demo · sample data"}</span><button onClick={() => go("profile")}>Privacy & preferences <Icon name="arrow" size={16} /></button></div>
    </aside>
    <div className="pv-workspace">
      <header className="pv-header"><div className="pv-header-in">
        <button className="pv-mobile-brand pv-brand-button" onClick={() => go("home")} aria-label="Knova home"><Brand /></button>
        <div className="pv-breadcrumb"><span>My Knova</span><span aria-hidden="true">/</span><strong>{SCREEN_LABELS[screen]}</strong></div>
        <button className="pv-search-trigger" onClick={() => setTool("search")}><Icon name="search" size={18} /><span>Search your app</span><kbd>⌘ K</kbd></button>
        <div className="pv-header-tools">
          <button className="pv-icon pv-search-mobile" aria-label="Search your app" onClick={() => setTool("search")}><Icon name="search" /></button>
          <button className="pv-icon" aria-label="Your updates" onClick={() => setTool("updates")}><Icon name="bell" /></button>
          <button className="pv-icon pv-theme-toggle" aria-label={state.theme === "dark" ? "Use light mode" : "Use dark mode"} onClick={() => update(s => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))}><Icon name={state.theme === "dark" ? "sun" : "moon"} /></button>
          <button className="pv-avatar" onClick={() => go("profile")} aria-label="Open your profile">{initials}</button>
          <button className="pv-icon pv-mobile-menu" onClick={() => setTool("menu")} aria-label="Open menu" aria-haspopup="dialog"><Icon name="menu" /></button>
        </div>
      </div></header>
      <main id="pv-main" ref={main} tabIndex={-1} className={`pv-content pv-screen-${screen}`}>
        {sync.mode === "cloud" && <div className="pv-banner pv-cloud-banner" role="status">Cloud mode · fictional workspace · {sync.phase === "error" ? "Sync failed — not saved" : sync.phase === "saved" ? "Saved" : sync.phase === "loading" ? "Loading — editing paused" : sync.phase === "saving" ? "Saving…" : sync.phase === "pending" ? "Changes not yet saved" : "Account workspace loaded"}
          {sync.phase === "error" && <><span className="pv-small">{sync.error}</span><Button className="pv-btn" onClick={() => { void workspaceSync.retry(); }}>Retry sync</Button></>}
          <Button className="pv-btn" onClick={() => workspaceSync.disable()}>Return to Demo mode</Button>
        </div>}
        {screen !== "home" && <button className="pv-back" onClick={back}><span aria-hidden="true">←</span> Back</button>}
        {sync.mode === "cloud" && !workspaceSync.canEdit() && screen !== "profile" ? <p className="pv-small">Account workspace unavailable. Retry sync or return to Demo mode.</p> : <Screen key={`${screen}-${sync.epoch}`} {...nav} />}
        <footer className="pv-content-footer"><span>Knova · Your health, in focus</span><span>Internal prototype · fictional data</span></footer>
      </main>
    </div>
    <nav className="pv-bottomnav" aria-label="Main"><div className="pv-bottomnav-in">{TABS.map(id => <button key={id} aria-current={activeTab === id ? "page" : undefined} onClick={() => go(id)}><Icon name={id} size={22} /><span>{id === "home" ? "Home" : id === "bookings" ? "Bookings" : id === "results" ? "Results" : "Profile"}</span></button>)}</div></nav>
    {tool === "menu" && <Modal title="Your Knova" onClose={() => setTool(null)}><Navigation screen={screen} go={go} compact /></Modal>}
    {tool === "search" && <SearchDialog go={go} close={() => setTool(null)} />}
    {tool === "updates" && <UpdatesDialog go={go} close={() => setTool(null)} />}
    {booking && <Modal title={booking.edit ? "Reschedule appointment" : "Book an appointment"} onClose={() => setBooking(null)}><p className="pv-small pv-muted">Simulated booking. No real appointment is made.</p><BookingForm edit={booking.edit} onDone={() => { setBooking(null); go("bookings"); }} /></Modal>}
    <Announcer />
  </div></div>;
}
