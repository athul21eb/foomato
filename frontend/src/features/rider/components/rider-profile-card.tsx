import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Phone,
  CreditCard,
  FileText,
  MapPin,
  Calendar,
  Clock,
  Pencil,
  Bike,
} from 'lucide-react';
import type { RiderProfile } from '../types/rider.types';
import {
  FadeInUp,
  InteractiveCard,
  AnimatedShimmerBadge,
  AnimatedDutyBeacon,
} from '../../../lib/animations';
import { useAuth } from '../../../context/use-auth';
import { RiderEditModal } from './rider-edit-modal';
import { useRiderLocationName } from '../hooks/use-rider-location-name';

interface RiderProfileCardProps {
  rider: RiderProfile;
  onEditClick?: () => void;
}

export const RiderProfileCard: React.FC<RiderProfileCardProps> = ({
  rider,
  onEditClick,
}) => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const handleEdit = onEditClick || (() => setIsEditModalOpen(true));
  const [imgError, setImgError] = useState(false);

  // Mask Aadhaar number for security (show only last 4 digits)
  const cleanAadhaar = rider.aadharNumber?.replace(/\s+/g, '') || '';
  const maskedAadhaar =
    cleanAadhaar.length === 12
      ? `•••• •••• ${cleanAadhaar.slice(8)}`
      : cleanAadhaar.length > 0
      ? cleanAadhaar
      : 'Not provided';

  const formattedDate = rider.createdAt
    ? new Date(rider.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const [lng, lat] = rider.location?.coordinates || [0, 0];
  const hasValidCoordinates = !(lat === 0 && lng === 0);

  const { placeName } = useRiderLocationName(
    rider.location?.coordinates,
    rider.location?.formattedAddress,
  );

  return (
    <>
      <FadeInUp className="w-full">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Top Banner Accent */}
          <div className="h-14 sm:h-16 bg-linear-to-r from-orange-500 via-amber-500 to-emerald-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
            <div className="absolute top-2.5 right-3 flex items-center gap-2">
              {rider.isVerified ? (
                <AnimatedShimmerBadge className="rounded-full shadow-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Courier
                  </span>
                </AnimatedShimmerBadge>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/90 text-white shadow-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Pending Verification
                </span>
              )}

              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 hover:bg-black/60 text-white text-[11px] font-bold backdrop-blur-md shadow-xs transition-all cursor-pointer border border-white/20 hover:scale-102 active:scale-98"
              >
                {rider.isVerified ? (
                  <>
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>Update Location</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-3 h-3 text-orange-400" />
                    <span>Edit Details</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-4 sm:px-6 pb-3 sm:pb-3.5 pt-0 relative">
            {/* Avatar and Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 -mt-8 sm:-mt-9 mb-2.5">
              <div className="flex items-end gap-3">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-900 shadow-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {rider.picture && !imgError ? (
                      <img
                        src={rider.picture}
                        alt={rider.riderName || 'Rider Avatar'}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-orange-500 to-amber-500 flex flex-col items-center justify-center text-white">
                        <Bike className="w-8 h-8 mb-0.5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          Courier
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0.5 right-0.5">
                    <AnimatedDutyBeacon active={rider.isAvailable} color="bg-emerald-500">
                      <span
                        className={`block w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${
                          rider.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'
                        }`}
                        title={rider.isAvailable ? 'Online' : 'Offline'}
                      />
                    </AnimatedDutyBeacon>
                  </div>
                </div>

                <div className="mb-0.5 min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white truncate">
                    {rider.riderName || 'Courier Partner'}
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {user?.email || 'Registered Courier Account'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Partner since {formattedDate}</span>
              </div>
            </div>

            {/* Details Grid (Ultra Compact) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
              {/* Phone */}
              <InteractiveCard className="p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 dark:text-orange-400 shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-zinc-400 font-medium">Phone</p>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {rider.phoneNumber ? `+91 ${rider.phoneNumber}` : 'Not provided'}
                    </p>
                  </div>
                </div>
              </InteractiveCard>

              {/* Aadhaar */}
              <InteractiveCard className="p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-zinc-400 font-medium">Aadhaar</p>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono truncate">
                      {maskedAadhaar}
                    </p>
                  </div>
                </div>
              </InteractiveCard>

              {/* Driving License */}
              <InteractiveCard className="p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-zinc-400 font-medium">License</p>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono truncate">
                      {rider.drivingLicenseNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </InteractiveCard>

              {/* GPS Base */}
              <InteractiveCard className="p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 dark:text-purple-400 shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-zinc-400 font-medium">Service Base</p>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate" title={placeName}>
                      {placeName}
                    </p>
                    {hasValidCoordinates && (
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              </InteractiveCard>
            </div>

            {/* Verification Status Explainer Banner */}
            {!rider.isVerified ? (
              <div className="mt-2.5 p-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="text-[11px] text-amber-800 dark:text-amber-300 min-w-0">
                  <span className="font-bold">Documents Under Review: </span>
                  <span>Aadhaar & License are undergoing 24–48h verification. Dispatches unlock once approved.</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </FadeInUp>

      {/* Edit Courier Details Modal */}
      {!onEditClick && isEditModalOpen && (
        <RiderEditModal
          rider={rider}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
};
