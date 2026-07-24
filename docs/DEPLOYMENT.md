# Deployment — GitHub Pages → today-ish.com

The app deploys to **GitHub Pages** via GitHub Actions
(`.github/workflows/deploy.yml`) on every push to `main`. Firebase is used only
for Firestore + Auth (and rules) — **not** for hosting.

---

## 1. Repository settings (one-time)

**Pages source.** Repo → **Settings → Pages → Build and deployment → Source:
`GitHub Actions`.** (Do not pick "Deploy from a branch".)

**Build-time variables.** Repo → **Settings → Secrets and variables → Actions →
Variables** tab → **New repository variable**, for each of these:

| Variable | Value |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `AIzaSyBEyiz3yCcIWVyQwfTMjpI0wsz5qKvq9vI` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `today-ish-b648a.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `today-ish-b648a` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `today-ish-b648a.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `696382847793` |
| `VITE_FIREBASE_APP_ID` | `1:696382847793:web:d364fb4f60ef474338ce10` |

> These are **Variables, not Secrets**. The Firebase *web* config is not
> sensitive — it ships in the client bundle no matter what; access is enforced
> by Firestore rules + the allowlist. If your org policy prefers Secrets, move
> them to the **Secrets** tab and change `vars.` → `secrets.` in
> `.github/workflows/deploy.yml`.

No other secrets are needed. The workflow does **not** touch Firebase (rules are
deployed separately, see below).

---

## 2. Custom domain — today-ish.com

The domain is committed as `public/CNAME` (→ `dist/CNAME`), so Pages keeps the
custom domain on every deploy. You still need to:

**a) Set it in GitHub.** Repo → **Settings → Pages → Custom domain** →
`today-ish.com` → Save. Tick **Enforce HTTPS** once the cert is issued (can take
a few minutes to an hour after DNS resolves).

**b) Configure DNS** at your registrar for the apex domain:

```
# A records (IPv4)
@   A   185.199.108.153
@   A   185.199.109.153
@   A   185.199.110.153
@   A   185.199.111.153

# AAAA records (IPv6, recommended)
@   AAAA 2606:50c0:8000::153
@   AAAA 2606:50c0:8001::153
@   AAAA 2606:50c0:8002::153
@   AAAA 2606:50c0:8003::153

# Optional: www → your Pages site
www CNAME <your-github-username>.github.io.
```

DNS propagation + cert issuance can take up to ~24h the first time (usually much
less).

---

## 3. Firebase Auth — authorize the domain (REQUIRED)

Google sign-in will fail on the live site until the domain is authorized:

Firebase console → **Authentication → Settings → Authorized domains → Add
domain** → add **`today-ish.com`** (and `www.today-ish.com` if you use www).
`localhost` is already there for local dev.

---

## 4. Firestore rules (managed separately, not in CI)

Rules live in `firestore.rules` and are deployed with the Firebase CLI, not by
this pipeline:

```bash
firebase deploy --only firestore:rules
```

Keep the deployed rules in sync with the repo file.

---

## 5. Deploy

Push to `main` (or run the workflow manually via **Actions → Deploy to GitHub
Pages → Run workflow**). The workflow:

1. installs deps with pnpm (frozen lockfile),
2. builds with the `VITE_FIREBASE_*` variables injected,
3. writes `404.html` (a copy of `index.html`) so deep links like `/tasks/:id`
   resolve — GitHub Pages has no SPA rewrite,
4. uploads `dist/` and deploys to Pages.

---

## 6. Ongoing: inviting users

The app is invite-only. For each person (including yourself), create a Firestore
doc at **`/allowlist/{email}`** — document ID = their exact Google email
(lowercase) — with any field (e.g. `addedAt`). Without it, sign-in bounces to the
Not-authorized screen.
