import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { RoleSelectCards } from '../features/auth/components/role-select-cards';
import { useAuth } from '../context/auth-context';
import { useTheme } from '../context/theme-context';

export const SelectRolePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      className={`p-8 sm:p-10 rounded-3xl border backdrop-blur-2xl transition-all duration-300 shadow-2xl max-w-xl mx-auto ${
        theme === 'dark'
          ? 'bg-zinc-900/80 border-zinc-800/90 text-white shadow-black/60'
          : 'bg-white/90 border-zinc-200/90 text-zinc-900 shadow-zinc-300/40'
      }`}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Account Setup</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Select Your Foomato Role
        </h2>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Hey {user?.name || 'there'}! Tell us how you'll be participating in the Foomato network.
        </p>
      </div>

      <RoleSelectCards />
    </div>
  );
};
