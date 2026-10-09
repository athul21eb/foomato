import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { ThemeToggle } from '../components/common/theme-toggle';
import { useTheme } from '../context/theme-context';

export const AuthLayout: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f4f4f5] text-zinc-900'
      }`}
    >
      {/* Background ambient radial gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-orange-500/15 to-amber-500/15 rounded-full blur-3xl" />
      </div>

      {/* Top action bar */}
      <header className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-5xl mx-auto w-[calc(100%-3rem)]">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Foomato
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Form Slot */}
      <main className="w-full max-w-md my-16 z-10">
        <Outlet />
      </main>

      <footer className="text-xs text-zinc-500 pb-6 text-center">
        Secured with industrial cryptographic authentication
      </footer>
    </div>
  );
};
