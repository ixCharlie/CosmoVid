import { tmpdir } from 'os';

export const PORT = process.env.PORT || 4000;
export const CACHE_TTL_SECONDS = 60 * 60; // 1 hour
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

// Video shrink tool: max upload size (100MB default; server must handle processing)
const SHRINK_MAX_MB = Math.min(500, Math.max(10, parseInt(process.env.SHRINK_MAX_MB || '100', 10) || 100));
export const SHRINK_MAX_BYTES = SHRINK_MAX_MB * 1024 * 1024;
export const SHRINK_MAX_MB_DISPLAY = SHRINK_MAX_MB;

export const TEMP_DIR = process.env.TEMP_DIR || tmpdir();
