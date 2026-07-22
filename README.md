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
- A Firebase project with **Firestore** (production mode) and **Google Auth**
  enabled, and the security rules deployed
- The [Firebase CLI](https://firebase.google.com/docs/cli) for deploys (`npm i -g firebase-tools`)

## Setup

```bash
npm install
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
npm run dev        # Vite dev server
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build (service worker active here)
```

> The PWA service worker is disabled in dev (`devOptions.enabled: false`) and
> active in `preview`/production.

## Deploy

```bash
firebase use <your-project-id>

# Security rules — see the note below before running this:
firebase deploy --only firestore:rules

# Hosting (builds to dist/):
npm run build
firebase deploy --only hosting
```

> ⚠️ **`firestore.rules` at the repo root is a locked-down PLACEHOLDER.** The
> real rules are already deployed on the project; paste them into that file
> before ever running `firebase deploy --only firestore:rules`, or you'll
> overwrite live rules with a deny-all.

---

## Project structure

```
firestore.rules            # (placeholder) Firestore security rules
firestore.indexes.json     # composite index defs (empty for now)
firebase.json              # hosting (SPA rewrites) + firestore config
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
  types/models.ts          # domain types (provisional; see below)
  components/               # icons, Logo, layout (Screen/BottomNav), ui/, domain/
  screens/                 # the 13 screens
  mock/fixtures.ts          # sample data until the Firestore layer is wired
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

## Known blocker (next step)

The Firestore **data layer is not yet wired** — screens currently read
`src/mock/fixtures.ts`. This is waiting on the exact **`DATA_MODEL.md`** and the
**deployed `firestore.rules`**, which pin down field names, doc-id conventions,
and the allowlist shape. Once provided:
1. reconcile `src/types/models.ts` to the exact schema,
2. add a `src/data/` layer (task/routine CRUD, optimistic completions,
   transactional streaks, `routineLogs`),
3. replace fixtures, and
4. drop the real rules into `firestore.rules`.

The scoring constants in `scoring.ts` (urgency thresholds, decay derivation) are
also flagged for reconciliation against `DATA_MODEL.md`.
