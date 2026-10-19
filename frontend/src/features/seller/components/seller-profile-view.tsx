import React from 'react';
import type { Seller } from '../types/seller.types';
import {
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  Edit3,
  Star,
  CheckCircle,
  Share2,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { SellerStatusToggle } from './seller-status-toggle';
import { toast } from 'sonner';
import { formatDistance } from '../utils/seller.utils';

interface SellerProfileViewProps {
  seller: Seller;
  mode?: 'owner' | 'public';
  onEditClick?: () => void;
}

export const SellerProfileView: React.FC<SellerProfileViewProps> = ({
  seller,
  mode = 'owner',
  onEditClick,
}) => {
  const isOwner = mode === 'owner';
  const formattedDistance = formatDistance(seller.distanceKm, seller.distance);

  // Construct Google Maps URL (coordinates are [longitude, latitude])
  const sellerCoords = seller.autoLocation?.coordinates;
  const hasValidCoords =
    Array.isArray(sellerCoords) &&
    sellerCoords.length === 2 &&
    typeof sellerCoords[0] === 'number' &&
    typeof sellerCoords[1] === 'number';

  const mapsUrl = hasValidCoords
    ? `https://www.google.com/maps?q=${sellerCoords[1]},${sellerCoords[0]}`
    : seller.autoLocation?.formattedAddress
      ? `https://www.google.com/maps?q=${encodeURIComponent(seller.autoLocation.formattedAddress)}`
      : null;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: seller.name,
          text: `Check out ${seller.name} on Foomato!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Store link copied to clipboard!');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg transition-colors duration-200">
        {/* Banner Cover Image */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-zinc-900">
          <img
            src={seller.image}
            alt={seller.name}
            className="w-full h-full object-cover object-center filter brightness-90 group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          {/* Top Floating Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {seller.isVerified && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Partner</span>
                </div>
              )}
              <div
                className={`inline-flex items-center justify-center gap-1.5 w-36 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-md transition-colors duration-200 ${
                  seller.isOpen
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-zinc-800/90 text-zinc-300 border border-zinc-700/50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    seller.isOpen ? 'bg-white animate-pulse' : 'bg-zinc-400'
                  }`}
                />
                <span>
                  {seller.isOpen ? 'Open For Orders' : 'Store Closed'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                type="button"
                title="Share Store"
                className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/10"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {isOwner && onEditClick && (
                <button
                  onClick={onEditClick}
                  type="button"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white text-xs font-bold backdrop-blur-md shadow-md hover:bg-white transition-colors cursor-pointer border border-white/20"
                >
                  <Edit3 className="w-3.5 h-3.5 text-orange-500" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Banner Title Overlay */}
          <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
                  {seller.name}
                </h1>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-xs font-bold shadow-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>4.8</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 line-clamp-2 max-w-2xl drop-shadow-sm font-medium">
                {seller.description}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Info Cards Bar */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
          {/* Location & Address with Google Maps redirect */}
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open location in Google Maps"
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Location
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-500 group-hover:underline">
                    <span>Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {seller.autoLocation?.formattedAddress ||
                    'No address registered'}
                </p>
              </div>
            </a>
          ) : (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Location
                </span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-2">
                  {seller.autoLocation?.formattedAddress ||
                    'No address registered'}
                </p>
              </div>
            </div>
          )}

          {/* Middle Card: Distance (public) or Contact Phone (owner) */}
          {!isOwner ? (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Distance
                </span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {formattedDistance ? (
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {formattedDistance} away
                    </span>
                  ) : (
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Nearby Kitchen
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Contact Phone
                </span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {seller.phone || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Timing / Status */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Operating Schedule
              </span>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 h-5 leading-none">
                <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${seller.isOpen ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <span className="truncate">
                  {seller.isOpen
                    ? 'Accepting live orders now'
                    : 'Closed - Check back soon'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Control Dashboard Widget */}
      {isOwner && (
        <div className="space-y-4">
          <SellerStatusToggle isOpen={seller.isOpen} />
        </div>
      )}
    </div>
  );
};
