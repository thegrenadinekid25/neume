import React from 'react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <aside className={styles.sidebar}>
      {children}
    </aside>
  );
};

// Sidebar section component for grouping controls
interface SidebarSectionProps {
  children?: React.ReactNode;
  className?: string;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({ children, className }) => {
  return (
    <section className={`${styles.section} ${className || ''}`}>
      {children}
    </section>
  );
};

// Divider between sections
export const SidebarDivider: React.FC = () => {
  return <hr className={styles.divider} />;
};

// Spacer to push content to bottom
export const SidebarSpacer: React.FC = () => {
  return <div className={styles.spacer} />;
};
