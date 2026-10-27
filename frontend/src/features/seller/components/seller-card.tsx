import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, ShieldCheck } from "lucide-react";
import type { NearbySeller } from "../types/seller.types";
import { formatDistance } from "../utils/seller.utils";
import { InteractiveCard } from "../../../lib/animations";

interface SellerCardProps {
  seller: NearbySeller;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  const navigate = useNavigate();
  const formattedDistance = formatDistance(seller.distanceKm, seller.distance);

  const handleClick = () => {
    navigate(`/seller-store/${seller.id}`, { state: { seller } });
  };

  return (
    <InteractiveCard
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer text-left"
    >
      {/* Photo Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-800">
        <img
          src={seller.image}
          alt={seller.name}
          loading="lazy"
          className={`h-full ${seller.isOpen ? "grayscale-0" : "grayscale-100" }  w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-95`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-md shadow-xs ${
              seller.isOpen ?
                "bg-emerald-500/90 text-white shadow-emerald-500/20"
              : "bg-zinc-800/90 text-zinc-300"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                seller.isOpen ? "bg-white animate-pulse" : "bg-zinc-400"
              }`}
            />
            {seller.isOpen ? "Open Now" : "Closed"}
          </span>

          {/* Verified Badge */}
          {seller.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-zinc-950 backdrop-blur-md shadow-xs">
              <ShieldCheck className="w-3 h-3 text-zinc-950" />
              Verified
            </span>
          )}
        </div>

        {/* Distance Pill over Photo */}
        {formattedDistance && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 text-white backdrop-blur-md text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>{formattedDistance} away</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white line-clamp-1 group-hover:text-orange-500 transition-colors">
            {seller.name}
          </h3>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>4.8</span>
          </div>
        </div>

        {seller.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
            {seller.description}
          </p>
        )}

        {/* Address / Footer Strip */}
        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-1 truncate max-w-[67%] md:max-w-[50%]">
            <MapPin className="w-3 h-3 shrink-0 text-zinc-400" />
            <span className="truncate">
              {seller.autoLocation?.formattedAddress || "Nearby Kitchen"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-orange-500 font-bold shrink-0">
            View Menu →
          </span>
        </div>
      </div>
    </InteractiveCard>
  );
};

// Backward-compatible alias for existing imports
export const RestaurantCard: React.FC<{ restaurant: NearbySeller }> = ({
  restaurant,
}) => <SellerCard seller={restaurant} />;
