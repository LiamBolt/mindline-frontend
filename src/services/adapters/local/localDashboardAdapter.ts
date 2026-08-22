import type { CounsellorSignal } from '../../types';
import type { DashboardService, ProcessSignalInput } from '../../dashboardService';

const STORAGE_KEY = 'mindline_dashboard_signals';
const SEED_FLAG = 'mindline_dashboard_seeded';

// Mock generation helpers
const generateMockHistory = (anonId: string, baseDate: Date) => {
  // Generate 3 past checkins
  return [2, 1, 0].map(daysAgo => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - daysAgo * 7);
    return {
      id: crypto.randomUUID(),
      anonId,
      timestamp: d.toISOString(),
      answers: { sleep: 2, energy: 2 } // Mock answers that trigger flags
    };
  });
};

export const localDashboardAdapter: DashboardService = {
  async listSignals(): Promise<CounsellorSignal[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async updateSignalStatus(id: string, status: CounsellorSignal['status']): Promise<void> {
    const signals = await this.listSignals();
    const updated = signals.map(sig => sig.id === id ? { ...sig, status } : sig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  async processSignal(input: ProcessSignalInput): Promise<void> {
    const signals = await this.listSignals();
    // Check if signal for this anonId already exists
    const existingIndex = signals.findIndex(s => s.anonId === input.anonId);
    
    if (existingIndex >= 0) {
      // Update existing
      signals[existingIndex] = {
        ...signals[existingIndex],
        lastCheckinDate: input.lastCheckinDate,
        trendDirection: input.trendDirection,
        consentOptedIn: input.consentOptedIn,
        history: input.history,
        // Reset status to new if it worsened again, else keep it
        status: input.trendDirection === 'worsening' ? 'new' : signals[existingIndex].status
      };
    } else {
      // Create new
      signals.push({
        id: crypto.randomUUID(),
        anonId: input.anonId,
        lastCheckinDate: input.lastCheckinDate,
        trendDirection: input.trendDirection,
        consentOptedIn: input.consentOptedIn,
        status: 'new',
        history: input.history,
        isDemoData: false
      });
    }
    
    // Sort so newest is first
    signals.sort((a, b) => new Date(b.lastCheckinDate).getTime() - new Date(a.lastCheckinDate).getTime());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
  },

  async seedMockCounsellorData(): Promise<void> {
    if (localStorage.getItem(SEED_FLAG)) return;

    const mockSignals: CounsellorSignal[] = [
      {
        id: crypto.randomUUID(),
        anonId: 'ML-A9X2B1',
        lastCheckinDate: new Date().toISOString(),
        trendDirection: 'worsening',
        consentOptedIn: true,
        status: 'new',
        history: generateMockHistory('ML-A9X2B1', new Date()),
        isDemoData: true
      },
      {
        id: crypto.randomUUID(),
        anonId: 'ML-Z4M8P9',
        lastCheckinDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        trendDirection: 'steady',
        consentOptedIn: false,
        status: 'reviewed',
        history: generateMockHistory('ML-Z4M8P9', new Date(Date.now() - 86400000 * 2)),
        isDemoData: true
      },
      {
        id: crypto.randomUUID(),
        anonId: 'ML-J7K3L2',
        lastCheckinDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        trendDirection: 'improving',
        consentOptedIn: true,
        status: 'contacted',
        history: generateMockHistory('ML-J7K3L2', new Date(Date.now() - 86400000 * 5)),
        isDemoData: true
      }
    ];

    const existing = await this.listSignals();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...mockSignals, ...existing]));
    localStorage.setItem(SEED_FLAG, 'true');
  }
};
