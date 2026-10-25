import { useRef, useSyncExternalStore, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

// ---- Live announcements (aria-live) ----
let msg = "";
const subs = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
export function announce(text: string) {
  msg = text; subs.forEach((s) => s());
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { msg = ""; subs.forEach((s) => s()); }, 4000);
}
export function Announcer() {
  const text = useSyncExternalStore((l) => (subs.add(l), () => subs.delete(l)), () => msg, () => "");
  return <div className="pv-toast" role="status" aria-live="polite">{text && <span>{text}</span>}</div>;
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const trigger = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const theme = document.querySelector(".pv-stage")?.getAttribute("data-theme") ?? "light";
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}><Dialog.Portal>
      <Dialog.Overlay className="pv-backdrop" data-theme={theme} />
      <Dialog.Content className="pv-modal" data-theme={theme} aria-describedby={undefined} onCloseAutoFocus={(event) => {
        event.preventDefault();
        if (trigger.current?.isConnected) trigger.current.focus();
        else document.getElementById("pv-main")?.focus();
      }}>
        <div className="pv-modal-head"><Dialog.Title asChild><h2>{title}</h2></Dialog.Title><Dialog.Close asChild><button className="pv-icon" aria-label="Close dialog">✕</button></Dialog.Close></div>
        {children}
      </Dialog.Content>
    </Dialog.Portal></Dialog.Root>
  );
}

export function Switch({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="pv-switch-row">
      <div><div className="pv-strong">{label}</div>{hint && <div className="pv-muted pv-small">{hint}</div>}</div>
      <button role="switch" aria-checked={checked} aria-label={label} className="pv-switch" onClick={() => onChange(!checked)}><span /></button>
    </div>
  );
}

export function Tabs<T extends string>({ items, value, onChange, label }: { items: readonly T[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="pv-tabs" role="tablist" aria-label={label}
      onKeyDown={(e) => {
        const i = items.indexOf(value);
        const index = e.key === "ArrowRight" ? (i + 1) % items.length : e.key === "ArrowLeft" ? (i - 1 + items.length) % items.length : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : -1;
        const next = items[index];
        if (next !== undefined) { e.preventDefault(); onChange(next); e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")[index]?.focus(); }
      }}>
      {items.map((it) => (
        <button key={it} role="tab" aria-selected={it === value} tabIndex={it === value ? 0 : -1} className="pv-tab" onClick={() => onChange(it)}>{it}</button>
      ))}
    </div>
  );
}

export const Card = ({ children, tone, className = "" }: { children: ReactNode; tone?: "pastel" | "warn"; className?: string }) =>
  <section className={`pv-card ${tone ? `pv-card-${tone}` : ""} ${className}`}>{children}</section>;

export const Pill = ({ status }: { status: string }) => <span className={`pv-pill pv-pill-${status}`}>{status === "in-range" ? "In range" : status === "action" ? "Action" : status === "monitor" ? "Monitor" : status}</span>;

export const Eyebrow = ({ children }: { children: ReactNode }) => <div className="pv-eyebrow">{children}</div>;

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="pv-check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> <span>{label}</span></label>;
}
