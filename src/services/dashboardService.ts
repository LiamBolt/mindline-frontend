import type { CounsellorSignal, CheckinRecord } from './types';
import { localDashboardAdapter } from './adapters/local/localDashboardAdapter';

export interface ProcessSignalInput {
  anonId: string;
  lastCheckinDate: string;
  trendDirection: 'improving' | 'steady' | 'worsening';
  consentOptedIn: boolean;
  history: CheckinRecord[];
}

export interface DashboardService {
  listSignals(): Promise<CounsellorSignal[]>;
  updateSignalStatus(id: string, status: CounsellorSignal['status']): Promise<void>;
  processSignal(input: ProcessSignalInput): Promise<void>;
  seedMockCounsellorData(): Promise<void>;
}

export const dashboardService: DashboardService = localDashboardAdapter;
