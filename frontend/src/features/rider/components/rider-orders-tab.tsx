import React from 'react';
import {
  Bike,
  Package,
  Navigation,
  Clock,
  Compass,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { RiderProfile } from '../types/rider.types';
import { RiderVerificationGuard } from './rider-verification-guard';
import {
  FadeInUp,
  StaggerContainer,
  RevealItem,
  InteractiveCard,
  AnimatedDutyBeacon,
} from '../../../lib/animations';

interface RiderOrdersTabProps {
  rider: RiderProfile;
  onEditClick: () => void;
}

export const RiderOrdersTab: React.FC<RiderOrdersTabProps> = ({
  rider,
  onEditClick,
}) => {
  if (!rider.isVerified) {
    return (
      <RiderVerificationGuard
        rider={rider}
        featureName="Orders"
        onEditClick={onEditClick}
      />
    );
  }

  const [lng, lat] = rider.location?.coordinates || [0, 0];
  const hasCoordinates = !(lat === 0 && lng === 0);

  return (
    <div className="space-y-6">
      {/* Live Dispatch Radar Banner */}
      <FadeInUp>
        <div className="p-6 rounded-3xl bg-linear-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border border-orange-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Compass className="w-7 h-7" />
              </div>
              <div className="absolute -top-1 -right-1">
                <AnimatedDutyBeacon active={rider.isAvailable} color="bg-emerald-500">
                  <span
                    className={`block w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                      rider.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'
                    }`}
                  />
                </AnimatedDutyBeacon>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  Dispatch Radar
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    rider.isAvailable
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30'
                  }`}
                >
                  {rider.isAvailable ? 'Scanning for Orders' : 'Fleet Idle'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-orange-500" />
                <span>
                  Base Hub:{' '}
                  {hasCoordinates
                    ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                    : 'Coordinates Pending'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">
              Acceptance Status:
            </span>
            <span className="font-extrabold text-emerald-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> High Priority Courier
            </span>
          </div>
        </div>
      </FadeInUp>

      {/* Active Orders List / Empty State */}
      <FadeInUp delay={0.1}>
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
              No Active Delivery Assigned
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
              {rider.isAvailable
                ? 'Stay online and nearby restaurant hubs. New incoming delivery requests will beep right here.'
                : 'Turn your duty status to Online to begin receiving nearby pickup requests.'}
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Trip Milestones / Historical Metrics */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RevealItem>
          <InteractiveCard className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Completed Trips
              </span>
              <h4 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                0
              </h4>
              <span className="text-[11px] text-zinc-400">Lifetime dispatches</span>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </InteractiveCard>
        </RevealItem>

        <RevealItem>
          <InteractiveCard className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Avg Drop Time
              </span>
              <h4 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                -- mins
              </h4>
              <span className="text-[11px] text-zinc-400">Target &lt; 25 mins</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Clock className="w-5 h-5" />
            </div>
          </InteractiveCard>
        </RevealItem>

        <RevealItem>
          <InteractiveCard className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Fleet Rating
              </span>
              <h4 className="text-xl font-black text-amber-500 mt-1">
                ★ 5.0
              </h4>
              <span className="text-[11px] text-zinc-400">Customer feedback</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <Bike className="w-5 h-5" />
            </div>
          </InteractiveCard>
        </RevealItem>
      </StaggerContainer>
    </div>
  );
};
