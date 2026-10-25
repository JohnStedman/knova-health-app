import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { PreventApp } from "@/components/prevent/PreventApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prevent · Your preventive health app (prototype)" },
      { name: "description", content: "Prevent participant app prototype: next steps, bookings, results and action plan. Fictional data; no live services." },
      { property: "og:title", content: "Prevent · Your preventive health app (prototype)" },
      { property: "og:description", content: "Clickable Prevent health app prototype with fictional data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return <ClientOnly fallback={<div className="pv-loading">Loading Prevent…</div>}><PreventApp /></ClientOnly>;
}
