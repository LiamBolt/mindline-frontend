import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConsentStore } from '../../stores/consentStore';
import { EMERGENCY_CONTACTS } from '../../config/emergencyContacts';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ConfirmationScreenProps {
  /**
   * When true, this check-in triggered a flagged trend — show appropriate
   * support messaging.  Never include diagnostic language or risk labels.
   */
  referralRecommended: boolean;
}

export default function ConfirmationScreen({ referralRecommended }: ConfirmationScreenProps) {
  const { optedIn } = useConsentStore();

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
        <div className="absolute inset-8 brand-fill rounded-full" />
      </div>

      <h2 className="text-3xl font-semibold text-fg-heading mb-4" aria-live="polite">
        Thank you for checking in.
      </h2>

      <p className="text-lg text-fg-secondary mb-8 max-w-md">
        Taking a moment for yourself matters. We'll keep checking in to see how you're doing over time.
      </p>

      {/* Referral recommendation messaging — only shown when trend was flagged.
          Copy is deliberately non-diagnostic.  Two paths: opted-in vs anonymous. */}
      {referralRecommended && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-full mb-8 rounded-2xl border border-border-subtle bg-bg-secondary p-5 text-left"
        >
          {optedIn ? (
            // Opted-in path: a counsellor may reach out (matches ConsentStep copy)
            <div className="flex gap-3">
              <InfoOutlinedIcon className="text-mint-600 dark:text-mint-400 shrink-0 mt-0.5" fontSize="small" />
              <div>
                <p className="text-sm font-semibold text-fg-heading mb-1">
                  Things have seemed consistently hard lately.
                </p>
                <p className="text-sm text-fg-secondary">
                  Because you chose to be contactable, a counsellor from the support team may reach out to check on you. You're under no obligation — just know that the door is open.
                </p>
              </div>
            </div>
          ) : (
            // Anonymous path: surface in-app resources directly
            <div>
              <div className="flex gap-3 mb-4">
                <InfoOutlinedIcon className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" fontSize="small" />
                <div>
                  <p className="text-sm font-semibold text-fg-heading mb-1">
                    Things have seemed consistently hard lately.
                  </p>
                  <p className="text-sm text-fg-secondary">
                    You're staying anonymous, which we fully respect. If you'd like to talk to someone, here are some direct lines:
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {EMERGENCY_CONTACTS.map((contact, idx) => (
                  <a
                    key={idx}
                    href={`tel:${contact.tel}`}
                    className="flex items-center justify-between p-3 bg-bg-primary rounded-xl border border-border-subtle hover:shadow-sm transition-shadow focus-ring"
                  >
                    <div>
                      <p className="text-sm font-medium text-fg-primary">{contact.label}</p>
                      <p className="text-xs text-fg-secondary">{contact.display}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-mint-100 dark:bg-mint-900/40 text-mint-700 dark:text-mint-300 flex items-center justify-center">
                      <PhoneRoundedIcon fontSize="small" />
                    </div>
                  </a>
                ))}
                <Link
                  to="/help"
                  className="block text-center text-sm text-mint-700 dark:text-mint-300 font-medium mt-2 hover:underline focus-ring rounded p-1"
                >
                  See all support resources →
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <Link
        to="/"
        className="px-10 py-4 btn-brand rounded-2xl text-lg font-medium focus-ring shadow-sm"
      >
        Done
      </Link>
    </div>
  );
}
