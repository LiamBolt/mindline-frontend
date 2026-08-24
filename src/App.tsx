import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useA11yStore } from './stores/a11yStore';
// Layouts
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/ErrorBoundary';
// Features (Placeholders for now)
const LandingPage = React.lazy(() => import('./features/landing/LandingPage'));
const HowItWorksPage = React.lazy(() => import('./features/landing/HowItWorksPage'));
const CheckinFlow = React.lazy(() => import('./features/checkin/CheckinFlow'));
const PrivacyPage = React.lazy(() => import('./features/privacy/PrivacyPage'));
const HelpPage = React.lazy(() => import('./features/help/HelpPage'));
const CounsellorDashboard = React.lazy(() => import('./features/counsellor/CounsellorDashboard'));
const SettingsPage = React.lazy(() => import('./features/settings/SettingsPage'));
const NotFoundPage = React.lazy(() => import('./features/NotFoundPage'));

export default function App() {
  const { theme, textSizeMultiplier, highContrast } = useA11yStore();

  // Apply a11y settings to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Theme logic
    const applyTheme = () => {
      if (
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    
    applyTheme();

    // Listen for system theme changes if set to 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (useA11yStore.getState().theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', handleChange);

    // Apply text size multiplier (default is 16px desktop / 18px mobile handled via tailwind classes on body usually, 
    // but here we can set a CSS variable to scale if needed, or adjust root font size)
    // 100% -> 16px, 112% -> 18px, 125% -> 20px
    root.style.fontSize = `${textSizeMultiplier * 100}%`;

    // Apply high contrast class
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, textSizeMultiplier, highContrast]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppShell>
          <React.Suspense fallback={<div className="flex h-screen items-center justify-center p-4">Loading...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/check-in" element={<CheckinFlow />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/counsellor" element={<CounsellorDashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </React.Suspense>
        </AppShell>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
