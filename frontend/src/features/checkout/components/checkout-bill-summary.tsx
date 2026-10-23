import React from 'react';
import { ShieldCheck, Loader2, Zap, Globe, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import type { PaymentGateway } from '../types/checkout.types';

interface CheckoutBillSummaryProps {
  subTotal: number;
  deliveryFee: number;
  platformFee: number;
  grandTotal: number;
  paymentMethod: PaymentGateway;
  isProcessing: boolean;
  hasAddress: boolean;
  isRestaurantClosed?: boolean;
  onPay: () => void;
}

export const CheckoutBillSummary: React.FC<CheckoutBillSummaryProps> = ({
  subTotal,
  deliveryFee,
  platformFee,
  grandTotal,
  paymentMethod,
  isProcessing,
  hasAddress,
  isRestaurantClosed = false,
  onPay,
}) => {
  const canProceed = hasAddress && !isRestaurantClosed && !isProcessing && subTotal > 0;

  return (
    <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs space-y-5 sticky top-24">
      <h2 className="text-base font-extrabold text-zinc-900 dark:text-white pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        Bill Summary
      </h2>

      <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center justify-between">
          <span>Item Total</span>
          <span className="font-bold text-zinc-900 dark:text-white">
            {formatCurrency(subTotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>Delivery Fee</span>
            {deliveryFee === 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Free
              </span>
            )}
          </div>
          <span className="font-bold text-zinc-900 dark:text-white">
            {deliveryFee === 0 ? (
              <span className="text-emerald-500 font-bold">FREE</span>
            ) : (
              formatCurrency(deliveryFee)
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Platform Fee</span>
          <span className="font-bold text-zinc-900 dark:text-white">
            {formatCurrency(platformFee)}
          </span>
        </div>

        {subTotal < 350 && (
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[11px] font-medium flex items-center justify-between">
            <span>Add {formatCurrency(350 - subTotal)} more for FREE delivery</span>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-sm font-black text-zinc-900 dark:text-white">
          <span>Grand Total</span>
          <span className="text-orange-500 font-extrabold text-lg">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {isRestaurantClosed && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Kitchen Currently Closed</span>
            <span className="text-[11px] opacity-90">
              This kitchen is not accepting new orders right now.
            </span>
          </div>
        </div>
      )}

      {!hasAddress && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>Please select or add a delivery address to pay</span>
        </div>
      )}

      {/* Pay CTA Button */}
      <button
        type="button"
        disabled={!canProceed}
        onClick={onPay}
        className={`w-full py-4 px-5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all shadow-md ${
          !canProceed
            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none'
            : paymentMethod === 'razorpay'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 active:scale-98 cursor-pointer'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/25 active:scale-98 cursor-pointer'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Order & Payment...</span>
          </>
        ) : paymentMethod === 'razorpay' ? (
          <>
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Pay {formatCurrency(grandTotal)} with Razorpay</span>
          </>
        ) : (
          <>
            <Globe className="w-4 h-4 text-indigo-200" />
            <span>Pay {formatCurrency(grandTotal)} with Stripe</span>
          </>
        )}
      </button>

      <div className="flex items-center gap-2 text-[10px] text-zinc-400 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>256-bit Encrypted & PCI-DSS Compliant</span>
      </div>
    </div>
  );
};
