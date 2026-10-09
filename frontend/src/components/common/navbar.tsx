import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { ThemeToggle } from './theme-toggle';
import { useTheme } from '../../context/theme-context';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-zinc-950/80 border-b border-zinc-800/80 text-white'
          : 'bg-white/85 border-b border-zinc-200/80 text-zinc-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
              Foomato
            </span>
            <span className="text-[10px] uppercase tracking-widest font-semibold opacity-60">
              Food & Delivery
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className="hover:text-orange-500 transition-colors opacity-80 hover:opacity-100"
          >
            Home
          </Link>
          <a
            href="#features"
            className="hover:text-orange-500 transition-colors opacity-80 hover:opacity-100"
          >
            Features
          </a>
          {isAuthenticated && (
            <Link
              to="/select-role"
              className="hover:text-orange-500 transition-colors opacity-80 hover:opacity-100"
            >
              Role
            </Link>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-500/20">
              <div className="flex items-center gap-2.5">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-9 h-9 rounded-full ring-2 ring-orange-500/40 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight line-clamp-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-orange-500 font-medium uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    {user.role || 'No Role'}
                  </span>
                </div>
              </div>

              <button
                id="logout-btn"
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              id="nav-login-btn"
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
