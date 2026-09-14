import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function CustomToggle({
  checked,
  onChange,
  id,
  ariaLabel,
  disabled = false,
}: CustomToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg-primary',
        checked ? 'bg-mint-600 dark:bg-mint-500' : 'bg-teal-200 dark:bg-teal-800',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className="sr-only">{ariaLabel}</span>
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}
