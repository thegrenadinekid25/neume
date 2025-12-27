/**
 * ReverbLoader - Loads and caches impulse response audio files
 * Falls back gracefully if IR files are not available
 */
export class ReverbLoader {
  private cache: Map<string, AudioBuffer> = new Map();

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

    try {
      console.log(`Loading impulse response from ${url}...`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Cache for future use
      this.cache.set(url, audioBuffer);
      console.log(`Impulse response loaded (${audioBuffer.duration.toFixed(2)}s)`);

      return audioBuffer;
    } catch (error) {
      console.warn('Failed to load impulse response:', error);
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
