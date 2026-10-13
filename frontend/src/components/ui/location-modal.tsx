import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  X,
  Check,
  Copy,
  RotateCw,
  Navigation,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Search,
  SlidersHorizontal,
  Info,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '../../context/use-theme';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchCurrentLocation,
  setManualLocation,
} from '../../slices/location/locationSlice';
import { toast } from 'sonner';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (locationData: {
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    latitude: number | null;
    longitude: number | null;
  }) => void;
  confirmButtonText?: string;
}

interface QuickCity {
  name: string;
  city: string;
  address: string;
  state: string;
  latitude: number;
  longitude: number;
  postalCode: string;
}

const REGIONAL_PRESETS: QuickCity[] = [
  {
    name: 'Thrissur',
    city: 'Thrissur',
    address: 'Swaraj Round, Thrissur',
    state: 'Kerala',
    latitude: 10.5276,
    longitude: 76.2144,
    postalCode: '680001',
  },
  {
    name: 'Kochi',
    city: 'Kochi',
    address: 'Marine Drive, Ernakulam, Kochi',
    state: 'Kerala',
    latitude: 9.9312,
    longitude: 76.2673,
    postalCode: '682011',
  },
  {
    name: 'Kozhikode',
    city: 'Kozhikode',
    address: 'SM Street, Kozhikode',
    state: 'Kerala',
    latitude: 11.2588,
    longitude: 75.7804,
    postalCode: '673001',
  },
  {
    name: 'Trivandrum',
    city: 'Thiruvananthapuram',
    address: 'Statue, MG Road, Thiruvananthapuram',
    state: 'Kerala',
    latitude: 8.5241,
    longitude: 76.9366,
    postalCode: '695001',
  },
  {
    name: 'Bengaluru',
    city: 'Bengaluru',
    address: 'Indiranagar, Bengaluru',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    postalCode: '560038',
  },
];

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
    road?: string;
  };
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  confirmButtonText = 'Confirm & Deliver Here',
}) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const locationState = useAppSelector((state) => state.location);

  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showIspExplanation, setShowIspExplanation] = useState(true);

  const siteHost =
    import.meta.env.VITE_SITE_DOMAIN ||
    import.meta.env.VITE_SITE_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.host : 'localhost:5173');

  if (!isOpen) return null;

  const handleRetryGPS = async () => {
    try {
      toast.info('Querying browser GPS coordinates...');
      const res = await dispatch(fetchCurrentLocation()).unwrap();
      toast.success(`Location identified: ${res.city || res.address}`);
    } catch (err: unknown) {
      toast.error(typeof err === 'string' ? err : 'Unable to retrieve location');
    }
  };

  const handleReloadPage = () => {
    toast.info('Reloading page to refresh browser permissions...');
    window.location.reload();
  };

  const handleCopyAddress = () => {
    const textToCopy =
      locationState.formattedAddress ||
      `${locationState.address || ''}, ${locationState.city || ''}`;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Address copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectPreset = (preset: QuickCity) => {
    dispatch(
      setManualLocation({
        latitude: preset.latitude,
        longitude: preset.longitude,
        city: preset.city,
        address: preset.address,
        country: preset.state,
        postalCode: preset.postalCode,
        formattedAddress: `${preset.address}, ${preset.state}`,
      }),
    );
    toast.success(`Location set to ${preset.name}!`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const trimmed = searchQuery.trim();
    const isPincode = /^\d{6}$/.test(trimmed);
    const searchUrl = isPincode
      ? `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
          trimmed,
        )}&countrycodes=in&format=json&addressdetails=1&limit=5`
      : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          trimmed,
        )}&countrycodes=in&format=json&addressdetails=1&limit=5`;

    try {
      const response = await fetch(searchUrl, {
        headers: { Accept: 'application/json' },
      });

      let data: NominatimResult[] = response.ok ? await response.json() : [];

      // Fallback to worldwide search if no results found in India
      if (data.length === 0 && !isPincode) {
        const globalRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            trimmed,
          )}&format=json&addressdetails=1&limit=5`,
          { headers: { Accept: 'application/json' } },
        );
        if (globalRes.ok) {
          data = await globalRes.json();
        }
      }

      setSearchResults(data);
      if (data.length === 0) {
        toast.info('No matching places found. Try a different city, neighborhood, or 6-digit pincode.');
      }
    } catch {
      toast.error('Search request failed. Please check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const city =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.address?.suburb ||
      result.address?.county ||
      result.display_name.split(',')[0] ||
      'Selected Location';

    const road =
      result.address?.road ||
      result.display_name.split(',').slice(0, 2).join(', ') ||
      city;

    dispatch(
      setManualLocation({
        latitude: lat,
        longitude: lon,
        city,
        address: road,
        country: result.address?.country || result.address?.state || null,
        postalCode: result.address?.postcode || null,
        formattedAddress: result.display_name,
      }),
    );

    toast.success(`Location set to ${city}!`);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({
        address: locationState.address,
        city: locationState.city,
        state: locationState.country,
        zipCode: locationState.postalCode,
        latitude: locationState.coords?.latitude || null,
        longitude: locationState.coords?.longitude || null,
      });
    }
    onClose();
  };

  const isLoading = locationState.status === 'loading';
  const isDenied = locationState.status === 'denied';
  const isFailed = locationState.status === 'failed';
  const hasCoordinates = !!locationState.coords;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-xl max-h-[90vh] rounded-3xl border shadow-2xl overflow-hidden transition-all flex flex-col animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-black/80'
            : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xl'
        }`}
      >
        {/* Top Gradient Stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-zinc-500/10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
              <Compass className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Delivery Location
              </h2>
              <p className="text-xs opacity-60">
                GPS auto-detection & neighborhood search
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-500/10 transition-colors cursor-pointer"
            title="Close popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* SEARCH BAR (Always Available for Quick Precision) */}
          <div className="space-y-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div
                className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-800/80 border-zinc-700/80 focus-within:border-orange-500/70'
                    : 'bg-zinc-50 border-zinc-300 focus-within:border-orange-500'
                }`}
              >
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city or pincode (e.g. Thrissur, 680001)..."
                  className="w-full bg-transparent text-xs sm:text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Search</span>
                )}
              </button>
            </form>

            {/* Search Results Dropdown List */}
            {searchResults.length > 0 && (
              <div
                className={`p-2 rounded-2xl border shadow-lg space-y-1 ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700'
                    : 'bg-white border-zinc-200'
                }`}
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Matching Locations
                </div>
                {searchResults.map((res) => (
                  <button
                    key={res.place_id}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                      theme === 'dark'
                        ? 'hover:bg-zinc-700/60 text-zinc-200'
                        : 'hover:bg-orange-50 text-zinc-900'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">
                      {res.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Regional City Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 pr-1">
                Popular:
              </span>
              {REGIONAL_PRESETS.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => handleSelectPreset(city)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                    locationState.city === city.city
                      ? 'bg-orange-500/15 border-orange-500/60 text-orange-600 dark:text-orange-400 font-bold'
                      : theme === 'dark'
                      ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-700/60 text-zinc-300'
                      : 'border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-orange-500" />
                  <span>{city.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 1. LOADING STATE */}
          {isLoading && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse">
                  <Navigation className="w-7 h-7 animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-orange-500/40 animate-ping" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Querying Real-Time GPS</h3>
                <p className="text-xs opacity-60 max-w-xs mx-auto mt-1">
                  Connecting to browser geolocation and reverse-geocoding coordinates...
                </p>
              </div>
            </div>
          )}

          {/* 2. PERMISSION DENIED - INDUSTRIAL UNBLOCK GUIDE */}
          {isDenied && !isLoading && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  theme === 'dark'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-sm">
                    Location Permission Blocked in Browser
                  </h4>
                  <p className="opacity-90 leading-relaxed">
                    When you click "Block" in Brave, Chrome, or Firefox, the browser permanently locks permission for this domain. Web apps cannot re-open the prompt automatically without you unblocking it.
                  </p>
                </div>
              </div>

              {/* Step-by-Step Visual Instruction Box */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  theme === 'dark'
                    ? 'bg-zinc-800/40 border-zinc-700/60'
                    : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    How to Unblock in 3 Steps:
                  </span>
                </div>

                <div className="space-y-3 text-xs opacity-90 pl-1">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-500 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      Look at your browser's address bar at the top:
                      <div className="mt-1.5 p-2 rounded-xl bg-black/40 border border-zinc-700/60 font-mono text-[11px] text-zinc-300 flex items-center gap-2 max-w-fit">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-sans font-bold text-[11px]">
                          <Info className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span>Permissions Icon</span>
                        </span>
                        <span className="font-mono text-zinc-300 font-medium">{siteHost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-500 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <p>
                      Click the icon and toggle <strong className="text-orange-500">Location</strong> to <strong className="text-emerald-500">"Allow"</strong> (or click "Reset permissions").
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-500 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <p>
                      Click the button below to reload and activate live GPS:
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleReloadPage}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reload Page & Enable GPS</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRetryGPS}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      theme === 'dark'
                        ? 'border-zinc-700 hover:bg-zinc-700 text-zinc-200'
                        : 'border-zinc-300 hover:bg-zinc-200 text-zinc-800'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5 text-orange-500" />
                    <span>Retry GPS Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. EXPLANATION: WHY DESKTOP SHOWS KOCHI INSTEAD OF THRISSUR */}
          {showIspExplanation && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                theme === 'dark'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <div className="space-y-1">
                  <span className="font-bold block">
                    Why does browser GPS point to Kochi when you are in Thrissur?
                  </span>
                  <p className="opacity-90 leading-relaxed text-[11px]">
                    Laptops and desktop PCs lack hardware satellite GPS chips. Browsers approximate location using your ISP's public IP address. In Kerala, major fiber networks (Jio, Airtel, Asianet, Kerala Vision) route all internet traffic through the central Kochi Internet Gateway (IXP). Use the search bar above or click <strong>Thrissur</strong> to set your exact town!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIspExplanation(false)}
                className="opacity-50 hover:opacity-100 p-1 text-xs"
                title="Dismiss note"
              >
                ✕
              </button>
            </div>
          )}

          {/* 4. CURRENT ACTIVE / DETECTED LOCATION CARD */}
          {hasCoordinates && !isLoading && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-300">
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-zinc-800/80 via-zinc-800/40 to-orange-950/20 border-zinc-700/60'
                    : 'bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-white border-orange-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative flex items-center justify-center">
                    <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full animate-ping" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      Active Selection
                    </span>
                    <h3 className="text-base font-black tracking-tight leading-snug">
                      {locationState.city || 'Custom Location'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRetryGPS}
                  title="Re-query GPS"
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    theme === 'dark'
                      ? 'border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                      : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-[11px] font-medium hidden sm:inline">
                    GPS
                  </span>
                </button>
              </div>

              {/* Formatted Address Box */}
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  theme === 'dark'
                    ? 'bg-zinc-800/40 border-zinc-800'
                    : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                    Full Delivery Address
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:underline cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs font-semibold leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {locationState.formattedAddress ||
                    locationState.address ||
                    'Precise location active'}
                </p>
              </div>

              {/* Coordinates & Google Maps Link */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-mono text-[11px] opacity-60">
                  {locationState.coords?.latitude.toFixed(4)}° N,{' '}
                  {locationState.coords?.longitude.toFixed(4)}° E
                </span>

                {locationState.coords && (
                  <a
                    href={`https://www.google.com/maps?q=${locationState.coords.latitude},${locationState.coords.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:underline"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 pt-4 border-t border-zinc-500/10 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            Cancel
          </button>

          {hasCoordinates && (
            <button
              id="confirm-location-btn"
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{confirmButtonText}</span>
            </button>
          )}

          {!hasCoordinates && (isDenied || isFailed) && (
            <button
              type="button"
              onClick={handleReloadPage}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
