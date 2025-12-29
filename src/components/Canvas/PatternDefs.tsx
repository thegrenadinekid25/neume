import { useAccessibilityStore } from '@/store/accessibility-store';

export function PatternDefs() {
  const colorblindMode = useAccessibilityStore((state) => state.colorblindMode);

  if (!colorblindMode) {
    return null;
  }

  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', visibility: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Horizontal lines pattern */}
        <pattern
          id="pattern-horizontal"
          x="0"
          y="0"
          width="8"
          height="4"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="2"
            x2="8"
            y2="2"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            opacity="0.35"
          />
        </pattern>

        {/* Vertical lines pattern */}
        <pattern
          id="pattern-vertical"
          x="0"
          y="0"
          width="4"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="2"
            y1="0"
            x2="2"
            y2="8"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            opacity="0.35"
          />
        </pattern>

        {/* Diagonal up (/) pattern */}
        <pattern
          id="pattern-diagonalUp"
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="8"
            x2="8"
            y2="0"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            opacity="0.35"
          />
        </pattern>

        {/* Diagonal down (\) pattern */}
        <pattern
          id="pattern-diagonalDown"
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="8"
            y2="8"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            opacity="0.35"
          />
        </pattern>

        {/* Dots pattern */}
        <pattern
          id="pattern-dots"
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="4"
            cy="4"
            r="1.5"
            fill="#1a1a1a"
            opacity="0.35"
          />
        </pattern>

        {/* Crosshatch pattern */}
        <pattern
          id="pattern-crosshatch"
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="8"
            x2="8"
            y2="0"
            stroke="#1a1a1a"
            strokeWidth="1"
            opacity="0.35"
          />
          <line
            x1="0"
            y1="0"
            x2="8"
            y2="8"
            stroke="#1a1a1a"
            strokeWidth="1"
            opacity="0.35"
          />
        </pattern>
      </defs>
    </svg>
  );
}
