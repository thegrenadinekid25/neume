import React, { useMemo } from 'react';
import styles from './OrganicButton.module.css';

export interface OrganicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  shape?: 'circle' | 'pill' | 'rectangle';
  size?: 'sm' | 'md' | 'lg';
  color?: string; // CSS variable name like '--color-major-V'
  icon?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Generates a deterministic wobble rotation based on content hash.
 * Each button gets a unique subtle rotation (±1.5deg) based on its content.
 */
function getWobbleRotation(content: string): number {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Map hash to range [-1.5, 1.5]
  const normalized = (Math.abs(hash) % 1000) / 1000; // 0 to 1
  return (normalized - 0.5) * 3; // -1.5 to 1.5
}

export const OrganicButton: React.FC<OrganicButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  shape = 'rectangle',
  size = 'md',
  color,
  icon,
  className = '',
  ariaLabel,
  type = 'button',
}) => {
  // Generate wobble rotation based on children content
  const wobbleRotation = useMemo(() => {
    const contentString = typeof children === 'string'
      ? children
      : React.Children.toArray(children).join('');
    return getWobbleRotation(contentString);
  }, [children]);

  const buttonClasses = [
    styles.organicButton,
    styles[variant],
    styles[shape],
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  const buttonStyle: React.CSSProperties = {
    '--wobble-rotation-value': `${wobbleRotation}deg`,
    ...(color && { '--button-accent-color': `var(${color})` }),
  } as React.CSSProperties;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span className={styles.content}>{children}</span>}
    </button>
  );
};

export type { OrganicButtonProps as OrganicButtonPropsType };
