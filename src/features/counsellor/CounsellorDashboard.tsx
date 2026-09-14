import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import type { CounsellorSignal } from '../../services/types';
import { useCounsellorAuthStore } from '../../stores/counsellorAuthStore';
import { COUNSELLOR_STAFF } from '../../config/counsellorAccess';
import { INSTITUTION } from '../../config/institutionConfig';
import { cn } from '../../utils/cn';
import BrandLogo from '../../components/layout/BrandLogo';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

import CustomSelect from '../../components/common/CustomSelect';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

type View = 'queue' | 'outreach' | 'well' | 'all' | 'closed' | 'protocol';
type ReachFilter = 'all' | 'confirmed' | 'not_reached' | 'awaiting';

const NAV: { id: View; label: string; icon: typeof InboxRoundedIcon }[] = [
  { id: 'queue', label: 'Needs attention', icon: AssignmentRoundedIcon },
  { id: 'outreach', label: 'Ready to contact (Active outreach)', icon: PhoneInTalkRoundedIcon },
  { id: 'well', label: 'Doing well', icon: SentimentSatisfiedAltRoundedIcon },
  { id: 'all', label: 'All check-ins', icon: InboxRoundedIcon },
  { id: 'closed', label: 'Closed', icon: TaskAltRoundedIcon },
  { id: 'protocol', label: 'How to respond', icon: MenuBookRoundedIcon },
];

const isDoingWell = (s: CounsellorSignal) =>
  s.trendDirection === 'improving' || (s.trendDirection === 'steady' && !s.elevatedAreas?.length);

export default function CounsellorDashboard() {
  const { isSignedIn, staffName, staffEmail, signIn, signOut } = useCounsellorAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signals, setSignals] = useState<CounsellorSignal[]>([]);
  const [view, setView] = useState<View>('queue');
  const [reachFilter, setReachFilter] = useState<ReachFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailMode, setDetailMode] = useState<'normal' | 'collapsed' | 'expanded'>('normal');

  useEffect(() => {
    if (!isSignedIn) return;
    void loadData();
  }, [isSignedIn]);

  const loadData = async () => {
    await dashboardService.seedMockCounsellorData();
    const data = await dashboardService.listSignals();
    setSignals(data);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const ok = signIn(email, password);
    if (!ok) setError('Those staff credentials were not recognised.');
    else setError('');
  };

  const visible = useMemo(() => {
    let base: CounsellorSignal[];
    if (view === 'queue') base = signals.filter((s) => s.status === 'new' && s.trendDirection === 'worsening');
    else if (view === 'outreach') base = signals.filter((s) => s.consentOptedIn && s.status !== 'closed' && s.trendDirection === 'worsening');
    else if (view === 'well') base = signals.filter(isDoingWell);
    else if (view === 'closed') base = signals.filter((s) => s.status === 'closed');
    else base = signals;

    // Apply the independent reach-state filter on top of the view filter.
    if (reachFilter === 'confirmed')
      return base.filter((s) => s.status === 'contacted' && s.studentSelfReportReached === 'yes');
    if (reachFilter === 'not_reached')
      return base.filter((s) => s.studentSelfReportReached === 'no');
    if (reachFilter === 'awaiting')
      return base.filter(
        (s) =>
          s.referralRecommendedAt &&
          (!s.studentSelfReportReached || s.studentSelfReportReached === 'not_yet_answered')
      );
    return base;
  }, [signals, view, reachFilter]);

  useEffect(() => {
    if (view === 'protocol') return;
    if (!visible.some((s) => s.id === selectedId)) {
      setSelectedId(visible[0]?.id ?? null);
    }
  }, [view, visible, selectedId]);

  const selected = signals.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId) {
      const current = signals.find((s) => s.id === selectedId);
      setNoteDraft(current?.notes ?? '');
    }
  }, [selectedId, signals]);

  const applyStatus = async (status: CounsellorSignal['status']) => {
    if (!selected) return;
    await dashboardService.updateSignalStatus(selected.id, status);
    await loadData();
  };

  const saveNote = async () => {
    if (!selected) return;
    await dashboardService.updateSignal(selected.id, { notes: noteDraft });
    await loadData();
  };

  if (!isSignedIn) {
    return (
      <div className="h-full min-h-0 flex items-center justify-center p-4 bg-ice-50 dark:bg-teal-900 overflow-auto">
        <div className="w-full max-w-md bg-white dark:bg-bg-secondary rounded-3xl border border-border-subtle shadow-sm p-8">
          <div className="flex justify-center mb-6">
            <BrandLogo size="lg" to={null} />
          </div>
          <h1 className="text-2xl font-semibold text-center text-fg-heading">Counselling Unit</h1>
          <p className="text-sm text-fg-secondary text-center mt-2 mb-8">
            Staff sign-in for {INSTITUTION.name} counsellors. Students never use this screen. Cases stay anonymous.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="staff-email" className="block text-sm font-medium mb-1">Staff email</label>
              <input
                id="staff-email"
                type="email"
                autoComplete="username"
                className="w-full bg-bg-primary border border-border-subtle rounded-xl p-4 text-fg-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="staff-password" className="block text-sm font-medium mb-1">Password</label>
              <input
                id="staff-password"
                type="password"
                autoComplete="current-password"
                className="w-full bg-bg-primary border border-border-subtle rounded-xl p-4 text-fg-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full py-4 rounded-xl font-medium btn-brand focus-ring shadow-sm">
              Sign in
            </button>
          </form>
          <div className="mt-6 rounded-2xl bg-ice-50 dark:bg-teal-800/40 p-4 text-sm text-fg-secondary">
            <p className="font-medium text-fg-heading mb-2">Issued unit credentials</p>
            <p>Email: {COUNSELLOR_STAFF.email}</p>
            <p>Password: {COUNSELLOR_STAFF.password}</p>
            <button
              type="button"
              className="mt-3 text-mint-700 dark:text-mint-300 font-medium underline"
              onClick={() => {
                setEmail(COUNSELLOR_STAFF.email);
                setPassword(COUNSELLOR_STAFF.password);
                setError('');
              }}
            >
              Fill these in
            </button>
          </div>
          <p className="text-center mt-6">
            <Link to="/" className="text-sm text-fg-secondary hover:underline">Back to MindLine</Link>
          </p>
        </div>
      </div>
    );
  }

  const queueCount = signals.filter((s) => s.status === 'new' && s.trendDirection === 'worsening').length;
  const outreachCount = signals.filter((s) => s.consentOptedIn && s.status !== 'closed' && s.trendDirection === 'worsening').length;
  const wellCount = signals.filter(isDoingWell).length;

  return (
    <div className="h-full min-h-0 flex overflow-hidden bg-ice-50 dark:bg-bg-primary text-fg-primary">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-teal-900/40 z-30 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-border-subtle bg-white dark:bg-bg-secondary flex flex-col transition-all duration-300 shrink-0',
          sidebarCollapsed ? 'lg:hidden' : 'lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-5 border-b border-border-subtle flex items-center justify-between shrink-0">
          <BrandLogo size="sm" />
          <button type="button" className="lg:hidden p-2 rounded-full focus-ring" onClick={() => setSidebarOpen(false)}>
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-border-subtle shrink-0">
          <p className="text-sm font-semibold">{staffName}</p>
          <p className="text-xs text-fg-secondary">{staffEmail}</p>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1" aria-label="Counsellor">
          {NAV.map((item) => {
            const Icon = item.icon;
            const count =
              item.id === 'queue' ? queueCount :
              item.id === 'outreach' ? outreachCount :
              item.id === 'well' ? wellCount :
              undefined;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors focus-ring',
                  view === item.id
                    ? 'bg-mint-100 text-teal-900 dark:bg-mint-900/50 dark:text-white'
                    : 'text-fg-secondary hover:bg-ice-100 dark:hover:bg-teal-800/40'
                )}
              >
                <Icon fontSize="small" />
                <span className="flex-1 text-left">{item.label}</span>
                {count !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-900 text-white dark:bg-mint-600">{count}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border-subtle shrink-0">
          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-fg-secondary hover:bg-ice-100 dark:hover:bg-teal-800/40 focus-ring"
          >
            <LogoutRoundedIcon fontSize="small" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="h-16 shrink-0 flex items-center justify-between gap-3 px-4 border-b border-border-subtle bg-ice-50/90 dark:bg-[#0b1630] backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl text-fg-secondary hover:bg-bg-primary hover:text-fg-primary focus-ring"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <MenuRoundedIcon />
            </button>

            {/* Desktop sidebar collapse/expand toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              title={sidebarCollapsed ? 'Show navigation sidebar' : 'Collapse navigation sidebar'}
              className="hidden lg:flex items-center justify-center p-2 rounded-xl text-fg-secondary hover:bg-bg-primary hover:text-fg-primary focus-ring border border-border-subtle"
            >
              <ViewSidebarRoundedIcon fontSize="small" />
            </button>

            <div className="min-w-0">
              <h1 className="text-base font-semibold text-fg-heading truncate">
                {NAV.find((n) => n.id === view)?.label}
              </h1>
              <p className="text-xs text-fg-secondary truncate">
                Anonymous IDs only. You decide the next step — the app does not.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* If detail panel is collapsed, provide quick restore button */}
            {view !== 'protocol' && detailMode === 'collapsed' && selected && (
              <button
                type="button"
                onClick={() => setDetailMode('normal')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-primary text-xs font-medium text-fg-secondary hover:text-fg-primary hover:border-mint-400 focus-ring shadow-sm"
              >
                <ChevronLeftRoundedIcon fontSize="small" />
                <span>Case {selected.anonId}</span>
              </button>
            )}

            {/* Custom Reach-state filter */}
            {view !== 'protocol' && (
              <CustomSelect
                value={reachFilter}
                onChange={(val) => setReachFilter(val as ReachFilter)}
                ariaLabel="Filter cases by outreach and confirmation status"
                options={[
                  {
                    value: 'all',
                    label: 'All outreach statuses',
                    description: 'Show all case confirmation states',
                  },
                  {
                    value: 'confirmed',
                    label: 'Student confirmed reached',
                    description: 'Contact logged & student confirmed',
                  },
                  {
                    value: 'not_reached',
                    label: 'Student reports not reached',
                    description: 'Counsellor logged contact, student says no contact',
                  },
                  {
                    value: 'awaiting',
                    label: 'Awaiting student confirmation',
                    description: 'Referral recommended, response pending',
                  },
                ]}
              />
            )}
          </div>
        </header>

        {view === 'protocol' ? (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ProtocolPanel />
          </div>
        ) : detailMode === 'expanded' && selected ? (
          /* Full-width Case Detail View */
          <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-bg-secondary p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
                <button
                  type="button"
                  onClick={() => setDetailMode('normal')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-subtle text-xs font-medium text-fg-secondary hover:text-fg-primary hover:bg-bg-primary focus-ring"
                >
                  <ArrowBackRoundedIcon fontSize="small" />
                  Back to dual panel view
                </button>
                <button
                  type="button"
                  onClick={() => setDetailMode('normal')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle text-xs font-medium text-fg-secondary hover:text-fg-primary focus-ring"
                >
                  <FullscreenExitRoundedIcon fontSize="small" />
                  Exit full screen
                </button>
              </div>
              <CaseDetail
                signal={selected}
                noteDraft={noteDraft}
                setNoteDraft={setNoteDraft}
                onSaveNote={saveNote}
                onStatus={applyStatus}
                detailMode={detailMode}
                onToggleExpand={() => setDetailMode('normal')}
                onCollapse={() => setDetailMode('collapsed')}
              />
            </div>
          </div>
        ) : (
          /* Dual or Collapsed Grid Layout */
          <div
            className={cn(
              'flex-1 min-h-0 grid overflow-hidden transition-all duration-300',
              detailMode === 'collapsed'
                ? 'grid-cols-1'
                : 'lg:grid-cols-[minmax(0,1fr)_400px] grid-cols-1'
            )}
          >
            <div className="min-h-0 overflow-y-auto p-4">
              {visible.length === 0 ? (
                <p className="text-fg-secondary p-8 text-center">Nothing in this list right now.</p>
              ) : (
                <ul className="space-y-2">
                  {visible.map((signal) => (
                    <li key={signal.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(signal.id);
                          if (detailMode === 'collapsed') setDetailMode('normal');
                        }}
                        className={cn(
                          'w-full text-left p-3.5 rounded-2xl border transition-colors focus-ring bg-white dark:bg-bg-secondary',
                          selected?.id === signal.id
                            ? 'border-mint-500 shadow-sm'
                            : 'border-border-subtle hover:border-mint-300'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold font-mono tracking-wide">{signal.anonId}</p>
                          <div className="flex flex-col items-end gap-1">
                            {isDoingWell(signal) ? <WellBadge /> : <StatusBadge status={signal.status} />}
                            {signal.referralRecommendedAt && (
                              <ReachBadge signal={signal} />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-fg-secondary">
                          <TrendChip direction={signal.trendDirection} />
                          <span>{signal.consentOptedIn ? 'May be contacted' : 'Anonymous'}</span>
                          <span>{new Date(signal.lastCheckinDate).toLocaleDateString()}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right Case Detail Inspector */}
            {detailMode !== 'collapsed' && (
              <section className="min-h-0 overflow-y-auto border-t lg:border-t-0 lg:border-l border-border-subtle bg-white dark:bg-bg-secondary p-5">
                {!selected ? (
                  <p className="text-fg-secondary">Select an ID to work it.</p>
                ) : (
                  <CaseDetail
                    signal={selected}
                    noteDraft={noteDraft}
                    setNoteDraft={setNoteDraft}
                    onSaveNote={saveNote}
                    onStatus={applyStatus}
                    detailMode={detailMode}
                    onToggleExpand={() =>
                      setDetailMode(detailMode === 'expanded' ? 'normal' : 'expanded')
                    }
                    onCollapse={() => setDetailMode('collapsed')}
                  />
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TrendChip({ direction }: { direction: CounsellorSignal['trendDirection'] }) {
  return (
    <span className="inline-flex items-center gap-1 capitalize">
      {direction === 'worsening' && <TrendingDownRoundedIcon className="text-red-500" fontSize="small" />}
      {direction === 'improving' && <TrendingUpRoundedIcon className="text-mint-600" fontSize="small" />}
      {direction === 'steady' && <TrendingFlatRoundedIcon className="text-amber-500" fontSize="small" />}
      {direction}
    </span>
  );
}

function WellBadge() {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-mint-100 text-mint-800 dark:bg-mint-900/50 dark:text-mint-100">
      Okay
    </span>
  );
}

function StatusBadge({ status }: { status: CounsellorSignal['status'] }) {
  const styles = {
    new: 'bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-100',
    reviewed: 'bg-ice-200 text-teal-800 dark:bg-teal-800 dark:text-ice-100',
    contacted: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
    closed: 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100',
  };
  return (
    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', styles[status])}>
      {status}
    </span>
  );
}

/**
 * ReachBadge — surfaces the three reach states from Stage 4.
 * Styling is intentionally neutral: this is a visibility signal for the
 * counselling team, not an alarm or error indicator.
 */
function ReachBadge({ signal }: { signal: CounsellorSignal }) {
  const { status, studentSelfReportReached, referralRecommendedAt } = signal;

  // Confirmed reached: counsellor recorded contact AND student confirmed it
  if (status === 'contacted' && studentSelfReportReached === 'yes') {
    return (
      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-mint-100 text-mint-800 dark:bg-mint-900/40 dark:text-mint-200">
        Confirmed reached
      </span>
    );
  }

  // Student reports not reached (could disagree with counsellor's 'contacted')
  if (studentSelfReportReached === 'no') {
    return (
      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300">
        Student reports not reached
      </span>
    );
  }

  // Referral was recommended but student hasn't answered the self-report yet
  if (
    referralRecommendedAt &&
    (!studentSelfReportReached || studentSelfReportReached === 'not_yet_answered')
  ) {
    return (
      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
        Awaiting confirmation
      </span>
    );
  }

  return null;
}


function CaseDetail({
  signal,
  noteDraft,
  setNoteDraft,
  onSaveNote,
  onStatus,
  detailMode = 'normal',
  onToggleExpand,
  onCollapse,
}: {
  signal: CounsellorSignal;
  noteDraft: string;
  setNoteDraft: (v: string) => void;
  onSaveNote: () => void;
  onStatus: (status: CounsellorSignal['status']) => void;
  detailMode?: 'normal' | 'collapsed' | 'expanded';
  onToggleExpand?: () => void;
  onCollapse?: () => void;
}) {
  const well = isDoingWell(signal);
  return (
    <div>
      {/* Panel header controls */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-fg-secondary">
          Case Inspector
        </span>
        <div className="flex items-center gap-1">
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              title={detailMode === 'expanded' ? 'Restore view' : 'Expand full screen'}
              className="p-1 rounded-lg text-fg-secondary hover:bg-bg-primary hover:text-fg-primary focus-ring"
            >
              {detailMode === 'expanded' ? (
                <FullscreenExitRoundedIcon fontSize="small" />
              ) : (
                <FullscreenRoundedIcon fontSize="small" />
              )}
            </button>
          )}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              title="Collapse detail panel"
              className="p-1 rounded-lg text-fg-secondary hover:bg-bg-primary hover:text-fg-primary focus-ring"
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </button>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold font-mono text-fg-heading tracking-wide">
        {signal.anonId}
      </h2>
      <p className="text-sm text-fg-secondary mt-1">Anonymous check-in ID. No name or faculty is stored here.</p>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        {well ? <WellBadge /> : <StatusBadge status={signal.status} />}
        {signal.referralRecommendedAt && <ReachBadge signal={signal} />}
        <span className="text-sm"><TrendChip direction={signal.trendDirection} /></span>
      </div>

      {signal.elevatedAreas && signal.elevatedAreas.length > 0 && (
        <p className="text-sm text-fg-secondary mt-4">
          Pattern held on: {signal.elevatedAreas.join(', ')}
        </p>
      )}

      <div className="mt-5 rounded-2xl border border-border-subtle p-4">
        {signal.consentOptedIn ? (
          <>
            <p className="text-sm font-medium">This ID asked to be reachable</p>
            <p className="text-lg font-semibold mt-1 font-mono">{signal.contactDetail}</p>
            <a href={`tel:${signal.contactDetail?.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-mint-700 dark:text-mint-300">
              <PhoneInTalkRoundedIcon fontSize="small" /> Call on an {INSTITUTION.name}-approved line
            </a>
          </>
        ) : (
          <p className="text-sm text-fg-secondary flex gap-2">
            <LockRoundedIcon fontSize="small" />
            This ID chose to remain anonymous. You can review the pattern, but you cannot identify them from MindLine.
          </p>
        )}
      </div>

      <h3 className="text-sm font-medium mt-6 mb-3">Recent check-ins</h3>
      <div className="grid grid-cols-3 gap-2">
        {signal.history.map((record) => (
          <div key={record.id} className="rounded-xl border border-border-subtle p-3 bg-ice-50 dark:bg-teal-900/30">
            <p className="text-[11px] text-fg-secondary mb-2">{new Date(record.timestamp).toLocaleDateString()}</p>
            {Object.entries(record.answers).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center text-[11px] capitalize">
                <span className="truncate mr-1">{key}</span>
                <span className={cn('w-2 h-2 rounded-full', val >= 2 ? 'bg-red-400' : val === 1 ? 'bg-amber-400' : 'bg-mint-400')} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <h3 className="text-sm font-medium mt-6 mb-2">Counsellor notes</h3>
      <textarea
        value={noteDraft}
        onChange={(e) => setNoteDraft(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-border-subtle p-3 bg-bg-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
        placeholder="What did you decide, and why? Do not write a name."
      />
      <button type="button" onClick={onSaveNote} className="mt-2 text-sm font-medium text-mint-700 dark:text-mint-300">
        Save note
      </button>

      {!well && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-fg-secondary uppercase tracking-wide">Next step</p>
          <button type="button" onClick={() => onStatus('reviewed')} className="w-full py-3 rounded-xl border border-border-subtle font-medium hover:bg-ice-100 dark:hover:bg-teal-800/40 focus-ring">
            Mark as reviewed
          </button>
          <button
            type="button"
            disabled={!signal.consentOptedIn}
            onClick={() => onStatus('contacted')}
            className="w-full py-3 rounded-xl font-medium btn-brand focus-ring disabled:opacity-40 disabled:pointer-events-none"
          >
            Record that I reached out
          </button>
          <button type="button" onClick={() => onStatus('closed')} className="w-full py-3 rounded-xl border border-border-subtle font-medium hover:bg-ice-100 dark:hover:bg-teal-800/40 focus-ring">
            Close this case
          </button>
        </div>
      )}
    </div>
  );
}

function ProtocolPanel() {
  return (
    <div className="max-w-3xl p-6 space-y-4">
      <p className="text-fg-secondary">
        MindLine is a referral bridge into {INSTITUTION.name} counselling — not a diagnosis tool. Every row is an anonymous ID. The counsellor, not the app, decides what happens next.
      </p>
      <section className="bg-white dark:bg-bg-secondary rounded-2xl border border-border-subtle p-5">
        <h2 className="font-semibold mb-2">1. Review a new signal</h2>
        <p className="text-sm text-fg-secondary">A flag only appears after a sustained pattern across several check-ins. A single hard week never creates a case. Open the ID, look at trend direction and which areas stayed elevated.</p>
      </section>
      <section className="bg-white dark:bg-bg-secondary rounded-2xl border border-border-subtle p-5">
        <h2 className="font-semibold mb-2">2. Respect consent</h2>
        <p className="text-sm text-fg-secondary">If they opted in, you may contact them using an {INSTITUTION.name}-approved method (unit phone line). If they stayed anonymous, you still see the pattern — you cannot identify them from this screen.</p>
      </section>
      <section className="bg-white dark:bg-bg-secondary rounded-2xl border border-border-subtle p-5">
        <h2 className="font-semibold mb-2">3. Decide the next step</h2>
        <p className="text-sm text-fg-secondary">Use normal professional procedure: review, reach out, or close. Record only reviewed, contacted, or closed — plus a short note. Do not write a name.</p>
      </section>
      <section className="bg-white dark:bg-bg-secondary rounded-2xl border border-border-subtle p-5">
        <h2 className="font-semibold mb-2">4. Urgent help is separate</h2>
        <p className="text-sm text-fg-secondary">Students who need help right now use “I need help now” on every student screen. Do not treat this dashboard as the only safety net.</p>
      </section>
    </div>
  );
}
