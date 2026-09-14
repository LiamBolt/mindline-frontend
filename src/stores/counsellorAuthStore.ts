import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COUNSELLOR_STAFF } from '../config/counsellorAccess';

interface CounsellorAuthState {
  isSignedIn: boolean;
  staffName: string;
  staffEmail: string;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
}

export const useCounsellorAuthStore = create<CounsellorAuthState>()(
  persist(
    (set) => ({
      isSignedIn: false,
      staffName: '',
      staffEmail: '',
      signIn: (email, password) => {
        const ok =
          email.trim().toLowerCase() === COUNSELLOR_STAFF.email &&
          password === COUNSELLOR_STAFF.password;
        if (ok) {
          set({
            isSignedIn: true,
            staffName: COUNSELLOR_STAFF.displayName,
            staffEmail: COUNSELLOR_STAFF.email,
          });
        }
        return ok;
      },
      signOut: () => set({ isSignedIn: false, staffName: '', staffEmail: '' }),
    }),
    { name: 'mindline_counsellor_session' }
  )
);
