import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Shield,
  ShoppingBag,
  Store,
  Bike,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/use-auth';
import { ThemeToggle } from './theme-toggle';
import { useTheme } from '../../context/use-theme';
import { LogoutModal } from '../ui/logout-modal';
import { toast } from 'sonner';
import { useAppSelector } from '../../app/hooks';

interface RoleNavProps {
  onOpenLogout: () => void;
}

/**
 * Minimalist Navbar for Restaurant Sellers
 */
const SellerNavbar: React.FC<RoleNavProps> = ({ onOpenLogout }) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-zinc-950/85 border-b border-zinc-800/80 text-white'
          : 'bg-white/90 border-b border-zinc-200/80 text-zinc-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Seller Hub Badge */}
        <Link to="/seller" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
            <img
              src="/foomato.png"
              alt="Foomato"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Foomato
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-500 border border-orange-500/20">
                Seller Hub
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
              seller Management
            </span>
          </div>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* User Profile & Role Info */}
          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-500/20">
              <div className="flex items-center gap-2.5">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-8 h-8 rounded-full ring-2 ring-orange-500/40 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0) || 'S'}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight line-clamp-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Store className="w-2.5 h-2.5" />
                    Seller
                  </span>
                </div>
              </div>

              {/* Logout Button: triggers LogoutModal */}
              <button
                type="button"
                onClick={onOpenLogout}
                title="Sign out of seller portal"
                className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * Minimalist Navbar for Delivery Riders
 */
const RiderNavbar: React.FC<RoleNavProps> = ({ onOpenLogout }) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-zinc-950/85 border-b border-zinc-800/80 text-white'
          : 'bg-white/90 border-b border-zinc-200/80 text-zinc-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Rider Fleet Badge */}
        <Link to="/rider" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
            <img
              src="/foomato.png"
              alt="Foomato"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Foomato
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                Rider Fleet
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
              Delivery Partner Portal
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden sm:flex items-center gap-2">
          <Link
            to="/rider"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Rider Dashboard</span>
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-500/20">
              <div className="flex items-center gap-2.5">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-8 h-8 rounded-full ring-2 ring-emerald-500/40 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0) || 'R'}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight line-clamp-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Bike className="w-2.5 h-2.5" />
                    Delivery Partner
                  </span>
                </div>
              </div>

              {/* Logout Button: triggers LogoutModal */}
              <button
                type="button"
                onClick={onOpenLogout}
                title="Sign out of rider portal"
                className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * Standard Consumer / Customer Navbar
 */
const CustomerNavbar: React.FC<RoleNavProps> = ({ onOpenLogout }) => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const cartTotalQuantity = useAppSelector((state) => state.cart.totalQuantity);

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
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <img
              src="/foomato.png"
              alt="Foomato"
              className="w-full h-full object-contain"
            />
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

          {/* Cart Icon - Redirects to /cart blank page */}
          {(!user || user.role === 'customer') && (
            <Link
              id="nav-cart-btn"
              to="/cart"
              title="Shopping Cart"
              className={`relative p-2.5 rounded-2xl border transition-all flex items-center justify-center group cursor-pointer ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-orange-400 hover:border-orange-500/40'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:text-orange-600 hover:border-orange-500/40 shadow-xs'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
              {cartTotalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-orange-500/30">
                  {cartTotalQuantity}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-500/20">
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

              {/* Logout Button: triggers LogoutModal */}
              <button
                type="button"
                onClick={onOpenLogout}
                title="Sign out of account"
                className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer ml-1"
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

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    const logoutTask = logout();
    navigate('/login', { replace: true });
    await logoutTask;
    toast.success('Signed out successfully. See you again!');
  };

  return (
    <>
      {isAuthenticated && user?.role === 'seller' ? (
        <SellerNavbar onOpenLogout={() => setIsLogoutModalOpen(true)} />
      ) : isAuthenticated && user?.role === 'rider' ? (
        <RiderNavbar onOpenLogout={() => setIsLogoutModalOpen(true)} />
      ) : (
        <CustomerNavbar onOpenLogout={() => setIsLogoutModalOpen(true)} />
      )}

      {/* Confirmation Modal for Nav Logout */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Navbar;
