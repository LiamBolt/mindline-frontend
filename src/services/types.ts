export interface CheckinRecord {
  id: string;
  anonId: string;
  timestamp: string;
  answers: Record<string, number>;
}

export interface ConsentState {
  hasBeenAsked: boolean;
  optedIn: boolean;
  contactMethod?: string;
  updatedAt: string;
}

export interface TrendResult {
  flagged: boolean;
  elevatedQuestionIds?: string[];
  direction: 'improving' | 'steady' | 'worsening' | 'insufficient-data';
}

// Discriminator for the two architecturally separate notification pathways.
// extreme_nudge: triggered by a single worst-option answer in a check-in.
// periodic_reminder: triggered by elapsed time since last check-in.
// These must never share a code path or be merged into a generic "notification".
export type NotificationType = 'extreme_nudge' | 'periodic_reminder';

export interface ScheduledNudge {
  id: string;
  anonId: string;
  type: NotificationType;
  triggerCheckinId?: string;   // set only for extreme_nudge
  triggerQuestionId?: string;  // which domain triggered it, for extreme_nudge
  scheduledFor: string;        // ISO timestamp — when it becomes due
  sentAt?: string;             // when actually surfaced to the student in-app
  respondedAt?: string;
  response?: number;           // reuses the same answer-index scale as the triggering question
}

export interface CounsellorSignal {
  id: string;
  anonId: string;
  lastCheckinDate: string;
  trendDirection: 'improving' | 'steady' | 'worsening';
  consentOptedIn: boolean;
  status: 'reviewed' | 'contacted' | 'closed' | 'new';
  history: CheckinRecord[];
  isDemoData?: boolean;
  contactDetail?: string;
  notes?: string;
  lastActionAt?: string;
  elevatedAreas?: string[];
  // Set when a flagged trend triggers a referral recommendation (Stage 3).
  referralRecommendedAt?: string;
  // Written ONLY by the student-facing recordStudentSelfReport() — never by updateSignalStatus().
  // Disagreement between this and status === 'contacted' is an expected, valid state.
  studentSelfReportReached?: 'yes' | 'no' | 'not_yet_answered';
}
