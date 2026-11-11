import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CLOUD_PROJECT, getAccountClient } from "@/lib/external-supabase";
import { useCloudAccount, workspaceSync } from "@/lib/prevent-store";
import { Card } from "./ui";

export function CloudAccountSection() {
  const sync = useCloudAccount();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const [error, setError] = useState(""); const [create, setCreate] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const supabase = getAccountClient();
      if (create) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setMessage(data.session ? "Account created. Choose whether to enable cloud saving." : "Check your email to confirm your account before signing in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("Signed in. Cloud saving remains off until you enable it.");
      }
      setPassword("");
    } catch (error) { setError(error instanceof Error ? error.message : "Account request failed."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setError("");
    // Clear account state and pending work immediately, even if remote logout fails.
    workspaceSync.disable();
    try {
      const { error } = await getAccountClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      workspaceSync.account(null); setMessage("Signed out. Your separate Demo workspace is restored.");
    } catch (error) { setError(error instanceof Error ? error.message : "Sign-out failed. Cloud saving is off."); }
    finally { setBusy(false); }
  }
  const labels = { idle: "Cloud saving off · Demo mode", loading: "Loading account workspace · editing paused", ready: "Account workspace loaded · no unsaved changes", pending: "Changes waiting to save", saving: "Saving fictional workspace…", saved: "Workspace saved", error: "Sync failed · not saved" };
  return <Card><h3>Cloud account</h3>
    <p className="pv-small pv-muted">Optional account saving for fictional prototype data only. Never enter real health information. Uploaded files are not sent.</p>
    <details className="pv-cloud-details"><summary>Account connection details</summary><p>{CLOUD_PROJECT.name} · {CLOUD_PROJECT.region}</p><p>Project: {CLOUD_PROJECT.id}</p><p>{CLOUD_PROJECT.url}</p><p>Prototype workspace only · not a clinical record.</p></details>
    <p className="pv-small" role="status" aria-live="polite">{labels[sync.phase]}{sync.savedAt && sync.phase === "saved" ? ` · ${new Date(sync.savedAt).toLocaleTimeString()}` : ""}</p>
    {sync.user ? <><p className="pv-cloud-email">Signed in as {sync.user.email}</p>
      {sync.mode === "demo" ? <><p className="pv-small">Enabling loads your account’s saved sample workspace first. Device Demo data stays separate. Saving begins only when you change that workspace.</p><Button className="pv-btn pv-btn-primary" disabled={busy} onClick={() => { void workspaceSync.enable(); }}>Enable cloud saving</Button></>
        : <><p className="pv-small">Cloud mode · sample changes save to your account only. Unsaved changes are lost when you leave cloud mode.</p><Button className="pv-btn" onClick={() => workspaceSync.disable()}>Return to Demo mode</Button></>}
      <Button className="pv-btn" disabled={busy} onClick={() => { void signOut(); }}>Sign out</Button>
    </> : <form onSubmit={submit} className="pv-cloud-form">
      <label className="pv-label">Account email<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="pv-label">Password<input type="password" autoComplete={create ? "new-password" : "current-password"} minLength={6} required value={password} onChange={e => setPassword(e.target.value)} /></label>
      <div className="pv-btns"><Button type="submit" className="pv-btn pv-btn-primary" disabled={busy}>{busy ? "Please wait…" : create ? "Create account" : "Sign in"}</Button><Button type="button" className="pv-btn" disabled={busy} onClick={() => { setCreate(!create); setMessage(""); setError(""); }}>{create ? "Use existing account" : "Create an account instead"}</Button></div>
      {create && <p className="pv-small pv-muted">Normal email confirmation applies. No profile or real health details are needed.</p>}
    </form>}
    {message && <p className="pv-small" role="status">{message}</p>}
    {(error || sync.error) && <p className="pv-error" role="alert">{error || sync.error}</p>}
    {sync.phase === "error" && sync.mode === "cloud" && <Button className="pv-btn" onClick={() => { void workspaceSync.retry(); }}>Retry sync</Button>}
  </Card>;
}