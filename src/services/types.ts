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
  id: string;
  anonId: string;
  lastCheckinDate: string;
  trendDirection: 'improving' | 'steady' | 'worsening';
  consentOptedIn: boolean;
  status: 'reviewed' | 'contacted' | 'closed' | 'new';
  history: CheckinRecord[];
  isDemoData?: boolean;
  studentName?: string;
  contactDetail?: string;
  faculty?: string;
  notes?: string;
  lastActionAt?: string;
  elevatedAreas?: string[];
}
