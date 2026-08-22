import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface A11yState {
  theme: 'light' | 'dark' | 'system';
  textSizeMultiplier: number; // 1, 1.12, 1.25
  highContrast: boolean;
  reduceMotion: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setTextSizeMultiplier: (val: number) => void;
  setHighContrast: (val: boolean) => void;
  setReduceMotion: (val: boolean) => void;
  reset: () => void;
}

export const useA11yStore = create<A11yState>()(
  persist(
    (set) => ({
      theme: 'system',
      textSizeMultiplier: 1,
      highContrast: false,
      reduceMotion: false,
      setTheme: (theme) => set({ theme }),
      setTextSizeMultiplier: (textSizeMultiplier) => set({ textSizeMultiplier }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      reset: () =>
        set({
          theme: 'system',
          textSizeMultiplier: 1,
          highContrast: false,
          reduceMotion: false,
        }),
    }),
    {
      name: 'mindline_a11y',
    }
  )
);
