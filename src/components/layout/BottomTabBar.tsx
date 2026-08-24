import { NavLink } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import type { SvgIconComponent } from '@mui/icons-material';
import { cn } from '../../utils/cn';

type Tab = {
  name: string;
  path: string;
  icon: SvgIconComponent;
  isHelp?: boolean;
};

const tabs: Tab[] = [
  { name: 'Home', path: '/', icon: HomeRoundedIcon },
  { name: 'Check-in', path: '/check-in', icon: SelfImprovementRoundedIcon },
  { name: 'Help', path: '/help', icon: SupportAgentRoundedIcon, isHelp: true },
  { name: 'More', path: '/settings', icon: MenuRoundedIcon },
];

export default function BottomTabBar() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 calm-glass-panel pb-[env(safe-area-inset-bottom)] border-t border-glass-border">
      <nav className="flex justify-around items-center h-16 px-2" aria-label="Primary">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.name}
              to={tab.path}
              end
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 focus-ring rounded-xl transition-colors duration-fast",
                isActive
                  ? "text-teal-800 dark:text-teal-50"
                  : "text-teal-600/80 dark:text-teal-300/80",
                tab.isHelp && !isActive && "text-help-600/80 dark:text-help-500/80",
                tab.isHelp && isActive && "text-help-600 dark:text-help-500"
              )}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "flex items-center justify-center w-[52px] h-8 rounded-full transition-colors duration-fast",
                      isActive && !tab.isHelp && "bg-mint-100 dark:bg-mint-900/80",
                      isActive && tab.isHelp && "bg-help-50 dark:bg-help-600/20"
                    )}
                  >
                    <Icon fontSize="small" />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] tracking-wide",
                      isActive ? "font-semibold" : "font-medium"
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
