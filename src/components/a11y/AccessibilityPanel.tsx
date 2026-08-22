import React, { useEffect, useRef } from 'react';
import { useA11yStore } from '../../stores/a11yStore';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { cn } from '../../utils/cn';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export default function AccessibilityPanel({ isOpen, onClose, triggerRef }: AccessibilityPanelProps) {
  const { 
    theme, setTheme, 
    textSizeMultiplier, setTextSizeMultiplier,
    highContrast, setHighContrast, 
    reduceMotion, setReduceMotion,
    reset 
  } = useA11yStore();

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:items-start items-end justify-end lg:pt-16 lg:pr-4" role="dialog" aria-label="Accessibility Settings">
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40 transition-opacity lg:hidden" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative w-full lg:w-96 calm-glass-panel rounded-t-3xl lg:rounded-3xl p-6 shadow-xl z-10 overflow-hidden outline-none",
          "transform transition-transform duration-modal ease-out lg:translate-y-0",
          // The CSS handles enter animation for us if we use framer-motion, but simple classes work too
          "animate-in slide-in-from-bottom-10 lg:slide-in-from-top-4 fade-in"
        )}
      >
        <div className="calm-glass-barrier" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-fg-heading">Accessibility</h2>
          <button 
            onClick={onClose}
            className="p-2 text-fg-secondary hover:text-fg-primary rounded-full transition-colors focus-ring"
            aria-label="Close panel"
          >
            <CloseRoundedIcon />
          </button>
        </div>

        <div className="space-y-6">
          {/* Text Size */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-fg-primary">Text Size</h3>
            <div className="flex gap-2">
              {[1, 1.12, 1.25].map((multiplier) => (
                <button
                  key={multiplier}
                  onClick={() => setTextSizeMultiplier(multiplier)}
                  className={cn(
                    "flex-1 py-2 rounded-xl border font-medium text-sm transition-all focus-ring",
                    textSizeMultiplier === multiplier 
                      ? "bg-mint-100 dark:bg-mint-900 border-mint-600 text-mint-900 dark:text-mint-100" 
                      : "bg-white dark:bg-bg-primary border-border-subtle text-fg-secondary hover:bg-bg-primary"
                  )}
                >
                  {multiplier === 1 ? 'Default' : multiplier === 1.12 ? 'Large' : 'Largest'}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-fg-primary">Theme</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "flex-1 flex justify-center py-2 rounded-xl border transition-all focus-ring",
                  theme === 'light' 
                    ? "bg-mint-100 dark:bg-mint-900 border-mint-600 text-mint-900 dark:text-mint-100" 
                    : "bg-white dark:bg-bg-primary border-border-subtle text-fg-secondary hover:bg-bg-primary"
                )}
                aria-label="Light theme"
              >
                <LightModeRoundedIcon fontSize="small" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "flex-1 flex justify-center py-2 rounded-xl border transition-all focus-ring",
                  theme === 'dark' 
                    ? "bg-mint-100 dark:bg-mint-900 border-mint-600 text-mint-900 dark:text-mint-100" 
                    : "bg-white dark:bg-bg-primary border-border-subtle text-fg-secondary hover:bg-bg-primary"
                )}
                aria-label="Dark theme"
              >
                <DarkModeRoundedIcon fontSize="small" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  "flex-1 flex justify-center py-2 rounded-xl border transition-all focus-ring",
                  theme === 'system' 
                    ? "bg-mint-100 dark:bg-mint-900 border-mint-600 text-mint-900 dark:text-mint-100" 
                    : "bg-white dark:bg-bg-primary border-border-subtle text-fg-secondary hover:bg-bg-primary"
                )}
                aria-label="System theme"
              >
                <SettingsBrightnessRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-white dark:bg-bg-primary rounded-xl border border-border-subtle cursor-pointer focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2 focus-within:ring-offset-bg-primary">
              <span className="font-medium text-sm text-fg-primary">High Contrast</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-mint-600 rounded bg-bg-primary border-border-subtle focus:ring-0 focus:outline-none"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-white dark:bg-bg-primary rounded-xl border border-border-subtle cursor-pointer focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2 focus-within:ring-offset-bg-primary">
              <span className="font-medium text-sm text-fg-primary">Reduce Motion</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-mint-600 rounded bg-bg-primary border-border-subtle focus:ring-0 focus:outline-none"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
              />
            </label>
          </div>

          <button 
            onClick={reset}
            className="w-full py-2 mt-2 text-sm text-fg-secondary hover:text-fg-primary transition-colors focus-ring rounded-lg"
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
