# Prevent participant app prototype

A clickable prototype of the Prevent participant app, built from the *Prevent App Wireframes* review file. All 15 wireframe screens are wired together as one working app.

**All people, results, appointments and records are fictional.** Nothing is sent anywhere; demo state is kept in the viewer's browser (`localStorage`) and can be cleared with **Reset demo data**.

## Run it

Open `index.html` in a browser. No build step or dependencies (Google Fonts loads Onest when online).

To host it, enable **GitHub Pages** (Settings → Pages → Deploy from branch → `main` / root).

You can open a specific screen directly with a hash, e.g. `index.html#results` or `index.html#mhr`.

## Screens

| # | Stage | Screen | Hash |
|---|-------|--------|------|
| 01 | Get started | Home and next steps | `home` |
| 02 | Get started | Onboarding and timeline | `journey` |
| 03 | Get started | Profile and preferences | `profile` |
| 04 | Get started | Documents and uploads | `documents` |
| 05 | Get started | My Health Record | `mhr` |
| 06 | Your appointment | Bookings | `bookings` |
| 07 | Your appointment | Telehealth consultation | `consult` |
| 08 | Understand your results | Result details | `results` |
| 09 | Understand your results | Hormones and screening | `hormones` |
| 10 | Understand your results | Biological age | `biological` |
| 11 | Understand your results | Released care summary | `summary` |
| 12 | Act and follow up | Personal action plan | `plan` |
| 13 | Act and follow up | Care-team conversation | `care` |
| 14 | Act and follow up | Connected devices | `devices` |
| 15 | Act and follow up | Age trajectory | `trajectory` |

## Working flows

- **Health history intake** – goals, history, medicines and consent (consent required to finish).
- **Bookings** – confirm, prepare, reschedule, cancel and book new appointments.
- **Telehealth** – device checks → waiting room → live call (mute, camera, phone fallback, end).
- **Care summary** – held until the consultation ends and a clinician release is simulated.
- **Results** – 12 reviewed markers with range bars, area filters and per-marker detail.
- **Action plan** – complete actions, view details, add reflections, share the GP summary.
- **Care team, devices, My Health Record, documents, trajectory** – messaging, connect/sync, record tabs, uploads (file name only), timeframe switching.

## Layout

- **Desktop:** phone frame with a screen index (left) and per-screen notes – purpose, content, interactions and clinical/data safeguard (right).
- **Mobile:** full-screen app; the ⋯ menu opens the screen list.
- Light and dark mode supported.

## Safeguards carried from the wireframes

- Results and summaries appear only after clinician review/release; draft notes are never shown.
- Tumour markers are framed as clinician-directed, not general screening.
- Wearable data is trend and coaching context, not diagnostic evidence.
- My Health Record is an illustrative concept; production needs ADHA onboarding, conformance, HIs, NASH PKI, role-based access and audit logging.
- Employers never see individual results.
