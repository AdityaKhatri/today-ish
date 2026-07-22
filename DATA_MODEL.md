# Today-ish — Firestore data model

All personal data is nested under `/users/{uid}/...` so a single
security rule protects every collection. `{uid}` is the Firebase Auth
UID from Google sign-in. Privacy is enforced by Firestore security
rules (see firestore.rules) — no client-side encryption in v1.

## /users/{uid}
```
{
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  defaultProfile: "personal" | "work"
}
```
Written once at first sign-in (by a Cloud Function trigger on user
creation, or client on first login).

## /users/{uid}/tasks/{taskId}
```
{
  title: string,
  notes: string | null,
  category: string,              // "personal" | "work" | "errands" | custom
  profile: "personal" | "work",
  status: "active" | "completed",
  createdAt: timestamp,           // server timestamp, fine for this one
  deadline: timestamp | null,
  effortMinutes: number,          // 5, 15, 30, 60+
  baseScore: number,              // derived from effortMinutes at add-time
  urgencyMultiplier: number,      // 1.0–1.5, frozen at add-time
  decayRatePerDay: number,        // computed alongside baseScore
  completedAt: timestamp | null,  // CLIENT-set timestamp, not serverTimestamp()
  scoreAtCompletion: number | null
}
```
`completedAt` must be set from the device clock at the moment of tap
(`Timestamp.now()` client-side), not `serverTimestamp()` — this is
what makes offline completions credit correctly against the decay
curve when they sync later.

Current live score is *computed*, not stored: derive it from
`baseScore`, `decayRatePerDay`, `deadline`, and `now` on read. Don't
persist a constantly-drifting number — it'll always be stale.

## /users/{uid}/routines/{routineId}
```
{
  title: string,
  category: string,
  profile: "personal" | "work",
  windowType: "fixed" | "flexible" | "anytime" | "multi",
  windowStart: string | null,     // "06:00" 24h local time
  windowEnd: string | null,       // "11:00"
  repeatDays: number[],           // 0=Sun..6=Sat
  reminderEnabled: boolean,
  createdAt: timestamp,
  currentStreak: number,          // maintained transactionally, see below
  longestStreak: number,
  lastCompletedDate: string | null // "2026-07-22", local date string
}
```
Streak counters live on the routine doc itself (not recomputed from
logs on every read) so the daily view stays a single cheap document
read. Update them transactionally whenever a completion or a
day-rollover is processed.

## /users/{uid}/routineLogs/{routineId_date}
```
{
  routineId: string,
  date: string,                   // "2026-07-22", doc id embeds this
  status: "done" | "missed",
  completedAt: timestamp | null   // CLIENT-set timestamp
}
```
Doc ID is `{routineId}_{date}` so a write is idempotent — completing
the same routine twice in a day overwrites rather than duplicates.
This log is the audit trail behind hit-rate calculations; the streak
count on the routine doc is the fast-path number the UI reads.

## /users/{uid}/pushTokens/{tokenId}
```
{
  token: string,                  // FCM token
  platform: "web" | "ios-pwa" | "android",
  createdAt: timestamp,
  lastSeenAt: timestamp
}
```
Update `lastSeenAt` on every app open. A scheduled Cloud Function can
prune tokens untouched for 60+ days, and must prune any token FCM
reports as invalid/unregistered after a send attempt.

## /users/{uid}/dailyBrief/{date}
```
{
  date: string,                   // "2026-07-22"
  profile: "personal" | "work" | "all",
  text: string,
  generatedAt: timestamp
}
```
Doc ID `{date}` (or `{date}_{profile}` since the brief is
profile-aware) makes "already generated today" a single doc read
before calling the LLM again.

## /allowlist/{email}
```
{
  addedAt: timestamp,
  note: string | null
}
```
Top-level, NOT nested under a user (there's no user yet when this is
checked). Denied to all client access — read only by the Admin SDK
inside the sign-in blocking function. Managed by hand in the Firestore
console.
