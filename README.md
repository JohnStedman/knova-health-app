# Prevent Health App — final participant-app prototype

Clickable Prevent participant app for John Stedman / CHG, based on the app shown inside the approved Prevent App Wireframes
(source wireframes: https://prevent-app-review.your-nursing-0059.chatgpt.site/).

The live reference URL could not be fetched by the calling assistant; its matching exported HTML
(inspected and rendered by the caller) plus the written specification were used for visual fidelity.

Lovable editor: https://lovable.dev/projects/97fd2ff5-bb60-4d44-a0dc-cc71f4748c5c

GitHub source: https://github.com/JohnStedman/prevent-health-app. This is a one-time source copy, not a Lovable two-way Git sync connection.

## Prototype boundaries
- Fictional data only. No accounts, login, database, backend, paid service or live integration.
- All state is browser-only (`localStorage`, versioned key `prevent-demo`, safe reset on corrupt data).
  Uploaded filename metadata stays in memory for the tab session; file contents are not read or sent over the network. Filenames are rendered as escaped React text, never HTML.
- Bookings, telehealth, My Health Record and devices (WHOOP, Apple Health, Health Connect, Oura) are **simulated**.
  No ADHA access, data-residency or compliance claims. No camera/microphone access, calls, OAuth or AI calls.
- No clinician/staff tools: the app ships only fictional, already-reviewed/released sample results and care summary. The simulated clinician releases the fictional summary at the end of a simulated call; unreleased notes remain hidden.
- Employers never see individual results. Tumour markers are clinician-directed, not general screening tests. Wearable data is for trends/coaching only, not diagnosis.
- Results, biological age and trajectory values are illustrative; no diagnostic algorithm.
- Accessibility work (labels, focus trap, Escape, live regions, reduced motion) is included but **not audited**.

## Commands
```
npm install
npm run dev         # local dev server (vite dev)
npm run build       # production build (vite build)
npm test            # vitest run
```

## Modules
- `src/lib/prevent-store.ts` — screen list, typed demo state, persistence, booking validation, ICS (Australia/Adelaide), released-results helpers.
- `src/components/prevent/ui.tsx` — modal (focus trap/Escape), switch, tabs, status announcer.
- `src/components/prevent/screens.tsx` — the 15 participant screens and booking form.
- `src/components/prevent/PreventApp.tsx` — app shell: header (brand/back + menu), bottom navigation Home / Bookings / Results / Profile.
- `src/routes/index.tsx` — page entry. `src/test/prevent.test.ts` — rule tests.

Navigation: bottom nav for the four main tabs; the header menu reaches all 15 sections; in-screen cards link between them. Desktop shows the participant app in a navy phone frame; mobile is full-screen. The header moon/sun control switches light/dark mode, saved on this device.

The app has one page route (`/`) and these 15 participant screens, in approved order. Screens support `/#<id>` and `/?screen=<id>` deep links; browser back/forward work.

| # | Screen ID | Participant screen |
|---|---|---|
| 1 | home | Home & next steps |
| 2 | journey | Onboarding & health history intake |
| 3 | profile | Profile, preferences, consent and GP sharing |
| 4 | documents | Documents & session-only sample uploads |
| 5 | mhr | Illustrative My Health Record |
| 6 | bookings | Create, reschedule, cancel and calendar download |
| 7 | consult | Telehealth checks, waiting room, simulated call and phone fallback |
| 8 | results | 12 reviewed sample markers, filters and clinician notes |
| 9 | hormones | Hormones & clinician-directed screening |
| 10 | biological | Illustrative biological age |
| 11 | care-summary | Clinician-released care summary |
| 12 | plan | Action plan, completion and reflections |
| 13 | care | Local care-team conversation |
| 14 | integrations | Simulated connected devices and permissions |
| 15 | trajectory | Illustrative age trajectory over 3/6/12 months |

Booking date/time changes are read from the same appointment record on Home, Bookings and Telehealth. Joining selects that specific confirmed telehealth booking. Cancellation removes it from Upcoming care and blocks consultation entry, including direct screen links. All dialogs use keyboard focus containment, Escape dismissal and focus restoration; arrow/Home/End keys navigate tab selectors. "Fictional data; no live services" and Reset demo live in Profile.

## Integration TODOs (not implemented)
Real identity/auth, clinical backend & audit log, pathology ingestion and clinician release workflow, ADHA/My Health Record conformance, telehealth vendor, device OAuth, notifications, hosting/data-residency review, formal accessibility audit.
