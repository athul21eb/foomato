import { useState, useEffect } from 'react';

function getCachedAddress(cacheKey: string): string | null {
  if (!cacheKey) return null;
  try {
    return sessionStorage.getItem(cacheKey);
  } catch {
    return null;
  }
}

/**
 * Resolves a readable place/locality name for coordinates,
 * using stored formattedAddress first, falling back to reverse-geocoding (Nominatim).
 */
export function useRiderLocationName(
  coordinates?: [number, number],
  savedAddress?: string,
): { placeName: string; isLoading: boolean } {
  const [lng, lat] = coordinates || [0, 0];
  const hasCoordinates = !(lat === 0 && lng === 0);
  const coordKey = hasCoordinates ? `${lat.toFixed(4)}_${lng.toFixed(4)}` : '';
  const cacheKey = coordKey ? `foomato_geocode_${coordKey}` : '';

  const [resolvedMap, setResolvedMap] = useState<Record<string, string>>({});

  const hasSavedAddress = Boolean(savedAddress && savedAddress.trim());
  const trimmedSavedAddress = savedAddress?.trim() || '';
  const cachedAddress = coordKey ? resolvedMap[coordKey] || getCachedAddress(cacheKey) : null;
  const shouldFetch = !hasSavedAddress && hasCoordinates && !cachedAddress;

  useEffect(() => {
    if (!shouldFetch) {
      return;
    }

    let isMounted = true;

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: { Accept: 'application/json' },
      },
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        let resolved = fallback;
        if (data) {
          const addressObj = data.address || {};
          const locality =
            addressObj.suburb ||
            addressObj.neighbourhood ||
            addressObj.residential ||
            addressObj.road ||
            '';
          const city =
            addressObj.city ||
            addressObj.town ||
            addressObj.village ||
            addressObj.county ||
            '';
          resolved =
            [locality, city].filter(Boolean).join(', ') ||
            data.display_name ||
            fallback;
        }

        try {
          sessionStorage.setItem(cacheKey, resolved);
        } catch {
          // ignore storage errors
        }

        setResolvedMap((prev) => ({ ...prev, [coordKey]: resolved }));
      })
      .catch(() => {
        if (!isMounted) return;
        const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setResolvedMap((prev) => ({ ...prev, [coordKey]: fallback }));
      });

    return () => {
      isMounted = false;
    };
  }, [shouldFetch, lat, lng, coordKey, cacheKey]);

  let placeName: string;
  if (hasSavedAddress) {
    placeName = trimmedSavedAddress;
  } else if (!hasCoordinates) {
    placeName = 'GPS Pending';
  } else {
    placeName = cachedAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  return { placeName, isLoading: shouldFetch };
}
