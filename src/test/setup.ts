import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// UI tests must never talk to a real Auth service; sync has explicit mocked-port tests.
vi.mock("../lib/external-supabase", () => ({
  startAccountConnection: () => () => {},
  CLOUD_PROJECT: { name: "CHG_Prevent", id: "vawctbdiepupidgakkhz", region: "ap-southeast-2", url: "https://vawctbdiepupidgakkhz.supabase.co" },
  getAccountClient: () => { throw new Error("Use a mocked auth client in account tests."); },
}));

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
