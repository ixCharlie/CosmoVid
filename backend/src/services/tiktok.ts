import { execFile } from 'child_process';
import { promisify } from 'util';
import NodeCache from 'node-cache';
import { CACHE_TTL_SECONDS } from '../config';

const execFileAsync = promisify(execFile);
const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });

const TIKTOK_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?(?:tiktok\.com\/)(?:@[\w.-]+\/video\/|[\w.-]+)(\d+)/i;

export interface DownloadResult {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  duration?: number; // seconds
  quality?: string; // e.g. "720p", "1080p"
  links: {
    mp4HdWatermark?: string;
    mp4HdNoWatermark?: string;
    mp3?: string;
  };
  error?: string;
}

function extractVideoId(url: string): string | null {
  const match = url.match(TIKTOK_URL_REGEX);
  return match ? match[1] : null;
}

/** yt-dlp JSON dump shape (subset we use) */
interface YtDlpFormat {
  format_id?: string;
  url?: string;
  ext?: string;
  vcodec?: string;
  acodec?: string;
  format_note?: string;
  height?: number;
}

interface YtDlpJson {
  id?: string;
  title?: string;
  uploader?: string;
  thumbnail?: string;
  url?: string;
  duration?: number;
  formats?: YtDlpFormat[];
}

function isVideoFormat(f: YtDlpFormat): boolean {
  const v = (f.vcodec || '').toLowerCase();
  return v !== 'none' && v !== '';
}

function isAudioOnlyFormat(f: YtDlpFormat): boolean {
  const v = (f.vcodec || '').toLowerCase();
  const a = (f.acodec || '').toLowerCase();
  return (v === 'none' || v === '') && a !== 'none' && a !== '';
}

function isNoWatermark(f: YtDlpFormat): boolean {
  const note = (f.format_note || f.format_id || '').toLowerCase();
  return note.includes('no watermark') || note.includes('without watermark');
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
 * Fetches TikTok video metadata and download links using yt-dlp only.
 * Requires yt-dlp installed and up to date (pip install yt-dlp / yt-dlp -U).
 */
export async function getTikTokDownloadLinks(url: string): Promise<DownloadResult> {
  const trimmed = url.trim();
  const videoId = extractVideoId(trimmed);

  if (!videoId) {
    return {
      success: false,
      links: {},
      error: 'Invalid TikTok URL. Use a link like https://www.tiktok.com/@user/video/123456789',
    };
  }

  const cacheKey = `tiktok:${videoId}`;
  const cached = cache.get<DownloadResult>(cacheKey);
  if (cached) return cached;

  try {
    const data = await runYtDlp(trimmed);
    const formats = Array.isArray(data?.formats) ? data.formats : [];
    const videoFormats = formats.filter((f) => f.url && isVideoFormat(f));
    const audioFormats = formats.filter((f) => f.url && isAudioOnlyFormat(f));

    const withWatermark = videoFormats.find((f) => !isNoWatermark(f)) ?? videoFormats[0];
    const noWatermark = videoFormats.find(isNoWatermark) ?? videoFormats.find((f) => !isNoWatermark(f)) ?? videoFormats[0];
    const audio = audioFormats[0];

    const videoUrlWatermark = withWatermark?.url;
    const videoUrlNoWatermark = noWatermark?.url ?? videoUrlWatermark;
    const audioUrl = audio?.url;

    if (videoUrlWatermark || videoUrlNoWatermark) {
      const chosenFormat = noWatermark ?? withWatermark;
      const quality = chosenFormat?.height
        ? `${chosenFormat.height}p`
        : (chosenFormat?.format_note && !/watermark/i.test(chosenFormat.format_note))
          ? chosenFormat.format_note
          : undefined;
      const result: DownloadResult = {
        success: true,
        title: data.title ?? undefined,
        author: data.uploader ?? undefined,
        cover: data.thumbnail ?? undefined,
        duration: typeof data.duration === 'number' ? data.duration : undefined,
        quality: quality ?? undefined,
        links: {
          mp4HdWatermark: videoUrlWatermark,
          mp4HdNoWatermark: videoUrlNoWatermark,
          mp3: audioUrl,
        },
      };
      cache.set(cacheKey, result);
      return result;
    }

    return {
      success: false,
      links: {},
      error: 'Video not found or is private. Please check the URL.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isPrivate =
      /private|unavailable|sign in|login|restricted|blocked|404|not found/i.test(message) ||
      message.includes('Private');
    const isExtract =
      /unable to extract|extract webpage/i.test(message);
    return {
      success: false,
      links: {},
      error: isPrivate
        ? 'Video not found or is private. Please check the URL.'
        : isExtract
          ? 'yt-dlp could not extract this video. Update yt-dlp (yt-dlp -U) and try again.'
          : 'Unable to fetch video. Please try again or use a different TikTok URL.',
    };
  }
}
