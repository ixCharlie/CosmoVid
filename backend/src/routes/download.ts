import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { getTikTokDownloadLinks } from '../services/tiktok';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from '../config';

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const downloadRouter = Router();

downloadRouter.use('/download', limiter);

downloadRouter.post('/download', async (req: Request, res: Response) => {
  const url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'TikTok URL is required.',
      links: {},
    });
  }

  const result = await getTikTokDownloadLinks(url);
  return res.json(result);
});
