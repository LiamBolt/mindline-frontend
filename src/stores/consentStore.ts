import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConsentState } from '../services/types';

interface ConsentStoreState extends ConsentState {
  setConsent: (optedIn: boolean, contactMethod?: string) => void;
}

export const useConsentStore = create<ConsentStoreState>()(
  persist(
    (set) => ({
      hasBeenAsked: false,
      optedIn: false,
      contactMethod: undefined,
      updatedAt: '',
      setConsent: (optedIn, contactMethod) => 
        set({ 
          hasBeenAsked: true, 
          optedIn, 
          contactMethod, 
          updatedAt: new Date().toISOString() 
        }),
    }),
    {
      name: 'mindline_consent',
    }
  )
);
