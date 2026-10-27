import React from 'react';
import {
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowDownLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { FadeInUp } from '../../../lib/animations';

export const CustomerWalletTab: React.FC = () => {
  const handleDummyAction = () => {
    toast.info('Wallet Feature Coming Soon', {
      description: 'Instant refunds and one-click wallet payments will be enabled shortly!',
    });
  };

  return (
    <FadeInUp className="space-y-6">
      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-950 p-6 sm:p-8 text-white shadow-2xl border border-zinc-700/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-amber-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Foomato Cash • Wallet</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
              Available Balance
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                ₹0.00
              </h2>
              <span className="text-xs text-zinc-400 font-medium">INR</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm">
              Use Foomato Cash for instant checkouts, auto-applied offers, and zero-delay refunds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDummyAction}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Money</span>
            </button>
            <button
              type="button"
              onClick={handleDummyAction}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-semibold text-sm border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Send Gift</span>
            </button>
          </div>
        </div>

        {/* Quick Top-up Badges */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-zinc-400 font-medium">Quick Add:</span>
          {['+ ₹100', '+ ₹250', '+ ₹500', '+ ₹1,000'].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={handleDummyAction}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-semibold text-zinc-200 border border-white/10 transition-all cursor-pointer"
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      {/* Perks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md flex items-start gap-3.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
              Instant 1-Second Refunds
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Cancelled or failed orders are credited instantly back to your wallet with zero bank processing wait.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md flex items-start gap-3.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
              One-Tap Ultra Checkout
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Bypass payment OTPs and bank gateways for lightning-fast food deliveries during peak hours.
            </p>
          </div>
        </div>
      </div>

      {/* Mocked Transactions Feed */}
      <div className="rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Recent Wallet Activity
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
            Preview Mode
          </span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  Welcome Promotional Credit
                </p>
                <p className="text-[10px] text-zinc-400">Foomato Signup Reward</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +₹0.00
              </p>
              <p className="text-[10px] text-zinc-400">Unlocked on Launch</p>
            </div>
          </div>
        </div>
      </div>
    </FadeInUp>
  );
};
