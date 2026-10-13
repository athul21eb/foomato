import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, User as UserIcon, Shield, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/use-auth';
import { ThemeToggle } from './theme-toggle';
import { useTheme } from '../../context/use-theme';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-zinc-950/80 border-b border-zinc-800/80 text-white'
          : 'bg-white/85 border-b border-zinc-200/80 text-zinc-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
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
            href="#categories"
            className="hover:text-orange-500 transition-colors opacity-80 hover:opacity-100"
          >
            Categories
          </a>
          <a
            href="#restaurants"
            className="hover:text-orange-500 transition-colors opacity-80 hover:opacity-100"
          >
            Featured
          </a>
          <a
            href="#how-it-works"
            className="hover:text-orange-500 transition-colors opacity-80 hover:opacity-100"
          >
            How It Works
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Cart Icon - Exclusively for Customer role */}
          {isAuthenticated && user?.role === 'customer' && (
            <Link
              id="nav-cart-btn"
              to="/account"
              title="Customer Cart & Orders"
              className={`relative p-2.5 rounded-2xl border transition-all flex items-center justify-center group ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-orange-400 hover:border-orange-500/40'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:text-orange-600 hover:border-orange-500/40 shadow-xs'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-orange-500/30">
                1
              </span>
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-500/20">
              <Link
                to="/account"
                title="View My Account"
                className="flex items-center gap-2.5 p-1.5 -m-1.5 rounded-2xl hover:bg-orange-500/10 transition-colors group cursor-pointer"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-9 h-9 rounded-full ring-2 ring-orange-500/40 object-cover group-hover:ring-orange-500 transition-all"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-orange-500 font-medium uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    {user.role || 'No Role'}
                  </span>
                </div>
              </Link>
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
