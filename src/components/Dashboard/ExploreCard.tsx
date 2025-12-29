import styles from './ExploreCard.module.css';

interface ExploreCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

export const ExploreCard: React.FC<ExploreCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <button className={styles.card} onClick={onClick}>
      <span className={styles.icon}>{icon}</span>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </button>
  );
};
