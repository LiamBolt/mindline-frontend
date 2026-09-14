import type { CheckinRecord } from './types';
import { localCheckinAdapter } from './adapters/local/localCheckinAdapter';

export interface CheckinService {
  /**
   * Submit a new check-in. Returns the persisted record plus a flag indicating
   * whether this submission triggered a referral recommendation (i.e. the trend
   * was flagged). Callers should show appropriate messaging when referralRecommended
   * is true — see ConfirmationScreen.tsx.
   */
  submitCheckin(
    record: Omit<CheckinRecord, 'id' | 'timestamp'>
  ): Promise<{ record: CheckinRecord; referralRecommended: boolean }>;

  getHistory(anonId: string): Promise<CheckinRecord[]>;
}

// In the future, this can be swapped with a remote adapter
export const checkinService: CheckinService = localCheckinAdapter;
