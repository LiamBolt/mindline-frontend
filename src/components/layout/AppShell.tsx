import React from 'react';
import TopNav from './TopNav';
import BottomTabBar from './BottomTabBar';
import HelpFAB from './HelpFAB';
import { useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import DueNudgeBanner from '../engagement/DueNudgeBanner';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const isCheckinFlow = location.pathname.startsWith('/check-in');
  const isCounsellor = location.pathname.startsWith('/counsellor');

  return (
    <div className={cn('flex flex-col font-sans', isCounsellor ? 'h-dvh overflow-hidden' : 'min-h-screen')}>
      {!isCounsellor && <TopNav isCheckin={isCheckinFlow} />}

      <main className={isCounsellor ? 'flex-1 min-h-0 overflow-hidden flex flex-col' : 'flex-1 flex flex-col pt-16 lg:pt-20 pb-20 lg:pb-0 relative'}>
        {/* DueNudgeBanner checks for due nudges/reminders/self-reports on mount.
            Shown on every student page; hidden during the check-in flow and
            on the counsellor dashboard (separate, staff-only context). */}
        {!isCheckinFlow && !isCounsellor && <DueNudgeBanner />}
        {children}
      </main>

      {!isCheckinFlow && !isCounsellor && <BottomTabBar />}
      {!isCounsellor && <HelpFAB />}
    </div>
  );
}
