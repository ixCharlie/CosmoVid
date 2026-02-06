export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-download-tiktok-without-watermark',
    title: 'How to Download TikTok Videos Without Watermark',
    date: '2025-02-05',
    excerpt: 'Save TikTok videos in HD with or without the TikTok watermark. Step-by-step guide using CosmoVid.',
    content: [
      'TikTok videos often have a watermark in the corner. If you want to save a video for personal use without that watermark, you can use a free online downloader like CosmoVid.',
      'Open the TikTok app and find the video you want to download. Tap the Share button, then choose "Copy link".',
      'Paste the link into the CosmoVid download box on our TikTok downloader page. Click "Get Download Links" and wait a moment.',
      'You’ll see two options: one with the watermark (original) and one without. Choose the no-watermark MP4 link to download the video in HD.',
      'Use downloaded videos only for personal use. Respect copyright and TikTok’s Terms of Service. We are not affiliated with TikTok.',
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
