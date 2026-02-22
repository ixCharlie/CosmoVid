import { execFile } from 'child_process';
import { promisify } from 'util';
import NodeCache from 'node-cache';
import { CACHE_TTL_SECONDS } from '../config';

const execFileAsync = promisify(execFile);
const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });

// Instagram stories URL: instagram.com/stories/username/ or /stories/highlights/ID
const INSTAGRAM_STORIES_REGEX =
  /(?:https?:\/\/)?(?:www\.)?instagram\.com\/stories\/([^/]+)(?:\/(\d+))?\/?/i;

export interface InstagramStoriesDownloadResult {
  success: boolean;
  title?: string;
  author?: string;
  cover?: string;
  /** Array of story items (video or image) */
  links: {
    items?: Array<{ url: string; type: 'video' | 'image'; thumbnail?: string }>;
  };
  error?: string;
}

function isValidStoriesUrl(url: string): boolean {
  return INSTAGRAM_STORIES_REGEX.test(url.trim());
}

interface YtDlpFormat {
  format_id?: string;
  url?: string;
  vcodec?: string;
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
 * Fetches Instagram stories metadata and download links using yt-dlp.
 * Note: Stories often require authentication. Public stories may work.
 */
export async function getInstagramStoriesDownloadLinks(
  url: string
): Promise<InstagramStoriesDownloadResult> {
  const trimmed = url.trim();

  if (!isValidStoriesUrl(trimmed)) {
    return {
      success: false,
      links: {},
      error: 'Invalid Instagram stories URL. Use a link like https://www.instagram.com/stories/username/',
    };
  }

  const cacheKey = `instagram-stories:${trimmed}`;
  const cached = cache.get<InstagramStoriesDownloadResult>(cacheKey);
  if (cached) return cached;

  try {
    const data = await runYtDlp(trimmed);

    // Stories are typically returned as entries (multiple items)
    const items: Array<{ url: string; type: 'video' | 'image'; thumbnail?: string }> = [];

    if (Array.isArray(data.entries) && data.entries.length > 0) {
      for (const entry of data.entries) {
        const formats = Array.isArray(entry.formats) ? entry.formats : [];
        const videoFmt = formats.find((f) => f.url && isVideoFormat(f));
        const imageFmt = formats.find((f) => f.url && !isVideoFormat(f));
        const mediaUrl = videoFmt?.url || imageFmt?.url || (entry as { url?: string }).url;
        if (mediaUrl) {
          items.push({
            url: mediaUrl,
            type: videoFmt ? 'video' : 'image',
            thumbnail: data.thumbnail,
          });
        }
      }
    } else {
      // Single story item
      const formats = Array.isArray(data?.formats) ? data.formats : [];
      const videoFmt = formats.find((f) => f.url && isVideoFormat(f));
      const imageFmt = formats.find((f) => f.url && !isVideoFormat(f));
      const mediaUrl = videoFmt?.url || imageFmt?.url;
      if (mediaUrl) {
        items.push({
          url: mediaUrl,
          type: videoFmt ? 'video' : 'image',
          thumbnail: data.thumbnail,
        });
      }
    }

    if (items.length > 0) {
      const result: InstagramStoriesDownloadResult = {
        success: true,
        title: data.title ?? undefined,
        author: data.uploader_id ?? data.uploader ?? undefined,
        cover: data.thumbnail ?? undefined,
        links: { items },
      };
      cache.set(cacheKey, result);
      return result;
    }

    return {
      success: false,
      links: {},
      error: 'Stories not found or require login. Instagram stories often need authentication—try using a public post or Reel instead.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isAuth =
      /login|sign in|private|unavailable|restricted|404|not found|authentication|cookie/i.test(message);
    return {
      success: false,
      links: {},
      error: isAuth
        ? 'Stories require login or are private. Instagram stories often need authentication. Try our Instagram post/Reel downloader for public content.'
        : 'Unable to fetch stories. Please try again or use a different URL.',
    };
  }
}
