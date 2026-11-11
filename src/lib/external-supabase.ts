import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { workspaceSync, type WorkspacePort, type DemoState } from "./prevent-store";

// Public browser credentials only; this is the user's existing external project.
export const CLOUD_PROJECT = {
  name: "CHG_Prevent", id: "vawctbdiepupidgakkhz", region: "ap-southeast-2",
  url: "https://vawctbdiepupidgakkhz.supabase.co",
  publishableKey: "sb_publishable__EsFFRY6SDBSmmZbD24ymg_OAuvzNN8",
} as const;
let client: SupabaseClient | undefined;
export function getAccountClient() {
  if (typeof window === "undefined") throw new Error("Account access is browser-only.");
  client ??= createClient(CLOUD_PROJECT.url, CLOUD_PROJECT.publishableKey, {
    auth: { storageKey: "knova-external-account", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export const accountWorkspacePort: WorkspacePort = {
  async load(userId, signal) {
    const { data, error } = await getAccountClient().from("knova_prototype_workspaces")
      .select("user_id,state,state_version").eq("user_id", userId).abortSignal(signal).maybeSingle();
    if (error) throw new Error(`Load failed: ${error.message}`);
    return data;
  },
  async save(userId, state: DemoState, signal) {
    const { error } = await getAccountClient().from("knova_prototype_workspaces").upsert({
      user_id: userId, state, state_version: 4, updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" }).abortSignal(signal);
    if (error) throw new Error(`Save failed: ${error.message}`);
  },
};

export function startAccountConnection() {
  const supabase = getAccountClient();
  workspaceSync.setPort(accountWorkspacePort);
  let revision = 0;
  let disposed = false;
  // Revalidate restored tokens; an auth event invalidates any older lookup.
  const verify = async () => {
    const version = ++revision;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (disposed || version !== revision) return;
      workspaceSync.account(data.user ? { id: data.user.id, email: data.user.email ?? "Signed-in account" } : null);
      if (error && error.name !== "AuthSessionMissingError") workspaceSync.authError(error.message);
    } catch (error) {
      if (!disposed && version === revision) workspaceSync.authError(error instanceof Error ? error.message : "Account verification failed.");
    }
  };
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") { ++revision; workspaceSync.account(null); }
    else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
      // Do not await other Auth calls inside the auth callback's lock.
      if (workspaceSync.snapshot().user?.id !== session?.user.id) workspaceSync.account(null);
      queueMicrotask(() => { if (!disposed) void verify(); });
    }
  });
  void verify();
  return () => { disposed = true; ++revision; data.subscription.unsubscribe(); };
}