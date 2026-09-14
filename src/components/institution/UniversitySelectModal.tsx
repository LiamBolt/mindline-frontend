import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import {
  useInstitutionStore,
  INSTITUTION_PRESETS,
  type InstitutionInfo,
} from '../../stores/institutionStore';
import { cn } from '../../utils/cn';

interface UniversitySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstVisit?: boolean;
}

export default function UniversitySelectModal({
  isOpen,
  onClose,
  isFirstVisit = false,
}: UniversitySelectModalProps) {
  const { currentId, setInstitution, markCampusSelected } = useInstitutionStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !isFirstVisit) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFirstVisit, onClose]);

  const handleSelect = (inst: InstitutionInfo) => {
    setInstitution(inst.id);
    markCampusSelected();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isFirstVisit ? undefined : onClose}
            className="fixed inset-0 bg-teal-950/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border-subtle bg-bg-secondary p-6 shadow-2xl z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="univ-modal-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-100 text-mint-700 dark:bg-mint-900/40 dark:text-mint-300">
                  <SchoolRoundedIcon fontSize="medium" />
                </div>
                <div>
                  <h2 id="univ-modal-title" className="text-lg font-semibold text-fg-heading">
                    {isFirstVisit ? 'Choose Your Campus' : 'Switch University Campus'}
                  </h2>
                  <p className="text-xs text-fg-secondary">
                    MindLine adapts support contacts and counselling units to your university.
                  </p>
                </div>
              </div>

              {!isFirstVisit && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-fg-secondary hover:bg-bg-primary hover:text-fg-primary focus-ring"
                  aria-label="Close"
                >
                  <CloseRoundedIcon fontSize="small" />
                </button>
              )}
            </div>

            {/* University List */}
            <div className="space-y-2.5 my-4 max-h-[60vh] overflow-y-auto pr-1">
              {Object.values(INSTITUTION_PRESETS).map((inst) => {
                const isSelected = inst.id === currentId;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => handleSelect(inst)}
                    className={cn(
                      'group flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all focus-ring',
                      isSelected
                        ? 'border-mint-500 bg-mint-50/70 shadow-sm dark:bg-mint-950/30'
                        : 'border-border-subtle bg-bg-primary hover:border-mint-300 hover:bg-ice-100/50 dark:hover:bg-teal-900/30'
                    )}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-fg-heading">
                          {inst.name}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-fg-secondary">
                          <LocationOnRoundedIcon sx={{ fontSize: 13 }} />
                          {inst.location}
                        </span>
                      </div>
                      <span className="text-xs text-fg-secondary truncate">
                        {inst.fullName}
                      </span>
                      <span className="text-[11px] font-medium text-teal-700 dark:text-mint-400 mt-0.5">
                        {inst.counsellingUnitLabel}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckCircleRoundedIcon className="text-mint-600 dark:text-mint-400" />
                      ) : (
                        <span className="inline-block h-5 w-5 rounded-full border border-border-subtle group-hover:border-mint-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-fg-secondary">
              <span>All student check-ins remain 100% anonymous.</span>
              {isFirstVisit && (
                <button
                  type="button"
                  onClick={() => handleSelect(INSTITUTION_PRESETS[currentId])}
                  className="px-4 py-2 rounded-xl btn-brand text-white font-medium shadow-sm"
                >
                  Continue with {INSTITUTION_PRESETS[currentId].name}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
