import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { spawn } from 'child_process';
import { Readable } from 'stream';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from '../config';

const PROXY_LIMIT = Math.min(60, Math.floor(RATE_LIMIT_MAX * 2));

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: PROXY_LIMIT,
  message: { success: false, error: 'Too many download requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const TIKTOK_MEDIA_HOSTS = [
  'tiktok.com',
  'tiktokv.com',
  'tiktokcdn.com',
  'byteoversea.com',
  'musical.ly',
  'snssdk.com',
  'byteimg.com',
  'ib.tiktokv.com',
  'v16-webapp-prime.tiktok.com',
  'v19-webapp-prime.tiktok.com',
  'v.tiktok.com',
];

function isAllowedMediaUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    return TIKTOK_MEDIA_HOSTS.some((h) => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

function decodeMediaParam(encoded: string): string | null {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    return decodeURIComponent(decoded);
  } catch {
    return null;
  }
}

export const proxyRouter = Router();

proxyRouter.use(limiter);

const YT_DLP = process.env.YT_DLP_PATH || 'yt-dlp';

/**
 * Stream TikTok video/audio using yt-dlp (output to stdout, pipe to response).
 * Avoids expired CDN URLs and Referer blocks.
 */
function streamWithYtDlp(
  tiktokPageUrl: string,
  variant: 'no_watermark' | 'watermark' | 'mp3',
  res: Response,
  filename: string,
  contentType: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const isAudio = variant === 'mp3';
    const format =
      isAudio
        ? ['-x', '--audio-format', 'mp3', '-o', '-']
        : variant === 'no_watermark'
          ? ['-f', "best[format_note*='No watermark']/best[format_note*='no watermark']/best", '-o', '-']
          : ['-f', 'best', '-o', '-'];

    const args = [
      '--no-warnings',
      '--no-playlist',
      '--no-check-certificate',
      ...format,
      tiktokPageUrl,
    ];

    const proc = spawn(YT_DLP, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    let resolved = false;
    const done = (ok: boolean) => {
      if (resolved) return;
      resolved = true;
      resolve(ok);
    };

    proc.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on('error', (err) => {
      console.error('yt-dlp spawn error:', err);
      done(false);
    });
    proc.on('close', (code) => {
      if (code !== 0 && stderr) {
        console.error('yt-dlp exit', code, 'stderr:', stderr.slice(0, 500));
      }
      if (!res.headersSent) done(false);
    });

    const stdout = proc.stdout;
    if (!stdout) {
      done(false);
      return;
    }

    stdout.on('error', () => done(false));
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    stdout.pipe(res);
    done(true);
  });
}

/** Fallback: fetch CDN URL and stream (used when only media param is provided). */
const TIKTOK_ORIGIN_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Referer: 'https://www.tiktok.com/',
  Origin: 'https://www.tiktok.com',
  Accept: '*/*',
};

async function streamUrlToResponse(
  downloadUrl: string,
  res: Response,
  filename: string,
  contentType: string
): Promise<boolean> {
  const response = await fetch(downloadUrl, {
    method: 'GET',
    redirect: 'follow',
    headers: TIKTOK_ORIGIN_HEADERS,
  });

  if (!response.ok || !response.body) {
    return false;
  }

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', response.headers.get('content-type') || contentType);
  const nodeStream = Readable.fromWeb(response.body as any);
  nodeStream.pipe(res);
  return true;
}

proxyRouter.get('/proxy', async (req: Request, res: Response) => {
  const media = typeof req.query.media === 'string' ? req.query.media.trim() : '';
  const tiktokUrlEnc = typeof req.query.tiktok_url === 'string' ? req.query.tiktok_url.trim() : '';
  const type = (req.query.type as string) || 'mp4';
  const variant = ((req.query.variant as string) || 'no_watermark') as 'no_watermark' | 'watermark' | 'mp3';

  const filename = type === 'mp3' ? 'tiktok-audio.mp3' : 'tiktok-video.mp4';
  const contentType = type === 'mp3' ? 'audio/mpeg' : 'video/mp4';

  if (tiktokUrlEnc) {
    const tiktokPageUrl = decodeMediaParam(tiktokUrlEnc);
    if (!tiktokPageUrl || !/tiktok\.com/i.test(tiktokPageUrl)) {
      return res.status(400).json({ error: 'Invalid TikTok URL.' });
    }

    try {
      const ok = await streamWithYtDlp(tiktokPageUrl, variant, res, filename, contentType);
      if (!ok && !res.headersSent) {
        return res.status(502).json({
          error: 'Download failed. Make sure yt-dlp is installed and the URL is valid.',
        });
      }
      return;
    } catch (err) {
      console.error('Proxy yt-dlp error:', err);
      if (!res.headersSent) {
        return res.status(502).json({
          error: 'Download failed. Please try again.',
        });
      }
      return;
    }
  }

  if (media) {
    const downloadUrl = decodeMediaParam(media);
    if (!downloadUrl || !isAllowedMediaUrl(downloadUrl)) {
      return res.status(400).json({ error: 'Invalid or disallowed media URL.' });
    }
    try {
      const streamed = await streamUrlToResponse(downloadUrl, res, filename, contentType);
      if (!streamed) {
        return res.status(502).json({
          error: 'Could not fetch the file. The link may have expired.',
        });
      }
      return;
    } catch (err) {
      console.error('Proxy fetch error:', err);
      return res.status(502).json({ error: 'Download failed. Please try again.' });
    }
  }

  return res.status(400).json({ error: 'Missing media or tiktok_url.' });
});
