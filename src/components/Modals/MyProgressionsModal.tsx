import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressionsStore } from '../../store/progressions-store';
import { useCanvasStore } from '../../store/canvas-store';
import { SavedProgression } from '../../services/progression-storage';
import { v4 as uuidv4 } from 'uuid';
import styles from './MyProgressionsModal.module.css';

const SaveDialog: React.FC<{
  onSave: (title: string, tags: string[], isFavorite: boolean) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave(title, tags, isFavorite);
  };

  return (
    <div className={styles.saveDialog}>
      <h3>Save Progression</h3>
      <input
        type="text"
        className={styles.input}
        placeholder="Title (e.g., My Sacred Progression)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <input
        type="text"
        className={styles.input}
        placeholder="Tags (comma-separated)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={isFavorite}
          onChange={(e) => setIsFavorite(e.target.checked)}
        />
        <span>Add to favorites</span>
      </label>
      <div className={styles.dialogButtons}>
        <button onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
        <button onClick={handleSave} className={styles.saveButton}>
          Save
        </button>
      </div>
    </div>
  );
};

export const MyProgressionsModal: React.FC = () => {
  const {
    progressions,
    isModalOpen,
    isSaveDialogOpen,
    loadProgressions,
    saveProgression,
    deleteProgression,
    toggleFavorite,
    closeModal,
    closeSaveDialog,
  } = useProgressionsStore();

  const { chords, setChords } = useCanvasStore();
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all');

  useEffect(() => {
    if (isModalOpen) {
      loadProgressions();
    }
  }, [isModalOpen, loadProgressions]);

  const handleSave = (title: string, tags: string[], isFavorite: boolean) => {
    const progression: SavedProgression = {
      id: uuidv4(),
      title,
      key: chords[0]?.key || 'C',
      mode: chords[0]?.mode || 'major',
      tempo: 120, // TODO: Get from tempo control
      chords,
      tags,
      isFavorite,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProgression(progression);
    closeSaveDialog();
    alert('Progression saved!');
  };

  const handleLoad = (progression: SavedProgression) => {
    setChords(progression.chords);
    closeModal();
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      deleteProgression(id);
    }
  };

  const filteredProgressions = filter === 'favorites'
    ? progressions.filter(p => p.isFavorite)
    : filter === 'recent'
    ? progressions.slice().sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ).slice(0, 10)
    : progressions;

  if (!isModalOpen && !isSaveDialogOpen) return null;

  if (isSaveDialogOpen) {
    return (
      <div className={styles.overlay} onClick={closeSaveDialog}>
        <motion.div
          className={styles.saveDialogContainer}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <SaveDialog
            onSave={handleSave}
            onCancel={closeSaveDialog}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={closeModal}>
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2>💾 My Progressions</h2>
            <button className={styles.closeButton} onClick={closeModal}>
              ×
            </button>
          </div>

          <div className={styles.filters}>
            <button
              className={filter === 'all' ? styles.filterActive : styles.filter}
              onClick={() => setFilter('all')}
            >
              All ({progressions.length})
            </button>
            <button
              className={filter === 'favorites' ? styles.filterActive : styles.filter}
              onClick={() => setFilter('favorites')}
            >
              ⭐ Favorites
            </button>
            <button
              className={filter === 'recent' ? styles.filterActive : styles.filter}
              onClick={() => setFilter('recent')}
            >
              Recent
            </button>
          </div>

          <div className={styles.list}>
            {filteredProgressions.length === 0 ? (
              <div className={styles.empty}>
                <p>No progressions saved yet.</p>
                <p>Create some chords and click "💾 Save" to get started!</p>
              </div>
            ) : (
              filteredProgressions.map((prog) => (
                <div key={prog.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>
                      {prog.isFavorite && '⭐ '}
                      {prog.title}
                    </h3>
                    <button
                      className={styles.favoriteButton}
                      onClick={() => toggleFavorite(prog.id)}
                    >
                      {prog.isFavorite ? '★' : '☆'}
                    </button>
                  </div>
                  <div className={styles.cardMeta}>
                    {prog.key} {prog.mode} • {prog.tempo} BPM • {prog.chords.length} chords
                  </div>
                  {prog.tags.length > 0 && (
                    <div className={styles.tags}>
                      {prog.tags.map((tag, i) => (
                        <span key={i} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={styles.cardDate}>
                    Saved: {new Date(prog.createdAt).toLocaleDateString()}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.loadButton}
                      onClick={() => handleLoad(prog)}
                    >
                      Load
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(prog.id, prog.title)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
