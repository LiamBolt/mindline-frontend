import { NavLink } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import type { SvgIconComponent } from '@mui/icons-material';
import { cn } from '../../utils/cn';

type Tab = {
  name: string;
  path: string;
  icon: SvgIconComponent;
  isHelp?: boolean;
};

// 3 clean student tabs. 'More' has been consolidated into the TopNav hamburger
// to eliminate hamburger redundancy on mobile.
const tabs: Tab[] = [
  { name: 'Home', path: '/', icon: HomeRoundedIcon },
  { name: 'Check-in', path: '/check-in', icon: SelfImprovementRoundedIcon },
  { name: 'Help', path: '/help', icon: SupportAgentRoundedIcon, isHelp: true },
];

export default function BottomTabBar() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F1A33]/95 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)] border-t border-border-subtle shadow-2xl">
      <nav className="flex justify-around items-center h-16 px-4 max-w-md mx-auto" aria-label="Primary mobile navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.name}
              to={tab.path}
              end
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 focus-ring rounded-2xl transition-colors duration-fast',
                  isActive
                    ? 'text-teal-800 dark:text-teal-50'
                    : 'text-teal-600/80 dark:text-teal-300/80',
                  tab.isHelp && !isActive && 'text-help-600/80 dark:text-help-500/80',
                  tab.isHelp && isActive && 'text-help-600 dark:text-help-500'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'flex items-center justify-center w-14 h-8 rounded-full transition-colors duration-fast',
                      isActive && !tab.isHelp && 'bg-mint-100 dark:bg-mint-900/80 text-mint-900 dark:text-mint-100',
                      isActive && tab.isHelp && 'bg-help-50 dark:bg-help-600/20 text-help-700 dark:text-help-400'
                    )}
                  >
                    <Icon fontSize="small" />
                  </div>
                  <span
                    className={cn(
                      'text-[11px] tracking-wide',
                      isActive ? 'font-semibold' : 'font-medium'
                    )}
                  >
                    {tab.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
