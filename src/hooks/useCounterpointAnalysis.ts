import { useEffect, useCallback, useRef } from 'react';
import { useVoiceLineStore } from '@/store/voice-line-store';
import { useCounterpointWarningsStore } from '@/store/counterpoint-warnings-store';
import { analyzeCounterpoint } from '@/services/counterpoint-analyzer';
import type { CounterpointAnalyzerConfig } from '@/types/counterpoint';

interface UseCounterpointAnalysisOptions {
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Custom analyzer config */
  config?: Partial<CounterpointAnalyzerConfig>;
  /** Whether to auto-run analysis on voice line changes */
  autoAnalyze?: boolean;
}

export function useCounterpointAnalysis(
  options: UseCounterpointAnalysisOptions = {}
) {
  const { debounceMs = 300, config = {}, autoAnalyze = true } = options;

  const voiceLines = useVoiceLineStore((state) => state.voiceLines);
  const setAnalysisResult = useCounterpointWarningsStore(
    (state) => state.setAnalysisResult
  );
  const analysisResult = useCounterpointWarningsStore(
    (state) => state.analysisResult
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runAnalysis = useCallback(() => {
    const result = analyzeCounterpoint(voiceLines, config);
    setAnalysisResult(result);
    return result;
  }, [voiceLines, config, setAnalysisResult]);

  const debouncedAnalysis = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      runAnalysis();
    }, debounceMs);
  }, [runAnalysis, debounceMs]);

  // Run analysis when voice lines change (if autoAnalyze is enabled)
  useEffect(() => {
    if (autoAnalyze) {
      debouncedAnalysis();
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [voiceLines, autoAnalyze, debouncedAnalysis]);

  return {
    /** Manually trigger analysis */
    analyze: runAnalysis,
    /** Current analysis result */
    result: analysisResult,
    /** Whether analysis is valid (no errors) */
    isValid: analysisResult?.summary.isValid ?? true,
    /** Quality score (0-100) */
    score: analysisResult?.summary.score ?? 100,
    /** Total violation count */
    violationCount: analysisResult?.violations.length ?? 0,
    /** Error count */
    errorCount: analysisResult?.summary.bySeverity.error ?? 0,
    /** Warning count */
    warningCount: analysisResult?.summary.bySeverity.warning ?? 0,
  };
}
