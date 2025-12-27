import React, { useRef, useEffect, useState } from 'react';
import styles from './SegmentedControl.module.css';

export interface SegmentedControlOption {
  value: string | number;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  // Calculate indicator position based on active segment
  useEffect(() => {
    if (!containerRef.current) return;

    const activeIndex = options.findIndex(opt => opt.value === value);
    if (activeIndex === -1) return;

    const segmentWidth = 100 / options.length;
    setIndicatorStyle({
      width: `${segmentWidth}%`,
      transform: `translateX(${activeIndex * 100}%)`,
    });
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      role="group"
      aria-label="Zoom level"
    >
      {/* Sliding indicator */}
      <div
        className={styles.indicator}
        style={indicatorStyle}
        aria-hidden="true"
      />

      {/* Segments */}
      {options.map((option, index) => {
        const isActive = option.value === value;
        const isLast = index === options.length - 1;

        return (
          <button
            key={option.value}
            type="button"
            className={`${styles.segment} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            aria-label={`Zoom ${option.label}`}
          >
            <span className={styles.label}>{option.label}</span>
            {/* Hairline divider (not on last segment) */}
            {!isLast && <span className={styles.divider} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
};

export type { SegmentedControlProps as SegmentedControlPropsType };
