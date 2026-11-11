import type { ScreenId } from "@/lib/prevent-store";
import { BRAND } from "@/lib/brand";

export const NAV_GROUPS: { title: string; screens: ScreenId[] }[] = [
  { title: "Your space", screens: ["home", "journey", "bookings", "care"] },
  { title: "Your health", screens: ["results", "hormones", "biological", "trajectory", "plan"] },
  { title: "Your care", screens: ["consult", "care-summary", "documents", "mhr", "integrations", "profile"] },
];
export const SCREEN_LABELS: Record<ScreenId, string> = {
  home: "Overview", journey: "My health journey", profile: "My profile", documents: "Documents",
  mhr: "My Health Record", bookings: "Appointments", consult: "Telehealth", results: "My results",
  hormones: "Hormones & screening", biological: "Biological age", "care-summary": "Care summary",
  plan: "My action plan", care: "Care team", integrations: "Connected devices", trajectory: "Health trends",
};
const paths: Record<string, string> = {
  home: "M3 10 12 3l9 7v10H3zM9 20v-7h6v7", journey: "M5 4v15h14M5 15l5-5 4 3 5-8",
  bookings: "M4 5h16v15H4zM8 3v4M16 3v4M4 10h16M8 14h2M14 14h2",
  results: "M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h5",
  plan: "m4 7 2 2 4-4M13 7h7m-16 9 2 2 4-4M13 16h7",
  care: "M21 11a8 8 0 0 1-8 8H7l-4 3V11a9 9 0 0 1 18 0ZM7 10h10M7 14h6",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  documents: "M3 6h7l2 2h9v12H3zM3 6V4h7l2 2",
  consult: "M3 6h12v12H3zM15 10l6-4v12l-6-4",
  hormones: "M9 3h6M10 3v6l-6 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-9V3M7 15h10",
  biological: "M4 12h4l3-8 3 16 3-8h3", trajectory: "M3 4v16h18M6 15l5-5 4 2 5-7",
  "care-summary": "M5 3h14v18H5zM8 8h8M8 12h8M8 16h5",
  mhr: "M12 3 3 7v5c0 4 4 7 9 9 5-2 9-5 9-9V7zM12 8v8M8 12h8",
  integrations: "M8 3h8v18H8zM8 7h8M8 17h8M11 20h2",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5",
  bell: "M5 17h14l-2-4V9a5 5 0 0 0-10 0v4zM10 21h4",
  arrow: "M5 12h14m-6-6 6 6-6 6", moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1",
  menu: "M4 6h16M4 12h16M4 18h16", check: "m5 12 4 4L19 6",
};
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths["results"]} /></svg>;
}
export function Brand() {
  return <span className="pv-wordmark"><img className="pv-logo-light" src={BRAND.logo} alt="Knova" width="118" height="37" /><img className="pv-logo-dark" src={BRAND.logoOnDark} alt="Knova" width="118" height="37" /></span>;
}
export function Navigation({ screen, go, compact = false }: { screen: ScreenId; go: (id: ScreenId) => void; compact?: boolean }) {
  return <nav aria-label={compact ? "All sections" : "App sections"} className="pv-navigation">{NAV_GROUPS.map(group => <div className="pv-nav-group" key={group.title}><p>{group.title}</p>{group.screens.map(id => <button key={id} type="button" aria-current={screen === id ? "page" : undefined} onClick={() => go(id)}><Icon name={id} /><span>{SCREEN_LABELS[id]}</span>{screen === id && <i aria-hidden="true" />}</button>)}</div>)}</nav>;
}
