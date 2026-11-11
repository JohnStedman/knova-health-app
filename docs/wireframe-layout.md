# Wireframe layout correction

Canonical reference: `Prevent-Wireframe-Layout-Reference.zip`, its original HTML/JS/CSS and 45 PNGs (15 screens at iPhone, Android and iPad sizes). Brand remains Knova; reference data is not imported over the existing state.

| Screen | Applied composition |
| --- | --- |
| home | Next-step card, to-do section/card, upcoming care, three summary counts, plan action; no editorial hero/ring/dashboard. |
| journey | Five-stage timeline card, intake and profile actions; working intake opens in a dialog. |
| profile | Identity card, six preference rows, care action; account saving/theme/reset in collapsed preferences. |
| documents | Reviewed library, previous records, upload then national-record action; two library cards side-by-side on tablet. |
| mhr | Concept notice, record/identity summary, four segmented views, four counters, recent records and separate-information notice. |
| bookings | Next-appointment card, compact appointment rows, booking action; details retain reschedule/cancel/calendar controls. |
| consult | Simulated portrait/room controls, preparation/checks and waiting/call actions; tablet uses adjacent room and preparation cards. |
| results | Compact biomarker/value/range table, clinician context, plan and care actions; table and note adjacent on tablet, filters in More options. |
| hormones | Hormone metrics, clinician-directed section, screening safeguard, plan/care actions; two sections adjacent on tablet. |
| biological | Full-width age composite, compact context/status summary, trajectory and explanation actions. |
| care-summary | Conditional release-status block and released summary, consultation action; centered narrow tablet column. |
| plan | Progress card, priority checklist/Open actions, follow-up and care actions; reflections available from action details/options. |
| care | Sample thread then message/full-thread/booking actions; message composition in accessible dialog. |
| integrations | Sync summary then four compact provider rows; permissions/sync/disconnect in provider dialogs, two-column tablet rows. |
| trajectory | Timeframe control, annotated chart, adjacent height-matched progress callout on tablet, driver context, marker action. |

## Checks

- 27 existing tests pass, including navigation, search/filter, persistence, cancellation/release rules and isolated serial account sync.
- Automatic preview build/typecheck passes; no manual project build is run because the editor harness runs it.
- Browser navigation checks: all 15 screens at 390, 412, 820 and 1280px; no horizontal overflow or page errors.
- Representative browser actions: intake, reschedule reflected on Home/consultation, simulated call, cancellation guard, booking creation, results → plan → care, safe sample filename, document viewer, Profile account details, light/dark theme and focus restoration.
- Side-by-side visual review against all 45 references, including a separate composition audit. Normal scroll and fixed safe-area navigation replace screenshot heights and device bezels.

## Deliberate differences and limits

- Existing fictional dates, marker values, released data and connected-device counts remain store-driven. Held content is never made visible merely to match a screenshot.
- Existing consultation identity/device/privacy guards remain three checks rather than removing a safeguard to match the two reference rows.
- The supplementary original portrait replaces the generated substitute. Its exact PNG bytes are preserved on the CDN and in the GitHub source; the simulated frame uses the reference center/10% crop and existing Knova-token gradient with recording off.
- No unsupported fasting instruction, real clinical connection, database migration, new backend or production publication.
- Account form/details access verified; real authenticated remote saving and email delivery remain unverified for the externally managed connection.
- GitHub delivery is a one-time authorised source copy, not a two-way sync claim.