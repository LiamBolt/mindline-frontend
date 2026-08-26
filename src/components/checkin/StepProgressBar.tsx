import { motion } from 'framer-motion';


interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export default function StepProgressBar({ currentStep, totalSteps, label }: StepProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));

  return (
    <div className="w-full max-w-xl mx-auto py-4">
      {label && (
        <div className="text-center text-sm font-medium text-fg-secondary mb-3" aria-live="polite">
          {label}
        </div>
      )}
      <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <motion.div 
          className="h-full brand-fill rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
