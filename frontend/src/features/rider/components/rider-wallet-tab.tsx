import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  CreditCard,
  TrendingUp,
  Receipt,
  Sparkles,
  IndianRupee,
  Calendar,
} from 'lucide-react';
import type { RiderProfile } from '../types/rider.types';
import { RiderVerificationGuard } from './rider-verification-guard';
import {
  FadeInUp,
  InteractiveCard,
  AnimatedNumberTicker,
  AnimatedBentoStatCard,
} from '../../../lib/animations';

interface RiderWalletTabProps {
  rider: RiderProfile;
  onEditClick: () => void;
}

export const RiderWalletTab: React.FC<RiderWalletTabProps> = ({
  rider,
  onEditClick,
}) => {
  if (!rider.isVerified) {
    return (
      <RiderVerificationGuard
        rider={rider}
        featureName="Wallet"
        onEditClick={onEditClick}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Hero Card */}
      <FadeInUp>
        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-orange-500 via-amber-500 to-orange-600 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-orange-100 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" /> Available Payout Balance
              </span>
              <div className="text-3xl sm:text-4xl font-black mt-2 flex items-center">
                <span>₹</span>
                <AnimatedNumberTicker value={0} decimals={2} />
              </div>
              <p className="text-xs text-orange-100/90 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Next automatic payout: Next Monday
              </p>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-orange-600 font-bold text-sm shadow-md hover:bg-orange-50 transition-all cursor-not-allowed opacity-80"
              title="Minimum balance of ₹200 required for manual withdrawal"
            >
              <span>Instant Cashout</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </FadeInUp>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnimatedBentoStatCard delay={0.05} className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Trip Earnings
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            ₹0.00
          </div>
          <p className="text-xs text-zinc-400 mt-1">Per-order standard payouts</p>
        </AnimatedBentoStatCard>

        <AnimatedBentoStatCard delay={0.1} className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Customer Tips
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            ₹0.00
          </div>
          <p className="text-xs text-emerald-500 font-semibold mt-1">100% passed to you</p>
        </AnimatedBentoStatCard>

        <AnimatedBentoStatCard delay={0.15} className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Fleet Incentives
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            ₹0.00
          </div>
          <p className="text-xs text-zinc-400 mt-1">Peak hour & rain surge bonus</p>
        </AnimatedBentoStatCard>
      </div>

      {/* Payout Destination Account */}
      <FadeInUp delay={0.2}>
        <InteractiveCard className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Settlement Method
                </h4>
                <p className="text-xs text-zinc-400">
                  Daily & weekly payouts automatically transfer here
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Active UPI / Direct Bank
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">
              Registered Phone for UPI:
            </span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">
              {rider.phoneNumber ? `+91 ${rider.phoneNumber}` : 'Pending setup'}
            </span>
          </div>
        </InteractiveCard>
      </FadeInUp>

      {/* Recent Transactions List */}
      <FadeInUp delay={0.25}>
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
            No Payout Transactions Yet
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            When you complete customer food deliveries, trip payments and tips will appear here instantly.
          </p>
        </div>
      </FadeInUp>
    </div>
  );
};
