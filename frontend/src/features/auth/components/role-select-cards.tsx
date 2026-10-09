import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Bike, Store, Check, ArrowRight, Loader2 } from 'lucide-react';
import type { Role } from '../types/auth.types';
import { useAuth } from '../../../context/auth-context';
import { useToast } from '../../../context/use-toast';
import { useTheme } from '../../../context/theme-context';

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
    badge: 'Merchant',
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
      navigate('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update role';
      error(message);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 gap-4">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isSelected = selectedRole === r.id;

          return (
            <button
              key={r.id}
              type="button"
              id={`role-option-${r.id}`}
              onClick={() => setSelectedRole(r.id)}
              className={`relative flex items-start gap-4 p-5 rounded-2xl text-left transition-all duration-300 border cursor-pointer ${
                isSelected
                  ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500'
                  : theme === 'dark'
                    ? 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300'
              }`}
            >
              <div
                className={`p-3 rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-orange-500 text-white'
                    : theme === 'dark'
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-base tracking-tight">
                    {r.title}
                  </h4>
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
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  isSelected
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-zinc-500/30 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

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
  );
};
