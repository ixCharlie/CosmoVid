# Next Steps After Droplet Update

Run these in order once your DigitalOcean droplet has been updated (Node.js, Nginx, PM2, yt-dlp installed).

---

## 1. Push Project to GitHub (if not done)

On your Mac, from the project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME/YOUR_REPO` with your GitHub username and repo name.

---

## 2. Point Domain to Droplet

- Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- Add an **A record**: `@` → your Droplet IP
- Add **A record** for `www` → your Droplet IP (optional)
- Add **A record** for `api` → your Droplet IP (if using API subdomain)
- Wait 5–30 minutes for DNS to propagate

---

## 3. Clone Repository on Droplet

In the DigitalOcean web terminal (or SSH):

```bash
cd /var/www
sudo mkdir -p tiktok-downloader
sudo chown $USER:$USER tiktok-downloader
cd tiktok-downloader
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

---

## 4. Backend Setup

```bash
cd /var/www/tiktok-downloader/backend
npm install
npm run build
echo "PORT=4000" > .env
pm2 start dist/server.js --name tiktok-api
pm2 save
pm2 startup   # run the command it prints
```

---

## 5. Frontend Setup

Replace `YOUR_DOMAIN.com` with your actual domain:

```bash
cd /var/www/tiktok-downloader/frontend
npm install
export NEXT_PUBLIC_API_URL=https://api.YOUR_DOMAIN.com
export NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN.com
npm run build
pm2 start npm --name tiktok-web -- start
pm2 save
```

---

## 6. Nginx Reverse Proxy

Create the config:

```bash
sudo nano /etc/nginx/sites-available/tiktok-downloader
```

Paste (replace `YOUR_DOMAIN.com`):

```nginx
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

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/tiktok-downloader /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. SSL with Let's Encrypt

Do this **after** your domain resolves to the droplet:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com -d api.YOUR_DOMAIN.com
```

Follow the prompts. Certbot will add HTTPS and auto-renewal.

---

## 8. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

---

## 9. Verify Deployment

- Visit `https://YOUR_DOMAIN.com` — frontend should load
- Visit `https://api.YOUR_DOMAIN.com/health` or similar — backend should respond
- Test the TikTok download flow

---

## 10. Optional: Analytics & Ads

- Update `NEXT_PUBLIC_GA_ID` in the frontend env for Google Analytics
- Add AdSense IDs in layout/components as per DEPLOYMENT.md

---

## Useful Commands Later

| Task              | Command                                        |
|-------------------|------------------------------------------------|
| View logs         | `pm2 logs` or `pm2 logs tiktok-api`            |
| Restart backend   | `pm2 restart tiktok-api`                       |
| Restart frontend  | `pm2 restart tiktok-web`                       |
| Deploy updates    | `cd /var/www/tiktok-downloader && git pull`    |
| Rebuild backend   | `cd backend && npm run build && pm2 restart tiktok-api` |
| Rebuild frontend  | `cd frontend && npm run build && pm2 restart tiktok-web` |
