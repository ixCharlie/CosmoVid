# Checking API and Site (CosmoVid)

Use this when users see **"Network error. Please check your connection and try again."** on download.

## What causes the error

The message appears when the browser **cannot reach** the download API (e.g. `fetch` throws). Common causes:

1. **Wrong or missing API URL** – Frontend was built with the wrong `NEXT_PUBLIC_API_URL` (or none), so it calls a URL that doesn’t exist or isn’t your server.
2. **API not reachable** – Backend down, wrong Nginx config, or DNS not set for `api.CosmoVid.com`.
3. **Same-origin mismatch** – You serve API at `https://CosmoVid.com/api` but the frontend was built with `NEXT_PUBLIC_API_URL=https://api.CosmoVid.com` (or the opposite).

## 1. See the real error in the browser

1. Open your site (e.g. https://CosmoVid.com).
2. Open DevTools → **Console**.
3. Paste a TikTok URL and click Download.
4. When the error appears, look for a red line like:
   - `[CosmoVid] Download API request failed: Failed to fetch { url: "..." }`
5. Note the **url** in that log. That is the exact URL the frontend is calling.

## 2. Check how your API is served

**Option A – API on subdomain** (e.g. `https://api.CosmoVid.com`)

- Nginx must have a `server` block for `api.CosmoVid.com` proxying to `http://127.0.0.1:4000`.
- DNS: an **A record** for `api.CosmoVid.com` → your Droplet IP.
- Frontend must be built with:  
  `NEXT_PUBLIC_API_URL=https://api.CosmoVid.com`

**Option B – API on same domain** (e.g. `https://CosmoVid.com/api`)

- Nginx must have `location /api { proxy_pass http://127.0.0.1:4000; ... }` under the main server block (see DEPLOYMENT.md “Alternative (API on same domain)”).
- Frontend must be built with:  
  `NEXT_PUBLIC_API_URL=https://CosmoVid.com`  
  or leave it **empty** so the app uses the same origin.

You must use **one** of these consistently. If Nginx serves API at `/api` on the main domain but the frontend was built with `NEXT_PUBLIC_API_URL=https://api.CosmoVid.com`, the browser will call the subdomain and you get a network error if that subdomain isn’t set up.

## 3. Verify API is up

On the server:

```bash
# Backend process
pm2 list
pm2 logs tiktok-api --lines 30

# Direct hit to backend (on the server)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/health
# Expect: 200

# If using api.CosmoVid.com (from server or your machine)
curl -s -o /dev/null -w "%{http_code}" https://api.CosmoVid.com/health
# Expect: 200
```

If `127.0.0.1:4000/health` returns 200 but `https://api.CosmoVid.com/health` fails, the problem is Nginx or DNS for the subdomain.

## 4. Rebuild frontend with the correct API URL

`NEXT_PUBLIC_*` is baked in at **build** time. Changing `.env` or the server env later does nothing until you rebuild.

On the server (or in CI):

```bash
cd /var/www/tiktok-downloader/frontend

# If API is at https://api.CosmoVid.com
export NEXT_PUBLIC_API_URL=https://api.CosmoVid.com
export NEXT_PUBLIC_SITE_URL=https://CosmoVid.com
npm run build
pm2 restart tiktok-web

# OR if API is on same origin (CosmoVid.com/api)
export NEXT_PUBLIC_API_URL=https://CosmoVid.com
export NEXT_PUBLIC_SITE_URL=https://CosmoVid.com
npm run build
pm2 restart tiktok-web
```

Then test again and check the Console for the `[CosmoVid] Download API request failed` log; the `url` should match how you actually serve the API.

## 5. Quick checklist

- [ ] Console shows which URL is being called.
- [ ] That URL is the one you configured (same origin or `api.CosmoVid.com`).
- [ ] `curl https://YourApiBase/health` returns 200 (from browser’s network or from server).
- [ ] Frontend was rebuilt with the correct `NEXT_PUBLIC_API_URL` and restarted (`pm2 restart tiktok-web`).
