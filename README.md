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
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

The committed lockfile pins the tested dependencies. Preserve the existing Lovable TanStack/Vite wrapper; it already registers the required plugins.

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

This is a browser-local prototype with fictional data. There is no real login, patient database, clinical messaging, telehealth service, wearable OAuth, pathology connection, payment or ADHA/My Health Record integration. Do not enter real health information.

Preferences, bookings, intake, actions and local messages persist in versioned localStorage on the same browser. Uploaded sample-file metadata remains in memory for the current tab. File contents are never read or transmitted. Reset remains available in Profile. Corrupt saved state recovers safely to fictional defaults.

Cancelled appointments cannot enter a consultation, and rescheduling updates the same appointment used by Home and Telehealth. Only released results and released care-summary content are visible. Biological-age and trend values are illustrative, with no diagnostic algorithm or clinical claims.

The web manifest supports a standalone app presentation on compatible browsers; it does not add offline service caching or imply App Store publication.

## GitHub and Lovable delivery

This repository was originally a one-time source copy, not a verified two-way GitHub connection. A GitHub push alone must not be treated as evidence that Lovable has updated. Apply the corresponding source bundle to the existing Lovable project and verify its build. Future automatic synchronization requires connecting this exact repository in Lovable's GitHub settings.

## Validation

The test suite covers all fifteen module entries, section search and result filtering, dashboard-to-plan persistence, cancellation confirmation, blocked cancelled consultations, corrupt nested-state recovery, reviewed-result safeguards and booking rules. Run type checking and a production build before publishing. Responsive browser checks should include iPhone, Android and iPad widths, plus dark mode and dialogs.
