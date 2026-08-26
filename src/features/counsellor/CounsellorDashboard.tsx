import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import type { CounsellorSignal } from '../../services/types';
import { useCounsellorAuthStore } from '../../stores/counsellorAuthStore';
import { COUNSELLOR_STAFF } from '../../config/counsellorAccess';
import { cn } from '../../utils/cn';
import logo from '../../assets/mindline-logo.jpeg';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

type View = 'queue' | 'outreach' | 'all' | 'closed' | 'protocol';

const NAV: { id: View; label: string; icon: typeof InboxRoundedIcon }[] = [
  { id: 'queue', label: 'New signals', icon: AssignmentRoundedIcon },
  { id: 'outreach', label: 'Ready to contact', icon: PhoneInTalkRoundedIcon },
  { id: 'all', label: 'All cases', icon: InboxRoundedIcon },
  { id: 'closed', label: 'Closed', icon: TaskAltRoundedIcon },
  { id: 'protocol', label: 'How to respond', icon: MenuBookRoundedIcon },
];

export default function CounsellorDashboard() {
  const { isSignedIn, staffName, staffEmail, signIn, signOut } = useCounsellorAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signals, setSignals] = useState<CounsellorSignal[]>([]);
  const [view, setView] = useState<View>('queue');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    if (view === 'queue') return signals.filter((s) => s.status === 'new');
    if (view === 'outreach') return signals.filter((s) => s.consentOptedIn && s.status !== 'closed');
    if (view === 'closed') return signals.filter((s) => s.status === 'closed');
    return signals;
  }, [signals, view]);

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-ice-50 dark:bg-teal-900">
        <div className="w-full max-w-md bg-white dark:bg-bg-secondary rounded-3xl border border-border-subtle shadow-sm p-8">
          <img src={logo} alt="MindLine" className="h-16 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-2xl font-semibold text-center text-fg-heading">Counselling Unit</h1>
          <p className="text-sm text-fg-secondary text-center mt-2 mb-8">
            Staff sign-in for MUST counsellors. Students never use this screen.
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

  return (
    <div className="min-h-screen flex bg-ice-50 dark:bg-bg-primary text-fg-primary">
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
          'fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-bg-secondary border-r border-border-subtle flex flex-col transition-transform duration-base',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="MindLine" className="h-12 w-auto object-contain" />
          </Link>
          <button type="button" className="lg:hidden p-2 rounded-full focus-ring" onClick={() => setSidebarOpen(false)}>
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-border-subtle">
          <p className="text-sm font-semibold">{staffName}</p>
          <p className="text-xs text-fg-secondary">{staffEmail}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1" aria-label="Counsellor">
          {NAV.map((item) => {
            const Icon = item.icon;
            const count =
              item.id === 'queue' ? signals.filter((s) => s.status === 'new').length :
              item.id === 'outreach' ? signals.filter((s) => s.consentOptedIn && s.status !== 'closed').length :
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

        <div className="p-3 border-t border-border-subtle">
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center gap-3 px-4 border-b border-border-subtle bg-white/80 dark:bg-bg-secondary/80 backdrop-blur">
          <button type="button" className="lg:hidden p-2 rounded-full focus-ring" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <MenuRoundedIcon />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-fg-heading">
              {NAV.find((n) => n.id === view)?.label}
            </h1>
            <p className="text-xs text-fg-secondary">Referral queue — the counsellor decides the next step, not the app.</p>
          </div>
        </header>

        {view === 'protocol' ? (
          <ProtocolPanel />
        ) : (
          <div className="flex-1 grid lg:grid-cols-[minmax(0,1fr)_380px] min-h-0">
            <div className="overflow-auto p-4">
              {visible.length === 0 ? (
                <p className="text-fg-secondary p-8 text-center">Nothing in this list right now.</p>
              ) : (
                <ul className="space-y-3">
                  {visible.map((signal) => (
                    <li key={signal.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(signal.id)}
                        className={cn(
                          'w-full text-left p-4 rounded-2xl border transition-colors focus-ring bg-white dark:bg-bg-secondary',
                          selected?.id === signal.id ? 'border-mint-500 shadow-sm' : 'border-border-subtle hover:border-mint-300'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {signal.consentOptedIn && signal.studentName ? signal.studentName : 'Anonymous student'}
                            </p>
                            <p className="text-xs font-mono text-fg-secondary mt-0.5">{signal.anonId}</p>
                          </div>
                          <StatusBadge status={signal.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-fg-secondary">
                          <TrendChip direction={signal.trendDirection} />
                          <span>{signal.consentOptedIn ? 'May be contacted' : 'Stay anonymous'}</span>
                          <span>{new Date(signal.lastCheckinDate).toLocaleDateString()}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <section className="border-t lg:border-t-0 lg:border-l border-border-subtle bg-white dark:bg-bg-secondary overflow-auto p-5">
              {!selected ? (
                <p className="text-fg-secondary">Select a case to work it.</p>
              ) : (
                <CaseDetail
                  signal={selected}
                  noteDraft={noteDraft}
                  setNoteDraft={setNoteDraft}
                  onSaveNote={saveNote}
                  onStatus={applyStatus}
                />
              )}
            </section>
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

function StatusBadge({ status }: { status: CounsellorSignal['status'] }) {
  const styles = {
    new: 'bg-mint-100 text-teal-900 dark:bg-mint-900/50 dark:text-mint-100',
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

function CaseDetail({
  signal,
  noteDraft,
  setNoteDraft,
  onSaveNote,
  onStatus,
}: {
  signal: CounsellorSignal;
  noteDraft: string;
  setNoteDraft: (v: string) => void;
  onSaveNote: () => void;
  onStatus: (status: CounsellorSignal['status']) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-fg-heading">
        {signal.consentOptedIn && signal.studentName ? signal.studentName : 'Anonymous student'}
      </h2>
      <p className="text-xs font-mono text-fg-secondary mt-1">{signal.anonId}</p>
      {signal.faculty && <p className="text-sm text-fg-secondary mt-2">{signal.faculty}</p>}

      <div className="flex flex-wrap gap-2 mt-4">
        <StatusBadge status={signal.status} />
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
            <p className="text-sm font-medium">Student asked to be reachable</p>
            <p className="text-lg font-semibold mt-1">{signal.contactDetail}</p>
            <a href={`tel:${signal.contactDetail?.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-mint-700 dark:text-mint-300">
              <PhoneInTalkRoundedIcon fontSize="small" /> Call on a MUST-approved line
            </a>
          </>
        ) : (
          <p className="text-sm text-fg-secondary flex gap-2">
            <LockRoundedIcon fontSize="small" />
            This student chose to remain anonymous. You can review the pattern, but you cannot identify or contact them from MindLine.
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
        rows={4}
        className="w-full rounded-xl border border-border-subtle p-3 bg-bg-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
        placeholder="What did you decide, and why?"
      />
      <button type="button" onClick={onSaveNote} className="mt-2 text-sm font-medium text-mint-700 dark:text-mint-300">
        Save note
      </button>

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
    </div>
  );
}

function ProtocolPanel() {
  return (
    <div className="max-w-3xl p-6 space-y-6 overflow-auto">
      <p className="text-fg-secondary">
        MindLine is a referral bridge into MUST counselling — not a diagnosis tool. The counsellor, not the app, decides what happens next.
      </p>
      <section className="bg-white dark:bg-bg-secondary rounded-2xl border border-border-subtle p-5">
        <h2 className="font-semibold mb-2">1. Review a new signal</h2>
        <p className="text-sm text-fg-secondary">A flag only appears after a sustained pattern across several check-ins. A single hard week never creates a case. Open the case, look at trend direction and which areas stayed elevated.</p>
      </section>
      <section className="bg-white dark:bg-bg-secondary rounded-2xl border border-border-subtle p-5">
        <h2 className="font-semibold mb-2">2. Respect consent</h2>
        <p className="text-sm text-fg-secondary">If the student opted in, you may contact them using a MUST-approved method (unit phone line). If they stayed anonymous, you still see the pattern — you just cannot identify them from this screen.</p>
      </section>
      <section className="bg-white dark:bg-bg-secondary rounded-2xl border border-border-subtle p-5">
        <h2 className="font-semibold mb-2">3. Decide the next step</h2>
        <p className="text-sm text-fg-secondary">Use normal professional procedure: review, reach out, or close. Record only the minimum status the workflow needs — reviewed, contacted, or closed — plus a short note for your team.</p>
      </section>
      <section className="bg-white dark:bg-bg-secondary rounded-2xl border border-border-subtle p-5">
        <h2 className="font-semibold mb-2">4. Urgent help is separate</h2>
        <p className="text-sm text-fg-secondary">Students who need help right now use “I need help now” on every student screen. Do not treat this dashboard as the only safety net.</p>
      </section>
    </div>
  );
}
