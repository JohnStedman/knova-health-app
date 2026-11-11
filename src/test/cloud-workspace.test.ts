import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultState, WorkspaceSync, type DemoState, type WorkspacePort } from "../lib/prevent-store";

const deferred = <T,>() => { let resolve: (v: T) => void = () => {}; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; };
describe("account-owned prototype persistence", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  function setup(port: WorkspacePort) {
    let state = createDefaultState(); const demo = { ...state, profile: { ...state.profile, name: "Device Demo" } };
    const sync = new WorkspaceSync({ read: () => state, replace: s => { state = s; }, demo: () => { state = demo; } });
    sync.setPort(port); sync.account({ id: "account-a", email: "a@example.invalid" });
    return { sync, read: () => state, edit: (name: string) => { if (sync.canEdit()) { state = { ...state, profile: { ...state.profile, name } }; sync.changed(); } } };
  }
  it("does not read or save until opt-in and blocks autosave until initial load finishes", async () => {
    const load = deferred<null>(); const port = { load: vi.fn(() => load.promise), save: vi.fn(async () => {}) };
    const x = setup(port); expect(port.load).not.toHaveBeenCalled(); x.edit("Demo edit"); expect(port.save).not.toHaveBeenCalled();
    const enabling = x.sync.enable(); x.edit("must not edit"); await vi.advanceTimersByTimeAsync(1000);
    expect(x.sync.canEdit()).toBe(false); expect(port.save).not.toHaveBeenCalled();
    load.resolve(null); await enabling; expect(x.read().profile.name).toBe("Alex"); expect(x.sync.snapshot().phase).toBe("ready");
    x.edit("Sample change"); await vi.advanceTimersByTimeAsync(699); expect(port.save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1); expect(port.save).toHaveBeenCalledWith("account-a", expect.objectContaining({ profile: expect.objectContaining({ name: "Sample change" }) }), expect.any(AbortSignal));
  });
  it("reports failed save honestly and retries the latest unsaved change", async () => {
    const port = { load: vi.fn(async () => null), save: vi.fn().mockRejectedValueOnce(new Error("Offline" )).mockResolvedValue(undefined) };
    const x = setup(port); await x.sync.enable(); x.edit("Unsaved sample"); await vi.advanceTimersByTimeAsync(700);
    expect(x.sync.snapshot()).toMatchObject({ phase: "error", error: "Offline", savedAt: null });
    expect(x.read().profile.name).toBe("Unsaved sample"); await x.sync.retry(); expect(x.sync.snapshot().phase).toBe("saved"); expect(port.save).toHaveBeenCalledTimes(2);
  });
  it("ignores an old account's late load and restores isolated demo on sign-out", async () => {
    const a = deferred<{ user_id: string; state: DemoState; state_version: number }>();
    const remote = { ...createDefaultState(), profile: { ...createDefaultState().profile, name: "Remote B" } };
    const port = { load: vi.fn().mockImplementationOnce(() => a.promise).mockResolvedValue({ user_id: "account-b", state: remote, state_version: 4 }), save: vi.fn(async () => {}) };
    const x = setup(port); const first = x.sync.enable(); x.sync.account({ id: "account-b", email: "b@example.invalid" }); await x.sync.enable();
    a.resolve({ user_id: "account-a", state: createDefaultState(), state_version: 4 }); await first;
    expect(x.read().profile.name).toBe("Remote B"); x.edit("B edit"); x.sync.account(null); await vi.advanceTimersByTimeAsync(1000);
    expect(x.read().profile.name).toBe("Device Demo"); expect(port.save).not.toHaveBeenCalled();
  });
  it("restores saved remote changes without an initial overwrite", async () => {
    const remote = createDefaultState(); const action = remote.plan.actions[0]; if (!action) throw new Error("Missing sample action"); action.done = true;
    const port = { load: vi.fn(async () => ({ user_id: "account-a", state: remote, state_version: 4 })), save: vi.fn(async () => {}) };
    const x = setup(port); await x.sync.enable(); expect(x.read().plan.actions[0]?.done).toBe(true); await vi.advanceTimersByTimeAsync(1000); expect(port.save).not.toHaveBeenCalled();
  });
  it("serializes saves and sends only the latest queued snapshot", async () => {
    const write = deferred<void>(); const port = { load: vi.fn(async () => null), save: vi.fn().mockImplementationOnce(() => write.promise).mockResolvedValue(undefined) };
    const x = setup(port); await x.sync.enable(); x.edit("First"); await vi.advanceTimersByTimeAsync(700); x.edit("Second"); x.edit("Latest"); await vi.advanceTimersByTimeAsync(700);
    expect(port.save).toHaveBeenCalledTimes(1); write.resolve(); await vi.advanceTimersByTimeAsync(701);
    expect(port.save).toHaveBeenCalledTimes(2); expect(port.save.mock.calls[1]?.[1].profile.name).toBe("Latest");
  });
  it("does not let an old save completion mark a new account saved", async () => {
    const write = deferred<void>(); const port = { load: vi.fn(async () => null), save: vi.fn(() => write.promise) };
    const x = setup(port); await x.sync.enable(); x.edit("A edit"); await vi.advanceTimersByTimeAsync(700);
    x.sync.account({ id: "account-b", email: "b@example.invalid" }); await x.sync.enable(); write.resolve(); await vi.advanceTimersByTimeAsync(0);
    expect(x.sync.snapshot()).toMatchObject({ user: { id: "account-b" }, phase: "ready", savedAt: null });
  });
  it("pauses on invalid remote state and retries load without overwriting it", async () => {
    const port = { load: vi.fn().mockResolvedValueOnce({ user_id: "account-a", state: {}, state_version: 4 }).mockResolvedValue(null), save: vi.fn(async () => {}) };
    const x = setup(port); await x.sync.enable(); expect(x.sync.canEdit()).toBe(false); expect(x.sync.snapshot().phase).toBe("error"); await x.sync.retry(); expect(x.sync.canEdit()).toBe(true); expect(port.save).not.toHaveBeenCalled();
  });
});