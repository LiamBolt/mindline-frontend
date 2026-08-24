import { NavLink } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { cn } from '../../utils/cn';

const tabs = [
  { name: 'Home', path: '/', icon: HomeRoundedIcon },
  { name: 'Check-in', path: '/check-in', icon: SelfImprovementRoundedIcon, isPrimary: true },
  { name: 'Help', path: '/help', icon: SupportAgentRoundedIcon, isHelp: true },
  { name: 'More', path: '/settings', icon: MenuRoundedIcon },
] as const;

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
                "flex flex-col items-center justify-center w-full h-full space-y-1 focus-ring rounded-xl transition-colors duration-fast",
                isActive
                  ? "text-teal-800 dark:text-teal-100"
                  : "text-teal-600 dark:text-teal-300",
                tab.isHelp && "text-help-600 dark:text-help-500",
                tab.isHelp && isActive && "text-help-600 dark:text-help-500"
              )}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "relative flex items-center justify-center rounded-full transition-all duration-fast",
                      tab.isPrimary ? "w-12 h-8" : "w-8 h-8",
                      isActive && tab.isPrimary && "bg-mint-100 dark:bg-mint-900",
                      isActive && !tab.isPrimary && "scale-110"
                    )}
                  >
                    <Icon fontSize={tab.isPrimary ? "medium" : "small"} />
                    {isActive && (
                      <span
                        className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-current"
                        aria-hidden
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-medium tracking-wide">
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
