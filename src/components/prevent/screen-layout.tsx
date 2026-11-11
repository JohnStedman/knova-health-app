import type { ReactNode } from "react";
import type { Booking, ScreenId } from "@/lib/prevent-store";
import { Eyebrow } from "./ui";
export interface Nav { go: (id: ScreenId) => void; openBooking: (edit?: Booking) => void }
export const fmtDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
export const Head = ({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) => (
  <header className="pv-screen-head"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1>{sub && <p className="pv-muted">{sub}</p>}</header>
);
export const Row = ({ children, onClick, label }: { children: ReactNode; onClick: () => void; label?: string }) => (
  <button className="pv-row" onClick={onClick} aria-label={label}>{children}<span aria-hidden>›</span></button>
);

