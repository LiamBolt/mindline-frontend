import type { CheckinRecord } from '../../types';
import type { CheckinService } from '../../checkinService';
import { evaluateTrend } from '../../trendService';
import { dashboardService } from '../../dashboardService';
import { engagementService, isExtremeAnswer } from '../../engagementService';

const STORAGE_KEY = 'mindline_checkin_history';

export const localCheckinAdapter: CheckinService = {
  async submitCheckin(
    record: Omit<CheckinRecord, 'id' | 'timestamp'>
  ): Promise<{ record: CheckinRecord; referralRecommended: boolean }> {
    // Generate an ID and timestamp
    const fullRecord: CheckinRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    // Get existing history
    const history = await this.getHistory(record.anonId);

    // Add new record
    const updatedHistory = [...history, fullRecord];

    // Save to local storage
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    allData[record.anonId] = updatedHistory;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));

    // After saving, evaluate trend to potentially trigger a counsellor signal.
    // In a real app, this would happen securely on the backend.
    const trend = evaluateTrend(updatedHistory);
    let referralRecommended = false;

    if (trend.flagged) {
      referralRecommended = true;
      // In a real app, the backend would generate the signal.
      // For local demo, we simulate it via dashboardService.
      // We must get the consent status from local storage manually here,
      // as the backend would typically know it.
      const consentStr = localStorage.getItem('mindline_consent');
      let optedIn = false;
      if (consentStr) {
        try {
          const parsed = JSON.parse(consentStr);
          optedIn = parsed.state?.optedIn === true;
        } catch (e) {}
      }

      await dashboardService.processSignal({
        anonId: record.anonId,
        lastCheckinDate: fullRecord.timestamp,
        trendDirection: trend.direction === 'insufficient-data' ? 'steady' : trend.direction,
        consentOptedIn: optedIn,
        history: updatedHistory,
        referralRecommended: true,
      });
    }

    // Stage 2: Schedule an extreme_nudge for each answer that hit the worst option.
    // Each nudge is independent — one per question that triggered it.
    for (const [questionId, value] of Object.entries(record.answers)) {
      if (isExtremeAnswer(questionId, value)) {
        await engagementService.scheduleNudge({
          anonId: record.anonId,
          checkinId: fullRecord.id,
          questionId,
        });
      }
    }

    // Stage 5: Schedule/replace the periodic_reminder using this check-in's
    // timestamp as the new baseline.  Architecturally independent of the
    // extreme_nudge path above — different type, different scheduling trigger.
    await engagementService.schedulePeriodicReminder({
      anonId: record.anonId,
      lastCheckinTimestamp: fullRecord.timestamp,
    });

    // Delay slightly to simulate network request
    await new Promise((resolve) => setTimeout(resolve, 300));

    return { record: fullRecord, referralRecommended };
  },

  async getHistory(anonId: string): Promise<CheckinRecord[]> {
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return allData[anonId] || [];
  },
};
