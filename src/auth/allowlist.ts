import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

/**
 * Client-side allowlist check. Security Rules permit a signed-in user to read
 * ONLY their own `/allowlist/{email}` entry, and independently gate every
 * `/users/{uid}/**` path on that entry existing — so this check is a UX
 * redirect, not the security boundary.
 *
 * Doc id convention (email, matching the auth token email) is PROVISIONAL
 * pending firestore.rules / DATA_MODEL.md.
 */
export async function isAllowlisted(email: string): Promise<boolean> {
  const ref = doc(db, 'allowlist', email)
  const snap = await getDoc(ref)
  return snap.exists()
}
