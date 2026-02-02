# Deployment: CosmoVid on DigitalOcean

This guide walks through deploying **CosmoVid** (TikTok downloader) on an Ubuntu 22.04 Droplet with Nginx, PM2, and Let's Encrypt SSL.

## Prerequisites

- A DigitalOcean account
- A domain pointed to your Droplet's IP (A record)
- GitHub repo with this project

---

## Start here: Get CosmoVid from GitHub onto your server

You don’t “push” to the server. You **push to GitHub**, then on the server you **clone** from GitHub.

**1. On your laptop** (in this project folder) — push your code to GitHub:

```bash
git add .
git commit -m "Deploy CosmoVid"
git push origin main
```

*(Use `master` instead of `main` if that’s your default branch.)*

**2. On the DigitalOcean server** — clone your repo into the app folder:

```bash
cd /var/www
sudo mkdir -p tiktok-downloader
sudo chown $USER:$USER tiktok-downloader
cd tiktok-downloader
git clone https://github.com/ixCharlie/CosmoVid.git .
```

The `.` at the end clones into the current folder. Repo: [ixCharlie/CosmoVid](https://github.com/ixCharlie/CosmoVid).

**3. Then** follow the rest of this guide: install Node, Nginx, PM2 (if not done), install yt-dlp, set up backend (§8), frontend (§9), Nginx (§10), and SSL (§11).

---

## 1. Create DigitalOcean Droplet

1. Log in to [DigitalOcean](https://cloud.digitalocean.com).
2. Create a Droplet:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic, $6/mo or higher
   - **Region:** Choose nearest to your users
   - **Authentication:** SSH key (recommended) or password
3. Note the Droplet IP address.

---

## 2. Initial Server Setup

SSH into the Droplet:

```bash
ssh root@YOUR_DROPLET_IP
```

Update system and install basics:

```bash
apt update && apt upgrade -y
apt install -y curl git ufw
```

(Optional) Create a non-root user:

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

---

## 3. Install Node.js (v20 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v20.x
npm -v
```

---

## 4. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 5. Install PM2

```bash
sudo npm install -g pm2
```

---

## 6. Clone Repository

```bash
cd /var/www
sudo mkdir -p tiktok-downloader
sudo chown $USER:$USER tiktok-downloader
cd tiktok-downloader
git clone https://github.com/ixCharlie/CosmoVid.git .
```

---

## 7. Install yt-dlp (required for backend)

The backend uses yt-dlp to fetch TikTok video links. Install it on the server:

```bash
# Ubuntu 22.04 – install latest yt-dlp
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
yt-dlp --version
```

Or with pip: `sudo pip3 install yt-dlp`

---

## 8. Backend Setup

```bash
cd backend
npm install
npm run build
```

Create environment file (optional):

```bash
echo "PORT=4000" > .env
# If yt-dlp is not in PATH: echo "YT_DLP_PATH=/usr/local/bin/yt-dlp" >> .env
```

Start with PM2:

```bash
pm2 start dist/server.js --name tiktok-api
pm2 save
pm2 startup   # follow the command it prints to enable on boot
```

**Note:** Use `pm2 start dist/server.js` (compiled JS), not `server.ts`. Build first with `npm run build`.

---

## 9. Frontend Setup

```bash
cd /var/www/tiktok-downloader/frontend
npm install
```

Set environment variables for build (**required** — if you skip this, the site will call `http://localhost:4000` from the user’s browser and show “Network error”):

```bash
# Use your real domain. Same-origin (recommended): use https://cosmovid.com and proxy /api to backend in Nginx.
export NEXT_PUBLIC_API_URL=https://cosmovid.com
export NEXT_PUBLIC_SITE_URL=https://cosmovid.com
export NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
npm run build
```

Start production server:

```bash
pm2 start npm --name tiktok-web -- start
pm2 save
```

Or use a custom server port:

```bash
pm2 start "npm run start -- -p 3000" --name tiktok-web
```

---

## 10. Nginx Reverse Proxy

Create Nginx config for your domain:

```bash
sudo nano /etc/nginx/sites-available/tiktok-downloader
```

Paste (replace `YOUR_DOMAIN.com` and optional API subdomain):

```nginx
# Frontend (Next.js)
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API (optional: same server, different path or subdomain)
server {
    listen 80;
    server_name api.YOUR_DOMAIN.com;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and test:

```bash
sudo ln -s /etc/nginx/sites-available/tiktok-downloader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Alternative (API on same domain):** To serve API at `https://YOUR_DOMAIN.com/api`, use one server block and:

```nginx
location /api {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
location / {
    proxy_pass http://127.0.0.1:3000;
    # ... same as above
}
```

Then set `NEXT_PUBLIC_API_URL=https://YOUR_DOMAIN.com` so the frontend calls the same origin.

---

## 11. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com -d api.YOUR_DOMAIN.com
```

Follow prompts. Certbot will configure HTTPS and auto-renewal.

Verify renewal:

```bash
sudo certbot renew --dry-run
```

---

## 12. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 13. Google AdSense & Analytics

- In **layout.tsx** (or `_document.tsx` in Pages Router), replace `ca-pub-XXXXXXXXXX` with your AdSense client ID.
- Replace `G-XXXXXXXXXX` with your GA4 Measurement ID and set `NEXT_PUBLIC_GA_ID` in the frontend env.
- For AdSense, add real ad unit IDs and replace the placeholder `AdSlot` component with actual `<ins class="adsbygoogle">` tags and `(adsbygoogle = window.adsbygoogle || []).push({});`.

---

## 14. Updating the Website (Push New Code)

**Best approach:** SSH in, pull from Git, rebuild, then restart PM2.

1. **Push your changes to GitHub** (from your laptop):

   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```

2. **On the DigitalOcean server**, SSH in and run:

   ```bash
   ssh root@YOUR_DROPLET_IP
   cd /var/www/tiktok-downloader
   git pull origin main
   ```

3. **Rebuild and restart backend:**

   ```bash
   cd backend
   npm install
   npm run build
   pm2 restart tiktok-api
   ```

4. **Rebuild and restart frontend** (set env vars if you use them):

   ```bash
   cd /var/www/tiktok-downloader/frontend
   npm install
   export NEXT_PUBLIC_API_URL=https://api.YOUR_DOMAIN.com
   export NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN.com
   npm run build
   pm2 restart tiktok-web
   ```

**One-liner** (after `git pull`, from project root):

```bash
cd /var/www/tiktok-downloader/backend && npm install && npm run build && pm2 restart tiktok-api && cd ../frontend && npm install && npm run build && pm2 restart tiktok-web
```

---

## 15. Backup and Rollback

### Backups

- **Git is your code backup.** Every push to `main` is a restore point. Use tags for releases:

  ```bash
  git tag -a v1.0.0 -m "Stable release"
  git push origin v1.0.0
  ```

- **Server snapshot (DigitalOcean):** In the Droplet dashboard → **Snapshots** → Create snapshot. Do this before big updates. Restoring means creating a new Droplet from the snapshot (or restoring to the same Droplet if supported).

- **Quick file backup on server** (optional, before a risky update):

  ```bash
  cd /var/www
  sudo cp -r tiktok-downloader tiktok-downloader-backup-$(date +%Y%m%d)
  ```

### Rollback to a previous version

**Option A — Roll back via Git (recommended)**

1. On the server:

   ```bash
   cd /var/www/tiktok-downloader
   git log --oneline -10
   ```

2. Pick the commit you want (e.g. `abc1234`) and reset:

   ```bash
   git reset --hard abc1234
   ```

3. Rebuild and restart (same as “Updating the Website” above):

   ```bash
   cd backend && npm install && npm run build && pm2 restart tiktok-api
   cd ../frontend && npm install && npm run build && pm2 restart tiktok-web
   ```

**Option B — Restore from file backup**

If you made a copy of the app folder:

```bash
 cd /var/www
 sudo rm -rf tiktok-downloader
 sudo mv tiktok-downloader-backup-YYYYMMDD tiktok-downloader
 cd tiktok-downloader/backend && npm run build && pm2 restart tiktok-api
 cd ../frontend && npm run build && pm2 restart tiktok-web
```

**Option C — Restore from DigitalOcean snapshot**

In the control panel, create a new Droplet from the snapshot (or use “Restore” if available). Point your domain to the new Droplet IP and re-run SSL (Certbot) if the IP changed.

---

## 16. Useful Commands

| Task              | Command                          |
|-------------------|----------------------------------|
| Backend logs      | `pm2 logs tiktok-api`            |
| Frontend logs     | `pm2 logs tiktok-web`            |
| Restart backend   | `pm2 restart tiktok-api`         |
| Restart frontend  | `pm2 restart tiktok-web`         |
| Rebuild & restart | `cd backend && npm run build && pm2 restart tiktok-api` |
| Frontend rebuild  | `cd frontend && npm run build && pm2 restart tiktok-web` |

---

## Scaling (Future)

- Add **Instagram Reels** or **YouTube Shorts** support by adding new routes (e.g. `/api/download/reels`, `/api/download/shorts`) and corresponding services.
- Use a process manager (PM2 cluster) or run behind a load balancer for higher traffic.
- Consider Redis for distributed cache if you run multiple API instances.
