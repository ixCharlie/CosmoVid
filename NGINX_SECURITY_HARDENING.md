# Nginx Security Hardening Guide

This guide addresses the security findings from your Nginx 1.24.0 scan and provides production-ready fixes.

---

## Summary of Issues Addressed

| Finding | Severity | Fix |
|---------|----------|-----|
| Version-based vulnerability (e.g. CVE-2026-1642, CVE-2025-23419, CVE-2024-7347) | Medium | Upgrade to Nginx 1.28.2+ |
| Missing security headers | Low | Add X-Content-Type-Options, Referrer-Policy, HSTS, CSP |
| Server software disclosure | Low | `server_tokens off;` |
| HTTP OPTIONS enabled | Info | `limit_except` to restrict methods |
| Missing security.txt | Info | Add `/.well-known/security.txt` |

---

## 1. Upgrade Nginx to Latest Stable (Fix CVEs)

**Nginx 1.24.0 is vulnerable to:**
- **CVE-2026-1642** (Medium): SSL upstream injection
- **CVE-2025-23419** (Medium): SSL session reuse bypass
- **CVE-2025-53859** (Low): Buffer overread in mail module
- **CVE-2024-7347** (Low): Buffer overread in mp4 module

**Target:** Nginx 1.28.2+ (stable) or 1.29.5+ (mainline)

### Ubuntu 22.04 – Official Nginx Repo

```bash
# Install prerequisites
sudo apt install -y curl gnupg2 ca-certificates lsb-release ubuntu-keyring

# Add Nginx signing key
curl -fsSL https://nginx.org/keys/nginx_signing.key | gpg --dearmor | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null

# Add stable repo
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] https://nginx.org/packages/ubuntu $(lsb_release -cs) nginx" | sudo tee /etc/apt/sources.list.d/nginx.list

# Pin Nginx packages
echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" | sudo tee /etc/apt/preferences.d/99nginx

# Upgrade
sudo apt update
sudo apt install nginx

# Verify version (should be 1.28.x or higher)
nginx -v
```

### After Upgrade

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 2. Security Headers – Why Each One Matters

| Header | Value | Purpose |
|--------|-------|---------|
| **X-Content-Type-Options** | `nosniff` | Stops browsers from MIME-sniffing; reduces XSS via content-type confusion. |
| **Referrer-Policy** | `no-referrer-when-downgrade` | Sends referrer on same security level; stricter options: `strict-origin-when-cross-origin` or `no-referrer`. |
| **Strict-Transport-Security** | `max-age=31536000; includeSubDomains; preload` | Enforces HTTPS for 1 year; helps prevent downgrade and SSL-strip attacks. |
| **Content-Security-Policy** | See below | Reduces XSS, clickjacking, and data injection by controlling allowed sources. |

### CSP for CosmoVid

The provided CSP allows:
- **AdSense / Google Analytics** – `googletagmanager.com`, `google-analytics.com`, `pagead2.googlesyndication.com`
- **Fonts** – `fonts.googleapis.com`, `fonts.gstatic.com`
- **Images** – `self`, `data:`, `https:`, `blob:`

If you add other third-party scripts or styles, extend the CSP. Tightening (e.g. removing `unsafe-inline`) may require nonces or hashes for scripts.

---

## 3. Restrict HTTP OPTIONS

**Why:** OPTIONS is used for CORS preflight. If your API is same-origin only, it is unnecessary and adds surface area.

**CosmoVid:** API is same-origin (`/api` or `api.CosmoVid.com`), so OPTIONS can be blocked.

If you later need CORS from other domains, either:
- Remove `limit_except` from the server block, or
- Allow OPTIONS only in `location /api` (see comments in `nginx/security-snippets.conf`).

---

## 4. Hide Nginx Version

**Why:** Avoids server fingerprinting and targeted CVE exploitation.

**Config:** `server_tokens off;` in the `http {}` block.

---

## 5. Add security.txt (RFC 9116)

**Why:** Helps security researchers report vulnerabilities.

**File:** `frontend/public/.well-known/security.txt`

**Update before deploy:**
- `Contact`: Valid email or URL (e.g. `mailto:security@cosmovid.com`)
- `Expires`: Date when the file is considered stale (within 1 year)
- `Policy`: URL to your security policy page
- `Canonical`: Full URL of the security.txt file

Create a `/security` page if you do not have one yet.

---

## 6. Where to Place Config

| Config | Location |
|--------|----------|
| `server_tokens off` | `/etc/nginx/nginx.conf` inside `http { }` |
| Security headers, `limit_except` | Each `server { }` block in your site config |
| Full hardened site config | `/etc/nginx/sites-available/tiktok-downloader` |

**Files in this repo:**
- `nginx/security-snippets.conf` – Reusable snippets
- `nginx/tiktok-downloader-secure.conf` – Full hardened site config

---

## 7. Step-by-Step Apply and Test

### Backup

```bash
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak
sudo cp /etc/nginx/sites-available/tiktok-downloader /etc/nginx/sites-available/tiktok-downloader.bak
```

### 1) Main config – Hide version

```bash
sudo nano /etc/nginx/nginx.conf
```

Inside `http { }`, add (or ensure):

```nginx
http {
    server_tokens off;
    # ... rest of config
}
```

### 2) Site config – Security headers and method restriction

**Option A:** Replace with full hardened config

```bash
# Copy from repo to server (adjust path if needed)
sudo cp /path/to/nginx/tiktok-downloader-secure.conf /etc/nginx/sites-available/tiktok-downloader
```

**Option B:** Manually add to existing config

Add to each `server { }` that serves HTTPS:

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com https://pagead2.googlesyndication.com; frame-src https://googleads.g.doubleclick.net; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests;" always;

limit_except GET HEAD POST PUT DELETE PATCH {
    deny all;
}
```

### 3) Deploy security.txt

Ensure `frontend/public/.well-known/security.txt` exists and is deployed. Next.js serves it at `/.well-known/security.txt`.

### 4) Test and reload

```bash
sudo nginx -t
```

If OK:

```bash
sudo systemctl reload nginx
```

### 5) Verify in browser

```bash
curl -I https://cosmovid.com
```

Check for:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer-when-downgrade`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy: ...`
- No `Server: nginx/1.24.0` (should show `Server: nginx` only)

```bash
curl -I https://cosmovid.com/.well-known/security.txt
```

---

## 8. Backward Compatibility and Production Notes

- **CSP:** If third-party scripts break, relax CSP gradually (e.g. add domains) rather than disabling it.
- **OPTIONS:** If CORS preflight fails for a new integration, allow OPTIONS for the affected path.
- **HSTS:** `preload` is optional; remove it if you prefer not to submit to the HSTS preload list.
- **Referrer-Policy:** `no-referrer-when-downgrade` is permissive; use `strict-origin-when-cross-origin` or `no-referrer` for stricter control.

---

## Quick Reference

| Task | Command |
|------|---------|
| Test config | `sudo nginx -t` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Check version | `nginx -v` |
| View headers | `curl -I https://your-domain.com` |
