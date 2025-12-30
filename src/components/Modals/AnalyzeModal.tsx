import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalysisStore } from '@/store/analysis-store';
import { useBuildFromBonesStore } from '@/store/build-from-bones-store';
import { BuildFromBonesContent } from '@/components/shared/BuildFromBonesContent';
import { useAppViewStore } from '@/store/app-view-store';
import type { AnalysisInput } from '@/types/analysis';
import styles from './AnalyzeModal.module.css';

// Supported score file formats and max file sizes
const SUPPORTED_FORMATS = ['.mid', '.midi', '.musicxml', '.mxl', '.xml', '.pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for MIDI/MusicXML
const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB for PDF

export const AnalyzeModal: React.FC = () => {
  const {
    isModalOpen,
    isAnalyzing,
    progress,
    error,
    result,
    showResultsView,
    deconstructionSteps,
    isDeconstructing,
    deconstructionError,
    closeModal,
    startAnalysis,
    startDeconstruction,
    setError,
  } = useAnalysisStore();

  const {
    nextStep,
    prevStep,
    jumpToStep,
    currentStep,
  } = useBuildFromBonesStore();

  // Form state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keyHint, setKeyHint] = useState('auto');
  const [modeHint, setModeHint] = useState<'auto' | 'major' | 'minor'>('auto');

  // Results view state
  const [resultsTab, setResultsTab] = useState<'results' | 'bones'>('results');
  const [isPlayingBones, setIsPlayingBones] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setImportFile(null);
      setShowAdvanced(false);
      setKeyHint('auto');
      setModeHint('auto');
    }
  }, [isModalOpen]);

  // Get file format from filename
  const getFileFormat = (filename: string): 'midi' | 'musicxml' | 'pdf' | null => {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'mid' || ext === 'midi') return 'midi';
    if (ext === 'musicxml' || ext === 'mxl' || ext === 'xml') return 'musicxml';
    if (ext === 'pdf') return 'pdf';
    return null;
  };

  // Handle file selection from input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  // Validate file size and format
  const validateAndSetFile = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!SUPPORTED_FORMATS.includes(fileExtension)) {
      setError({
        code: 'INVALID_FORMAT',
        message: `Unsupported format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`,
        retryable: false,
      });
      return;
    }

    // Use larger limit for PDFs
    const isPdf = fileExtension === '.pdf';
    const maxSize = isPdf ? MAX_PDF_SIZE : MAX_FILE_SIZE;
    const maxSizeLabel = isPdf ? '20MB' : '10MB';

    if (file.size > maxSize) {
      setError({
        code: 'FILE_TOO_LARGE',
        message: `File is too large. Maximum size is ${maxSizeLabel}.`,
        retryable: false,
      });
      return;
    }

    setImportFile(file);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = false;
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = false;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setImportFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle analyze button click
  const handleAnalyze = async () => {
    if (!importFile) {
      setError({
        code: 'INVALID_FORMAT',
        message: 'Please select a score file',
        retryable: false,
      });
      return;
    }

    const format = getFileFormat(importFile.name);
    if (!format) {
      setError({
        code: 'INVALID_FORMAT',
        message: 'Unsupported file format',
        retryable: false,
      });
      return;
    }

    const input: AnalysisInput = {
      type: 'file',
      importFile,
      importFormat: format,
      keyHint: keyHint === 'auto' ? undefined : keyHint,
      modeHint: modeHint === 'auto' ? undefined : modeHint,
    };

    await startAnalysis(input);
  };

  // Handle "Go to Canvas" button
  const handleGoToCanvas = () => {
    useAppViewStore.getState().navigateToCanvas();
    closeModal();
  };

  // Handle "Build from Bones" button in results
  const handleStartBones = async () => {
    if (!deconstructionSteps) {
      await startDeconstruction();
    }
    setResultsTab('bones');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isAnalyzing && !isDeconstructing) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isAnalyzing, isDeconstructing, closeModal]);

  const content = (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isAnalyzing && closeModal()}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="analyze-title"
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 id="analyze-title">Analyze Chord Progression</h2>
              <button
                className={styles.closeButton}
                onClick={closeModal}
                disabled={isAnalyzing}
                aria-label="Close modal"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>


            {/* Results View Tabs */}
            {showResultsView && (
              <div className={styles.tabNav}>
                <button
                  className={`${styles.tabButton} ${resultsTab === 'results' ? styles.active : ''}`}
                  onClick={() => setResultsTab('results')}
                >
                  Results
                </button>
                <button
                  className={`${styles.tabButton} ${resultsTab === 'bones' ? styles.active : ''}`}
                  onClick={() => setResultsTab('bones')}
                >
                  Build from Bones
                </button>
              </div>
            )}

            {/* Content */}
            <div className={styles.content}>
              {/* Results View */}
              {showResultsView ? (
                <>
                  {/* Results Tab - Analysis Summary */}
                  {resultsTab === 'results' && (
                    <div className={styles.resultsSummary}>
                      <div className={styles.summarySection}>
                        <h3 className={styles.summaryTitle}>Analysis Results</h3>
                        {result && (
                          <div className={styles.resultGrid}>
                            <div className={styles.resultItem}>
                              <div className={styles.resultLabel}>Title</div>
                              <div className={styles.resultValue}>{result.title || 'Untitled'}</div>
                            </div>
                            <div className={styles.resultItem}>
                              <div className={styles.resultLabel}>Key</div>
                              <div className={styles.resultValue}>{result.key}</div>
                            </div>
                            <div className={styles.resultItem}>
                              <div className={styles.resultLabel}>Mode</div>
                              <div className={styles.resultValue}>{result.mode}</div>
                            </div>
                            <div className={styles.resultItem}>
                              <div className={styles.resultLabel}>Tempo</div>
                              <div className={styles.resultValue}>{result.tempo} BPM</div>
                            </div>
                            <div className={styles.resultItem}>
                              <div className={styles.resultLabel}>Chord Count</div>
                              <div className={styles.resultValue}>{result.chords?.length || 0}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        className={styles.startBonesButton}
                        onClick={handleStartBones}
                        disabled={isDeconstructing}
                      >
                        {isDeconstructing ? 'Deconstructing...' : 'Start Build from Bones'}
                      </button>
                    </div>
                  )}

                  {/* Build from Bones Tab */}
                  {resultsTab === 'bones' && deconstructionSteps && (
                    <div className={styles.bonesContent}>
                      {isDeconstructing ? (
                        <div className={styles.deconstructingContainer}>
                          <div className={styles.spinner} />
                          <p className={styles.deconstructingMessage}>Deconstructing progression...</p>
                        </div>
                      ) : deconstructionError ? (
                        <div className={styles.errorContainer}>
                          <p className={styles.errorMessage}>{deconstructionError.message}</p>
                        </div>
                      ) : (
                        <BuildFromBonesContent
                          steps={deconstructionSteps}
                          currentStep={currentStep}
                          isPlaying={isPlayingBones}
                          onStepClick={jumpToStep}
                          onPrevious={prevStep}
                          onPlay={() => setIsPlayingBones(!isPlayingBones)}
                          onNext={nextStep}
                        />
                      )}
                    </div>
                  )}

                  {/* Show button to start deconstruction if not already started */}
                  {resultsTab === 'bones' && !deconstructionSteps && !isDeconstructing && (
                    <div className={styles.startBonesContainer}>
                      <p className={styles.startBonesMessage}>
                        Click below to start the step-by-step deconstruction
                      </p>
                      <button
                        className={styles.startBonesButton}
                        onClick={handleStartBones}
                      >
                        Start Deconstruction
                      </button>
                    </div>
                  )}
                </>
              ) : !isAnalyzing && !progress ? (
                <>
                  {/* Score File Upload */}
                  <div
                    className={`${styles.dropZone} ${dragOverRef.current ? styles.dragOver : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Drop score file here or click to select"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <div className={styles.dropZoneIcon}>Score</div>
                    <div className={styles.dropZoneText}>Drop score file here</div>
                    <div className={styles.dropZoneSubtext}>
                      or click to select
                    </div>
                    <button
                      className={styles.filePickerButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      disabled={isAnalyzing}
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept={SUPPORTED_FORMATS.join(',')}
                      onChange={handleFileSelect}
                      disabled={isAnalyzing}
                      aria-label="Select score file"
                    />
                  </div>

                  {importFile && (
                    <div className={styles.selectedFile}>
                      <span className={styles.fileName}>
                        {importFile.name}
                      </span>
                      <button
                        className={styles.removeFile}
                        onClick={handleRemoveFile}
                        disabled={isAnalyzing}
                        aria-label="Remove file"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className={styles.helpText}>
                    Supported: MIDI (.mid), MusicXML (.musicxml, .mxl), PDF sheet music (.pdf)
                  </div>

                  {importFile?.name.toLowerCase().endsWith('.pdf') && (
                    <div className={styles.pdfWarning}>
                      PDF processing takes 30-60 seconds and works best on clean, typeset scores.
                    </div>
                  )}

                  <div className={styles.helpText}>
                    <strong>Where to find score files:</strong>
                    <br />
                    Export from Sibelius, Finale, Dorico, MuseScore
                    <br />
                    Download MIDI from musescore.com or PDF from IMSLP
                  </div>

                  {/* Advanced Options */}
                  <button
                    className={`${styles.advancedToggle} ${showAdvanced ? styles.open : ''}`}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <span className={styles.advancedToggleIcon}>{showAdvanced ? '-' : '+'}</span>
                    Advanced Options
                  </button>

                  <div className={`${styles.advancedOptions} ${showAdvanced ? styles.open : ''}`}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel} htmlFor="key-select">
                        Key Hint
                      </label>
                      <select
                        id="key-select"
                        className={styles.select}
                        value={keyHint}
                        onChange={(e) => setKeyHint(e.target.value)}
                        disabled={isAnalyzing}
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="C">C</option>
                        <option value="Db">D♭</option>
                        <option value="D">D</option>
                        <option value="Eb">E♭</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="Gb">G♭</option>
                        <option value="G">G</option>
                        <option value="Ab">A♭</option>
                        <option value="A">A</option>
                        <option value="Bb">B♭</option>
                        <option value="B">B</option>
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel} htmlFor="mode-select">
                        Mode Hint
                      </label>
                      <select
                        id="mode-select"
                        className={styles.select}
                        value={modeHint}
                        onChange={(e) => setModeHint(e.target.value as 'auto' | 'major' | 'minor')}
                        disabled={isAnalyzing}
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : null}

              {/* Error Display */}
              {error && !isAnalyzing && (
                <div className={styles.progressSection}>
                  <div className={styles.errorText}>
                    Error: {error.message}
                  </div>
                </div>
              )}

              {/* Progress Display */}
              {isAnalyzing && progress && (
                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <div className={styles.progressMessage}>
                    {progress.message}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              {showResultsView ? (
                <>
                  <button
                    className={styles.cancelButton}
                    onClick={closeModal}
                    disabled={isDeconstructing}
                  >
                    Close
                  </button>
                  <button
                    className={styles.analyzeButton}
                    onClick={handleGoToCanvas}
                    disabled={isDeconstructing}
                  >
                    Go to Canvas
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.cancelButton}
                    onClick={closeModal}
                    disabled={isAnalyzing}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.analyzeButton}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !importFile}
                  >
                    {isAnalyzing && <div className={styles.spinner} />}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
