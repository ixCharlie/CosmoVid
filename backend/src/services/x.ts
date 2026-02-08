import { execFile } from 'child_process';
import { promisify } from 'util';
import NodeCache from 'node-cache';
import { CACHE_TTL_SECONDS } from '../config';

const execFileAsync = promisify(execFile);
const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });

const X_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/(?:\w+\/status\/|status\/)(\d+)/i;

export interface XDownloadResult {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  duration?: number;
  quality?: string;
  fps?: number;
  links: {
    video?: string;
  };
  error?: string;
}

function extractStatusId(url: string): string | null {
  const match = url.match(X_URL_REGEX);
  return match ? match[1] : null;
}

interface YtDlpFormat {
  format_id?: string;
  url?: string;
  vcodec?: string;
  acodec?: string;
  height?: number;
  fps?: number;
  format_note?: string;
}

interface YtDlpJson {
  id?: string;
  title?: string;
  uploader?: string;
  uploader_id?: string;
  thumbnail?: string;
  duration?: number;
  formats?: YtDlpFormat[];
}

function isVideoFormat(f: YtDlpFormat): boolean {
  const v = (f.vcodec || '').toLowerCase();
  return v !== 'none' && v !== '';
}

function runYtDlp(url: string): Promise<YtDlpJson> {
  const bin = process.env.YT_DLP_PATH || 'yt-dlp';
  const args = [
    '--dump-json',
    '--no-download',
    '--no-warnings',
    '--no-playlist',
    '--no-check-certificate',
    url,
  ];
  return execFileAsync(bin, args, {
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 2 * 1024 * 1024,
  }).then(({ stdout }) => JSON.parse(stdout) as YtDlpJson);
}

/**
 * Fetches X (Twitter) video metadata and download link using yt-dlp.
 */
export async function getXDownloadLinks(url: string): Promise<XDownloadResult> {
  const trimmed = url.trim();
  const statusId = extractStatusId(trimmed);

  if (!statusId) {
    return {
      success: false,
      links: {},
      error: 'Invalid X/Twitter URL. Use a link like https://x.com/user/status/123456789',
    };
  }

  const cacheKey = `x:${statusId}`;
  const cached = cache.get<XDownloadResult>(cacheKey);
  if (cached) return cached;

  try {
    const data = await runYtDlp(trimmed);
    const formats = Array.isArray(data?.formats) ? data.formats : [];
    const videoFormats = formats.filter((f) => f.url && isVideoFormat(f));
    const best = videoFormats[0];
    const videoUrl = best?.url;

    if (videoUrl) {
      const quality = best?.height
        ? `${best.height}p`
        : (best?.format_note && !/unknown/i.test(best.format_note))
          ? best.format_note
          : undefined;
      const fps = best?.fps != null && Number.isFinite(best.fps) ? best.fps : undefined;
      const result: XDownloadResult = {
        success: true,
        title: data.title ?? undefined,
        author: data.uploader_id ?? data.uploader ?? undefined,
        cover: data.thumbnail ?? undefined,
        duration: typeof data.duration === 'number' ? data.duration : undefined,
        quality: quality ?? undefined,
        fps: fps ?? undefined,
        links: { video: videoUrl },
      };
      cache.set(cacheKey, result);
      return result;
    }

    return {
      success: false,
      links: {},
      error: 'No video found. The post may be text-only or the video is unavailable.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isPrivate =
      /private|unavailable|sign in|login|restricted|blocked|404|not found|suspended/i.test(message);
    return {
      success: false,
      links: {},
      error: isPrivate
        ? 'Video not found or is private. Please check the URL.'
        : 'Unable to fetch video. Please try again or use a different X/Twitter URL.',
    };
  }
}
