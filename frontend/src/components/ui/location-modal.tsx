import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/use-theme';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchCurrentLocation,
  setManualLocation,
} from '../../slices/location/locationSlice';
import { useModalScrollLock } from '../../lib/use-modal-scroll-lock';
import {
  loadGoogleMaps,
  isGoogleMapsReady,
  getGoogleMapsApiKey,
  reverseGeocodeGoogle,
  parseAddressComponents,
} from '../../lib/google-maps-loader';
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
    neighbourhood?: string;
  };
}

interface GooglePrediction {
  placeId: string;
  description: string;
  mainText?: string;
  secondaryText?: string;
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
  const [isSearching, setIsSearching] = useState(false);
  const hasApiKey = Boolean(getGoogleMapsApiKey());

  // Google Maps SDK states
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(() => isGoogleMapsReady());
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(() => Boolean(hasApiKey && !isGoogleMapsReady()));
  const [googlePredictions, setGooglePredictions] = useState<GooglePrediction[]>([]);
  const [nominatimResults, setNominatimResults] = useState<NominatimResult[]>([]);

  // Map DOM refs & instances
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const updateLocationFromCoordsRef = useRef<(lat: number, lng: number) => Promise<void>>(() => Promise.resolve());

  const updateMarkerPosition = useCallback((lat: number, lng: number) => {
    const marker = markerInstanceRef.current;
    if (!marker) return;
    const latLng = { lat, lng };
    if ('position' in marker) {
      marker.position = latLng;
    } else if (typeof (marker as google.maps.Marker).setPosition === 'function') {
      (marker as google.maps.Marker).setPosition(latLng);
    }
  }, []);

  // Load Google Maps SDK when modal opens if API key is provided
  useEffect(() => {
    if (!isOpen || !hasApiKey || isGoogleMapsReady()) return;

    let isSubscribed = true;
    loadGoogleMaps()
      .then(() => {
        if (isSubscribed) {
          setGoogleMapsLoaded(true);
          setIsGoogleLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Google Maps SDK load error:', err);
        if (isSubscribed) {
          setIsGoogleLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, hasApiKey]);

  // Handle Reverse Geocode and store location in Redux
  const updateLocationFromCoords = useCallback(
    async (lat: number, lng: number) => {
      // 1. Immediately update Redux coordinates so Active Pin UI reflects click/drag instantaneously
      dispatch(
        setManualLocation({
          latitude: lat,
          longitude: lng,
          city: 'Detecting...',
          address: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
          country: null,
          postalCode: null,
          formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        }),
      );

      try {
        if (googleMapsLoaded) {
          const geocoded = await reverseGeocodeGoogle(lat, lng);
          if (geocoded) {
            dispatch(
              setManualLocation({
                latitude: geocoded.lat,
                longitude: geocoded.lng,
                city: geocoded.city,
                address: geocoded.address,
                country: geocoded.state || geocoded.country,
                postalCode: geocoded.postalCode || null,
                formattedAddress: geocoded.formattedAddress,
              }),
            );
            toast.success(`Location set: ${geocoded.city || geocoded.address}`);
            return;
          }
        }

        // Fallback reverse geocoding with OpenStreetMap Nominatim
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
          { headers: { Accept: 'application/json' } },
        );
        if (res.ok) {
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.suburb ||
            data.address?.county ||
            'Selected Pin';
          const road =
            data.address?.road ||
            data.address?.neighbourhood ||
            data.display_name?.split(',')[0] ||
            city;
          dispatch(
            setManualLocation({
              latitude: lat,
              longitude: lng,
              city,
              address: road,
              country: data.address?.state || data.address?.country || null,
              postalCode: data.address?.postcode || null,
              formattedAddress: data.display_name,
            }),
          );
          toast.success(`Location set: ${city}`);
        }
      } catch (err) {
        console.warn('Reverse geocode error:', err);
      }
    },
    [dispatch, googleMapsLoaded],
  );

  // Keep ref up to date to avoid stale closures in map event listeners
  useEffect(() => {
    updateLocationFromCoordsRef.current = updateLocationFromCoords;
  }, [updateLocationFromCoords]);

  // Track initial coordinates to center the map when modal opens
  const initialCenterRef = useRef<{ lat: number; lng: number }>({
    lat: locationState.coords?.latitude ?? 12.9716,
    lng: locationState.coords?.longitude ?? 77.5946,
  });

  // Initialize interactive Google Map ONCE when modal is open and Google Maps is ready
  useEffect(() => {
    if (!isOpen || !googleMapsLoaded || !mapContainerRef.current) return;
    if (typeof window === 'undefined' || typeof window.google?.maps?.Map !== 'function') {
      console.warn('Google Maps Map constructor is not ready yet.');
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    try {
      const currentLat = initialCenterRef.current.lat;
      const currentLng = initialCenterRef.current.lng;

      // Reset references to ensure fresh initialization on newly mounted DOM node
      mapInstanceRef.current = null;
      markerInstanceRef.current = null;

      // Create new Map instance with mapId required for AdvancedMarkerElement
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: currentLat, lng: currentLng },
        zoom: 15,
        mapId: 'foomato_location_picker',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: 'greedy',
      });
      mapInstanceRef.current = map;

      // Modern AdvancedMarkerElement to resolve deprecation warning
      if (google.maps.marker?.AdvancedMarkerElement) {
        const advMarker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: currentLat, lng: currentLng },
          map,
          gmpDraggable: true,
          title: 'Drag to adjust your location',
        });
        markerInstanceRef.current = advMarker;

        advMarker.addListener('dragend', () => {
          const pos = advMarker.position;
          if (pos) {
            const lat = typeof pos.lat === 'function' ? pos.lat() : Number(pos.lat);
            const lng = typeof pos.lng === 'function' ? pos.lng() : Number(pos.lng);
            if (!isNaN(lat) && !isNaN(lng)) {
              updateMarkerPosition(lat, lng);
              updateLocationFromCoordsRef.current(lat, lng);
            }
          }
        });
      } else {
        const legacyMarker = new google.maps.Marker({
          position: { lat: currentLat, lng: currentLng },
          map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          title: 'Drag to adjust your location',
        });
        markerInstanceRef.current = legacyMarker;

        legacyMarker.addListener('dragend', () => {
          const pos = legacyMarker.getPosition();
          if (pos) {
            const lat = pos.lat();
            const lng = pos.lng();
            updateMarkerPosition(lat, lng);
            updateLocationFromCoordsRef.current(lat, lng);
          }
        });
      }

      // Handle map click to drop and move pin
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          updateMarkerPosition(lat, lng);
          updateLocationFromCoordsRef.current(lat, lng);
        }
      });

      // Ensure map tiles properly layout after mounting
      timer = setTimeout(() => {
        if (mapInstanceRef.current && window.google?.maps?.event) {
          google.maps.event.trigger(mapInstanceRef.current, 'resize');
        }
      }, 120);
    } catch (mapErr) {
      console.warn('Failed to initialize Google Map in LocationModal:', mapErr);
    }

    // Clean up instances when unmounting or closing modal
    return () => {
      if (timer) clearTimeout(timer);
      mapInstanceRef.current = null;
      markerInstanceRef.current = null;
    };
  }, [isOpen, googleMapsLoaded, updateMarkerPosition]);

  // Synchronize map center when coordinates change while modal is open
  useEffect(() => {
    if (!isOpen || !mapInstanceRef.current || !locationState.coords) return;
    const { latitude, longitude } = locationState.coords;
    mapInstanceRef.current.panTo({ lat: latitude, lng: longitude });
    updateMarkerPosition(latitude, longitude);
  }, [isOpen, locationState.coords, updateMarkerPosition]);

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const handleRetryGPS = async () => {
    try {
      toast.info('Querying browser GPS coordinates...');
      const res = await dispatch(fetchCurrentLocation()).unwrap();
      toast.success(`Location identified: ${res.city || res.address}`);
      if (mapInstanceRef.current && res.latitude && res.longitude) {
        mapInstanceRef.current.panTo({ lat: res.latitude, lng: res.longitude });
        updateMarkerPosition(res.latitude, res.longitude);
      }
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

  // Google Places Autocomplete query with Nominatim fallback
  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    const trimmed = val.trim();
    if (!trimmed) {
      setGooglePredictions([]);
      setNominatimResults([]);
      return;
    }

    const isPincode = /^\d{6}$/.test(trimmed);

    // If 6-digit Indian PIN code, directly query Nominatim postalcode endpoint
    if (isPincode) {
      fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
          trimmed,
        )}&countrycodes=in&format=json&addressdetails=1&limit=5`,
        { headers: { Accept: 'application/json' } },
      )
        .then((res) => res.json())
        .then((data: NominatimResult[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setNominatimResults(data);
          }
        })
        .catch(() => {});
    }

    if (googleMapsLoaded && typeof google !== 'undefined' && google.maps.places) {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      }
      autocompleteServiceRef.current.getPlacePredictions(
        { input: val, componentRestrictions: { country: 'in' } },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            setGooglePredictions(
              predictions.map((p) => ({
                placeId: p.place_id,
                description: p.description,
                mainText: p.structured_formatting?.main_text,
                secondaryText: p.structured_formatting?.secondary_text,
              })),
            );
            if (!isPincode) {
              setNominatimResults([]);
            }
          } else {
            setGooglePredictions([]);
            // If Google returned no predictions and not a pincode, search Nominatim for suggestions
            if (!isPincode && trimmed.length >= 3) {
              fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                  trimmed,
                )}&countrycodes=in&format=json&addressdetails=1&limit=5`,
                { headers: { Accept: 'application/json' } },
              )
                .then((res) => res.json())
                .then((data: NominatimResult[]) => {
                  if (Array.isArray(data)) {
                    setNominatimResults(data);
                  }
                })
                .catch(() => {});
            }
          }
        },
      );
    } else if (!isPincode && trimmed.length >= 3) {
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          trimmed,
        )}&countrycodes=in&format=json&addressdetails=1&limit=5`,
        { headers: { Accept: 'application/json' } },
      )
        .then((res) => res.json())
        .then((data: NominatimResult[]) => {
          if (Array.isArray(data)) {
            setNominatimResults(data);
          }
        })
        .catch(() => {});
    }
  };

  // Execute explicit search submit (Pincode -> Google Geocoding -> Nominatim fallback)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsSearching(true);
    const isPincode = /^\d{6}$/.test(trimmed);

    // 1. Direct Indian pincode lookup via Nominatim
    if (isPincode) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
            trimmed,
          )}&countrycodes=in&format=json&addressdetails=1&limit=5`,
          { headers: { Accept: 'application/json' } },
        );
        if (res.ok) {
          const data: NominatimResult[] = await res.json();
          if (data && data.length > 0) {
            handleSelectNominatimResult(data[0]);
            setIsSearching(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Pincode search error:', err);
      }
    }

    // 2. Google Geocoding Search
    if (googleMapsLoaded && typeof google !== 'undefined') {
      try {
        const geocoder = new google.maps.Geocoder();
        const googleResult = await new Promise<google.maps.GeocoderResult | null>((resolve) => {
          const request: google.maps.GeocoderRequest = isPincode
            ? { componentRestrictions: { country: 'IN', postalCode: trimmed } }
            : { address: trimmed, componentRestrictions: { country: 'in' } };

          geocoder.geocode(request, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
              resolve(results[0]);
            } else {
              geocoder.geocode({ address: trimmed }, (fResults, fStatus) => {
                if (fStatus === google.maps.GeocoderStatus.OK && fResults && fResults[0]) {
                  resolve(fResults[0]);
                } else {
                  resolve(null);
                }
              });
            }
          });
        });

        if (googleResult) {
          const geocoded = parseAddressComponents(googleResult, 0, 0);
          dispatch(
            setManualLocation({
              latitude: geocoded.lat,
              longitude: geocoded.lng,
              city: geocoded.city,
              address: geocoded.address,
              country: geocoded.state || geocoded.country,
              postalCode: geocoded.postalCode || null,
              formattedAddress: geocoded.formattedAddress,
            }),
          );
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat: geocoded.lat, lng: geocoded.lng });
            updateMarkerPosition(geocoded.lat, geocoded.lng);
          }
          toast.success(`Location set: ${geocoded.city}`);
          setSearchQuery('');
          setGooglePredictions([]);
          setNominatimResults([]);
          setIsSearching(false);
          return;
        }
      } catch (err) {
        console.warn('Google geocoder search error:', err);
      }
    }

    // 3. OpenStreetMap Nominatim Fallback Search
    const searchUrl = isPincode
      ? `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
          trimmed,
        )}&countrycodes=in&format=json&addressdetails=1&limit=5`
      : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          trimmed,
        )}&countrycodes=in&format=json&addressdetails=1&limit=5`;

    try {
      const response = await fetch(searchUrl, { headers: { Accept: 'application/json' } });
      let data: NominatimResult[] = response.ok ? await response.json() : [];

      if (data.length === 0 && !isPincode) {
        const globalRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            trimmed,
          )}&format=json&addressdetails=1&limit=5`,
          { headers: { Accept: 'application/json' } },
        );
        if (globalRes.ok) data = await globalRes.json();
      }

      if (data.length > 0) {
        handleSelectNominatimResult(data[0]);
        if (data.length > 1) {
          setNominatimResults(data);
        }
      } else {
        toast.info('No matching places found. Try a different city or 6-digit pincode.');
      }
    } catch {
      toast.error('Search request failed. Please check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // Select place from Google Predictions with multi-level fallback
  const handleSelectGooglePrediction = async (prediction: GooglePrediction) => {
    // 1. Try Google PlacesService Details
    if (googleMapsLoaded && typeof google !== 'undefined') {
      try {
        const place = await new Promise<google.maps.places.PlaceResult | null>((resolve) => {
          const container = mapContainerRef.current || document.createElement('div');
          const placesService = new google.maps.places.PlacesService(mapInstanceRef.current || container);
          placesService.getDetails(
            {
              placeId: prediction.placeId,
              fields: ['geometry', 'formatted_address', 'address_components', 'name'],
            },
            (result, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
                resolve(result);
              } else {
                resolve(null);
              }
            },
          );
        });

        if (place && place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const geocoded = parseAddressComponents(place, lat, lng);
          dispatch(
            setManualLocation({
              latitude: geocoded.lat,
              longitude: geocoded.lng,
              city: geocoded.city,
              address: geocoded.address,
              country: geocoded.state || geocoded.country,
              postalCode: geocoded.postalCode || null,
              formattedAddress: geocoded.formattedAddress,
            }),
          );
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat, lng });
            updateMarkerPosition(lat, lng);
          }
          toast.success(`Selected: ${geocoded.city}`);
          setSearchQuery('');
          setGooglePredictions([]);
          setNominatimResults([]);
          return;
        }

        // 2. Try Geocoder by placeId or description
        const geocoderResult = await new Promise<google.maps.GeocoderResult | null>((resolve) => {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ placeId: prediction.placeId }, (results, gStatus) => {
            if (gStatus === google.maps.GeocoderStatus.OK && results && results[0]) {
              resolve(results[0]);
            } else {
              geocoder.geocode({ address: prediction.description }, (textResults, tStatus) => {
                if (tStatus === google.maps.GeocoderStatus.OK && textResults && textResults[0]) {
                  resolve(textResults[0]);
                } else {
                  resolve(null);
                }
              });
            }
          });
        });

        if (geocoderResult && geocoderResult.geometry?.location) {
          const lat = geocoderResult.geometry.location.lat();
          const lng = geocoderResult.geometry.location.lng();
          const geocoded = parseAddressComponents(geocoderResult, lat, lng);
          dispatch(
            setManualLocation({
              latitude: geocoded.lat,
              longitude: geocoded.lng,
              city: geocoded.city,
              address: geocoded.address,
              country: geocoded.state || geocoded.country,
              postalCode: geocoded.postalCode || null,
              formattedAddress: geocoded.formattedAddress,
            }),
          );
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat, lng });
            updateMarkerPosition(lat, lng);
          }
          toast.success(`Selected: ${geocoded.city}`);
          setSearchQuery('');
          setGooglePredictions([]);
          setNominatimResults([]);
          return;
        }
      } catch (err) {
        console.warn('Google place select error:', err);
      }
    }

    // 3. Fallback to Nominatim search with place description
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          prediction.description,
        )}&countrycodes=in&format=json&addressdetails=1&limit=1`,
        { headers: { Accept: 'application/json' } },
      );
      if (res.ok) {
        const data: NominatimResult[] = await res.json();
        if (data && data.length > 0) {
          handleSelectNominatimResult(data[0]);
          return;
        }
      }
    } catch (err) {
      console.warn('Nominatim fallback select error:', err);
    }

    toast.error('Unable to resolve place location. Please click on the map.');
  };

  const handleSelectNominatimResult = (result: NominatimResult) => {
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
      result.address?.neighbourhood ||
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

    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng: lon });
      updateMarkerPosition(lat, lon);
    }

    toast.success(`Location set to ${city}!`);
    setNominatimResults([]);
    setGooglePredictions([]);
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

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg md:max-w-4xl lg:max-w-5xl md:h-[620px] max-h-[92vh] rounded-3xl border shadow-2xl overflow-hidden transition-all flex flex-col animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-black/80'
            : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xl'
        }`}
      >
        {/* Top Gradient Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-zinc-500/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
              <Compass className="w-5 h-5 animate-[spin_16s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Choose Location
                </h2>
                {googleMapsLoaded ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    Google Maps
                  </span>
                ) : isGoogleLoading ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading Maps...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                    GPS / OSM
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs opacity-60">
                Interactive pin picker & Google Places search
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-500/10 transition-colors cursor-pointer"
            title="Close popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Desktop (Side-by-Side: Map on Left, Search & Details on Right), Mobile (Stacked: Search -> Map -> Details -> Actions) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-y-auto md:overflow-hidden">
          {/* MAP CANVAS (Takes 7 cols on md, 8 cols on lg. On mobile, rendered right under search) */}
          <div className="md:col-span-7 lg:col-span-8 p-3.5 sm:p-5 flex flex-col min-h-0 order-2 md:order-1">
            <div className="relative w-full h-52 sm:h-64 md:h-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner bg-zinc-100 dark:bg-zinc-800 shrink-0 md:shrink">
              {/* Google Map Container Canvas */}
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Floating Map Overlays: Top Header Toolbar (Hint on left, GPS on right) */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/85 dark:bg-black/85 backdrop-blur-md text-white text-[11px] font-medium shadow-md border border-white/10 shrink min-w-0">
                  <span className="shrink-0 text-xs">📍</span>
                  <span className="truncate">Drag pin or click map to set location</span>
                </div>

                <button
                  type="button"
                  onClick={handleRetryGPS}
                  title="Locate my position via browser GPS"
                  className="pointer-events-auto shrink-0 p-2 sm:px-3 sm:py-2 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-zinc-800 dark:text-white shadow-lg backdrop-blur-md hover:bg-white dark:hover:bg-zinc-900 active:scale-95 transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  <Navigation className="w-4 h-4 text-orange-500" />
                  <span className="hidden sm:inline">My GPS</span>
                </button>
              </div>
            </div>
          </div>

          {/* CONTROLS & DETAILS PANEL (Takes 5 cols on md, 4 cols on lg) */}
          <div className="md:col-span-5 lg:col-span-4 p-3.5 sm:p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-500/10 bg-zinc-50/50 dark:bg-zinc-900/40 min-h-0 order-1 md:order-2 space-y-3.5">
            {/* Search Input & Active Address Section */}
            <div className="space-y-3">
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Search Location
                </label>
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
                  <div
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                      theme === 'dark'
                        ? 'bg-zinc-800/90 border-zinc-700 focus-within:border-orange-500'
                        : 'bg-white border-zinc-300 focus-within:border-orange-500'
                    }`}
                  >
                    <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      placeholder={
                        googleMapsLoaded
                          ? 'Search city, landmark, or street...'
                          : 'Search city or pincode...'
                      }
                      className="w-full bg-transparent text-xs outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setGooglePredictions([]);
                          setNominatimResults([]);
                        }}
                        className="p-0.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Find</span>}
                  </button>
                </form>

                {/* Google Places Predictions Dropdown */}
                {googlePredictions.length > 0 && (
                  <div
                    className={`absolute z-30 left-0 right-0 mt-1.5 p-1.5 rounded-2xl border shadow-2xl max-h-52 overflow-y-auto space-y-1 ${
                      theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <span>Places Suggestions</span>
                      <span className="text-orange-500 font-semibold">Google Places</span>
                    </div>
                    {googlePredictions.map((pred) => (
                      <button
                        key={pred.placeId}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectGooglePrediction(pred)}
                        className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-start gap-2 cursor-pointer ${
                          theme === 'dark'
                            ? 'hover:bg-zinc-700/60 text-zinc-200'
                            : 'hover:bg-orange-50 text-zinc-900'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold block truncate">
                            {pred.mainText || pred.description}
                          </span>
                          {pred.secondaryText && (
                            <span className="text-[10px] opacity-60 block truncate">
                              {pred.secondaryText}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Nominatim Fallback Dropdown List */}
                {nominatimResults.length > 0 && (
                  <div
                    className={`absolute z-30 left-0 right-0 mt-1.5 p-1.5 rounded-2xl border shadow-2xl max-h-52 overflow-y-auto space-y-1 ${
                      theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Matching Locations (OSM)
                    </div>
                    {nominatimResults.map((res) => (
                      <button
                        key={res.place_id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectNominatimResult(res)}
                        className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-start gap-2 cursor-pointer ${
                          theme === 'dark'
                            ? 'hover:bg-zinc-700/60 text-zinc-200'
                            : 'hover:bg-orange-50 text-zinc-900'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-tight">{res.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Location Details Card */}
              {hasCoordinates && !isLoading && (
                <div
                  className={`p-3.5 rounded-2xl border space-y-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-zinc-800/60 border-zinc-700/60'
                      : 'bg-white border-zinc-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      Active Pin
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-500 hover:underline cursor-pointer"
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

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-extrabold tracking-tight truncate">
                        {locationState.city || 'Custom Location'}
                      </h4>
                      <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300 line-clamp-2 mt-0.5">
                        {locationState.formattedAddress ||
                          locationState.address ||
                          'Address detected'}
                      </p>
                    </div>
                  </div>

                  {/* Coordinates & Google Maps Link */}
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-zinc-500/10">
                    <span className="font-mono opacity-60">
                      {locationState.coords?.latitude.toFixed(4)}° N,{' '}
                      {locationState.coords?.longitude.toFixed(4)}° E
                    </span>

                    {locationState.coords && (
                      <a
                        href={`https://www.google.com/maps?q=${locationState.coords.latitude},${locationState.coords.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-orange-500 hover:underline"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="py-4 flex flex-col items-center justify-center text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse">
                    <Navigation className="w-4 h-4 animate-spin" />
                  </div>
                  <span className="text-xs font-bold">Querying Real-Time GPS...</span>
                </div>
              )}

              {/* Permission Denied Notice */}
              {isDenied && !isLoading && (
                <div
                  className={`p-3 rounded-2xl border text-xs space-y-2 ${
                    theme === 'dark'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-bold">Location Permission Blocked</span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-tight">
                    Allow location permission in browser address bar or use search bar above.
                  </p>
                  <button
                    type="button"
                    onClick={handleReloadPage}
                    className="w-full py-1.5 rounded-xl text-xs font-bold bg-orange-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reload Page</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions: Cancel & Confirm buttons */}
            <div className="pt-2.5 border-t border-zinc-500/10 flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
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
                  className="flex-[2] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{confirmButtonText}</span>
                </button>
              )}

              {!hasCoordinates && (isDenied || isFailed) && (
                <button
                  type="button"
                  onClick={handleRetryGPS}
                  className="flex-[2] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry GPS</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LocationModal;
