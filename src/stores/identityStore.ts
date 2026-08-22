import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IdentityState {
  anonId: string | null;
  passphraseHash: string | null;
  initializeIdentity: () => void;
  setPassphraseHash: (hash: string) => void;
}

const generateAnonId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint32Array(6);
  window.crypto.getRandomValues(array);
  let id = 'ML-';
  for (let i = 0; i < 6; i++) {
    id += chars[array[i] % chars.length];
  }
  return id;
};

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set, get) => ({
      anonId: null,
      passphraseHash: null,
      initializeIdentity: () => {
        if (!get().anonId) {
          set({ anonId: generateAnonId() });
        }
      },
      setPassphraseHash: (hash) => set({ passphraseHash: hash }),
    }),
    {
      name: 'mindline_anon_id',
    }
  )
);
