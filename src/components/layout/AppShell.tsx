import React from 'react';
import TopNav from './TopNav';
import BottomTabBar from './BottomTabBar';
import HelpFAB from './HelpFAB';
import { useLocation } from 'react-router-dom';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const isCheckinFlow = location.pathname.startsWith('/check-in');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation - Always visible on desktop, visible on mobile except in checkin flow */}
      <TopNav isCheckin={isCheckinFlow} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-16 lg:pt-20 pb-20 lg:pb-0 relative">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Visible on mobile only (<1024px) */}
      {!isCheckinFlow && <BottomTabBar />}

      {/* Floating Action Buttons - Visible on desktop only (>=1024px) */}
      <HelpFAB />
    </div>
  );
}
