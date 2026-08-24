
import { EMERGENCY_CONTACTS } from '../../config/emergencyContacts';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';

export default function HelpPage() {
  return (
    <div className="flex-1 flex flex-col p-4 max-w-xl mx-auto w-full pt-12">
      <div className="bg-help-50 dark:bg-[#4a2710] p-6 rounded-3xl border border-help-500/20">
        <h1 className="text-2xl font-semibold text-help-600 dark:text-help-500 mb-2">I need help now</h1>
        <p className="text-fg-secondary mb-8">
          If you are in immediate distress or need to speak with someone right away, please use the contacts below. These are direct lines to support at MUST.
        </p>

        <div className="space-y-4">
          {EMERGENCY_CONTACTS.map((contact, idx) => (
            <a
              key={idx}
              href={`tel:${contact.tel}`}
              className="flex items-center justify-between p-4 bg-white dark:bg-bg-secondary rounded-2xl shadow-sm hover:shadow-md transition-shadow focus-ring border border-border-subtle"
            >
              <div>
                <h2 className="font-medium text-fg-primary">{contact.label}</h2>
                <p className="text-fg-secondary text-sm mt-1">{contact.display}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-help-600 text-white flex items-center justify-center flex-shrink-0">
                <PhoneRoundedIcon fontSize="small" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
