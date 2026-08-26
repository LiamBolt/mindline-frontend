import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import { cn } from '../../utils/cn';
import logo from '../../assets/mindline-logo.jpeg';

interface TopNavProps {
  isCheckin: boolean;
}

export default function TopNav({ isCheckin }: TopNavProps) {
  const location = useLocation();
  const [a11yOpen, setA11yOpen] = useState(false);
  const a11yTriggerRef = useRef<HTMLButtonElement>(null) as React.MutableRefObject<HTMLButtonElement>;

  return (
    <>
      {/* The header is ALWAYS frosted glass — visible boundary, blur, luminous bottom border */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 nav-glass transition-all duration-base",
          isCheckin && "lg:block hidden"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo + Wordmark */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center focus-ring rounded-lg px-1 py-1">
                <img
                  src={logo}
                  alt="MindLine"
                  className="h-11 w-auto max-w-[148px] object-contain"
                />
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main navigation">
              {[
                { to: '/', label: 'Home' },
                { to: '/how-it-works', label: 'How it works' },
                { to: '/counsellor', label: 'For counsellors' },
                { to: '/privacy', label: 'Privacy' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all focus-ring",
                    location.pathname === to || (to === '/counsellor' && location.pathname.startsWith('/counsellor'))
                      ? "text-teal-900 dark:text-white bg-mint-100/80 dark:bg-mint-900/40"
                      : "text-fg-secondary hover:text-fg-heading hover:bg-teal-100/40 dark:hover:bg-teal-800/20"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Accessibility icon — Emotiv-style */}
              <button
                ref={a11yTriggerRef}
                onClick={() => setA11yOpen(true)}
                aria-expanded={a11yOpen}
                aria-label="Accessibility settings"
                className="p-2 text-fg-secondary hover:text-teal-700 dark:hover:text-mint-400 rounded-full transition-colors focus-ring hover:bg-teal-100/40 dark:hover:bg-teal-800/30"
              >
                <AccessibilityNewRoundedIcon fontSize="small" />
              </button>

              {location.pathname !== '/check-in' && (
                <Link
                  to="/check-in"
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold text-white btn-brand transition-all focus-ring shadow-sm hover:shadow-md"
                >
                  Start check-in
                </Link>
              )}
            </div>

            {/* Mobile Right: Accessibility only */}
            <div className="flex lg:hidden items-center space-x-1">
              <button
                ref={a11yTriggerRef}
                onClick={() => setA11yOpen(true)}
                aria-expanded={a11yOpen}
                aria-label="Accessibility settings"
                className="p-2 text-fg-secondary hover:text-teal-700 dark:hover:text-mint-400 rounded-full transition-colors focus-ring"
              >
                <AccessibilityNewRoundedIcon fontSize="small" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Accessibility Panel — lazy loaded */}
      <React.Suspense fallback={null}>
        {a11yOpen && React.createElement(
          React.lazy(() => import('../a11y/AccessibilityPanel')),
          { isOpen: a11yOpen, onClose: () => setA11yOpen(false), triggerRef: a11yTriggerRef }
        )}
      </React.Suspense>
    </>
  );
}

