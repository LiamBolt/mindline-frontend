import type { ScheduledNudge } from './types';
import { CHECKIN_QUESTIONS } from '../config/checkinQuestions';
import { localEngagementAdapter } from './adapters/local/localEngagementAdapter';

/**
 * Returns true when the given answer value is the worst available option for
 * that question (i.e. answerValue === options.length - 1).
 *
 * This is a stricter, lower bar than elevatedFromIndex, which governs the
 * multi-check-in trend.  Do not conflate the two.
 */
export function isExtremeAnswer(questionId: string, value: number): boolean {
  const q = CHECKIN_QUESTIONS.find((q) => q.id === questionId);
  return !!q && value === q.options.length - 1;
}

export interface EngagementService {
  /**
   * Schedule a follow-up nudge (type: 'extreme_nudge') after an extreme answer.
   * Called once per extreme-answer question per check-in.
   */
  scheduleNudge(input: {
    anonId: string;
    checkinId: string;
    questionId: string;
  }): Promise<void>;

  /**
   * Schedule a periodic re-engagement reminder (type: 'periodic_reminder').
   * Called after every check-in submission, using the check-in timestamp as
   * the baseline so the next reminder fires reminderCadenceDays later.
   */
  schedulePeriodicReminder(input: {
    anonId: string;
    lastCheckinTimestamp: string;
  }): Promise<void>;

  /**
   * Returns all nudges (type: 'extreme_nudge') that are due and unseen for
   * the given anonId.  "Due" = scheduledFor <= now, sentAt not yet set.
   */
  getDueNudges(anonId: string): Promise<ScheduledNudge[]>;

  /**
   * Returns all periodic reminders that are due and unseen for the given anonId.
   */
  getDueReminders(anonId: string): Promise<ScheduledNudge[]>;

  /**
   * Mark a nudge/reminder as surfaced to the student (sets sentAt).
   */
  markNudgeSent(nudgeId: string): Promise<void>;

  /**
   * Record the student's response to an extreme-nudge follow-up.
   * The response value uses the same answer-index scale as the triggering question.
   */
  recordNudgeResponse(nudgeId: string, response: number): Promise<void>;
}

// In the future this can be swapped with a remote adapter.
export const engagementService: EngagementService = localEngagementAdapter;
