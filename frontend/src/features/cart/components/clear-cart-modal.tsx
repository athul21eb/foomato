import React, { useEffect } from 'react';
import { Trash2, X, AlertCircle, Loader2 } from 'lucide-react';

interface ClearCartModalProps {
  isOpen: boolean;
  itemCount: number;
  sellerName?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isClearing?: boolean;
}

export const ClearCartModal: React.FC<ClearCartModalProps> = ({
  isOpen,
  itemCount,
  sellerName,
  onConfirm,
  onCancel,
  isClearing = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClearing) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isClearing]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!isClearing) onCancel();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
      >
        {/* Top Danger Gradient Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 shrink-0" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isClearing}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1 pr-6">
              <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Clear your cart?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                This will remove all items from your current order.
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}{' '}
                {sellerName ? `from ${sellerName}` : ''}
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
              Are you sure you want to empty your cart? You will need to add your dishes again to complete an order.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <button
              type="button"
              onClick={onCancel}
              disabled={isClearing}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isClearing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              {isClearing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Clearing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Clear Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearCartModal;
