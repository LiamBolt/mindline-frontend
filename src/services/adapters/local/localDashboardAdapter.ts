import type { CheckinRecord, CounsellorSignal } from '../../types';
import type { DashboardService, ProcessSignalInput } from '../../dashboardService';

const STORAGE_KEY = 'mindline_dashboard_signals';
const SEED_FLAG = 'mindline_dashboard_seeded_v3';

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
        id: 'case-namukasa',
        anonId: 'ML-A9X2B1',
        studentName: 'Namukasa Aisha',
        contactDetail: '0782 441 903',
        faculty: 'Faculty of Medicine',
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
        id: 'case-okello',
        anonId: 'ML-K4N8C2',
        studentName: 'Okello Daniel',
        contactDetail: '0751 220 448',
        faculty: 'Faculty of Computing and Informatics',
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
        id: 'case-nakato',
        anonId: 'ML-P2Q7D5',
        faculty: 'Faculty of Science',
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
        id: 'case-auma',
        anonId: 'ML-R8T1E4',
        studentName: 'Auma Patricia',
        contactDetail: '0772 915 330',
        faculty: 'Faculty of Medicine',
        lastCheckinDate: daysAgo(2).toISOString(),
        trendDirection: 'worsening',
        consentOptedIn: true,
        status: 'reviewed',
        elevatedAreas: ['Sleep', 'Energy'],
        notes: 'Reviewed. Pattern is sustained. Prepare a quiet outreach this week.',
        lastActionAt: daysAgo(1).toISOString(),
        history: historyFor('ML-R8T1E4', daysAgo(2), ['hard', 'hard', 'hard']),
        isDemoData: true,
      },
      {
        id: 'case-mugisha',
        anonId: 'ML-B3M6F9',
        studentName: 'Mugisha Brian',
        contactDetail: '0704 118 672',
        faculty: 'Faculty of Business and Management Sciences',
        lastCheckinDate: daysAgo(3).toISOString(),
        trendDirection: 'steady',
        consentOptedIn: true,
        status: 'reviewed',
        elevatedAreas: ['Overwhelm'],
        notes: 'Holding pattern. Recheck after the next check-in before contacting.',
        lastActionAt: daysAgo(2).toISOString(),
        history: historyFor('ML-B3M6F9', daysAgo(3), ['mixed', 'mixed', 'mixed']),
        isDemoData: true,
      },
      {
        id: 'case-kiggundu',
        anonId: 'ML-Z4M8P9',
        faculty: 'Faculty of Science',
        lastCheckinDate: daysAgo(4).toISOString(),
        trendDirection: 'steady',
        consentOptedIn: false,
        status: 'reviewed',
        notes: 'Anonymous — no outreach. Keep on the watch list only.',
        lastActionAt: daysAgo(3).toISOString(),
        history: historyFor('ML-Z4M8P9', daysAgo(4), ['mixed', 'ok', 'mixed']),
        isDemoData: true,
      },
      {
        id: 'case-atim',
        anonId: 'ML-H5J2G8',
        studentName: 'Atim Sarah',
        contactDetail: '0789 003 215',
        faculty: 'Faculty of Interdisciplinary Studies',
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
        id: 'case-ssemakula',
        anonId: 'ML-J7K3L2',
        studentName: 'Ssemakula Joseph',
        contactDetail: '0758 664 091',
        faculty: 'Faculty of Computing and Informatics',
        lastCheckinDate: daysAgo(6).toISOString(),
        trendDirection: 'improving',
        consentOptedIn: true,
        status: 'contacted',
        notes: 'Reached out after three hard weeks. Latest check-in is lighter. Follow up Friday.',
        lastActionAt: daysAgo(5).toISOString(),
        history: historyFor('ML-J7K3L2', daysAgo(6), ['hard', 'mixed', 'ok']),
        isDemoData: true,
      },
      {
        id: 'case-twesigye',
        anonId: 'ML-W1C9N7',
        studentName: 'Twesigye Ivan',
        contactDetail: '0762 557 840',
        faculty: 'Faculty of Medicine',
        lastCheckinDate: daysAgo(0).toISOString(),
        trendDirection: 'worsening',
        consentOptedIn: true,
        status: 'new',
        elevatedAreas: ['Sleep', 'Focus', 'Energy'],
        notes: '',
        history: historyFor('ML-W1C9N7', daysAgo(0), ['ok', 'hard', 'hard']),
        isDemoData: true,
      },
      {
        id: 'case-nalubega',
        anonId: 'ML-D6S4V3',
        studentName: 'Nalubega Faith',
        contactDetail: '0776 219 504',
        faculty: 'Faculty of Business and Management Sciences',
        lastCheckinDate: daysAgo(10).toISOString(),
        trendDirection: 'improving',
        consentOptedIn: true,
        status: 'closed',
        notes: 'Student attended counselling. Closed after improving check-ins. Door remains open.',
        lastActionAt: daysAgo(8).toISOString(),
        history: historyFor('ML-D6S4V3', daysAgo(10), ['hard', 'mixed', 'ok']),
        isDemoData: true,
      },
      {
        id: 'case-akello',
        anonId: 'ML-Q9L0Y1',
        faculty: 'Faculty of Computing and Informatics',
        lastCheckinDate: daysAgo(12).toISOString(),
        trendDirection: 'steady',
        consentOptedIn: false,
        status: 'closed',
        notes: 'Stayed anonymous. No contact. Closed from the active queue.',
        lastActionAt: daysAgo(9).toISOString(),
        history: historyFor('ML-Q9L0Y1', daysAgo(12), ['mixed', 'mixed', 'ok']),
        isDemoData: true,
      },
      {
        id: 'case-wasswa',
        anonId: 'ML-E2U5H6',
        studentName: 'Wasswa Peter',
        contactDetail: '0701 883 226',
        faculty: 'Faculty of Science',
        lastCheckinDate: daysAgo(7).toISOString(),
        trendDirection: 'improving',
        consentOptedIn: true,
        status: 'contacted',
        notes: 'SMS sent via MUST-approved channel. Student confirmed they are managing better.',
        lastActionAt: daysAgo(6).toISOString(),
        history: historyFor('ML-E2U5H6', daysAgo(7), ['hard', 'ok', 'ok']),
        isDemoData: true,
      },
    ];

    const existing = (await this.listSignals()).filter((s) => !s.isDemoData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...cases, ...existing]));
    localStorage.setItem(SEED_FLAG, 'true');
  },
};
