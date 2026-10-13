import React from 'react';
import { useTheme } from '../../context/use-theme';

export interface LoadingScreenProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Preparing your experience...',
  subtext = 'Fetching fresh flavors and live data',
  fullScreen = true,
}) => {
  const { theme } = useTheme();

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-2xl transition-all duration-300'
    : 'w-full flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 transition-all duration-300';

  const bgClasses = fullScreen
    ? theme === 'dark'
      ? 'bg-zinc-950/95 text-white'
      : 'bg-white/95 text-zinc-900'
    : 'bg-transparent text-inherit';

  return (
    <div className={`${containerClasses} ${bgClasses} animate-in fade-in duration-300`}>
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-tr from-orange-500/15 via-amber-500/15 to-red-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="flex flex-col items-center text-center max-w-sm mx-auto">
        {/* Animated Brand Emblem with Multi-ring Glow */}
        <div className="relative mb-6">
          {/* Outer spinning gradient ring */}
          <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-400 to-red-500 opacity-75 blur-xs animate-spin [animation-duration:4s]" />

          {/* Secondary pulsing aura */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 opacity-60 animate-pulse" />

          {/* Core Logo Container */}
          <div
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center p-3 shadow-2xl transition-transform ${
              theme === 'dark'
                ? 'bg-zinc-900 border border-zinc-700/60 shadow-orange-500/20'
                : 'bg-white border border-zinc-100 shadow-orange-500/20'
            }`}
          >
            <img
              src="/foomato.png"
              alt="Foomato"
              className="w-full h-full object-contain drop-shadow-md select-none"
            />
          </div>
        </div>

        {/* Brand Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
            Foomato
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
        </div>

        {/* Primary Message */}
        <p className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200 tracking-tight mb-1">
          {message}
        </p>

        {/* Subtext description */}
        {subtext && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs font-medium">
            {subtext}
          </p>
        )}

        {/* Animated Loading Dots Indicator */}
        <div className="flex items-center gap-1.5 mt-5">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
