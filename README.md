# Knova participant app

A responsive, clickable participant app for internal product review. The app uses the current Knova website logo assets and its charcoal, lavender and warm-paper draft palette. The palette is recorded as draft pending brand sign-off; change its tokens in `src/styles.css` when updated.

- Source: https://github.com/JohnStedman/prevent-health-app
- Lovable app: https://lovable.dev/projects/97fd2ff5-bb60-4d44-a0dc-cc71f4748c5c
- Brand reference: Knova Website, Lovable project `1c8019eb-b61e-4f91-9363-e6155a5e362b`
- Journey reference: https://prevent-app-review.your-nursing-0059.chatgpt.site/

## App experience

Desktop and tablet use a responsive sidebar and full-width workspace. Phones use edge-to-edge screens and a fixed bottom navigation. There is no device frame or wireframe-review toolbar in the participant app. All fifteen participant modules remain available through navigation and search.

Home brings together preparation progress, the next appointment, reviewed results, action completion, device connections and care-team links. Values come from the shared store. Booking creation, rescheduling, cancellation confirmation, calendar export, intake, local care messages, document samples, result search and filters, action-plan updates, device preferences, updates and light/dark mode work in the prototype.

## Development

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

This project preserves its existing compatible dependencies and pinned TanStack packages. The minimal repository typecheck command uses `tsc --noEmit`; Lovable uses its automatic typecheck. Preserve the existing Lovable TanStack/Vite wrapper; it already registers the required plugins.

## Code structure

- `src/lib/brand.ts`: brand asset references and product name.
- `src/styles.css`: shared design tokens, light/dark themes and responsive layouts.
- `src/lib/prevent-store.ts`: typed fictional state, persistence, validation and booking/consultation rules. The existing storage key and screen IDs remain compatible with saved prototypes.
- `src/components/prevent/PreventApp.tsx`: app controller and responsive shell.
- `app-navigation.tsx`: navigation groups, labels, icons and wordmark.
- `app-tools.tsx`: searchable navigation and updates derived from sample state.
- `screen-layout.tsx` and `ui.tsx`: shared screen layout and accessible Radix dialogs.
- `home-screen.tsx`: dashboard and contextual next actions.
- `account-screens.tsx`: health journey, profile, documents and national-record concept.
- `appointment-screens.tsx`: bookings, confirmation and simulated telehealth.
- `results-screens.tsx`: reviewed markers, search, screening, biological age and released summary.
- `wellbeing-screens.tsx`: action plan, conversation, connected devices and trends.
- `screens.tsx`: typed module registry. Existing `/#screen-id` and `/?screen=screen-id` links remain valid.

## Prototype scope

This is a fictional prototype with browser-local Demo mode and optional real account authentication/saving to the existing external Supabase project CHG_Prevent. There is no production patient record, clinical messaging, telehealth service, wearable OAuth, pathology connection, payment or ADHA/My Health Record integration. Do not enter real health information.

In Demo mode, preferences, bookings, intake, actions and sample messages persist under the compatible `prevent-demo` version-4 localStorage key. Uploaded sample-file metadata remains in memory for the current tab, is cleared on account/workspace switches, and is never saved remotely. File contents are never read or transmitted. Demo reset remains available in Profile. Corrupt saved Demo state recovers safely to fictional defaults.

## Optional external account saving

Profile → Cloud account shows the exact project, connection details, sign-in/create-account controls, save status and retry. Email/password authentication uses the existing project's settings; signup waits for normal email confirmation when enabled. Nothing has been provisioned, no users have been created by the implementation, and no email has been sent by validation. Provider settings, email delivery and a real authenticated write remain unverified until a user signs in. No separate user-profile table is needed: display names/preferences are sample workspace state, not authentication credentials.

Signing in alone does not read or write the workspace. Each session must explicitly enable cloud saving. Enabling loads that user's `knova_prototype_workspaces` row before editing/autosave; no row starts with fresh fictional samples rather than importing device Demo data. Changes debounce for 700ms and saves serialize. Failed loads pause editing; invalid rows are not overwritten. Failed saves show an error and allow Retry sync; unsaved edits remain only in memory. Returning to Demo or signing out aborts pending work and restores the separate device Demo workspace. Already accepted server requests cannot be undone by browser cancellation, but their captured owner ID and RLS cannot write a different account. Account workspace data is never copied into shared Demo localStorage. Auth tokens use the separate `knova-external-account` storage key.

Only the public publishable key is used. There is no service key, anonymous write, policy change, new Cloud project or schema broadening. See `docs/external-supabase-setup.md` and `docs/sql/knova-prototype-workspaces.sql` for the already-applied schema and setup/validation limits.

Cancelled appointments cannot enter a consultation, and rescheduling updates the same appointment used by Home and Telehealth. Only released results and released care-summary content are visible. Biological-age and trend values are illustrative, with no diagnostic algorithm or clinical claims.

The web manifest supports a standalone app presentation on compatible browsers; it does not add offline service caching or imply App Store publication.

## GitHub and Lovable delivery

This repository was originally a one-time source copy, not a verified two-way GitHub connection. A GitHub push alone must not be treated as evidence that Lovable has updated. Apply the corresponding source bundle to the existing Lovable project and verify its build. Future automatic synchronization requires connecting this exact repository in Lovable's GitHub settings.

## Validation

The test suite covers all fifteen module entries, section search and result filtering, dashboard-to-plan persistence, cancellation confirmation, blocked cancelled consultations, corrupt nested-state recovery, reviewed-result safeguards and booking rules. Run type checking and a production build before publishing. Responsive browser checks should include iPhone, Android and iPad widths, plus dark mode and dialogs.
