import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckinDraftState {
  answers: Record<string, number>;
  currentStepIndex: number;
  setAnswer: (questionId: string, value: number) => void;
  setStep: (stepIndex: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  clearDraft: () => void;
}

export const useCheckinDraftStore = create<CheckinDraftState>()(
  persist(
    (set) => ({
      answers: {},
      currentStepIndex: 0,
      setAnswer: (questionId, value) => 
        set((state) => ({ answers: { ...state.answers, [questionId]: value } })),
      setStep: (stepIndex) => set({ currentStepIndex: stepIndex }),
      nextStep: () => set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),
      prevStep: () => set((state) => ({ currentStepIndex: Math.max(0, state.currentStepIndex - 1) })),
      clearDraft: () => set({ answers: {}, currentStepIndex: 0 }),
    }),
    {
      name: 'mindline_checkin_draft',
    }
  )
);
