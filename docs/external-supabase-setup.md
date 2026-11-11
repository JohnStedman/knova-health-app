# Authorised external prototype connection

Target: **CHG_Prevent**, `vawctbdiepupidgakkhz`, `ap-southeast-2`.
API: https://vawctbdiepupidgakkhz.supabase.co
Dashboard: https://supabase.com/dashboard/project/vawctbdiepupidgakkhz

No Lovable Cloud provisioning, new project, service key, profile table, policy changes or anonymous writes. `src/lib/external-supabase.ts` configures the public publishable browser client, pinned to `@supabase/supabase-js` **2.119.0**. Authentication credentials are used only by Auth, never saved into prototype state. Display names and preferences remain fictional workspace data; no separate account profile is collected.

The owner already applied the exact non-destructive schema in `sql/knova-prototype-workspaces.sql`. It is a reference copy, **not a new migration**. No Supabase CLI is installed in this project and no remote migration history/version was supplied; no migration filename/version has been invented. Do not rerun this reference SQL or loosen policies. The app selects only the signed-in owner's row and upserts that row only after opt-in and successful initial load. No DELETE is used.

## Read-only validation, 11 November 2026 UTC

- Auth settings endpoint: HTTP 200; email enabled, signup permitted, `mailer_autoconfirm: false`, anonymous auth disabled.
- Anonymous read of `knova_prototype_workspaces`: HTTP 401 / Postgres 42501, permission denied. Expected: owner intentionally revoked anonymous access. **Do not apply the response's anon-GRANT hint.**
- No write, email send, signup or account creation was performed. User reports zero Auth users. Real authenticated persistence/RLS enforcement, email delivery, configured redirect allowlist and cross-device restoration require a user's own sign-in and remain unverified.
- Configure the app's permitted confirmation redirect origins in the existing dashboard before account creation; no auth settings were changed here.

## Manual acceptance once a user signs in

1. In Demo mode edit a sample preference. Sign in with an existing account: cloud saving must still be off.
2. Enable cloud saving. Wait for load before editing. Existing remote state restores; missing row starts with independent fictional defaults.
3. Change a sample preference, wait for Saved, reload, sign in if needed and explicitly enable saving again. Confirm restoration.
4. Simulate offline access. A save failure must display Not saved / Retry sync. Reconnect and retry, then confirm Saved.
5. Sign out during a load/save. Demo workspace returns; no cloud content appears in `prevent-demo` localStorage. Switch accounts and repeat.

No real health information. Clinical records, telehealth, ADHA, payment and wearable integrations remain simulations. Autosaves use last-write-wins across tabs/devices (no multi-device merge); unsaved changes are memory-only and can be lost on reload/sign-out. Browser cancellation cannot undo a write already accepted by the server. Each captured owner ID and RLS still prevent writing another user's row. No production publishing approval has been given.