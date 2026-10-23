import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Bike, Store, Check, ArrowRight, Loader2 } from 'lucide-react';
import type { Role } from '../types/auth.types';
import { useAuth } from '../../../context/use-auth';
import { useToast } from '../../../context/use-toast';
import { useTheme } from '../../../context/use-theme';
import { CardRevealStagger, CardRevealItem } from '../../../lib/animations';

interface RoleOption {
  id: Role;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLES: RoleOption[] = [
  {
    id: 'customer',
    title: 'Customer',
    badge: 'Foodie',
    description: 'Explore restaurants, order mouthwatering dishes, and track deliveries in real time.',
    icon: ShoppingBag,
  },
  {
    id: 'rider',
    title: 'Delivery Rider',
    badge: 'Partner',
    description: 'Deliver orders across the city on your schedule and earn competitive payouts.',
    icon: Bike,
  },
  {
    id: 'seller',
    title: 'Restaurant Seller',
    badge: 'Seller',
    description: 'Manage menus, showcase your kitchen creations, and supercharge sales.',
    icon: Store,
  },
];

export const RoleSelectCards: React.FC = () => {
  const { user, updateRole, isLoading } = useAuth();
  const { success, error } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<Role>(
    user?.role || 'customer',
  );

  const handleSubmit = async () => {
    try {
      await updateRole(selectedRole);
      success(`Role set to ${selectedRole.toUpperCase()}! Welcome aboard!`);
      if (selectedRole === 'seller') {
        navigate('/seller');
      } else if (selectedRole === 'rider') {
        navigate('/rider');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update role';
      error(message);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <CardRevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 w-full">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isSelected = selectedRole === r.id;

          return (
            <CardRevealItem key={r.id}>
              <button
                type="button"
                id={`role-option-${r.id}`}
                onClick={() => setSelectedRole(r.id)}
                className={`w-full relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl text-left transition-all duration-300 border cursor-pointer ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10 ring-2 ring-orange-500/70 md:-translate-y-1'
                    : theme === 'dark'
                      ? 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`p-2.5 sm:p-3 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                          : theme === 'dark'
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-orange-500/20 text-orange-400'
                            : theme === 'dark'
                              ? 'bg-zinc-800 text-zinc-400'
                              : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {r.badge}
                      </span>

                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500 text-white shadow-xs'
                            : 'border-zinc-500/30 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-base tracking-tight mb-1 text-zinc-900 dark:text-zinc-100">
                    {r.title}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                    {r.description}
                  </p>
                </div>

                <div
                  className={`text-[11px] font-semibold pt-2.5 border-t border-zinc-500/10 flex items-center justify-between ${
                    isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <span>{isSelected ? 'Active Selection' : 'Click to select'}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-orange-500' : 'bg-transparent'
                    }`}
                  />
                </div>
              </button>
            </CardRevealItem>
          );
        })}
      </CardRevealStagger>

      <div className="w-full max-w-md mx-auto pt-2">
        <button
          id="confirm-role-btn"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-98 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating role...</span>
            </>
          ) : (
            <>
              <span>Continue as {selectedRole.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
