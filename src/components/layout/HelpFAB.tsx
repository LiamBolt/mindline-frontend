
import { Link } from 'react-router-dom';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

export default function HelpFAB() {
  return (
    <div className="hidden lg:block fixed bottom-8 right-8 z-50">
      <Link
        to="/help"
        className="flex items-center justify-center px-5 py-3 bg-help-600 hover:bg-help-500 text-white rounded-full shadow-lg transition-transform hover:-translate-y-1 focus-ring"
        aria-label="I need help now"
      >
        <SupportAgentRoundedIcon className="mr-2" />
        <span className="font-medium text-sm">I need help now</span>
      </Link>
    </div>
  );
}
