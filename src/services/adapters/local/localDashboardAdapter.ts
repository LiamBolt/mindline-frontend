import type { CheckinRecord, CounsellorSignal } from '../../types';
import type { DashboardService, ProcessSignalInput } from '../../dashboardService';

const STORAGE_KEY = 'mindline_dashboard_signals';
const SEED_FLAG = 'mindline_dashboard_seeded_v4';

const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const answers = (level: 'ok' | 'mixed' | 'hard'): Record<string, number> => {
  if (level === 'ok') {
    return { sleep: 0, appetite: 0, overwhelm: 0, social: 0, focus: 0, energy: 0, selfRegard: 1 };
  }
  if (level === 'mixed') {
    return { sleep: 1, appetite: 1, overwhelm: 2, social: 1, focus: 2, energy: 1, selfRegard: 2 };
  }
  return { sleep: 2, appetite: 2, overwhelm: 3, social: 3, focus: 3, energy: 3, selfRegard: 3 };
};

const historyFor = (anonId: string, base: Date, pattern: Array<'ok' | 'mixed' | 'hard'>): CheckinRecord[] =>
  pattern.map((level, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() - (pattern.length - 1 - i) * 7);
    return {
      id: `${anonId}-${i}`,
      anonId,
      timestamp: d.toISOString(),
      answers: answers(level),
    };
  });

export const localDashboardAdapter: DashboardService = {
  async listSignals(): Promise<CounsellorSignal[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async updateSignalStatus(id, status) {
    await this.updateSignal(id, { status, lastActionAt: new Date().toISOString() });
  },

  async updateSignal(id, patch) {
    const signals = await this.listSignals();
    const updated = signals.map((sig) =>
      sig.id === id ? { ...sig, ...patch, lastActionAt: patch.lastActionAt ?? new Date().toISOString() } : sig
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  async processSignal(input: ProcessSignalInput): Promise<void> {
    const signals = await this.listSignals();
    const existingIndex = signals.findIndex((s) => s.anonId === input.anonId);

    if (existingIndex >= 0) {
      signals[existingIndex] = {
        ...signals[existingIndex],
        lastCheckinDate: input.lastCheckinDate,
        trendDirection: input.trendDirection,
        consentOptedIn: input.consentOptedIn,
        history: input.history,
        status: input.trendDirection === 'worsening' ? 'new' : signals[existingIndex].status,
      };
    } else {
      signals.push({
        id: crypto.randomUUID(),
        anonId: input.anonId,
        lastCheckinDate: input.lastCheckinDate,
        trendDirection: input.trendDirection,
        consentOptedIn: input.consentOptedIn,
        status: 'new',
        history: input.history,
        isDemoData: false,
      });
    }

    signals.sort((a, b) => new Date(b.lastCheckinDate).getTime() - new Date(a.lastCheckinDate).getTime());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
  },

  async seedMockCounsellorData(): Promise<void> {
    if (localStorage.getItem(SEED_FLAG)) return;

    const cases: CounsellorSignal[] = [
      {
        id: 'case-a9x2b1',
        anonId: 'ML-A9X2B1',
        contactDetail: '0782 441 903',
        lastCheckinDate: daysAgo(0).toISOString(),
        trendDirection: 'worsening',
        consentOptedIn: true,
        status: 'new',
        elevatedAreas: ['Sleep', 'Overwhelm', 'Energy'],
        notes: '',
        history: historyFor('ML-A9X2B1', daysAgo(0), ['mixed', 'hard', 'hard']),
        isDemoData: true,
      },
      {
        id: 'case-k4n8c2',
        anonId: 'ML-K4N8C2',
        contactDetail: '0751 220 448',
        lastCheckinDate: daysAgo(1).toISOString(),
        trendDirection: 'worsening',
        consentOptedIn: true,
        status: 'new',
        elevatedAreas: ['Focus', 'Self-regard'],
        notes: '',
        history: historyFor('ML-K4N8C2', daysAgo(1), ['ok', 'mixed', 'hard']),
        isDemoData: true,
      },
      {
        id: 'case-p2q7d5',
        anonId: 'ML-P2Q7D5',
        lastCheckinDate: daysAgo(1).toISOString(),
        trendDirection: 'worsening',
        consentOptedIn: false,
        status: 'new',
        elevatedAreas: ['Social withdrawal', 'Appetite'],
        notes: '',
        history: historyFor('ML-P2Q7D5', daysAgo(1), ['mixed', 'hard', 'hard']),
        isDemoData: true,
      },
      {
        id: 'case-r8t1e4',
        anonId: 'ML-R8T1E4',
        contactDetail: '0772 915 330',
        lastCheckinDate: daysAgo(2).toISOString(),
        trendDirection: 'worsening',
        consentOptedIn: true,
        status: 'reviewed',
        elevatedAreas: ['Sleep', 'Energy'],
        notes: 'Reviewed. Pattern is sustained. Outreach this week if they stay opted in.',
        lastActionAt: daysAgo(1).toISOString(),
        history: historyFor('ML-R8T1E4', daysAgo(2), ['hard', 'hard', 'hard']),
        isDemoData: true,
      },
      {
        id: 'case-h5j2g8',
        anonId: 'ML-H5J2G8',
        contactDetail: '0789 003 215',
        lastCheckinDate: daysAgo(5).toISOString(),
        trendDirection: 'worsening',
        consentOptedIn: true,
        status: 'contacted',
        elevatedAreas: ['Social withdrawal', 'Self-regard'],
        notes: 'Called on the unit line. Student agreed to a walk-in this week.',
        lastActionAt: daysAgo(4).toISOString(),
        history: historyFor('ML-H5J2G8', daysAgo(5), ['mixed', 'hard', 'hard']),
        isDemoData: true,
      },
      {
        id: 'case-b3m6f9',
        anonId: 'ML-B3M6F9',
        lastCheckinDate: daysAgo(3).toISOString(),
        trendDirection: 'steady',
        consentOptedIn: false,
        status: 'reviewed',
        elevatedAreas: ['Overwhelm'],
        notes: 'Holding pattern. Recheck after the next check-in. No contact — they stayed anonymous.',
        lastActionAt: daysAgo(2).toISOString(),
        history: historyFor('ML-B3M6F9', daysAgo(3), ['mixed', 'mixed', 'mixed']),
        isDemoData: true,
      },
      {
        id: 'case-n4p8k2',
        anonId: 'ML-N4P8K2',
        lastCheckinDate: daysAgo(0).toISOString(),
        trendDirection: 'improving',
        consentOptedIn: false,
        status: 'closed',
        notes: 'Check-ins have stayed light. No flag.',
        lastActionAt: daysAgo(0).toISOString(),
        history: historyFor('ML-N4P8K2', daysAgo(0), ['ok', 'ok', 'ok']),
        isDemoData: true,
      },
      {
        id: 'case-c7v1w3',
        anonId: 'ML-C7V1W3',
        lastCheckinDate: daysAgo(2).toISOString(),
        trendDirection: 'improving',
        consentOptedIn: false,
        status: 'closed',
        notes: 'Doing well over three weeks.',
        lastActionAt: daysAgo(2).toISOString(),
        history: historyFor('ML-C7V1W3', daysAgo(2), ['mixed', 'ok', 'ok']),
        isDemoData: true,
      },
      {
        id: 'case-s5d9q8',
        anonId: 'ML-S5D9Q8',
        lastCheckinDate: daysAgo(4).toISOString(),
        trendDirection: 'steady',
        consentOptedIn: false,
        status: 'closed',
        notes: 'Steady and mostly okay. No outreach needed.',
        lastActionAt: daysAgo(4).toISOString(),
        history: historyFor('ML-S5D9Q8', daysAgo(4), ['ok', 'mixed', 'ok']),
        isDemoData: true,
      },
      {
        id: 'case-g2y6t0',
        anonId: 'ML-G2Y6T0',
        lastCheckinDate: daysAgo(6).toISOString(),
        trendDirection: 'improving',
        consentOptedIn: true,
        contactDetail: '0704 118 672',
        status: 'closed',
        notes: 'Earlier concern eased. Latest weeks look okay. Closed from the queue.',
        lastActionAt: daysAgo(5).toISOString(),
        history: historyFor('ML-G2Y6T0', daysAgo(6), ['hard', 'ok', 'ok']),
        isDemoData: true,
      },
      {
        id: 'case-j7k3l2',
        anonId: 'ML-J7K3L2',
        contactDetail: '0758 664 091',
        lastCheckinDate: daysAgo(6).toISOString(),
        trendDirection: 'improving',
        consentOptedIn: true,
        status: 'contacted',
        notes: 'Reached out after three harder weeks. Latest check-in is lighter. Follow up Friday.',
        lastActionAt: daysAgo(5).toISOString(),
        history: historyFor('ML-J7K3L2', daysAgo(6), ['hard', 'mixed', 'ok']),
        isDemoData: true,
      },
      {
        id: 'case-d6s4v3',
        anonId: 'ML-D6S4V3',
        lastCheckinDate: daysAgo(10).toISOString(),
        trendDirection: 'improving',
        consentOptedIn: true,
        contactDetail: '0776 219 504',
        status: 'closed',
        notes: 'Attended a walk-in. Closed after improving check-ins. Door remains open.',
        lastActionAt: daysAgo(8).toISOString(),
        history: historyFor('ML-D6S4V3', daysAgo(10), ['hard', 'mixed', 'ok']),
        isDemoData: true,
      },
    ];

    const existing = (await this.listSignals()).filter((s) => !s.isDemoData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...cases, ...existing]));
    localStorage.setItem(SEED_FLAG, 'true');
  },
};
