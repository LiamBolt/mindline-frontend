import type { CounsellorSignal, CheckinRecord } from './types';
import { localDashboardAdapter } from './adapters/local/localDashboardAdapter';

export interface ProcessSignalInput {
  anonId: string;
  lastCheckinDate: string;
  trendDirection: 'improving' | 'steady' | 'worsening';
  consentOptedIn: boolean;
  history: CheckinRecord[];
  referralRecommended?: boolean;
}

export interface DashboardService {
  listSignals(): Promise<CounsellorSignal[]>;

  /** Written ONLY by the counsellor dashboard. Never touches studentSelfReportReached. */
  updateSignalStatus(id: string, status: CounsellorSignal['status']): Promise<void>;

  updateSignal(id: string, patch: Partial<CounsellorSignal>): Promise<void>;

  processSignal(input: ProcessSignalInput): Promise<void>;

  /**
   * Written ONLY by the student-facing flow, via a separate, independent write
   * path.  Must never touch CounsellorSignal.status — that field belongs to
   * updateSignalStatus() alone.  Disagreement between the two is a valid state.
   */
  recordStudentSelfReport(
    anonId: string,
    value: 'yes' | 'no'
  ): Promise<void>;

  seedMockCounsellorData(): Promise<void>;
}

export const dashboardService: DashboardService = localDashboardAdapter;
