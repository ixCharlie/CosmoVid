# How to Make Changes to the Website

This guide explains where to edit the code and how to run, test, and deploy your changes.

---

## 1. Run the site locally (so you can see changes)

On your computer, from the project folder:

```bash
# Terminal 1 – backend (API)
cd backend
npm install
npm run build
npm run dev
# Runs at http://localhost:4000

# Terminal 2 – frontend (website)
cd frontend
npm install
npm run dev
# Runs at http://localhost:3000
```

Open **http://localhost:3000** in your browser. Changes to the frontend usually hot-reload; backend changes need a restart of `npm run dev` in the backend folder.

---

## 2. Where to edit what

### Text and copy (English & Arabic)

- **English:** `frontend/src/locales/en.json`
- **Arabic:** `frontend/src/locales/ar.json`

Edit the values (right side of the quotes). Keys like `home.title`, `footer.tagline`, `faq.legalAnswer` are used in the app. Keep the same keys in both files so both languages stay in sync.

**Examples:**
- Site name / tagline: `common.siteName`, `footer.tagline`
- Homepage: `home.title`, `home.subtitle`, button labels under `home.*`
- FAQ text: `faq.howItWorksAnswer`, `faq.legalAnswer`
- About page: `about.intro`, `about.contactText`

### Layout and design (header, footer, navigation)

- **Footer:** `frontend/src/components/Footer.tsx`
- **Header / nav:** `frontend/src/components/Header.tsx`
- **Global styles (colors, fonts, spacing):** `frontend/src/app/globals.css`

Footer and header use translations: they call `t('footer.tagline')`, `t('nav.home')`, etc. So changing the **wording** is done in `en.json` / `ar.json`; changing **structure or layout** is done in the component files.

### Homepage (downloader form and results)

- **Form (URL input, submit button):** `frontend/src/components/DownloadForm.tsx`
- **Results (download links, copy button):** `frontend/src/components/DownloadResults.tsx`
- **Home layout / sections:** `frontend/src/components/HomeContent.tsx`

Labels and messages come from the locale files; logic and layout are in these components.

### Other pages (FAQ, About)

- **FAQ:** `frontend/src/components/FaqContent.tsx` (and FAQ text in `en.json` / `ar.json`)
- **About:** `frontend/src/components/AboutContent.tsx` (and About text in the locale files)

### Meta / SEO (title, description)

- **Default meta:** `frontend/src/app/layout.tsx` (e.g. `metadata.title`, `metadata.description`)
- **Per-page meta:** inside each page or in the locale files under `metaTitle`, `metaDescription`

### Backend (download API, TikTok logic)

- **Download API (POST /api/download):** `backend/src/routes/download.ts`
- **Proxy (streaming the actual file):** `backend/src/routes/proxy.ts`
- **TikTok fetching (yt-dlp, links):** `backend/src/services/tiktok.ts`
- **Port / config:** `backend/src/config.ts` and `backend/src/server.ts`

After editing backend code, run in the backend folder:

```bash
npm run build
npm run dev
```

---

## 3. Common types of changes

| What you want to change | Where to edit |
|-------------------------|----------------|
| Footer tagline / “for personal use” text | `frontend/src/locales/en.json` and `ar.json` → `footer.tagline` |
| Site name everywhere | `frontend/src/locales/en.json` and `ar.json` → `common.siteName` |
| Homepage title or subtitle | Same files → `home.title`, `home.subtitle` |
| FAQ or legal disclaimer text | Same files → `faq.*` |
| Button labels (Download, Retry, etc.) | Same files → `home.*`, `common.*` |
| Colors / fonts / spacing | `frontend/src/app/globals.css` (and sometimes component classNames) |
| Add or remove a nav link | `frontend/src/components/Header.tsx` and `Footer.tsx` + locale `nav.*` |
| Change how downloads work (API) | `backend/src/services/tiktok.ts`, `backend/src/routes/download.ts`, `proxy.ts` |

---

## 4. Save and deploy your changes

### On your computer

1. Save all files.
2. Test locally (frontend at http://localhost:3000, try the download flow).
3. Commit and push to GitHub:

```bash
cd /path/to/Website
git add -A
git status
git commit -m "Short description of what you changed"
git push origin main
```

### On the server (SSH)

SSH into your server, then run:

```bash
cd /var/www/tiktok-downloader
git pull
cd backend && npm run build && pm2 restart tiktok-api
cd ../frontend && npm run build && pm2 restart tiktok-web
```

(If your project path is different, use that path instead of `/var/www/tiktok-downloader`.)

After this, the live site uses your new code.

---

## 5. Quick reference

- **Frontend (what users see):** `frontend/src/` — components, `app/`, `locales/`
- **Backend (API / download):** `backend/src/` — `routes/`, `services/`, `server.ts`
- **Text in English/Arabic:** `frontend/src/locales/en.json` and `ar.json`
- **Run locally:** backend `npm run dev` (port 4000), frontend `npm run dev` (port 3000)
- **Deploy:** push to `main`, then on server: `git pull` + rebuild backend + rebuild frontend + `pm2 restart tiktok-api tiktok-web`

For first-time server setup, domain, Nginx, and SSL, see **DEPLOYMENT.md** and **NEXT_STEPS.md**.

---

## Styles not loading on the live site?

If the page looks plain (no colors, no Tailwind) on the server:

1. **Use production build** — On the server you must run `npm run build` then `npm start` (or PM2). Do **not** run `next dev` in production.
2. **Rebuild frontend** — In SSH: `cd /var/www/tiktok-downloader/frontend && rm -rf .next && npm run build && pm2 restart tiktok-web`.
3. **Nginx** — Your config must proxy the whole site to the Next app: `location / { proxy_pass http://127.0.0.1:3000; ... }`. So `/` and `/_next/static/*` (where CSS lives) go to Next.js.
4. **Hard refresh** — Try Ctrl+Shift+R (or Cmd+Shift+R) to bypass cache.

The root layout includes a small inline style fallback so the page still has background and text color even if the CSS bundle fails to load.
