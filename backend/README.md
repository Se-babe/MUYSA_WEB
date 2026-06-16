# Legacy Backend (MySQL + Express)

**This backend is no longer used.** MUYSA Connect now runs on Firebase.

Do **not** run `npm run dev` here. Use the frontend instead:

```bash
cd ../frontend
npm run dev
```

Or from the project root:

```bash
cd ..
npm run dev
```

The MySQL errors you saw (`Table 'muysa_connect.users' doesn't exist`) come from this old server. The React app talks directly to Firebase — no Express API needed.
