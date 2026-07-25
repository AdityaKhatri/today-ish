# `functions/` — Cloud Functions (Blaze)

Requires the **Blaze** plan (Cloud Functions can't deploy on Spark).

## `sendReminders` (scheduled)

Runs every 15 minutes and sends FCM push reminders to opted-in users:

- Selects users with `users/{uid}.remindersEnabled == true`.
- **Tasks:** active tasks whose absolute `deadline` is overdue or within the next
  hour → "Task due soon" / "Task overdue".
- **Routines:** `windowType: "fixed"` routines whose local `windowStart` time has
  passed today, scheduled for today (`repeatDays`), with reminders on and not yet
  done. Local time uses the user's stored `timezone` (written by the client on
  app open).
- Sends **data-only** messages to each device in `users/{uid}/pushTokens` (the
  client SW renders them, avoiding double notifications).
- **Dedupes** per local day via `users/{uid}/reminderState/{YYYY-MM-DD}`.
- **Prunes** tokens FCM reports as unregistered/invalid.

The selection logic mirrors the in-app `src/lib/reminders.ts` / `ReminderRunner`
(which covers the app-open case); this function covers app-closed delivery.

## Prerequisites

1. Blaze plan enabled.
2. Cloud Messaging API (V1) enabled, and a Web Push (VAPID) certificate generated
   (the client uses the VAPID key; the server uses the default service-account
   credentials — no key needed here).
3. The client has registered at least one push token (turn on reminders in the
   app on a supported device).

## Develop / deploy

```bash
cd functions
npm install
npm run build            # tsc → lib/
firebase deploy --only functions
npm run logs             # tail logs
```

The schedule uses Cloud Scheduler (auto-provisioned on first deploy). Adjust the
cadence/timezone in `src/index.ts` (`onSchedule({ schedule, timeZone })`).
