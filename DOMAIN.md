# Custom Domain — Makerere University Yumbe Students Association

Connect a memorable web address so members can access **MUYSA Connect** using your association name.

## Current live URL

**https://muysa-6962c.web.app**

This works immediately. A custom domain is optional but recommended for sharing (e.g. on posters, WhatsApp, and social media).

## Recommended domain ideas

| Example | Notes |
|---------|--------|
| `muysa.org` / `muysa.ug` | Short, easy to remember |
| `connect.muysa.org` | Points clearly to the app |
| `yumbestudents.makerere.ac.ug` | If Makerere IT provides subdomains |

Purchase a domain from **Namecheap**, **Google Domains**, **Cloudflare**, or a local Ugandan registrar.

## Connect domain to Firebase Hosting

1. Open [Firebase Console → Hosting](https://console.firebase.google.com/project/muysa-6962c/hosting)
2. Click **Add custom domain**
3. Enter your domain (e.g. `muysa.org` or `www.muysa.org`)
4. Firebase shows **DNS records** (usually `A` records and/or `TXT` for verification)
5. Add those records at your domain registrar’s DNS panel
6. Wait for SSL certificate provisioning (can take up to 24 hours)

Firebase automatically provides **HTTPS**.

## Update the app after connecting a domain

1. Set your public URL in `frontend/.env`:

```
VITE_PUBLIC_URL=https://your-domain.org
```

2. Update `frontend/index.html`:
   - `<link rel="canonical" href="..." />`
   - `og:url` meta tag

3. Rebuild and deploy:

```bash
npm run deploy:hosting
```

4. In Firebase Console → **Authentication → Settings → Authorized domains**, add your custom domain so sign-in works.

## Share with members

Use wording like:

> **Makerere University Yumbe Students Association**  
> Official platform: https://your-domain.org  
> Register with your name and course to join.

## Search visibility

The home page includes:

- Page title: **Makerere University Yumbe Students Association | MUYSA Connect**
- Meta description and keywords for search engines
- Structured data (Organization schema) for Google

Submit your site to [Google Search Console](https://search.google.com/search-console) after the custom domain is live.
