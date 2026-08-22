import type { CheckinRecord } from './types';
import { localCheckinAdapter } from './adapters/local/localCheckinAdapter';

export interface CheckinService {
  submitCheckin(record: Omit<CheckinRecord, 'id' | 'timestamp'>): Promise<CheckinRecord>;
  getHistory(anonId: string): Promise<CheckinRecord[]>;
}

// In the future, this can be swapped with a remote adapter
export const checkinService: CheckinService = localCheckinAdapter;
