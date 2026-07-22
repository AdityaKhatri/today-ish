# `functions/` — reserved for the future Blaze-plan build

This folder is intentionally empty in the current build.

The project currently runs on the Firebase **Spark (free) plan**, which cannot
deploy Cloud Functions. Everything in this build works with **Firestore + Auth
only**:

- Allowlist enforcement is done with Firestore Security Rules + a client-side
  check after sign-in (see `src/auth/`), **not** a blocking Cloud Function.
- Score calculation is a pure, dependency-free module at
  [`src/lib/scoring.ts`](../src/lib/scoring.ts). It is deliberately isolated so
  that a future Cloud Function can import the **same** logic without a rewrite.

## What lands here after upgrading to Blaze

- **FCM push notifications** while the app is closed (scheduled reminders,
  overdue nudges). The in-app reminder surfacing already exists on Home.
- **AI features** — the morning-brief generator and the ask-AI backend, which
  need a server-side home for an API key. The UI slots already exist
  (`MorningBriefCard`, the ask-AI FAB/sheet) and read/write
  `/users/{uid}/dailyBrief/{date}_{profile}`.
- Optionally, a scheduled function that recomputes/validates streaks or
  archives old logs — importing `scoring.ts` as-is.

When that work starts, initialize functions here (e.g. `firebase init
functions` with the TypeScript template) — no other part of the repo needs to
move.
