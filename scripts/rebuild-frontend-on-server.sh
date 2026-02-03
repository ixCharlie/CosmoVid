#!/usr/bin/env bash
# Run this on the server (e.g. after git pull) to rebuild the frontend and fix
# "Network error" on download. Uses same-origin API by default.
#
# Usage (from repo root, e.g. /var/www/tiktok-downloader):
#   ./scripts/rebuild-frontend-on-server.sh
#
# If your API is on a subdomain (e.g. https://api.CosmoVid.com):
#   NEXT_PUBLIC_API_URL=https://api.CosmoVid.com ./scripts/rebuild-frontend-on-server.sh
#   # or
#   export NEXT_PUBLIC_API_URL=https://api.CosmoVid.com
#   ./scripts/rebuild-frontend-on-server.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT/frontend"

# Same-origin when unset (Nginx must proxy /api to backend). Override with env if using subdomain.
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-}"

echo "Building frontend (NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-<same origin>})..."
npm run build

echo "Restarting Next.js app..."
pm2 restart tiktok-web --update-env

echo "Done. Test download on the site."
