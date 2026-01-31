export const PORT = process.env.PORT || 4000;
export const CACHE_TTL_SECONDS = 60 * 60; // 1 hour
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP
