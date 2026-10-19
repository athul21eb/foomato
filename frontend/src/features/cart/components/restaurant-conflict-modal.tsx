import React from 'react';
import { AlertTriangle, Trash2, ArrowRight } from 'lucide-react';
import type { CartItemInput } from '../hooks/useCart';

interface RestaurantConflictModalProps {
  isOpen: boolean;
  currentRestaurantName?: string | null;
  pendingItem?: CartItemInput | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RestaurantConflictModal: React.FC<RestaurantConflictModalProps> = ({
  isOpen,
  currentRestaurantName,
  pendingItem,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !pendingItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white">
              Replace cart items?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Only items from one restaurant can be ordered at a time.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 leading-relaxed">
          <p>
            Your cart already contains dishes from{' '}
            <span className="font-bold text-zinc-900 dark:text-white">
              {currentRestaurantName || 'another restaurant'}
            </span>
            .
          </p>
          <p>
            Do you want to discard your current cart and start a fresh order
            with{' '}
            <span className="font-bold text-orange-500">
              {pendingItem.name}
            </span>{' '}
            from{' '}
            <span className="font-bold text-zinc-900 dark:text-white">
              {pendingItem.sellerName || 'this kitchen'}
            </span>
            ?
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard & Add</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
