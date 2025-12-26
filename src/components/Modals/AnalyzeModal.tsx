import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAnalysisStore } from '@/store/analysis-store';
import { parseYoutubeUrl, isValidYoutubeUrl } from '@/utils/youtube-parser';
import { AnalysisInput } from '@/types/analysis';
import { Spinner } from '@/components/UI/Spinner';
import styles from './AnalyzeModal.module.css';

type TabType = 'youtube' | 'audio';

interface FormData {
  youtubeUrl: string;
  audioFile: FileList | null;
  startTime: string;
  endTime: string;
  keyHint: string;
  modeHint: string;
}

export const AnalyzeModal: React.FC = () => {
  const {
    isModalOpen,
    isAnalyzing,
    progress,
    error,
    closeModal,
    startAnalysis,
    cancelAnalysis,
  } = useAnalysisStore();

  const [activeTab, setActiveTab] = useState<TabType>('youtube');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      youtubeUrl: '',
      audioFile: null,
      startTime: '00:00',
      endTime: '',
      keyHint: 'auto',
      modeHint: 'auto',
    },
  });

  const youtubeUrl = watch('youtubeUrl');

  // File validation
  const validateFile = (file: File): string | null => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    if (file.size > MAX_FILE_SIZE) {
      return 'File must be under 50MB';
    }

    const validFormats = ['.mp3', '.wav', '.m4a'];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validFormats.includes(ext)) {
      return `File must be ${validFormats.join(', ')}`;
    }

    return null;
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateFile(file);
      if (!error) {
        setSelectedFile(file);
      } else {
        alert(error);
      }
    }
  };

  // File input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (!error) {
        setSelectedFile(file);
      } else {
        alert(error);
      }
    }
  };

  // Parse time string (MM:SS) to seconds
  const parseTime = (timeStr: string): number | undefined => {
    if (!timeStr) return undefined;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return undefined;
    const minutes = parseInt(parts[0]);
    const seconds = parseInt(parts[1]);
    if (isNaN(minutes) || isNaN(seconds)) return undefined;
    return minutes * 60 + seconds;
  };

  // Form submission
  const onSubmit = (data: FormData) => {
    const input: AnalysisInput = {
      type: activeTab,
      startTime: parseTime(data.startTime),
      endTime: parseTime(data.endTime),
      keyHint: data.keyHint === 'auto' ? undefined : data.keyHint,
      modeHint: data.modeHint === 'auto' ? undefined : (data.modeHint as 'major' | 'minor'),
    };

    if (activeTab === 'youtube') {
      const videoId = parseYoutubeUrl(data.youtubeUrl);
      if (!videoId) {
        alert('Invalid YouTube URL');
        return;
      }
      input.youtubeUrl = data.youtubeUrl;
      input.videoId = videoId;
    } else {
      if (!selectedFile) {
        alert('Please select an audio file');
        return;
      }
      input.audioFile = selectedFile;
    }

    startAnalysis(input);
  };

  // Handle close
  const handleClose = () => {
    if (isAnalyzing) {
      cancelAnalysis();
    }
    closeModal();
    reset();
    setSelectedFile(null);
  };

  // Check if form is valid
  const isFormValid = () => {
    if (activeTab === 'youtube') {
      return youtubeUrl && isValidYoutubeUrl(youtubeUrl);
    } else {
      return selectedFile !== null;
    }
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.backdrop} onClick={handleClose}>
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
            ×
          </button>

          {/* Title */}
          <h2 className={styles.title}>Analyze Music</h2>
          <p className={styles.subtitle}>Extract chord progressions from YouTube or audio files</p>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'youtube' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('youtube')}
            >
              YouTube URL
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'audio' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('audio')}
            >
              Audio File
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'youtube' ? (
                <motion.div
                  key="youtube"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className={styles.tabContent}
                >
                  <label className={styles.label}>YouTube URL</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="https://youtube.com/watch?v=..."
                    {...register('youtubeUrl', {
                      required: activeTab === 'youtube',
                      validate: (value) => activeTab !== 'youtube' || isValidYoutubeUrl(value) || 'Invalid YouTube URL',
                    })}
                  />
                  {errors.youtubeUrl && (
                    <span className={styles.error}>{errors.youtubeUrl.message}</span>
                  )}

                  {/* Example links */}
                  <div className={styles.examples}>
                    <p className={styles.examplesLabel}>Try these examples:</p>
                    <button
                      type="button"
                      className={styles.exampleLink}
                      onClick={() => setValue('youtubeUrl', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                    >
                      Example 1 (Rick Astley - Never Gonna Give You Up)
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="audio"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={styles.tabContent}
                >
                  <div
                    className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <div className={styles.dropZoneIcon}>🎵</div>
                    {selectedFile ? (
                      <>
                        <div className={styles.dropZoneText}>{selectedFile.name}</div>
                        <div className={styles.dropZoneSubtext}>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.dropZoneText}>
                          Drop audio file here or click to browse
                        </div>
                        <div className={styles.dropZoneSubtext}>
                          Supports MP3, WAV, M4A (max 50MB)
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept=".mp3,.wav,.m4a"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Advanced Options */}
            <div className={styles.advanced}>
              <button
                type="button"
                className={styles.advancedToggle}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '▼' : '▶'} Advanced Options
              </button>

              {showAdvanced && (
                <div className={styles.advancedOptions}>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Start Time (MM:SS)</label>
                      <input
                        type="text"
                        className={styles.inputSmall}
                        placeholder="00:00"
                        {...register('startTime')}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>End Time (MM:SS)</label>
                      <input
                        type="text"
                        className={styles.inputSmall}
                        placeholder="Auto"
                        {...register('endTime')}
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Key Hint</label>
                      <select className={styles.select} {...register('keyHint')}>
                        <option value="auto">Auto-detect</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="G">G</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Mode Hint</label>
                      <select className={styles.select} {...register('modeHint')}>
                        <option value="auto">Auto-detect</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}
            {isAnalyzing && progress && (
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <div className={styles.progressMessage}>{progress.message}</div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className={styles.errorContainer}>
                <div className={styles.errorMessage}>{error.message}</div>
              </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.buttonPrimary}
                disabled={!isFormValid() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Spinner size="sm" />
                    <span style={{ marginLeft: '8px' }}>Analyzing...</span>
                  </>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
