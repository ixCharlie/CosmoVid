# Check API, Frontend & Backend (Website)

Quick reference to verify the site and API are wired correctly.

---

## "Network error. Please check your connection and try again."

This message on [cosmovid.com](https://cosmovid.com/en) means the **browser never got a response** from the API (the `fetch()` call threw).

**Most likely cause:** The frontend was built **without** setting `NEXT_PUBLIC_API_URL` on the server. In that case Next.js falls back to `http://localhost:4000`. In the user’s browser, “localhost” is **their own computer**, not your server, so the request fails and you see “Network error.”

**Fix:**

1. **On the server**, when building the frontend, set the **public** API URL and rebuild:
   - **Option A (same domain):**  
     `NEXT_PUBLIC_API_URL=https://cosmovid.com`  
     and configure Nginx so `https://cosmovid.com/api` is proxied to the backend (port 4000). See DEPLOYMENT.md “Alternative (API on same domain)”.
   - **Option B (subdomain):**  
     `NEXT_PUBLIC_API_URL=https://api.cosmovid.com`  
     and configure Nginx (and DNS) so `api.cosmovid.com` points to the same server and is proxied to port 4000.

2. Rebuild the frontend with the chosen URL, then restart:
   ```bash
   cd /var/www/tiktok-downloader/frontend
   export NEXT_PUBLIC_API_URL=https://cosmovid.com
   export NEXT_PUBLIC_SITE_URL=https://cosmovid.com
   npm run build
   pm2 restart tiktok-web
   ```

3. Ensure Nginx proxies `/api` (or `api.cosmovid.com`) to `http://127.0.0.1:4000` and reload Nginx. Ensure the backend is running: `pm2 list` → `tiktok-api` online, and `curl -s http://127.0.0.1:4000/health` → `{"status":"ok"}`.

---

## What the frontend expects

| Purpose | URL | Method |
|--------|-----|--------|
| Get video info (paste URL, get links) | `{API_URL}/api/download` | POST, body: `{ "url": "https://tiktok.com/..." }` |
| Download file (stream) | `{API_URL}/api/download/proxy?tiktok_url=...&variant=...&type=...` | GET |
| (Optional) Health | `{API_URL}/health` | GET |

- **API_URL** is set by `NEXT_PUBLIC_API_URL` (frontend env).
- Default when not set: `http://localhost:4000` (see `frontend/next.config.js`).

---

## What the backend serves

| Path | Handler | Notes |
|------|---------|--------|
| `GET /health` | Health check | Returns `{ "status": "ok" }` |
| `POST /api/download` | Get TikTok video info | Rate limited, returns links + title/author |
| `GET /api/download/proxy?...` | Stream video/audio file | Used when user clicks “Download” |

Route order is set so:
- **POST /api/download** is handled by the download router (fetch video info).
- **GET /api/download/proxy** is handled by the proxy router (stream file).

---

## Local check (on your machine)

1. **Backend**
   ```bash
   cd backend && npm run dev
   ```
   - Health: open or `curl http://localhost:4000/health` → `{"status":"ok"}`.
   - API: `curl -X POST http://localhost:4000/api/download -H "Content-Type: application/json" -d '{"url":"https://www.tiktok.com/@user/video/123"}'` (replace with a real URL to test).

2. **Frontend**
   ```bash
   cd frontend && npm run dev
   ```
   - Open http://localhost:3000, paste a TikTok URL, click “Get Download Links”.
   - If API is on port 4000 and you didn’t set `NEXT_PUBLIC_API_URL`, it should call `http://localhost:4000` (default in `next.config.js`).

3. **Env**
   - Frontend: `NEXT_PUBLIC_API_URL` should point to the backend (e.g. `http://localhost:4000` locally, `https://api.yourdomain.com` in production).
   - Backend: `PORT` (default 4000), optional `YT_DLP_PATH` if yt-dlp is not in PATH.

---

## Server check (over SSH)

On the server:

```bash
# Backend health
curl -s http://127.0.0.1:4000/health

# Frontend (Next.js)
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/

# PM2
pm2 list
```

- Health should return `{"status":"ok"}`.
- Frontend should return `200`.
- `tiktok-api` and `tiktok-web` should be **online**.

---

## Bug that was fixed (route order)

Previously, **POST /api/download** was sent to the proxy router (mounted at `/api/download` first), which only has **GET /proxy**. So “Get Download Links” could return 404.

**Fix:** Mount the proxy router under the download router at `/download`, then mount the download router at `/api`. So:

- **POST /api/download** → download router → OK.
- **GET /api/download/proxy** → download router → proxy router at `/download` → OK.

See `backend/src/server.ts`: `downloadRouter.use('/download', proxyRouter)` then `app.use('/api', downloadRouter)`.
