import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/theme-context';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`relative p-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
        theme === 'dark'
          ? 'bg-zinc-800/80 hover:bg-zinc-700/80 text-amber-400 border border-zinc-700/60 shadow-inner'
          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
        )}
      </div>
    </button>
  );
};
