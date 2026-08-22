
import { useA11yStore } from '../../stores/a11yStore';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import { cn } from '../../utils/cn';

export default function SettingsPage() {
  const { theme, setTheme, highContrast, setHighContrast, reduceMotion, setReduceMotion } = useA11yStore();

  return (
    <div className="flex-1 flex flex-col p-4 max-w-xl mx-auto w-full pt-12">
      <h1 className="text-2xl font-semibold mb-8">Settings</h1>
      
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4 text-teal-800 dark:text-teal-100">Appearance</h2>
        
        <div className="bg-bg-secondary rounded-2xl p-2 border border-border-subtle flex flex-wrap gap-2">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              "flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all focus-ring text-sm font-medium",
              theme === 'light' ? "bg-mint-100 dark:bg-teal-800 text-teal-900 dark:text-white shadow-sm" : "text-fg-secondary hover:bg-bg-primary"
            )}
          >
            <LightModeRoundedIcon fontSize="small" className="mr-2" />
            Light
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              "flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all focus-ring text-sm font-medium",
              theme === 'dark' ? "bg-mint-100 dark:bg-teal-800 text-teal-900 dark:text-white shadow-sm" : "text-fg-secondary hover:bg-bg-primary"
            )}
          >
            <DarkModeRoundedIcon fontSize="small" className="mr-2" />
            Dark
          </button>
          
          <button
            onClick={() => setTheme('system')}
            className={cn(
              "flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all focus-ring text-sm font-medium",
              theme === 'system' ? "bg-mint-100 dark:bg-teal-800 text-teal-900 dark:text-white shadow-sm" : "text-fg-secondary hover:bg-bg-primary"
            )}
          >
            <SettingsBrightnessRoundedIcon fontSize="small" className="mr-2" />
            System
          </button>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4 text-teal-800 dark:text-teal-100">Accessibility</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-bg-secondary rounded-2xl border border-border-subtle cursor-pointer focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2 focus-within:ring-offset-bg-primary">
            <div>
              <span className="block font-medium">High Contrast</span>
              <span className="text-sm text-fg-secondary">Increase contrast across the app</span>
            </div>
            <input 
              type="checkbox" 
              className="w-5 h-5 text-mint-600 rounded bg-bg-primary border-border-subtle focus:ring-0 focus:outline-none"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
          </label>
          
          <label className="flex items-center justify-between p-4 bg-bg-secondary rounded-2xl border border-border-subtle cursor-pointer focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2 focus-within:ring-offset-bg-primary">
            <div>
              <span className="block font-medium">Reduce Motion</span>
              <span className="text-sm text-fg-secondary">Minimize animations and transitions</span>
            </div>
            <input 
              type="checkbox" 
              className="w-5 h-5 text-mint-600 rounded bg-bg-primary border-border-subtle focus:ring-0 focus:outline-none"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
