/**
 * YouTube URL parsing utilities
 */

/**
 * Extract video ID from various YouTube URL formats
 * Supports:
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&t=30s
 * - https://youtube.com/embed/VIDEO_ID
 */
export function parseYoutubeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if a string is a valid YouTube URL
 */
export function isValidYoutubeUrl(url: string): boolean {
  return parseYoutubeUrl(url) !== null;
}

/**
 * Get thumbnail URL for a video ID
 */
export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
