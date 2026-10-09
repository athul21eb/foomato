import React from 'react';
import { UtensilsCrossed, Heart } from 'lucide-react';
import { useTheme } from '../../context/theme-context';

export const Footer: React.FC = () => {
  const { theme } = useTheme();

  return (
    <footer
      className={`border-t transition-colors duration-300 py-12 ${
        theme === 'dark'
          ? 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
          : 'bg-zinc-50 border-zinc-200 text-zinc-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Foomato
          </span>
          <span className="text-xs opacity-60">
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs opacity-75">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for next-gen food logistics</span>
        </div>
      </div>
    </footer>
  );
};
