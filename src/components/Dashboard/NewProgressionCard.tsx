import styles from './NewProgressionCard.module.css';

interface NewProgressionCardProps {
  onClick: () => void;
}

export const NewProgressionCard: React.FC<NewProgressionCardProps> = ({ onClick }) => {
  return (
    <button className={styles.card} onClick={onClick}>
      <span className={styles.icon}>+</span>
      <span className={styles.label}>New Progression</span>
    </button>
  );
};
