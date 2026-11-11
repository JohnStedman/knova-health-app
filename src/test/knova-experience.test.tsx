import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { PreventApp } from "@/components/prevent/PreventApp";
import { SCREEN_LABELS } from "@/components/prevent/app-navigation";
import {
  SCREENS,
  createDefaultState,
  loadState,
  nextBooking,
  resetDemo,
  serialize,
} from "@/lib/prevent-store";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  resetDemo();
});
afterEach(cleanup);

describe("Knova participant experience", () => {
  it("opens all fifteen sections through the app navigation", () => {
    render(<PreventApp />);
    for (const item of SCREENS) {
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      const navigation = screen.getByRole("navigation", { name: "All sections" });
      fireEvent.click(within(navigation).getByRole("button", { name: SCREEN_LABELS[item.id] }));
      expect(screen.getByRole("main").querySelector("h1")).toBeTruthy();
      expect(document.title).toBe(`${SCREEN_LABELS[item.id]} · Knova`);
      expect(window.location.hash).toBe(`#${item.id}`);
    }
  });

  it("searches sections and filters reviewed markers including an empty state", () => {
    render(<PreventApp />);
    fireEvent.click(screen.getByRole("button", { name: "Search your app" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "results" } });
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /My results/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("More result options"));
    fireEvent.click(screen.getByRole("button", { name: "Search & filter markers" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search markers" }), {
      target: { value: "ApoB" },
    });
    expect(screen.getByText("1 reviewed markers")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search markers" }), {
      target: { value: "not-a-marker" },
    });
    expect(screen.getByText("No matching results")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("searchbox", { name: "Search markers" })).toHaveValue("");
  });

  it("carries action changes between the dashboard and the plan and saves them", () => {
    render(<PreventApp />);
    fireEvent.click(screen.getByRole("button", { name: "View your action plan" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Consistent sleep window/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Home$/ }));
    fireEvent.click(screen.getByRole("button", { name: "View your action plan" }));
    expect(screen.getByRole("checkbox", { name: /Consistent sleep window/ })).toBeChecked();
    expect(loadState(window.localStorage.getItem("prevent-demo")).state.plan.actions[0]?.done).toBe(
      true,
    );
  });

  it("requires cancellation confirmation and blocks the cancelled consultation", () => {
    render(<PreventApp />);
    fireEvent.click(screen.getByRole("button", { name: /^Bookings$/ }));
    fireEvent.click(screen.getByRole("button", { name: /View appointment/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("dialog", { name: "Cancel this appointment?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm cancellation" }));
    expect(screen.queryByRole("button", { name: "Join (simulated)" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByRole("button", { name: /^Telehealth$/ }));
    expect(screen.getByText("No confirmed telehealth appointment")).toBeInTheDocument();
  });

  it("recovers malformed nested state and omits past appointments from upcoming care", () => {
    const state = createDefaultState(new Date("2026-11-11T12:00:00Z"));
    expect(
      loadState(serialize({ ...state, plan: null } as unknown as typeof state)).recovered,
    ).toBe(true);
    const booking = state.bookings[0];
    if (!booking) throw new Error("Missing booking fixture");
    booking.date = "2026-11-10";
    expect(nextBooking(state, new Date("2026-11-11T12:00:00Z"))).toBeUndefined();
  });
});
