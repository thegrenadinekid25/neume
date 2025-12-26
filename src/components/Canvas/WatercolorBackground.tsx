import React, { useMemo } from 'react';
import { getKeyBackground } from '@/styles/colors';
import styles from './WatercolorBackground.module.css';

interface WatercolorBackgroundProps {
  currentKey: string;
  currentMode: 'major' | 'minor';
}

export const WatercolorBackground: React.FC<WatercolorBackgroundProps> = ({
  currentKey,
  currentMode,
}) => {
  const baseColor = getKeyBackground(currentKey, currentMode);

  // Generate subtle color variations (±5% luminosity)
  const colorVariants = useMemo(() => {
    return generateColorVariants(baseColor);
  }, [baseColor]);

  return (
    <div className={styles.watercolorBackground}>
      {/* Base layer with key color */}
      <div
        className={styles.baseLayer}
        style={{ backgroundColor: baseColor }}
      />

      {/* Watercolor wash layers */}
      <div
        className={styles.washLayer1}
        style={{
          background: createWashGradient(colorVariants[0], colorVariants[1])
        }}
      />
      <div
        className={styles.washLayer2}
        style={{
          background: createWashGradient(colorVariants[2], colorVariants[3])
        }}
      />

      {/* Paper grain texture */}
      <div className={styles.grainLayer} />
    </div>
  );
};

/**
 * Generate color variants with ±5% luminosity variation
 */
function generateColorVariants(baseHex: string): string[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [baseHex, baseHex, baseHex, baseHex];

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Create 4 variants with different luminosity
  const variants = [
    adjustLuminosity(hsl, -0.05), // 5% darker
    adjustLuminosity(hsl, 0.02),  // 2% lighter
    adjustLuminosity(hsl, -0.03), // 3% darker
    adjustLuminosity(hsl, 0.05),  // 5% lighter
  ];

  return variants.map(hslToHex);
}

/**
 * Create radial gradient for watercolor wash
 */
function createWashGradient(color1: string, color2: string): string {
  return `radial-gradient(
    ellipse at ${Math.random() * 100}% ${Math.random() * 100}%,
    ${color1} 0%,
    ${color2} 50%,
    transparent 100%
  )`;
}

/**
 * Adjust HSL luminosity
 */
function adjustLuminosity(
  hsl: { h: number; s: number; l: number },
  delta: number
): { h: number; s: number; l: number } {
  return {
    h: hsl.h,
    s: hsl.s,
    l: Math.max(0, Math.min(1, hsl.l + delta)),
  };
}

/**
 * Convert HSL to hex
 */
function hslToHex(hsl: { h: number; s: number; l: number }): string {
  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b));
}

// Color conversion utilities
interface RGB { r: number; g: number; b: number; }

function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}
