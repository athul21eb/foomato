import React from 'react';
import { useUpdateSellerStatusMutation } from '../api/seller.api';
import { getErrorMessage } from '../../../lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SellerStatusToggleProps {
  isOpen: boolean;
  compact?: boolean;
}

export const SellerStatusToggle: React.FC<SellerStatusToggleProps> = ({
  isOpen,
  compact = false,
}) => {
  const [updateStatus, { isLoading }] = useUpdateSellerStatusMutation();

  const handleToggle = async () => {
    try {
      const nextStatus = !isOpen;
      await updateStatus({ isOpen: nextStatus }).unwrap();
      if (nextStatus) {
        toast.success('Store is now OPEN and accepting orders');
      } else {
        toast.info('Store is now CLOSED');
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update store status'));
    }
  };

  // Compact variant: Small inline pill switch
  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        type="button"
        title={isOpen ? 'Click to close store' : 'Click to open store'}
        className={`inline-flex items-center justify-center gap-2 w-20 px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-200 cursor-pointer ${
          isOpen
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15'
            : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/15'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin text-zinc-500 shrink-0" />
        ) : (
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOpen ? 'bg-emerald-500' : 'bg-zinc-400'
            }`}
          />
        )}
        <span>{isOpen ? 'Open' : 'Closed'}</span>
      </button>
    );
  }

  // Minimal, elegant standard switch with locked layout dimensions
  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 p-4 shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Minimal Status Details */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Store Status
            </span>
            <span
              className={`inline-flex items-center justify-center gap-1.5 w-20 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors duration-200 ${
                isOpen
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isOpen ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
              />
              <span>{isOpen ? 'Open' : 'Closed'}</span>
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 h-4 flex items-center leading-none">
            {isOpen
              ? 'Accepting live orders from customers'
              : 'Store is paused and offline'}
          </p>
        </div>

        {/* Right: Clean, Standard Minimalist Switch */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          type="button"
          role="switch"
          aria-checked={isOpen}
          title={isOpen ? 'Click to close store' : 'Click to open store'}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed ${
            isOpen ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
          }`}
        >
          <span className="sr-only">Toggle store operating status</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none h-5 w-5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out flex items-center justify-center ${
              isOpen ? 'translate-x-5' : 'translate-x-0'
            }`}
          >
            {isLoading && (
              <Loader2 className="w-3 h-3 text-zinc-400 animate-spin shrink-0" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SellerStatusToggle;
