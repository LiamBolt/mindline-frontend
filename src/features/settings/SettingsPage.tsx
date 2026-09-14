import { useState } from 'react';
import { useA11yStore } from '../../stores/a11yStore';
import { useIdentityStore } from '../../stores/identityStore';
import { dashboardService } from '../../services/dashboardService';
import type { ScheduledNudge, CounsellorSignal } from '../../services/types';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import { cn } from '../../utils/cn';

export default function SettingsPage() {
  const { theme, setTheme, highContrast, setHighContrast, reduceMotion, setReduceMotion } = useA11yStore();
  const { anonId } = useIdentityStore();
  const [fastTiming, setFastTiming] = useState(
    () => localStorage.getItem('mindline_demo_fast_timing') === 'true'
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleToggleFastTiming = (enabled: boolean) => {
    setFastTiming(enabled);
    localStorage.setItem('mindline_demo_fast_timing', enabled ? 'true' : 'false');
    showFeedback(
      enabled
        ? 'Fast Demo Timing enabled: extreme nudges schedule for 5s, reminders for 10s.'
        : 'Standard timing restored: 36h extreme nudge delay, 3.5d reminder cadence.'
    );
  };

  const handleTriggerExtremeNudge = () => {
    const id = anonId || 'ML-DEMO1';
    const pastTime = new Date(Date.now() - 1000).toISOString();
    const raw = localStorage.getItem('mindline_scheduled_nudges');
    const nudges: ScheduledNudge[] = raw ? JSON.parse(raw) : [];
    const filtered = nudges.filter(
      (n) => !(n.anonId === id && n.type === 'extreme_nudge' && !n.respondedAt)
    );
    filtered.push({
      id: crypto.randomUUID(),
      anonId: id,
      type: 'extreme_nudge',
      triggerQuestionId: 'sleep',
      triggerCheckinId: 'demo-checkin-id',
      scheduledFor: pastTime,
    });
    localStorage.setItem('mindline_scheduled_nudges', JSON.stringify(filtered));
    window.dispatchEvent(new Event('mindline_nudge_update'));
    showFeedback('Extreme-answer nudge is active! Return to Home or any student screen to see the banner.');
  };

  const handleTriggerPeriodicReminder = () => {
    const id = anonId || 'ML-DEMO1';
    const pastTime = new Date(Date.now() - 1000).toISOString();
    const raw = localStorage.getItem('mindline_scheduled_nudges');
    const nudges: ScheduledNudge[] = raw ? JSON.parse(raw) : [];
    const filtered = nudges.filter(
      (n) => !(n.anonId === id && n.type === 'periodic_reminder' && !n.respondedAt)
    );
    filtered.push({
      id: crypto.randomUUID(),
      anonId: id,
      type: 'periodic_reminder',
      scheduledFor: pastTime,
    });
    localStorage.setItem('mindline_scheduled_nudges', JSON.stringify(filtered));
    window.dispatchEvent(new Event('mindline_nudge_update'));
    showFeedback('Periodic reminder banner ("30 seconds for you today?") is active! Return to Home to see it.');
  };

  const handleTriggerSelfReport = async () => {
    const id = anonId || 'ML-DEMO1';
    const now = new Date().toISOString();
    await dashboardService.processSignal({
      anonId: id,
      lastCheckinDate: now,
      trendDirection: 'worsening',
      consentOptedIn: true,
      history: [],
      referralRecommended: true,
    });
    const raw = localStorage.getItem('mindline_dashboard_signals');
    if (raw) {
      const signals: CounsellorSignal[] = JSON.parse(raw);
      const updated = signals.map((s) =>
        s.anonId === id
          ? {
              ...s,
              referralRecommendedAt: now,
              studentSelfReportReached: 'not_yet_answered' as const,
            }
          : s
      );
      localStorage.setItem('mindline_dashboard_signals', JSON.stringify(updated));
    }
    window.dispatchEvent(new Event('mindline_nudge_update'));
    showFeedback('Post-referral self-report banner is active! Return to Home to answer "Have you been contacted by a counsellor?".');
  };

  const handleResetDemoData = async () => {
    localStorage.removeItem('mindline_dashboard_seeded_v4');
    localStorage.removeItem('mindline_dashboard_seeded_v5');
    localStorage.removeItem('mindline_dashboard_signals');
    localStorage.removeItem('mindline_scheduled_nudges');
    localStorage.removeItem('mindline_checkin_history');
    await dashboardService.seedMockCounsellorData();
    window.dispatchEvent(new Event('mindline_nudge_update'));
    showFeedback('All demo data reloaded! Counsellor dashboard seeded with Confirmed, Not reached, and Awaiting cases.');
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-xl mx-auto w-full pt-12">
      <h1 className="text-2xl font-semibold mb-8">Settings</h1>

      {/* Demo & Pitch Controls */}
      <section className="mb-8 p-5 bg-bg-secondary rounded-3xl border border-border-subtle shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium text-teal-800 dark:text-teal-100 flex items-center gap-2">
            <ScienceRoundedIcon fontSize="small" /> Demo & Testing Controls
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-mint-100 text-mint-800 dark:bg-mint-900/40 dark:text-mint-200">
            Interactive Test Suite
          </span>
        </div>
        <p className="text-xs text-fg-secondary mb-4">
          Test all engagement loop prompts and dashboard states in real time without waiting 36 hours or 3.5 days.
        </p>

        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-mint-50 dark:bg-mint-900/30 text-mint-800 dark:text-mint-200 border border-mint-200 dark:border-mint-800 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircleRoundedIcon fontSize="small" className="shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Fast Demo Timing Toggle */}
          <label className="flex items-center justify-between p-3.5 bg-bg-primary rounded-xl border border-border-subtle cursor-pointer">
            <div>
              <span className="block text-sm font-medium">Fast Demo Mode (5s delays)</span>
              <span className="text-xs text-fg-secondary">Nudges trigger 5s after check-in instead of 36h</span>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 text-mint-600 rounded bg-bg-primary border-border-subtle focus:ring-0"
              checked={fastTiming}
              onChange={(e) => handleToggleFastTiming(e.target.checked)}
            />
          </label>

          {/* Trigger Extreme Nudge */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3.5 bg-bg-primary rounded-xl border border-border-subtle">
            <div>
              <span className="block text-sm font-medium">Stage 2: Extreme-Answer Nudge</span>
              <span className="text-xs text-fg-secondary">Simulates follow-up: &ldquo;Are you still feeling that way?&rdquo;</span>
            </div>
            <button
              type="button"
              onClick={handleTriggerExtremeNudge}
              className="px-3.5 py-2 rounded-xl text-xs font-medium btn-brand text-white shadow-sm hover:opacity-90 transition-all shrink-0"
            >
              Trigger Banner Now
            </button>
          </div>

          {/* Trigger Periodic Reminder */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3.5 bg-bg-primary rounded-xl border border-border-subtle">
            <div>
              <span className="block text-sm font-medium">Stage 5: Periodic Reminder</span>
              <span className="text-xs text-fg-secondary">Simulates re-engagement: &ldquo;30 seconds for you today?&rdquo;</span>
            </div>
            <button
              type="button"
              onClick={handleTriggerPeriodicReminder}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-mint-600 text-mint-700 dark:text-mint-300 hover:bg-mint-50 dark:hover:bg-mint-900/20 transition-all shrink-0"
            >
              Trigger Banner Now
            </button>
          </div>

          {/* Trigger Student Self-Report */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3.5 bg-bg-primary rounded-xl border border-border-subtle">
            <div>
              <span className="block text-sm font-medium">Stage 3b: Post-Referral Self-Report</span>
              <span className="text-xs text-fg-secondary">Prompts: &ldquo;Have you been contacted by a counsellor?&rdquo;</span>
            </div>
            <button
              type="button"
              onClick={handleTriggerSelfReport}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-teal-600 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all shrink-0"
            >
              Trigger Prompt Now
            </button>
          </div>

          {/* Reset All Seed Data & State */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetDemoData}
              className="w-full py-2.5 px-4 rounded-xl border border-border-subtle hover:bg-bg-primary text-xs font-medium text-fg-secondary hover:text-fg-primary transition-colors flex items-center justify-center gap-1.5"
            >
              <RestartAltRoundedIcon fontSize="small" />
              Reset All Demo Data & Refresh Dashboard Signals
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4 text-teal-800 dark:text-teal-100">Appearance</h2>

        <div className="bg-bg-secondary rounded-2xl p-2 border border-border-subtle flex flex-wrap gap-2">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              "flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all focus-ring text-sm font-medium",
              theme === 'light' ? "bg-mint-100 dark:bg-teal-800 text-teal-900 dark:text-white shadow-sm" : "text-fg-secondary hover:bg-bg-primary"
            )}
          >
            <LightModeRoundedIcon fontSize="small" className="mr-2" />
            Light
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={cn(
              "flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all focus-ring text-sm font-medium",
              theme === 'dark' ? "bg-mint-100 dark:bg-teal-800 text-teal-900 dark:text-white shadow-sm" : "text-fg-secondary hover:bg-bg-primary"
            )}
          >
            <DarkModeRoundedIcon fontSize="small" className="mr-2" />
            Dark
          </button>

          <button
            onClick={() => setTheme('system')}
            className={cn(
              "flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all focus-ring text-sm font-medium",
              theme === 'system' ? "bg-mint-100 dark:bg-teal-800 text-teal-900 dark:text-white shadow-sm" : "text-fg-secondary hover:bg-bg-primary"
            )}
          >
            <SettingsBrightnessRoundedIcon fontSize="small" className="mr-2" />
            System
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4 text-teal-800 dark:text-teal-100">Accessibility</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-bg-secondary rounded-2xl border border-border-subtle cursor-pointer focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2 focus-within:ring-offset-bg-primary">
            <div>
              <span className="block font-medium">High Contrast</span>
              <span className="text-sm text-fg-secondary">Increase contrast across the app</span>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 text-mint-600 rounded bg-bg-primary border-border-subtle focus:ring-0 focus:outline-none"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-bg-secondary rounded-2xl border border-border-subtle cursor-pointer focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2 focus-within:ring-offset-bg-primary">
            <div>
              <span className="block font-medium">Reduce Motion</span>
              <span className="text-sm text-fg-secondary">Minimize animations and transitions</span>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 text-mint-600 rounded bg-bg-primary border-border-subtle focus:ring-0 focus:outline-none"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
