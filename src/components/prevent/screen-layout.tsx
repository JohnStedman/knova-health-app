import type { ReactNode } from "react";
import type { Booking, ScreenId } from "@/lib/prevent-store";
import { Eyebrow } from "./ui";
import { Button } from "@/components/ui/button";
import { Icon } from "./app-navigation";
export interface Nav {
  go: (id: ScreenId) => void;
  openBooking: (edit?: Booking) => void;
}
export const fmtDate = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
export const Head = ({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) => (
  <header className="pv-screen-head">
    <Eyebrow>{eyebrow}</Eyebrow>
    <h1>{title}</h1>
    {sub && <p className="pv-muted">{sub}</p>}
  </header>
);
export const Row = ({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label?: string;
}) => (
  <Button variant="prototype" className="pv-row" onClick={onClick} aria-label={label}>
    {children}
    <Icon name="arrow" size={14} />
  </Button>
);
export function WireRow({
  title,
  sub,
  action = "View",
  onClick,
  icon,
}: {
  title: string;
  sub?: string;
  action?: string;
  onClick: () => void;
  icon?: string;
}) {
  return (
    <div className={`pv-wire-row ${icon ? "pv-wire-row-icon" : ""}`}>
      {icon && (
        <span className="pv-tool-icon">
          <Icon name={icon} size={18} />
        </span>
      )}
      <div>
        <strong>{title}</strong>
        {sub && <small>{sub}</small>}
      </div>
      <Button variant="prototype" className="pv-mini-btn" onClick={onClick} aria-label={`${action} ${title}`}>
        {action}
        <Icon name="arrow" size={10} />
      </Button>
    </div>
  );
}
export function SectionTitle({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div className="pv-section-title">
      <h2>{title}</h2>
      <Button variant="prototype" className="pv-text-link" onClick={onClick}>
        View all
      </Button>
    </div>
  );
}
export function FullAction({
  children,
  onClick,
  secondary = false,
}: {
  children: ReactNode;
  onClick: () => void;
  secondary?: boolean;
}) {
  return (
    <Button
      className={`pv-btn pv-btn-wide ${secondary ? "pv-btn-secondary" : "pv-btn-primary"}`}
      onClick={onClick}
    >
      {children}
      <Icon name="arrow" size={12} />
    </Button>
  );
}
