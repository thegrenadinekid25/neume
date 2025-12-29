import { ExploreCard } from './ExploreCard';
import styles from './ExploreSection.module.css';

export const ExploreSection: React.FC = () => {
  const handleAnalyze = () => {
    // Open analyze modal - dispatch event
    window.dispatchEvent(new CustomEvent('openAnalyzeModal'));
  };

  const handleBuildFromBones = () => {
    // Build from Bones requires analyzing a piece first
    // Open the analyze modal which can lead to Build from Bones
    window.dispatchEvent(new CustomEvent('openAnalyzeModal'));
  };

  return (
    <div className={styles.container}>
      <ExploreCard
        title="Analyze a Piece"
        description="Extract chord progressions from existing music"
        icon="🎵"
        onClick={handleAnalyze}
      />
      <ExploreCard
        title="Build from Bones"
        description="Deconstruct progressions step by step"
        icon="🦴"
        onClick={handleBuildFromBones}
      />
    </div>
  );
};
