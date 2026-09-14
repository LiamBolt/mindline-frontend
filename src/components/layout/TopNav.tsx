import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import EmergencyRoundedIcon from '@mui/icons-material/EmergencyRounded';
import { useInstitutionStore } from '../../stores/institutionStore';
import UniversitySelectModal from '../institution/UniversitySelectModal';
import { cn } from '../../utils/cn';
import BrandLogo from './BrandLogo';

interface TopNavProps {
  isCheckin: boolean;
}

export default function TopNav({ isCheckin }: TopNavProps) {
  const location = useLocation();
  const [a11yOpen, setA11yOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [univModalOpen, setUnivModalOpen] = useState(false);
  const a11yTriggerRef = useRef<HTMLButtonElement>(null) as React.MutableRefObject<HTMLButtonElement>;

  const { hasSelectedCampus, getCurrentInstitution } = useInstitutionStore();
  const currentInstitution = getCurrentInstitution();

  // Close mobile menu on location change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 nav-glass transition-all duration-base',
          isCheckin && 'lg:block hidden'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <BrandLogo size="sm" />
              </div>

              {/* University Campus Badge & Switcher Button */}
              <button
                type="button"
                onClick={() => setUnivModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border-subtle bg-bg-secondary/70 hover:bg-bg-secondary hover:border-mint-400 dark:hover:border-mint-600 transition-all focus-ring text-fg-primary shadow-xs"
                title="Switch university campus"
                aria-label={`Current campus: ${currentInstitution.name}. Click to change.`}
              >
                <SchoolRoundedIcon sx={{ fontSize: 16 }} className="text-mint-600 dark:text-mint-400" />
                <span className="font-semibold text-fg-heading">{currentInstitution.name}</span>
                <span className="text-fg-secondary text-[10px] ml-0.5">▾</span>
              </button>
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
                    'px-4 py-2 rounded-full text-sm font-medium transition-all focus-ring',
                    location.pathname === to ||
                      (to === '/counsellor' && location.pathname.startsWith('/counsellor'))
                      ? 'text-teal-900 dark:text-white bg-mint-100/80 dark:bg-mint-900/40'
                      : 'text-fg-secondary hover:text-fg-heading hover:bg-teal-100/40 dark:hover:bg-teal-800/20'
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Accessibility icon */}
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

            {/* Mobile Right Controls: Accessibility + Innovative Morphing Hamburger */}
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

              {/* Unique Morphing Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile menu"
                className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-2xl border border-border-subtle bg-bg-secondary/80 p-2 text-fg-secondary transition-all hover:text-fg-primary focus-ring"
              >
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-0.5 w-5 rounded-full bg-current origin-center"
                />
                <motion.span
                  animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.15 }}
                  className="h-0.5 w-5 rounded-full bg-current"
                />
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-0.5 w-5 rounded-full bg-current origin-center"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Innovative Mobile Navigation Command Dock */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Soft backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-teal-950/50 backdrop-blur-sm lg:hidden"
            />

            {/* Floating Command Dock */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed top-20 inset-x-4 z-40 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border border-border-subtle bg-bg-secondary/95 p-5 shadow-2xl backdrop-blur-2xl lg:hidden"
            >
              {/* Campus switcher card */}
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-primary p-3">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-100 text-mint-700 dark:bg-mint-900/40 dark:text-mint-300 shrink-0">
                    <SchoolRoundedIcon fontSize="small" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-[11px] text-fg-secondary">Current Campus</span>
                    <span className="text-xs font-semibold text-fg-heading truncate">
                      {currentInstitution.fullName}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setUnivModalOpen(true);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-secondary text-xs font-medium text-mint-700 dark:text-mint-300 hover:border-mint-400"
                >
                  Switch
                </button>
              </div>

              {/* Dedicated Counsellor Portal Gateway on Mobile */}
              <div className="mb-4">
                <Link
                  to="/counsellor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-mint-50/90 dark:bg-mint-950/40 border border-mint-200/80 dark:border-mint-800 text-teal-950 dark:text-mint-100 transition-all font-medium text-sm group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-mint-200/80 dark:bg-mint-900/80 text-teal-800 dark:text-mint-300">
                      <LockRoundedIcon fontSize="small" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-fg-heading">Counsellor Portal</span>
                      <span className="text-[11px] text-fg-secondary">{currentInstitution.counsellingUnitLabel}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-mint-700 dark:text-mint-300 group-hover:translate-x-1 transition-transform">
                    Sign in →
                  </span>
                </Link>
              </div>

              {/* Navigation Links with Icons */}
              <div className="space-y-1 pb-3 border-b border-border-subtle">
                {[
                  { to: '/', label: 'Home', icon: HomeRoundedIcon },
                  { to: '/how-it-works', label: 'How it works', icon: MenuBookRoundedIcon },
                  { to: '/privacy', label: 'Privacy & Anonymous ID', icon: SecurityRoundedIcon },
                  { to: '/settings', label: 'Settings & Testing Suite', icon: SettingsRoundedIcon },
                  { to: '/help', label: 'I need help now', icon: EmergencyRoundedIcon },
                ].map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      location.pathname === to
                        ? 'bg-mint-100/70 text-teal-900 font-semibold dark:bg-mint-900/40 dark:text-mint-100'
                        : 'text-fg-secondary hover:bg-bg-primary hover:text-fg-heading'
                    )}
                  >
                    <Icon fontSize="small" className="text-fg-secondary" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              {/* Quick Check-in action */}
              {location.pathname !== '/check-in' && (
                <div className="pt-4">
                  <Link
                    to="/check-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center py-3 rounded-2xl btn-brand text-white font-medium text-sm shadow-md"
                  >
                    Start your 30s check-in
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* University Selection Modal */}
      <UniversitySelectModal
        isOpen={univModalOpen || (!hasSelectedCampus && location.pathname === '/')}
        onClose={() => setUnivModalOpen(false)}
        isFirstVisit={!hasSelectedCampus && location.pathname === '/'}
      />

      {/* Accessibility Panel — lazy loaded */}
      <React.Suspense fallback={null}>
        {a11yOpen &&
          React.createElement(
            React.lazy(() => import('../a11y/AccessibilityPanel')),
            {
              isOpen: a11yOpen,
              onClose: () => setA11yOpen(false),
              triggerRef: a11yTriggerRef,
            }
          )}
      </React.Suspense>
    </>
  );
}
