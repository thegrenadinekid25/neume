/**
 * Parse YouTube URL to extract video ID
 * Supports multiple URL formats
 */
export function parseYoutubeUrl(url: string): string | null {
  // Support formats:
  // - https://youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/watch?v=VIDEO_ID&t=30s
  // - https://youtube.com/embed/VIDEO_ID

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Check if URL is a valid YouTube URL
 */
export function isValidYoutubeUrl(url: string): boolean {
  return parseYoutubeUrl(url) !== null;
}

/**
 * Get YouTube thumbnail URL from video ID
 */
export function getYoutubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'maxres' = 'hq'): string {
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Build YouTube watch URL from video ID
 */
export function buildYoutubeUrl(videoId: string, startTime?: number): string {
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  if (startTime) {
    return `${base}&t=${Math.floor(startTime)}s`;
  }
  return base;
}
