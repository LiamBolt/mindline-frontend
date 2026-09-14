import type { ScheduledNudge } from '../../types';
import type { EngagementService } from '../../engagementService';
import { ENGAGEMENT_CONFIG } from '../../../config/engagementConfig';

// In a real app this would be secured server-side.  For the local demo we
// simulate it with localStorage, mirroring localCheckinAdapter / localDashboardAdapter.
const STORAGE_KEY = 'mindline_scheduled_nudges';

function loadAll(): ScheduledNudge[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(nudges: ScheduledNudge[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nudges));
}

export const localEngagementAdapter: EngagementService = {
  // ── extreme_nudge ────────────────────────────────────────────────────────────

  async scheduleNudge({ anonId, checkinId, questionId }): Promise<void> {
    const nudges = loadAll();

    // Avoid duplicate extreme nudges for the same check-in + question pair.
    const alreadyScheduled = nudges.some(
      (n) =>
        n.anonId === anonId &&
        n.type === 'extreme_nudge' &&
        n.triggerCheckinId === checkinId &&
        n.triggerQuestionId === questionId &&
        !n.respondedAt
    );
    if (alreadyScheduled) return;

    const isFastDemo = localStorage.getItem('mindline_demo_fast_timing') === 'true';
    const delayMs = isFastDemo
      ? 5 * 1000 // 5 seconds in fast demo mode for live testing/pitch
      : ENGAGEMENT_CONFIG.extremeNudgeDelayHours * 60 * 60 * 1000;

    const scheduledFor = new Date(Date.now() + delayMs).toISOString();

    nudges.push({
      id: crypto.randomUUID(),
      anonId,
      type: 'extreme_nudge',
      triggerCheckinId: checkinId,
      triggerQuestionId: questionId,
      scheduledFor,
    });

    saveAll(nudges);
  },

  // ── periodic_reminder ────────────────────────────────────────────────────────
  // Architecturally distinct from extreme_nudge: different trigger, different
  // type value, different scheduling baseline, can coexist with an extreme_nudge
  // at the same time without any interference.

  async schedulePeriodicReminder({ anonId, lastCheckinTimestamp }): Promise<void> {
    const nudges = loadAll();

    // Cancel any existing unresponded periodic_reminder for this user so there
    // is never more than one outstanding at a time.
    const filtered = nudges.filter(
      (n) => !(n.anonId === anonId && n.type === 'periodic_reminder' && !n.respondedAt)
    );

    const isFastDemo = localStorage.getItem('mindline_demo_fast_timing') === 'true';
    const delayMs = isFastDemo
      ? 10 * 1000 // 10 seconds in fast demo mode
      : ENGAGEMENT_CONFIG.reminderCadenceDays * 24 * 60 * 60 * 1000;

    const scheduledFor = new Date(
      new Date(lastCheckinTimestamp).getTime() + delayMs
    ).toISOString();

    filtered.push({
      id: crypto.randomUUID(),
      anonId,
      type: 'periodic_reminder',
      scheduledFor,
    });

    saveAll(filtered);
  },

  // ── query ────────────────────────────────────────────────────────────────────

  async getDueNudges(anonId: string): Promise<ScheduledNudge[]> {
    const now = new Date().toISOString();
    return loadAll().filter(
      (n) =>
        n.anonId === anonId &&
        n.type === 'extreme_nudge' &&
        n.scheduledFor <= now &&
        !n.sentAt &&
        !n.respondedAt
    );
  },

  async getDueReminders(anonId: string): Promise<ScheduledNudge[]> {
    const now = new Date().toISOString();
    return loadAll().filter(
      (n) =>
        n.anonId === anonId &&
        n.type === 'periodic_reminder' &&
        n.scheduledFor <= now &&
        !n.sentAt &&
        !n.respondedAt
    );
  },

  // ── mutations ────────────────────────────────────────────────────────────────

  async markNudgeSent(nudgeId: string): Promise<void> {
    const nudges = loadAll().map((n) =>
      n.id === nudgeId ? { ...n, sentAt: new Date().toISOString() } : n
    );
    saveAll(nudges);
  },

  async recordNudgeResponse(nudgeId: string, response: number): Promise<void> {
    const nudges = loadAll().map((n) =>
      n.id === nudgeId
        ? { ...n, respondedAt: new Date().toISOString(), response }
        : n
    );
    saveAll(nudges);
  },
};
