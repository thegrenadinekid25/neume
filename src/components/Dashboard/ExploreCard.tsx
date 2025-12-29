import styles from './ExploreCard.module.css';

interface ExploreCardProps {
  title: string;
  description: string;
  icon: 'analyze' | 'create' | 'learn';
  onClick: () => void;
}

const AnalyzeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Waveform bars */}
    <rect x="4" y="14" width="3" height="4" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="9" y="10" width="3" height="12" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="14" y="6" width="3" height="20" rx="1" fill="currentColor" />
    <rect x="19" y="10" width="3" height="12" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="24" y="14" width="3" height="4" rx="1" fill="currentColor" opacity="0.6" />
    {/* Magnifying glass overlay */}
    <circle cx="22" cy="22" r="5" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.9" />
    <path d="M26 26L29 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
  </svg>
);

const IconMap: Record<string, React.FC> = {
  analyze: AnalyzeIcon,
};

export const ExploreCard: React.FC<ExploreCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  const IconComponent = IconMap[icon];

  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.iconWrapper}>
        {IconComponent ? <IconComponent /> : <span className={styles.iconFallback}>{icon}</span>}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      <span className={styles.arrow}>→</span>
    </button>
  );
};
