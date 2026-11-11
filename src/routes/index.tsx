import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { PreventApp } from "@/components/prevent/PreventApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Knova · Your health, in focus" },
      { name: "description", content: "Knova participant prototype: next steps, sample bookings, results and action plan, with Demo mode and optional account-owned fictional workspace saving." },
      { property: "og:title", content: "Knova · Your health, in focus" },
      { property: "og:description", content: "Knova participant app with bookings, results and personal action plans. Internal prototype with fictional data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return <ClientOnly fallback={<div className="pv-loading">Loading Knova…</div>}><PreventApp /></ClientOnly>;
}
