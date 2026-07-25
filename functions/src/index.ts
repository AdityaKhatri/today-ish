import { onSchedule } from 'firebase-functions/v2/scheduler'
import { logger } from 'firebase-functions/v2'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { DateTime } from 'luxon'

initializeApp()
const db = getFirestore()

const HOUR_MS = 60 * 60 * 1000

interface Reminder {
  /** stable per-day key for dedupe + notification tag */
  key: string
  title: string
  body: string
}

/**
 * Scheduled reminder sender.
 *
 * Runs every 15 minutes. For each opted-in user (users.remindersEnabled == true)
 * it finds due/overdue tasks and due fixed-time routines, sends them via FCM to
 * the user's registered pushTokens, dedupes per local day, and prunes tokens
 * FCM reports as invalid.
 *
 * Task deadlines are absolute Timestamps, so they're timezone-independent.
 * Routine "fixed" times are local ("HH:mm"), so they use the user's stored
 * `timezone` (written by the client).
 */
export const sendReminders = onSchedule(
  { schedule: 'every 15 minutes', timeZone: 'Etc/UTC', region: 'us-central1' },
  async () => {
    const nowMs = Date.now()
    const users = await db.collection('users').where('remindersEnabled', '==', true).get()
    logger.info(`sendReminders: ${users.size} opted-in user(s)`)
    await Promise.all(users.docs.map((u) => processUser(u.id, u.data(), nowMs)))
  },
)

async function processUser(uid: string, user: FirebaseFirestore.DocumentData, nowMs: number): Promise<void> {
  const tokensSnap = await db.collection(`users/${uid}/pushTokens`).get()
  const tokens = tokensSnap.docs.map((d) => d.get('token') as string).filter(Boolean)
  if (tokens.length === 0) return

  const tz: string = user.timezone || 'Etc/UTC'
  const reminders = await computeReminders(uid, nowMs, tz)
  if (reminders.length === 0) return

  // Dedupe within the user's local day.
  const localDate = DateTime.now().setZone(tz).toFormat('yyyy-MM-dd')
  const stateRef = db.doc(`users/${uid}/reminderState/${localDate}`)
  const stateSnap = await stateRef.get()
  const fired: string[] = stateSnap.exists ? (stateSnap.get('fired') as string[]) ?? [] : []
  const fresh = reminders.filter((r) => !fired.includes(r.key))
  if (fresh.length === 0) return

  for (const r of fresh) {
    await sendToTokens(uid, tokens, r)
  }

  await stateRef.set(
    {
      fired: FieldValue.arrayUnion(...fresh.map((r) => r.key)),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )
  logger.info(`sendReminders: sent ${fresh.length} to ${uid}`)
}

async function computeReminders(uid: string, nowMs: number, tz: string): Promise<Reminder[]> {
  const out: Reminder[] = []

  // Tasks — absolute deadline, overdue or due within the hour.
  const tasksSnap = await db.collection(`users/${uid}/tasks`).where('status', '==', 'active').get()
  for (const d of tasksSnap.docs) {
    const t = d.data()
    const deadline: number | undefined = t.deadline?.toMillis?.()
    if (!deadline) continue
    if (deadline - nowMs <= HOUR_MS) {
      const overdue = nowMs > deadline
      out.push({
        key: `task:${d.id}`,
        title: overdue ? 'Task overdue' : 'Task due soon',
        body: t.title || 'Task',
      })
    }
  }

  // Routines — fixed-time in the user's local zone, active today, not done.
  const local = DateTime.now().setZone(tz)
  const dow = local.weekday % 7 // luxon 1=Mon..7=Sun → JS 0=Sun..6=Sat
  const dateKey = local.toFormat('yyyy-MM-dd')
  const routinesSnap = await db.collection(`users/${uid}/routines`).get()
  for (const d of routinesSnap.docs) {
    const r = d.data()
    if (!r.reminderEnabled || r.windowType !== 'fixed' || !r.windowStart) continue
    const repeatDays: number[] = r.repeatDays ?? []
    if (!repeatDays.includes(dow)) continue
    const [h, m] = String(r.windowStart).split(':').map(Number)
    const at = local.set({ hour: h, minute: m, second: 0, millisecond: 0 })
    if (local < at) continue
    const logSnap = await db.doc(`users/${uid}/routineLogs/${d.id}_${dateKey}`).get()
    if (logSnap.exists && logSnap.get('status') === 'done') continue
    out.push({ key: `routine:${d.id}`, title: 'Routine reminder', body: r.title || 'Routine' })
  }

  return out
}

async function sendToTokens(uid: string, tokens: string[], r: Reminder): Promise<void> {
  const res = await getMessaging().sendEachForMulticast({
    tokens,
    // DATA-only so the client SW controls rendering (no double notifications).
    data: { title: r.title, body: r.body, tag: r.key },
  })

  const invalid: string[] = []
  res.responses.forEach((resp, i) => {
    if (resp.success) return
    const code = resp.error?.code
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-registration-token' ||
      code === 'messaging/invalid-argument'
    ) {
      invalid.push(tokens[i])
    }
  })

  await Promise.all(
    invalid.map((tok) => db.doc(`users/${uid}/pushTokens/${tok}`).delete().catch(() => undefined)),
  )
}
