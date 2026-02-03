# Deployment: CosmoVid on DigitalOcean

This guide walks through deploying **CosmoVid** (TikTok downloader) on an Ubuntu 22.04 Droplet with Nginx, PM2, and Let's Encrypt SSL.

## Prerequisites

- A DigitalOcean account
- A domain pointed to your Droplet's IP (A record)
- GitHub repo with this project

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

**Install ffmpeg (required for Video Shrinker tool):**

```bash
sudo apt install -y ffmpeg
ffmpeg -version
```

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
# Video shrink tool: max upload size in MB (default 100; max 500). Example: SHRINK_MAX_MB=100
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

Set environment variables for build:

```bash
export NEXT_PUBLIC_API_URL=https://api.CosmoVid.com
export NEXT_PUBLIC_SITE_URL=https://CosmoVid.com
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

Paste (configured for CosmoVid.com):

```nginx
# Frontend (Next.js)
server {
    listen 80;
    server_name CosmoVid.com www.CosmoVid.com;
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
    server_name api.CosmoVid.com;
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

**Alternative (API on same domain):** To serve API at `https://CosmoVid.com/api`, use one server block and:

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

Then set `NEXT_PUBLIC_API_URL=https://CosmoVid.com` so the frontend calls the same origin.

---

## 11. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d CosmoVid.com -d www.CosmoVid.com -d api.CosmoVid.com
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

## 14. Rebuild frontend on server (fix “Network error” on download)

If users see **“Network error. Please check your connection and try again.”** when downloading, the frontend was likely built with the wrong API URL. Rebuild on the server:

**Option A – API on same domain** (Nginx proxies `https://YourDomain.com/api` to the backend):

```bash
cd /var/www/tiktok-downloader
git pull
chmod +x scripts/rebuild-frontend-on-server.sh
./scripts/rebuild-frontend-on-server.sh
```

Ensure your main Nginx server block has a `location /api { proxy_pass http://127.0.0.1:4000; ... }` (see “Alternative (API on same domain)” in section 10).

**Option B – API on subdomain** (e.g. `https://api.CosmoVid.com`):

```bash
cd /var/www/tiktok-downloader
git pull
export NEXT_PUBLIC_API_URL=https://api.CosmoVid.com
export NEXT_PUBLIC_SITE_URL=https://CosmoVid.com
./scripts/rebuild-frontend-on-server.sh
```

---

## 15. Useful Commands

| Task              | Command                          |
|-------------------|----------------------------------|
| Backend logs      | `pm2 logs tiktok-api`            |
| Frontend logs     | `pm2 logs tiktok-web`            |
| Restart backend   | `pm2 restart tiktok-api`         |
| Restart frontend  | `pm2 restart tiktok-web`         |
| Rebuild & restart | `cd backend && npm run build && pm2 restart tiktok-api` |
| Frontend rebuild  | `./scripts/rebuild-frontend-on-server.sh` (from repo root) |

---

## 16. Scaling (Future)

- Add **Instagram Reels** or **YouTube Shorts** support by adding new routes (e.g. `/api/download/reels`, `/api/download/shorts`) and corresponding services.
- Use a process manager (PM2 cluster) or run behind a load balancer for higher traffic.
- Consider Redis for distributed cache if you run multiple API instances.
