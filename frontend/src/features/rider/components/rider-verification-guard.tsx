import React from 'react';
import {
  ShieldAlert,
  Clock,
  FileCheck2,
  Lock,
  Pencil,
  ArrowRight,
  ShieldCheck,
  Bike,
} from 'lucide-react';
import type { RiderProfile } from '../types/rider.types';
import {
  AnimatedVerificationCard,
  AnimatedLockBadge,
} from '../../../lib/animations';

interface RiderVerificationGuardProps {
  rider: RiderProfile;
  featureName: 'Orders' | 'Wallet';
  onEditClick: () => void;
}

export const RiderVerificationGuard: React.FC<RiderVerificationGuardProps> = ({
  rider,
  featureName,
  onEditClick,
}) => {
  const isOrders = featureName === 'Orders';

  return (
    <AnimatedVerificationCard className="w-full">
      <div className="rounded-3xl border border-amber-500/30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-xl mx-auto text-center relative z-10 space-y-5">
          {/* Lock & Feature Icon Graphic */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/25">
              {isOrders ? (
                <Bike className="w-10 h-10" />
              ) : (
                <Lock className="w-10 h-10" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2">
              <AnimatedLockBadge className="w-8 h-8 rounded-full bg-zinc-900 text-amber-400 border-2 border-white dark:border-zinc-800 flex items-center justify-center shadow-md">
                <ShieldAlert className="w-4 h-4" />
              </AnimatedLockBadge>
            </div>
          </div>

          {/* Status Chip */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25 shadow-xs">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>KYC Verification In Progress</span>
            </span>
          </div>

          {/* Heading & Explanation */}
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {isOrders ? 'Order Dispatch Locked' : 'Rider Wallet Locked'}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
              {isOrders
                ? 'Your courier account is currently awaiting compliance approval. Once verified, active dispatches and customer delivery requests in your zone will unlock automatically.'
                : 'Earnings settlements, trip incentives, and UPI payouts will be activated immediately once your Driving License and Aadhaar KYC are verified by our fleet team.'}
            </p>
          </div>

          {/* Verification Steps Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 text-left space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <span>Submitted Credentials</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Under 24–48h Review
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    Driving License:
                  </span>
                </div>
                <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                  {rider.drivingLicenseNumber || 'Missing'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    Aadhaar Card:
                  </span>
                </div>
                <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                  {rider.aadharNumber
                    ? `•••• •••• ${rider.aadharNumber.replace(/\s+/g, '').slice(-4)}`
                    : 'Missing'}
                </span>
              </div>
            </div>
          </div>

          {/* CTA Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span>Review or Edit Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-zinc-400 mt-2">
              Made a typo in your license number or name? You can edit them anytime.
            </p>
          </div>
        </div>
      </div>
    </AnimatedVerificationCard>
  );
};
