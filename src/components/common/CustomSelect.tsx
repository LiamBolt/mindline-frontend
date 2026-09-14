import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
  className?: string;
  menuClassName?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  menuClassName,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const nextIndex = (currentIndex + 1) % options.length;
        onChange(options[nextIndex].value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        onChange(options[prevIndex].value);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={cn(
          'group flex items-center justify-between gap-2.5 rounded-xl border border-border-subtle bg-bg-primary px-3.5 py-2 text-xs font-medium text-fg-primary shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-border-focus hover:border-mint-400 dark:hover:border-mint-600',
          isOpen && 'border-mint-500 ring-2 ring-border-focus',
          className
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          <span>{selectedOption?.label}</span>
        </span>
        <KeyboardArrowDownRoundedIcon
          fontSize="small"
          className={cn(
            'text-fg-secondary transition-transform duration-200 group-hover:text-fg-primary',
            isOpen && 'rotate-180 text-mint-600 dark:text-mint-400'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute right-0 z-50 mt-1.5 min-w-[220px] max-h-64 overflow-y-auto rounded-2xl border border-border-subtle bg-bg-secondary p-1.5 shadow-xl backdrop-blur-xl focus:outline-none',
              menuClassName
            )}
            role="listbox"
            aria-label={ariaLabel}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'group flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors',
                    isSelected
                      ? 'bg-mint-100/70 font-semibold text-mint-900 dark:bg-mint-900/40 dark:text-mint-100'
                      : 'text-fg-primary hover:bg-bg-primary hover:text-fg-heading'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon}
                    <div className="flex flex-col">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="text-[10px] text-fg-secondary group-hover:text-fg-primary">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckRoundedIcon
                      fontSize="inherit"
                      className="text-mint-600 dark:text-mint-300 shrink-0 text-sm"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
