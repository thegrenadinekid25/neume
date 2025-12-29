import { ExploreCard } from './ExploreCard';
import styles from './ExploreSection.module.css';

export const ExploreSection: React.FC = () => {
  const handleAnalyze = () => {
    // Open analyze modal - dispatch event
    window.dispatchEvent(new CustomEvent('openAnalyzeModal'));
  };

  return (
    <div className={styles.container}>
      <ExploreCard
        title="Analyze a Piece"
        description="Extract chord progressions from existing music and deconstruct them step by step"
        icon="analyze"
        onClick={handleAnalyze}
      />
    </div>
  );
};
