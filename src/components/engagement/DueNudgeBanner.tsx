import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdentityStore } from '../../stores/identityStore';
import { useConsentStore } from '../../stores/consentStore';
import { engagementService } from '../../services/engagementService';
import { dashboardService } from '../../services/dashboardService';
import { checkinService } from '../../services/checkinService';
import { CHECKIN_QUESTIONS } from '../../config/checkinQuestions';
import type { ScheduledNudge, CounsellorSignal } from '../../services/types';
import { cn } from '../../utils/cn';

import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';

type BannerState =
  | { kind: 'idle' }
  | { kind: 'extreme_nudge'; nudge: ScheduledNudge }
  | { kind: 'periodic_reminder'; nudge: ScheduledNudge }
  | { kind: 'self_report'; signal: CounsellorSignal }
  | { kind: 'dismissed' };

/**
 * DueNudgeBanner — surfaces three distinct in-app prompts on app open:
 *
 * 1. extreme_nudge   — "Are you still feeling that way?" follow-up after an
 *                      extreme check-in answer (Stage 2).
 * 2. periodic_reminder — "30 seconds for you today?" re-engagement nudge (Stage 5).
 * 3. self_report      — "Did you reach out?" post-referral question (Stage 3b).
 *
 * Only one prompt is shown at a time (priority: extreme_nudge > self_report >
 * periodic_reminder).  All three pathways are kept architecturally distinct —
 * they use separate service methods and never share a code path.
 */
export default function DueNudgeBanner() {
  const { anonId } = useIdentityStore();
  const { optedIn } = useConsentStore();
  const [state, setState] = useState<BannerState>({ kind: 'idle' });
  const [responded, setResponded] = useState(false);

  const load = useCallback(async () => {
    if (!anonId) return;

    // Priority 1 — extreme_nudge (Stage 2)
    const dueNudges = await engagementService.getDueNudges(anonId);
    if (dueNudges.length > 0) {
      const nudge = dueNudges[0];
      await engagementService.markNudgeSent(nudge.id);
      setState({ kind: 'extreme_nudge', nudge });
      return;
    }

    // Priority 2 — post-referral self-report (Stage 3b)
    // Check if the student has a referralRecommendedAt set but hasn't answered yet.
    const signals = await dashboardService.listSignals();
    const pending = signals.find(
      (s) =>
        s.anonId === anonId &&
        s.referralRecommendedAt &&
        (!s.studentSelfReportReached || s.studentSelfReportReached === 'not_yet_answered')
    );
    if (pending) {
      setState({ kind: 'self_report', signal: pending });
      return;
    }

    // Priority 3 — periodic_reminder (Stage 5)
    const dueReminders = await engagementService.getDueReminders(anonId);
    if (dueReminders.length > 0) {
      const nudge = dueReminders[0];
      await engagementService.markNudgeSent(nudge.id);
      setState({ kind: 'periodic_reminder', nudge });
      return;
    }
  }, [anonId]);

  useEffect(() => {
    void load();
    const handleUpdate = () => void load();
    window.addEventListener('mindline_nudge_update', handleUpdate);
    const interval = setInterval(() => {
      if (localStorage.getItem('mindline_demo_fast_timing') === 'true') {
        void load();
      }
    }, 2000);
    return () => {
      window.removeEventListener('mindline_nudge_update', handleUpdate);
      clearInterval(interval);
    };
  }, [load]);

  const handleDismiss = () => setState({ kind: 'dismissed' });

  // ── extreme_nudge response handler ─────────────────────────────────────────
  const handleNudgeResponse = async (nudge: ScheduledNudge, value: number) => {
    if (responded || !anonId) return;
    setResponded(true);
    await engagementService.recordNudgeResponse(nudge.id, value);

    // Feed the response back through the normal check-in pipeline so
    // evaluateTrend treats it identically to a scheduled check-in answer.
    if (nudge.triggerQuestionId) {
      await checkinService.submitCheckin({
        anonId,
        answers: { [nudge.triggerQuestionId]: value },
      });
    }
    setState({ kind: 'dismissed' });
  };

  // ── self-report response handler ────────────────────────────────────────────
  const handleSelfReport = async (value: 'yes' | 'no') => {
    if (!anonId) return;
    // recordStudentSelfReport is a completely separate write path from
    // updateSignalStatus — it only touches studentSelfReportReached.
    await dashboardService.recordStudentSelfReport(anonId, value);
    setState({ kind: 'dismissed' });
  };

  if (state.kind === 'idle' || state.kind === 'dismissed') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="due-nudge-banner"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 mt-3 mb-1 rounded-2xl border border-border-subtle bg-bg-secondary shadow-sm overflow-hidden"
        role="region"
        aria-label="Check-in follow-up"
      >
        {state.kind === 'extreme_nudge' && (
          <ExtremeNudgeContent
            nudge={state.nudge}
            responded={responded}
            onResponse={handleNudgeResponse}
            onDismiss={handleDismiss}
          />
        )}
        {state.kind === 'periodic_reminder' && (
          <PeriodicReminderContent onDismiss={handleDismiss} />
        )}
        {state.kind === 'self_report' && (
          <SelfReportContent
            optedIn={optedIn}
            onResponse={handleSelfReport}
            onDismiss={handleDismiss}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ExtremeNudgeContent({
  nudge,
  responded,
  onResponse,
  onDismiss,
}: {
  nudge: ScheduledNudge;
  responded: boolean;
  onResponse: (nudge: ScheduledNudge, value: number) => void;
  onDismiss: () => void;
}) {
  const question = CHECKIN_QUESTIONS.find((q) => q.id === nudge.triggerQuestionId);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-mint-700 dark:text-mint-300">
          <AutorenewRoundedIcon fontSize="small" />
          <span className="text-sm font-semibold">Quick follow-up</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-fg-secondary hover:text-fg-primary p-1 rounded-full focus-ring"
          aria-label="Dismiss"
        >
          <CancelOutlinedIcon fontSize="small" />
        </button>
      </div>

      <p className="text-sm text-fg-secondary mb-3">
        Hi, just checking in.{' '}
        {question ? (
          <>
            <span className="text-fg-primary font-medium">{question.prompt}</span>
          </>
        ) : (
          'Are you still feeling that way?'
        )}
      </p>

      {question && (
        <div className="space-y-1.5">
          {(question.options as readonly string[]).map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onResponse(nudge, idx)}
              disabled={responded}
              className={cn(
                'w-full text-left px-4 py-2.5 rounded-xl border border-border-subtle text-sm font-medium transition-colors focus-ring',
                responded
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-ice-100 dark:hover:bg-teal-800/40'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PeriodicReminderContent({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-mint-100 dark:bg-mint-900/40 text-mint-700 dark:text-mint-300 flex items-center justify-center shrink-0">
          <AccessTimeRoundedIcon fontSize="small" />
        </div>
        <p className="text-sm text-fg-secondary">
          <span className="font-semibold text-fg-primary">30 seconds for you today?</span>{' '}
          A quick check-in helps us spot how you're doing over time.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/check-in"
          onClick={onDismiss}
          className="px-4 py-2 rounded-xl text-sm font-medium btn-brand focus-ring"
        >
          Check in
        </Link>
        <button
          onClick={onDismiss}
          className="p-1.5 text-fg-secondary hover:text-fg-primary rounded-full focus-ring"
          aria-label="Dismiss reminder"
        >
          <CancelOutlinedIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}

function SelfReportContent({
  optedIn,
  onResponse,
  onDismiss,
}: {
  optedIn: boolean;
  onResponse: (value: 'yes' | 'no') => void;
  onDismiss: () => void;
}) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
          <PhoneRoundedIcon fontSize="small" />
          <span className="text-sm font-semibold">A quick question</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-fg-secondary hover:text-fg-primary p-1 rounded-full focus-ring"
          aria-label="Dismiss"
        >
          <CancelOutlinedIcon fontSize="small" />
        </button>
      </div>

      <p className="text-sm text-fg-secondary mb-3">
        {optedIn
          ? 'Have you been contacted by a counsellor, or reached out to support yourself?'
          : 'Have you been able to reach out to any support resources since your last check-in?'}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onResponse('yes')}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-subtle text-sm font-medium hover:bg-mint-50 dark:hover:bg-mint-900/20 text-mint-700 dark:text-mint-300 transition-colors focus-ring"
        >
          <CheckCircleOutlineRoundedIcon fontSize="small" />
          Yes
        </button>
        <button
          onClick={() => onResponse('no')}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-subtle text-sm font-medium hover:bg-ice-100 dark:hover:bg-teal-800/40 transition-colors focus-ring"
        >
          <CancelOutlinedIcon fontSize="small" />
          Not yet
        </button>
      </div>
    </div>
  );
}
