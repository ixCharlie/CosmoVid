import { execFile } from 'child_process';
import { promisify } from 'util';
import NodeCache from 'node-cache';
import { CACHE_TTL_SECONDS } from '../config';

const execFileAsync = promisify(execFile);
const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });

// Instagram URL patterns: posts, reels, photos
const INSTAGRAM_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i;

export interface InstagramDownloadResult {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  duration?: number;
  quality?: string;
  /** Single video URL */
  links: {
    video?: string;
    image?: string;
    /** Carousel: multiple items (video or image) */
    items?: Array<{ url: string; type: 'video' | 'image'; thumbnail?: string }>;
  };
  error?: string;
}

function extractShortcode(url: string): string | null {
  const match = url.match(INSTAGRAM_URL_REGEX);
  return match ? match[1] : null;
}

interface YtDlpFormat {
  format_id?: string;
  url?: string;
  vcodec?: string;
  acodec?: string;
  height?: number;
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
  entries?: Array<{ id?: string; url?: string; _type?: string; formats?: YtDlpFormat[] }>;
}

function isVideoFormat(f: YtDlpFormat): boolean {
  const v = (f.vcodec || '').toLowerCase();
  return v !== 'none' && v !== '';
}

function isImageFormat(f: YtDlpFormat): boolean {
  const v = (f.vcodec || '').toLowerCase();
  return v === 'none' || v === '';
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
    timeout: 45000,
    maxBuffer: 4 * 1024 * 1024,
  }).then(({ stdout }) => JSON.parse(stdout) as YtDlpJson);
}

/**
 * Fetches Instagram post/reel/photo metadata and download links using yt-dlp.
 * Supports single posts, Reels, and carousels.
 */
export async function getInstagramDownloadLinks(url: string): Promise<InstagramDownloadResult> {
  const trimmed = url.trim();
  const shortcode = extractShortcode(trimmed);

  if (!shortcode) {
    return {
      success: false,
      links: {},
      error: 'Invalid Instagram URL. Use a link like https://www.instagram.com/p/ABC123 or https://www.instagram.com/reel/ABC123',
    };
  }

  const cacheKey = `instagram:${shortcode}`;
  const cached = cache.get<InstagramDownloadResult>(cacheKey);
  if (cached) return cached;

  try {
    const data = await runYtDlp(trimmed);

    // Carousel (multiple entries)
    if (Array.isArray(data.entries) && data.entries.length > 0) {
      const items: Array<{ url: string; type: 'video' | 'image'; thumbnail?: string }> = [];
      for (const entry of data.entries) {
        const formats = Array.isArray(entry.formats) ? entry.formats : [];
        const videoFmt = formats.find((f) => f.url && isVideoFormat(f));
        const imageFmt = formats.find((f) => f.url && isImageFormat(f));
        const entryUrl = (entry as { url?: string }).url;
        const mediaUrl = videoFmt?.url || imageFmt?.url || entryUrl;
        if (mediaUrl) {
          items.push({
            url: mediaUrl,
            type: videoFmt ? 'video' : 'image',
            thumbnail: data.thumbnail,
          });
        }
      }
      if (items.length > 0) {
        const result: InstagramDownloadResult = {
          success: true,
          title: data.title ?? undefined,
          author: data.uploader_id ?? data.uploader ?? undefined,
          cover: data.thumbnail ?? undefined,
          links: { items },
        };
        cache.set(cacheKey, result);
        return result;
      }
    }

    // Single post/reel
    const formats = Array.isArray(data?.formats) ? data.formats : [];
    const videoFormats = formats.filter((f) => f.url && isVideoFormat(f));
    const imageFormats = formats.filter((f) => f.url && isImageFormat(f));
    const bestVideo = videoFormats[0];
    const bestImage = imageFormats[0];
    const videoUrl = bestVideo?.url;
    const imageUrl = bestImage?.url;

    if (videoUrl || imageUrl) {
      const quality = bestVideo?.height
        ? `${bestVideo.height}p`
        : (bestVideo?.format_note && !/unknown/i.test(bestVideo.format_note))
          ? bestVideo.format_note
          : undefined;
      const result: InstagramDownloadResult = {
        success: true,
        title: data.title ?? undefined,
        author: data.uploader_id ?? data.uploader ?? undefined,
        cover: data.thumbnail ?? undefined,
        duration: typeof data.duration === 'number' ? data.duration : undefined,
        quality: quality ?? undefined,
        links: {
          video: videoUrl,
          image: imageUrl,
        },
      };
      cache.set(cacheKey, result);
      return result;
    }

    return {
      success: false,
      links: {},
      error: 'Media not found or is private. Please check the URL.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isPrivate =
      /private|unavailable|sign in|login|restricted|blocked|404|not found|suspended|login required/i.test(message);
    return {
      success: false,
      links: {},
      error: isPrivate
        ? 'Media not found or is private. Please check the URL.'
        : 'Unable to fetch media. Please try again or use a different Instagram URL.',
    };
  }
}
