import { CHECKIN_QUESTIONS } from '../config/checkinQuestions';
import type { CheckinRecord, TrendResult } from './types';

// Pure function, no side effects
export function evaluateTrend(history: CheckinRecord[]): TrendResult {
  // We need at least 3 check-ins to establish a trend
  const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const recent = sortedHistory.slice(-3);
  
  if (recent.length < 3) {
    return { flagged: false, direction: 'insufficient-data' };
  }

  // Rule: if the same question (or more) comes back "elevated" on the student's 
  // 3 most-recent consecutive check-ins, on at least 2 different questions, the signal flags.
  const elevatedCountByQuestion = CHECKIN_QUESTIONS.filter((q) =>
    recent.every((c) => {
      const val = c.answers[q.id];
      return val !== undefined && val >= q.elevatedFromIndex;
    })
  );

  const flagged = elevatedCountByQuestion.length >= 2;
  
  // Calculate general direction based on total severity
  // (Comparing the most recent 3 vs the 3 before it, or just a simple slope of the last 3)
  const sumSeverity = (record: CheckinRecord) => 
    Object.values(record.answers).reduce((sum, val) => sum + val, 0);
    
  const scores = recent.map(sumSeverity);
  
  let direction: 'improving' | 'steady' | 'worsening' = 'steady';
  if (scores[2] > scores[0] + 1) direction = 'worsening';
  else if (scores[2] < scores[0] - 1) direction = 'improving';

  return {
    flagged,
    elevatedQuestionIds: flagged ? elevatedCountByQuestion.map((q) => q.id) : undefined,
    direction,
  };
}
