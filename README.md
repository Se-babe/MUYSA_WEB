# MUYSA Connect

**Makerere University Yumbe Students Association Platform**

Official web app for MUYSA members — students and alumni at Makerere University.

## Stack

- **Frontend:** React + Vite
- **Auth:** Firebase Authentication (Email/Password)
- **Database:** Cloud Firestore
- **Hosting:** Firebase Hosting
- **Storage:** Firebase Storage (optional — requires Blaze plan for image uploads)

The Express/MySQL backend in `backend/` is **legacy** and not used.

## Quick start (development)

```bash
npm install
cd frontend && cp .env.example .env   # add Firebase credentials
cd .. && npm run dev                  # http://localhost:5173
```

## Go live (production)

See **[GO-LIVE.md](./GO-LIVE.md)** for the full checklist.

```bash
npm run check            # validate config, rules, build
npm run deploy:rules     # deploy Firestore rules
npm run deploy:hosting   # build + publish live site
```

## Firebase project

- **Project ID:** `muysa-6962c`
- **Console:** https://console.firebase.google.com/project/muysa-6962c

### Enable before launch

1. Authentication → Email/Password
2. Firestore (production)
3. Deploy rules: `npm run deploy:rules`

### First admin

Register through the app, then in Firestore set your `users` document `role` to `admin`.

## Environment variables

Copy `frontend/.env.example` → `frontend/.env`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run check` | Pre-launch system validation |
| `npm run deploy:rules` | Deploy Firestore rules + indexes |
| `npm run deploy:hosting` | Build and publish to Firebase Hosting |
| `npm run deploy:all` | Rules + hosting in one step |

## Role access

| Page | Student | Alumni | Admin | Staff |
|------|---------|--------|-------|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Executives (view + archive) | ✅ | ✅ | ✅ | ✅ |
| News, Events, Messages | ✅ | ✅ | ✅ | ✅ |
| Job board (apply) | ✅ | ✅ | ✅ | ❌ |
| Post jobs | ❌ | ✅ | ✅ | ❌ |
| Student / Alumni directories | ❌ | ✅ | ✅ | ✅ |
| All Members | ❌ | ❌ | ✅ | ❌ |
| Manage Executives / Users | ❌ | ❌ | ✅ | ❌ |
| Post News | ❌ | ❌ | ✅ | ✅ |

## Firestore collections

| Collection | Purpose |
|------------|---------|
| `users` | Profiles and roles |
| `student_profiles` / `alumni_profiles` | Directory data |
| `executives` | Current and past executive records |
| `posts` | News and announcements |
| `events` | Community events |
| `jobs` | Job board |
| `conversations` | Direct messaging |
| `stats/members` | Membership counts (admin-maintained) |

## Security

- Users can only register as `student` or `alumni` — not self-promote to admin
- Profile updates cannot change role or account status
- Executives: read if signed in, write admin only
- Deactivated users (`is_active: false`) cannot stay logged in

## Spark vs Blaze

| Feature | Spark (free) | Blaze |
|---------|--------------|-------|
| Auth, Firestore, Hosting | ✅ | ✅ |
| Cover image uploads | ❌ | ✅ |

The app works fully on Spark without image uploads.
# MUYSA_WEB
