import { describe, it, expect } from 'vitest';
import { debounce, throttle } from '../utils/performance';
import { detectBrowser } from '../utils/browserDetection';

describe('Utility Tests', () => {

  describe('Performance Utilities', () => {
    it('debounce delays function execution', async () => {
      let callCount = 0;
      const fn = () => callCount++;
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(callCount).toBe(0);

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(callCount).toBe(1);
    });

    it('throttle limits function calls', async () => {
      let callCount = 0;
      const fn = () => callCount++;
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(callCount).toBe(1);

      await new Promise(resolve => setTimeout(resolve, 150));

      throttled();

      expect(callCount).toBe(2);
    });
  });

  describe('Browser Detection', () => {
    it('detects browser correctly', () => {
      const browser = detectBrowser();

      expect(browser).toHaveProperty('name');
      expect(browser).toHaveProperty('isChrome');
      expect(browser).toHaveProperty('isFirefox');
      expect(browser).toHaveProperty('isSafari');
      expect(browser).toHaveProperty('isEdge');
      expect(browser).toHaveProperty('isMobile');
      expect(browser).toHaveProperty('supportsWebAudio');
    });

    it('checks Web Audio API support', () => {
      const browser = detectBrowser();

      // In jsdom environment with mocked AudioContext
      expect(browser.supportsWebAudio).toBe(true);
    });
  });
});
