
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ConfirmationScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto w-full text-center px-4 pt-12 pb-20">
      
      {/* Gentle non-gamified animation (soft breathing/pulse graphic) */}
      <div className="relative w-32 h-32 mb-12">
        <motion.div
          className="absolute inset-0 bg-mint-100 dark:bg-mint-900/40 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-4 bg-mint-200 dark:bg-mint-800/40 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <div className="absolute inset-8 bg-mint-500 dark:bg-teal-700 rounded-full" />
      </div>

      <h2 className="text-3xl font-semibold text-fg-heading mb-4">
        Thank you for checking in.
      </h2>
      
      <p className="text-lg text-fg-secondary mb-12 max-w-md">
        Taking a moment for yourself matters. We'll keep checking in to see how you're doing over time.
      </p>

      <Link
        to="/"
        className="px-10 py-4 bg-teal-800 hover:bg-teal-900 text-white dark:bg-mint-700 dark:hover:bg-mint-800 rounded-2xl text-lg font-medium transition-colors focus-ring shadow-sm"
      >
        Done
      </Link>
    </div>
  );
}
