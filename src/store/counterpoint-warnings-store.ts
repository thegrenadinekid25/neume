import { create } from 'zustand';
import type {
  CounterpointViolation,
  CounterpointAnalysisResult,
  CounterpointSeverity,
} from '@/types/counterpoint';

interface CounterpointWarningsState {
  analysisResult: CounterpointAnalysisResult | null;
  violations: CounterpointViolation[];
  isOverlayVisible: boolean;
  hoveredViolationId: string | null;
  dismissedViolationIds: Set<string>;
  selectedViolationId: string | null;
  severityFilter: CounterpointSeverity[];
}

interface CounterpointWarningsActions {
  setAnalysisResult: (result: CounterpointAnalysisResult | null) => void;
  setOverlayVisible: (visible: boolean) => void;
  toggleOverlay: () => void;
  hoverViolation: (id: string | null) => void;
  selectViolation: (id: string | null) => void;
  dismissViolation: (id: string) => void;
  undismissViolation: (id: string) => void;
  clearDismissed: () => void;
  setSeverityFilter: (severities: CounterpointSeverity[]) => void;
  getVisibleViolations: () => CounterpointViolation[];
  getViolationsAtBeat: (beat: number) => CounterpointViolation[];
  getViolationsByNoteId: (noteId: string) => CounterpointViolation[];
}

export const useCounterpointWarningsStore = create<
  CounterpointWarningsState & CounterpointWarningsActions
>((set, get) => ({
  analysisResult: null,
  violations: [],
  isOverlayVisible: true,
  hoveredViolationId: null,
  dismissedViolationIds: new Set(),
  selectedViolationId: null,
  severityFilter: ['error', 'warning', 'info'],

  setAnalysisResult: (result) =>
    set({
      analysisResult: result,
      violations: result?.violations ?? [],
    }),

  setOverlayVisible: (visible) => set({ isOverlayVisible: visible }),

  toggleOverlay: () =>
    set((state) => ({
      isOverlayVisible: !state.isOverlayVisible,
    })),

  hoverViolation: (id) => set({ hoveredViolationId: id }),

  selectViolation: (id) => set({ selectedViolationId: id }),

  dismissViolation: (id) =>
    set((state) => {
      const newDismissed = new Set(state.dismissedViolationIds);
      newDismissed.add(id);
      return { dismissedViolationIds: newDismissed };
    }),

  undismissViolation: (id) =>
    set((state) => {
      const newDismissed = new Set(state.dismissedViolationIds);
      newDismissed.delete(id);
      return { dismissedViolationIds: newDismissed };
    }),

  clearDismissed: () => set({ dismissedViolationIds: new Set() }),

  setSeverityFilter: (severities) => set({ severityFilter: severities }),

  getVisibleViolations: () => {
    const { violations, dismissedViolationIds, severityFilter } = get();
    return violations.filter(
      (v) =>
        !dismissedViolationIds.has(v.id) && severityFilter.includes(v.severity)
    );
  },

  getViolationsAtBeat: (beat) => {
    const visibleViolations = get().getVisibleViolations();
    return visibleViolations.filter((v) => v.location.beat === beat);
  },

  getViolationsByNoteId: (noteId) => {
    const visibleViolations = get().getVisibleViolations();
    return visibleViolations.filter((v) => v.location.noteIds.includes(noteId));
  },
}));
