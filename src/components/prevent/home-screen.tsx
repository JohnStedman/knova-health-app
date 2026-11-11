import { nextBooking, summaryCounts, useDemo, useUploads } from "@/lib/prevent-store";
import { Button } from "@/components/ui/button";
import { Card, Eyebrow } from "./ui";
import { Head, fmtDate, WireRow, SectionTitle, FullAction, type Nav } from "./screen-layout";

export function Home({ go, openBooking }: Nav) {
  const s = useDemo();
  const uploads = useUploads();
  const booking = nextBooking(s);
  const counts = summaryCounts(s);
  return (
    <>
      <Head
        eyebrow="Participant journey"
        title={`Welcome back, ${s.profile.name}.`}
        sub="A clearer picture. A practical next step."
      />
      <Card tone="pastel" className="pv-feature">
        <Eyebrow>Your next step</Eyebrow>
        <h2>Prepare for your clinician conversation.</h2>
        <p>
          {s.intake.saved
            ? "Your history is saved. Add prior results and bring your questions."
            : "Complete your history, add prior results and bring your questions."}
        </p>
        <FullAction onClick={() => go("journey")}>Explore your journey</FullAction>
      </Card>
      <SectionTitle title="Your to-do list" onClick={() => go("journey")} />
      <Card>
        <h3>Start with context</h3>
        <WireRow
          title={s.intake.saved ? "Health history complete" : "Complete your health history"}
          sub="Goals, consent and clinical context"
          onClick={() => go("journey")}
        />
        <WireRow
          title={uploads.length ? "Previous results attached" : "Add previous results"}
          sub={uploads.length ? "Available in this session" : "Prepare your consultation"}
          onClick={() => go("documents")}
        />
      </Card>
      <SectionTitle title="Upcoming care" onClick={() => go("bookings")} />
      <Card>
        <h3>Your care schedule</h3>
        {booking ? (
          <WireRow
            title={booking.service}
            sub={`${fmtDate(booking.date)} · ${booking.time} · ${booking.mode}`}
            onClick={() => go("bookings")}
          />
        ) : (
          <WireRow
            title="No upcoming appointments"
            sub="Make time for your next conversation"
            action="Book"
            onClick={() => openBooking()}
          />
        )}
      </Card>
      <SectionTitle title="Your health summary" onClick={() => go("results")} />
      <div className="pv-stats">
        {(
          [
            ["Action", counts.action],
            ["Monitor", counts.monitor],
            ["In range", counts.inRange],
          ] as const
        ).map(([label, count]) => (
          <Button variant="prototype" className="pv-stat" key={label} onClick={() => go("results")}>
            <b>{count}</b>
            <span>{label}</span>
          </Button>
        ))}
      </div>
      <FullAction onClick={() => go("plan")}>View your action plan</FullAction>
    </>
  );
}
