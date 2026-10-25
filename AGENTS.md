## Project rules
- All prototype state and business rules live in `src/lib/prevent-store.ts` (pure functions + one store); UI reads via `useDemo()` so rules stay unit-testable.
- No backend: this is a browser-only fictional prototype; do not add network calls or persistence beyond localStorage.
- Styling uses `pv-*` classes and `--pv-*` tokens in `src/styles.css`; no ad hoc colors in components.
- Consultation state references a booking ID and derives appointment details through the central store so edits/cancellations cannot leave stale or joinable cancelled appointments.
- Shared modals use Radix Dialog with explicit trigger-focus restoration because callback changes must not reset keyboard focus.
- Desktop phone framing and mobile full-screen presentation share the same participant screen tree; theme tokens are scoped to the app and dialog portals to keep colours consistent.
