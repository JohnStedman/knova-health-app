<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All prototype state and business rules live in `src/lib/prevent-store.ts` (pure functions + one store); UI reads via `useDemo()` so rules stay unit-testable.
- Use only the authorised external Supabase browser client for explicit account auth and opt-in fictional workspace saving; no new backend provisioning or clinical integrations, because Demo mode must remain independent.
- Keep sync lifecycle rules in prevent-store.ts and I/O in external-supabase.ts; load before save, serialize/debounce writes, invalidate on identity changes, and never store account workspace data in shared Demo storage, to prevent cross-account leakage.
- Styling uses `pv-*` classes and `--pv-*` tokens in `src/styles.css`; no ad hoc colors in components.
- Wireframe controls use the shared Button's `prototype` variant with `pv-*` classes so default shadcn decoration cannot override the canonical layout.
- Appointment lists, details and consultation transitions use central Adelaide-calendar-day eligibility and resolve bookings by ID; past/cancelled/clinic records cannot join, preventing stale saved records from bypassing guards.
- Shared modals use Radix Dialog with explicit trigger-focus restoration because callback changes must not reset keyboard focus.
- The canonical uploaded wireframe source and 45 screenshots govern section order, composition and tablet grids; reuse the shared participant screen tree with normal scrolling and fixed bottom navigation, not a sidebar or device frame, to prevent layout drift. Theme tokens remain scoped to app and dialog portals.
- Participant modules are grouped by domain behind a typed screen registry; navigation and search use shared screen labels to preserve compatible deep links.
