import React from 'react';

export type IconName = 'play' | 'pause' | 'stop' | 'analyze' | 'folder' | 'sparkle' | 'magnify';

export interface MusicalIconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg'; // 16, 20, 24px
  color?: string;
  className?: string;
  ariaLabel?: string;
}

const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

/**
 * Bauhaus-style geometric SVG icons
 * Simple shapes, 2px stroke weight, outline-only (no fills)
 */
export const MusicalIcon: React.FC<MusicalIconProps> = ({
  name,
  size = 'md',
  color = 'currentColor',
  className = '',
  ariaLabel,
}) => {
  const pixelSize = ICON_SIZES[size];

  const svgProps = {
    width: pixelSize,
    height: pixelSize,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    role: ariaLabel ? 'img' : 'presentation',
    'aria-label': ariaLabel,
    'aria-hidden': !ariaLabel,
  };

  const renderIcon = () => {
    switch (name) {
      case 'play':
        // Triangle pointing right
        return (
          <svg {...svgProps}>
            <polygon points="6,4 20,12 6,20" fill="none" />
          </svg>
        );

      case 'pause':
        // Two vertical bars
        return (
          <svg {...svgProps}>
            <line x1="7" y1="5" x2="7" y2="19" />
            <line x1="17" y1="5" x2="17" y2="19" />
          </svg>
        );

      case 'stop':
        // Square
        return (
          <svg {...svgProps}>
            <rect x="5" y="5" width="14" height="14" rx="1" fill="none" />
          </svg>
        );

      case 'analyze':
      case 'magnify':
        // Magnifying glass (circle + diagonal line)
        return (
          <svg {...svgProps}>
            <circle cx="10" cy="10" r="6" fill="none" />
            <line x1="14.5" y1="14.5" x2="20" y2="20" />
          </svg>
        );

      case 'folder':
        // Simple folder shape with front flap
        return (
          <svg {...svgProps}>
            <path
              d="M3 6 L3 18 L21 18 L21 8 L12 8 L10 6 L3 6"
              fill="none"
            />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );

      case 'sparkle':
        // 4-pointed star
        return (
          <svg {...svgProps}>
            <path
              d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12 M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
              fill="none"
            />
          </svg>
        );

      default:
        // Fallback: empty circle
        return (
          <svg {...svgProps}>
            <circle cx="12" cy="12" r="8" fill="none" />
          </svg>
        );
    }
  };

  return renderIcon();
};

export type { MusicalIconProps as MusicalIconPropsType };
