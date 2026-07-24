# Today-ish

A mobile-first PWA task + routine tracker with a **decaying-score** mechanic for
one-off tasks and a **streak-based, daily-reset** model for routines.

> _roughly today, reliably done._

Built with **React + Vite + TypeScript** and **Firebase (Firestore + Auth)**.
Runs on the Firebase **Spark (free) plan** — no Cloud Functions.

---

## Scope of this build

**In:**
- Google sign-in + invite-only **allowlist** gate (Firestore rules + client check)
- Tasks with a frozen `baseScore × urgencyMultiplier` peak that **decays daily**
  and accelerates past the deadline (see `src/lib/scoring.ts`)
- Routines with four window types, daily reset, streaks
- Profile switcher (Personal / Work / All), free-ish categories
- Offline persistence (IndexedDB) + service-worker app-shell caching
- In-app live reminders (Home refreshes urgency while the tab is open)
- All 13 screens from the "Nautilus" design handoff

**Deferred (additive later, on the Blaze plan — see `functions/README.md`):**
- Cloud Functions of any kind
- FCM / background push notifications (in-app reminders only for now)
- AI morning brief + ask-AI (layout slots exist; functionality does not)
- Client-side encryption

---

## Prerequisites

- Node.js **18.18+** (built on 18.20)
- **pnpm** (this repo uses pnpm; built on 11.3)
- A Firebase project with **Firestore** (production mode) and **Google Auth**
  enabled, and the security rules deployed
- The [Firebase CLI](https://firebase.google.com/docs/cli) for deploys (`pnpm add -g firebase-tools`)

## Setup

```bash
pnpm install
cp .env.example .env.local   # then fill in your Firebase web config
```

`.env.local` (values from Firebase console → Project settings → Your apps → Web):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

The web config is not secret (it ships in the client bundle); access is gated by
Firestore rules + the allowlist, not by hiding these.

## Develop

```bash
pnpm dev        # Vite dev server
pnpm typecheck  # tsc --noEmit
pnpm build      # typecheck + production build to dist/
pnpm preview    # serve the production build (service worker active here)
```

> The PWA service worker is disabled in dev (`devOptions.enabled: false`) and
> active in `preview`/production.

## Deploy

The app is hosted on **GitHub Pages at `app.today-ish.com`** via GitHub Actions
(`.github/workflows/deploy.yml`) on every push to `main`. Firebase is **not** used
for hosting. Full walkthrough (Pages source, repo variables, DNS, custom domain,
authorized domains): **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)**.

In short: set the six `VITE_FIREBASE_*` repo **Variables**, add a DNS CNAME
`app → <username>.github.io`, add `app.today-ish.com` to Firebase Auth authorized
domains, and push.

**Firestore rules** are managed separately with the Firebase CLI (not by CI):

```bash
firebase deploy --only firestore:rules   # keep firestore.rules in sync
```

---

## Project structure

```
firestore.rules            # deployed Firestore security rules
firestore.indexes.json     # composite index defs (empty — all queries single-field)
firebase.json              # firestore config (the hosting block is unused; app is on Pages)
.github/workflows/         # deploy.yml — GitHub Pages CI/CD
functions/                 # empty — reserved for the future Blaze build
public/
  favicon.svg
  icons/                   # PWA icons (generated from the SVG sources)
src/
  lib/
    scoring.ts             # ★ SHARED, pure score math (Cloud-Function-ready)
    dates.ts  views.ts  cn.ts  profileOptions.ts
  firebase/config.ts       # app init + Firestore offline persistence
  auth/                    # Google sign-in + allowlist gate + ensureUserDoc
  state/                   # ProfileContext, useNow (live clock), useOnline
  types/models.ts          # domain types (match DATA_MODEL.md)
  data/                    # Firestore layer: paths, tasks, routines, DataProvider
  components/               # icons, Logo, layout (Screen/BottomNav), ui/, domain/
  screens/                 # the 13 screens
```

## Core mechanics

**Scoring lives in one pure module — `src/lib/scoring.ts`** — deliberately free
of React/Firebase so a future Cloud Function can import it unchanged:

- `baseScore` from effort (sub-linear): `5min→20, 15min→35, 30min→50, 1hr+→90`
- `urgencyMultiplier` (1.0–1.5) set from deadline tightness **at add-time and
  frozen**
- live score = `peak − decayRatePerDay × daysElapsed`, decay **accelerates past
  the deadline** and can go **negative** — always recomputed from stored fields
  + `now`, never stored stale
- completing a task locks in the live score at the tap (`scoreAtCompletion`) with
  a **client-side** timestamp (offline-correct)

Routines never decay: each day is pass/miss, resets at local midnight, a miss is
neutral (never a penalty).

## Auth & allowlist

After Google sign-in the client reads `/allowlist/{email}`; if it's missing the
user is **signed out immediately** and shown the not-authorized screen — before
any app screen renders. Firestore rules independently require that entry for any
`/users/{uid}/**` access, so the redirect is UX, not the security boundary.

## Offline & PWA

Firestore uses `persistentLocalCache` (multi-tab). Completion timestamps are
captured client-side at the moment of the tap, so offline-then-sync credits the
correct score. `vite-plugin-pwa` precaches the app shell and generates the
manifest + service worker.

---

## Data layer

Wired against `DATA_MODEL.md` and the deployed `firestore.rules`. `src/data/`
holds live `onSnapshot` subscriptions (active tasks, routines, today's logs) via
`DataProvider`, plus task CRUD, optimistic completions (client `Timestamp.now()`
at the tap), and transactional routine streaks with an idempotent
`routineLogs/{routineId}_{date}` audit trail. All queries are single-field, so
no composite indexes are required.

### To confirm with the schema owner
- **Two added fields** beyond `DATA_MODEL.md`, needed for the `multi`
  (few-times-per-day) window type: `targetCount` on the routine and `count` on
  the log. The schema has no other place to store a per-day target/progress.
- **Decay anchor:** live score decays from `baseScore × urgencyMultiplier`
  starting at `createdAt`, accelerating past the deadline. The tunable constants
  (urgency thresholds, decay fraction, acceleration) live in `src/lib/scoring.ts`
  and are easy to adjust if the intended curve differs.
- `DATA_MODEL.md`'s `/allowlist` note (Admin-SDK-only via a blocking function)
  is superseded by the deployed rules, which let a user read their own entry —
  the client check matches the deployed rules.

## Still deferred (unchanged)

FCM/background push, the AI morning brief + ask-AI backend, and Cloud Functions
remain out until the Blaze plan (see `functions/README.md`). Their UI slots exist
and are inert.
