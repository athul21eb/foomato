import React, { useState } from 'react';
import { Power, ShieldAlert, Navigation, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useToggleAvailabilityMutation } from '../api/rider.api';
import type { RiderProfile } from '../types/rider.types';
import { getErrorMessage } from '../../../lib/utils';
import {
  ScaleIn,
  AnimatedDutyBeacon,
  AnimatedGlowContainer,
  AnimatedShimmerBadge,
} from '../../../lib/animations';

interface RiderAvailabilityToggleProps {
  rider: RiderProfile;
}

export const RiderAvailabilityToggle: React.FC<RiderAvailabilityToggleProps> = ({
  rider,
}) => {
  const [toggleAvailability, { isLoading: isUpdating }] =
    useToggleAvailabilityMutation();
  const [isLocating, setIsLocating] = useState(false);

  const handleToggle = async () => {
    if (!rider.isVerified) {
      toast.error(
        'Verification required: Your account documents are under admin review. You can go online once verified.',
      );
      return;
    }

    const nextAvailable = !rider.isAvailable;

    // Get current GPS location when going online or offline
    setIsLocating(true);
    let lat = rider.location?.coordinates?.[1] || 12.9716;
    let lng = rider.location?.coordinates?.[0] || 77.5946;

    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
              maximumAge: 10000,
            });
          },
        );
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (geoError: unknown) {
        console.warn(
          'Geolocation retrieval fell back to saved coordinates:',
          geoError,
        );
      }
    }
    setIsLocating(false);

    try {
      await toggleAvailability({
        isAvailable: nextAvailable,
        latitude: lat,
        longitude: lng,
      }).unwrap();

      if (nextAvailable) {
        toast.success('You are now ONLINE and ready for delivery dispatches!');
      } else {
        toast.info('You are now OFFLINE. Rest up!');
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update duty status'));
    }
  };

  const isBusy = isUpdating || isLocating;

  return (
    <ScaleIn className="w-full">
      <AnimatedGlowContainer active={rider.isAvailable} className="rounded-2xl">
        <div
          className={`relative overflow-hidden rounded-2xl border transition-all duration-300 px-4 py-2.5 sm:px-5 sm:py-2.5 ${
            rider.isAvailable
              ? 'bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 dark:border-emerald-500/20'
              : 'bg-zinc-900/40 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AnimatedDutyBeacon active={rider.isAvailable} color="bg-emerald-500">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                    rider.isAvailable
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {isBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin text-inherit" />
                  ) : (
                    <Power className="w-4 h-4" />
                  )}
                </div>
              </AnimatedDutyBeacon>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-tight">
                    Duty Status:
                  </h3>
                  {rider.isAvailable ? (
                    <AnimatedShimmerBadge className="rounded-full">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        Online
                      </span>
                    </AnimatedShimmerBadge>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      Offline
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  {rider.isAvailable
                    ? 'Transmitting live GPS to dispatcher. Orders will alert here.'
                    : 'Switch on to broadcast availability and receive nearby orders.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
              {!rider.isVerified && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Verification Pending</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleToggle}
                disabled={isBusy || !rider.isVerified}
                className={`relative inline-flex h-8 sm:h-8.5 items-center justify-center gap-1.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                  rider.isAvailable
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isLocating ? 'Locating...' : 'Updating...'}</span>
                  </>
                ) : rider.isAvailable ? (
                  <>
                    <Power className="w-3.5 h-3.5" />
                    <span>Go Offline</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Go Online</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
    </AnimatedGlowContainer>
  </ScaleIn>
  );
};

export default RiderAvailabilityToggle;
