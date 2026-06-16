# MUYSA Connect — Go-Live Checklist

Use this checklist before inviting students and alumni to the platform.

## 1. Firebase Console (one-time)

- [ ] Project **muysa-6962c** is active
- [ ] **Authentication → Sign-in method → Email/Password** is enabled
- [ ] **Firestore** database exists (production mode)
- [ ] (Optional) **Storage** enabled if you upgrade to Blaze for cover images

## 2. Local configuration

```bash
cd muysa-connect/frontend
cp .env.example .env
# Fill in Firebase web app credentials from Project Settings
```

## 3. Run system check

From project root:

```bash
npm install
npm run check
```

All checks must pass before go-live.

## 4. Deploy rules and site

```bash
npm run deploy:rules      # Firestore security rules + indexes
npm run deploy:hosting    # Build + publish to Firebase Hosting
```

Your live URL will appear in the terminal (e.g. `https://muysa-6962c.web.app`).

To use a custom domain (e.g. `muysa.org`), see **[DOMAIN.md](./DOMAIN.md)**.

## 5. Create the first admin

1. Register your account at the live site (or locally)
2. Firebase Console → Firestore → `users` → your document
3. Set `role` to `admin`
4. Sign out and sign back in

## 6. Admin setup (before inviting members)

- [ ] Add **current executives** via Manage Executives
- [ ] Add **past executive records** (archive) by academic year
- [ ] Post a welcome **news** article via Post News
- [ ] Create at least one **upcoming event** (via Firestore or admin tools)
- [ ] Confirm your **profile** has name and course filled in

## 7. Invite members

Share the live URL and ask members to:

1. **Register** as Student or Alumni at the **Makerere University Yumbe Students Association** platform
2. Enter their **full name** and **course of study** (required)
3. Complete their **profile**
4. Explore Executives, News, Events, and Jobs

## Role access summary

| Feature | Student | Alumni | Admin |
|---------|---------|--------|-------|
| Dashboard, News, Events | ✅ | ✅ | ✅ |
| Executives & archive (view) | ✅ | ✅ | ✅ |
| Job board (apply) | ✅ | ✅ | ✅ |
| Post jobs | ❌ | ✅ | ✅ |
| Student / Alumni directories | ❌ | ✅ | ✅ |
| Messaging | ✅ | ✅ | ✅ |
| All Members registry | ❌ | ❌ | ✅ |
| Manage executives / users | ❌ | ❌ | ✅ |

## Support

- **Forgot password:** Login page → enter email → Forgot password?
- **Deactivated account:** Contact MUYSA admin (admin sets `is_active: false` in Firestore)
- **Storage uploads fail:** Expected on Spark plan — posts and jobs work without cover images

## Maintenance commands

```bash
npm run dev              # local development
npm run check            # pre-launch validation
npm run deploy:rules     # after rule changes
npm run deploy:hosting   # publish frontend updates
```
