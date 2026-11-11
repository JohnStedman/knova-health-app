import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Bookings, BookingForm } from "@/components/prevent/appointment-screens";
import {
  adelaideDate, bookingStatus, upcomingBookings, nextBooking, consultationBooking,
  startConsultation, advanceConsultation, cancelBooking, saveBooking,
  createDefaultState, loadState, serialize, resetDemo, update, type Booking,
} from "@/lib/prevent-store";

const clock = new Date("2026-11-11T04:42:00Z");
const past: Booking = { id: "past", service: "Clinician consultation", date: "2026-11-02", time: "10:30", mode: "Telehealth", status: "confirmed" };
const future: Booking = { ...past, id: "future", date: "2026-11-12" };
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(clock); resetDemo(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
const fixture = () => ({ ...createDefaultState(clock), bookings: [past, future] });

describe("Adelaide appointment eligibility", () => {
  it("preserves a persisted 2 November record but excludes it from upcoming/Home", () => {
    const decoded = loadState(serialize(fixture()), clock);
    expect(decoded.recovered).toBe(false);
    expect(decoded.state.bookings[0]?.date).toBe("2026-11-02");
    expect(bookingStatus(past, clock)).toBe("Past");
    expect(upcomingBookings(decoded.state, clock).map(b => b.id)).toEqual(["future"]);
    expect(nextBooking(decoded.state, clock)?.id).toBe("future");
  });
  it("uses Adelaide's date when the UTC day is different", () => {
    const boundary = new Date("2026-11-10T14:00:00Z");
    expect(adelaideDate(boundary)).toBe("2026-11-11");
    expect(bookingStatus({ ...past, date: "2026-11-10" }, boundary)).toBe("Past");
    expect(bookingStatus({ ...past, date: "2026-11-11" }, boundary)).toBe("Confirmed");
  });
  it("never auto-selects, explicitly selects or advances a past consultation", () => {
    const state = { ...fixture(), bookings: [past] };
    expect(consultationBooking(state, clock)).toBeUndefined();
    expect(startConsultation(state, "past", clock)).toBe(state);
    const selected = { ...fixture(), consult: { ...state.consult, bookingId: "past", identity: true, privacy: true, device: true } };
    expect(consultationBooking(selected, clock)).toBeUndefined();
    for (const phase of ["checks", "waiting", "call", "ended"] as const) {
      expect(advanceConsultation(selected, phase, clock)).toBe(selected);
    }
  });
  it("does not fall back to another booking after cancelled selection, and rejects clinic selection", () => {
    const selected = startConsultation(fixture(), "future", clock);
    const cancelled = cancelBooking(selected, "future");
    expect(consultationBooking(cancelled, clock)).toBeUndefined();
    expect(startConsultation(cancelled, "future", clock)).toBe(cancelled);
    expect(advanceConsultation(cancelled, "waiting", clock)).toBe(cancelled);
    const clinic = saveBooking(fixture(), { ...future, mode: "CHG clinic" });
    expect(startConsultation(clinic, "future", clock)).toBe(clinic);
    expect(consultationBooking(clinic, clock)).toBeUndefined();
  });
  it("permits same-day and future confirmed telehealth and their valid phase transitions", () => {
    for (const date of ["2026-11-11", "2026-11-12"]) {
      const state = saveBooking(fixture(), { ...future, date });
      const selected = startConsultation(state, "future", clock);
      expect(consultationBooking(selected, clock)?.date).toBe(date);
      const ready = { ...selected, consult: { ...selected.consult, identity: true, device: true, privacy: true } };
      const waiting = advanceConsultation(ready, "waiting", clock);
      const call = advanceConsultation(waiting, "call", clock);
      expect(call.consult.phase).toBe("call");
      expect(advanceConsultation(call, "ended", clock).consult.phase).toBe("ended");
    }
  });
  it("rescheduling a past record to the future restores upcoming and join eligibility", () => {
    const changed = saveBooking({ ...fixture(), bookings: [past] }, { ...past, date: "2026-11-15" });
    expect(nextBooking(changed, clock)?.date).toBe("2026-11-15");
    expect(consultationBooking(startConsultation(changed, "past", clock), clock)?.id).toBe("past");
  });
  it("lists persisted past records only in history and resolves open details from current state", () => {
    update(() => fixture());
    render(<Bookings go={vi.fn()} openBooking={vi.fn()} />);
    expect(screen.getAllByRole("button", { name: /View appointment/ })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "View all" }));
    expect(screen.getAllByRole("button", { name: /View appointment/ })).toHaveLength(2);
    const pastRow = screen.getAllByRole("button", { name: /View appointment/ })[0];
    if (!pastRow) throw new Error("Missing persisted history record");
    fireEvent.click(pastRow);
    expect(screen.queryByRole("button", { name: "Join (simulated)" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reschedule" })).toBeEnabled();
    expect(screen.queryByText("Before your appointment")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Show upcoming" }));
    expect(screen.getAllByRole("button", { name: /View appointment/ })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /View appointment/ }));
    act(() => update(state => cancelBooking(state, "future")));
    expect(screen.queryByRole("button", { name: "Join (simulated)" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reschedule" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Cancel$/ })).not.toBeInTheDocument();
  });
  it("a stale reschedule form cannot reconfirm a cancelled record", () => {
    update(() => ({ ...fixture(), bookings: [{ ...future, status: "cancelled" }] }));
    render(<BookingForm edit={future} onDone={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Save new time" }));
    expect(screen.getByText(/no longer confirmed/)).toBeInTheDocument();
  });
});