import type { ReactNode } from "react";
import type { ScreenId } from "@/lib/prevent-store";
import type { Nav } from "./screen-layout";
import { Home } from "./home-screen";
import { Journey, Profile, Documents, Mhr } from "./account-screens";
import { Bookings, Consult } from "./appointment-screens";
import { Results, Hormones, Biological, CareSummary } from "./results-screens";
import { Plan, Care, Integrations, Trajectory } from "./wellbeing-screens";
export type { Nav } from "./screen-layout";
export { BookingForm } from "./appointment-screens";
export { TRAJ } from "./wellbeing-screens";
export const SCREEN_COMPONENTS: Record<ScreenId, (n: Nav) => ReactNode> = {
  home: Home, journey: Journey, profile: Profile, documents: Documents, mhr: Mhr, bookings: Bookings, consult: Consult,
  results: Results, hormones: Hormones, biological: Biological, "care-summary": CareSummary, plan: Plan, care: Care,
  integrations: Integrations, trajectory: Trajectory,
};
