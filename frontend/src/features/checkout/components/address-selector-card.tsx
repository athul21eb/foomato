import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  ChevronRight,
  Phone,
  FileText,
  AlertCircle,
  Plus,
} from 'lucide-react';
import type { CustomerAddress } from '../../customer/types/address.types';

interface AddressSelectorCardProps {
  selectedAddress: CustomerAddress | null;
  addresses: CustomerAddress[];
  isLoading: boolean;
  onOpenAddressModal: () => void;
}

export const AddressSelectorCard: React.FC<AddressSelectorCardProps> = ({
  selectedAddress,
  addresses,
  isLoading,
  onOpenAddressModal,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        </div>
        <div className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      </div>
    );
  }

  // Zero saved addresses: prompt to navigate to /address page
  if (!addresses || addresses.length === 0 || !selectedAddress) {
    return (
      <div className="p-6 rounded-3xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                No Delivery Address Found
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-md leading-relaxed">
                You haven&apos;t added any delivery addresses yet. Add your home, office, or live location to complete your food order.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/address', { state: { returnTo: '/checkout' } })}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Address</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Location Pin & Heading */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Delivery Destination
            </span>
            {selectedAddress.isDefault && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Default
              </span>
            )}
          </div>

          {/* Formatted Address */}
          <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug">
            {selectedAddress.formattedAddress}
          </p>

          {/* Contact Mobile */}
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>+91 {selectedAddress.mobile}</span>
          </div>

          {/* Instructions note if present */}
          {selectedAddress.instructions && (
            <div className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 mt-2">
              <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="italic line-clamp-2">
                &quot;{selectedAddress.instructions}&quot;
              </span>
            </div>
          )}
        </div>

        {/* Right: Change / Switch Address Button */}
        <button
          type="button"
          onClick={onOpenAddressModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 transition-all cursor-pointer shrink-0"
        >
          <span>Change</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
