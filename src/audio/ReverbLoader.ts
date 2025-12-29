/**
 * ReverbLoader - Loads and caches impulse response audio files
 * Falls back gracefully if IR files are not available
 */
export class ReverbLoader {
  private cache: Map<string, AudioBuffer> = new Map();
  private failedUrls: Set<string> = new Set();
  private hasLoggedForUrl: Set<string> = new Set();

  /**
   * Load impulse response from URL
   * Returns null if loading fails (fallback to algorithmic reverb)
   */
  async loadImpulseResponse(
    url: string,
    audioContext: AudioContext
  ): Promise<AudioBuffer | null> {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Check if we've already failed to load this URL
    if (this.failedUrls.has(url)) {
      return null;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Cache for future use
      this.cache.set(url, audioBuffer);

      // Only log success once per URL
      if (!this.hasLoggedForUrl.has(url)) {
        console.log(`[Audio] Impulse response loaded (${audioBuffer.duration.toFixed(2)}s)`);
        this.hasLoggedForUrl.add(url);
      }

      return audioBuffer;
    } catch (error) {
      // Cache the failure to prevent repeated attempts
      this.failedUrls.add(url);

      // Only log failure once per URL
      if (!this.hasLoggedForUrl.has(url)) {
        console.warn('[Audio] Impulse response unavailable, using algorithmic reverb');
        this.hasLoggedForUrl.add(url);
      }
      return null;
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const reverbLoader = new ReverbLoader();
