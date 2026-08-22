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

export interface CounsellorSignal {
  id: string; // The anonymized signal ID, distinct from user ID for privacy
  anonId: string; // Shown as e.g., ML-7F3K2Q
  lastCheckinDate: string;
  trendDirection: 'improving' | 'steady' | 'worsening';
  consentOptedIn: boolean;
  status: 'reviewed' | 'contacted' | 'closed' | 'new';
  history: CheckinRecord[]; // Recent history for sparkline
  isDemoData?: boolean; // True if seeded mock data
}
