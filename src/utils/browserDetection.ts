/**
 * Browser detection utilities for cross-browser compatibility
 */

export interface BrowserInfo {
  name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isMobile: boolean;
  supportsWebAudio: boolean;
}

/**
 * Detect current browser
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;

  const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !isChrome;
  const isEdge = /Edg/.test(userAgent);
  const isMobile = /iPhone|iPad|iPod|Android/.test(userAgent);

  // Check Web Audio API support
  const supportsWebAudio = 'AudioContext' in window || 'webkitAudioContext' in window;

  let name: BrowserInfo['name'] = 'unknown';
  if (isChrome) name = 'chrome';
  else if (isFirefox) name = 'firefox';
  else if (isSafari) name = 'safari';
  else if (isEdge) name = 'edge';

  return {
    name,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isMobile,
    supportsWebAudio,
  };
}

/**
 * Get browser-specific audio context initialization
 */
export async function initializeAudioContext(): Promise<void> {
  const browser = detectBrowser();

  // Safari requires explicit resume after user gesture
  if (browser.isSafari) {
    // Audio initialization happens via AudioInitButton
    console.log('[Browser] Safari detected - audio requires user interaction');
  }

  // Firefox may need additional setup
  if (browser.isFirefox) {
    console.log('[Browser] Firefox detected - audio timing may vary slightly');
  }

  console.log(`[Browser] Detected: ${browser.name}`);
}

/**
 * Check if browser supports required features
 */
export function checkBrowserCompatibility(): {
  compatible: boolean;
  warnings: string[];
} {
  const browser = detectBrowser();
  const warnings: string[] = [];

  if (!browser.supportsWebAudio) {
    warnings.push('Web Audio API not supported - audio playback will not work');
  }

  if (browser.isMobile) {
    warnings.push('Mobile browsers may have limited audio capabilities');
  }

  if (browser.name === 'unknown') {
    warnings.push('Unknown browser - some features may not work correctly');
  }

  const compatible = browser.supportsWebAudio && !browser.isMobile;

  return { compatible, warnings };
}

// Export singleton browser info
export const browserInfo = detectBrowser();
