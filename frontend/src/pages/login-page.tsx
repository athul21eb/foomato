import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShieldAlert } from 'lucide-react';
import { GoogleLoginBtn } from '../features/auth/components/google-login-btn';
import { useAuth } from '../context/auth-context';
import { useTheme } from '../context/theme-context';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (!user?.role) {
        navigate('/select-role');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div
      className={`p-8 sm:p-10 rounded-3xl border backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
        theme === 'dark'
          ? 'bg-zinc-900/80 border-zinc-800/90 text-white shadow-black/60'
          : 'bg-white/90 border-zinc-200/90 text-zinc-900 shadow-zinc-300/40'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-4 animate-bounce duration-1000">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Welcome to Foomato
        </h2>
        <p className="text-sm text-zinc-500 max-w-xs">
          Sign in securely to explore menus, manage deliveries, or run your kitchen.
        </p>
      </div>

      {/* Google Login Component */}
      <div className="w-full flex justify-center my-4">
        <GoogleLoginBtn />
      </div>

      {/* Privacy & Terms Note */}
      <div className="mt-8 pt-6 border-t border-zinc-500/10 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Single sign-on protected by Google Identity Services</span>
        </div>
      </div>
    </div>
  );
};
