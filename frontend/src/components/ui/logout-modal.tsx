import React, { useEffect } from 'react';
import { LogOut, X, AlertTriangle, Shield, User as UserIcon } from 'lucide-react';
import { useTheme } from '../../context/use-theme';
import { useAuth } from '../../context/use-auth';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roleLabel =
    user?.role === 'seller'
      ? 'Restaurant Seller'
      : user?.role === 'rider'
      ? 'Delivery Partner'
      : user?.role === 'customer'
      ? 'Customer'
      : 'User';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all flex flex-col animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-black/80'
            : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xl'
        }`}
      >
        {/* Top Danger Gradient Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 shrink-0" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-500/10 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Header with Icon */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500/20 to-orange-500/20 text-red-500 dark:text-red-400 flex items-center justify-center shadow-md border border-red-500/20 shrink-0">
              <LogOut className="w-6 h-6 ml-0.5" />
            </div>

            <div className="space-y-1 pr-6">
              <h3 className="text-xl font-extrabold tracking-tight">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Are you sure you want to end your active Foomato session?
              </p>
            </div>
          </div>

          {/* User Account Capsule */}
          {user && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                theme === 'dark'
                  ? 'bg-zinc-800/50 border-zinc-700/60'
                  : 'bg-zinc-50 border-zinc-200/80'
              }`}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full ring-2 ring-red-500/30 object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight truncate">
                  {user.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-zinc-400 truncate">
                    {user.email || 'Google Account'}
                  </span>
                  <span>•</span>
                  <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" />
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning Note */}
          <div className="flex items-start gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              You will need to re-authenticate with Google next time you access your store, cart, or delivery dashboard.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoggingOut}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              Cancel
            </button>

            <button
              id="confirm-nav-logout-btn"
              type="button"
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
