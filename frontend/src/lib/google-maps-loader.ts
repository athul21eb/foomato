let googleMapsPromise: Promise<typeof google.maps> | null = null;

export const getGoogleMapsApiKey = (): string => {
  return (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
};

export const isGoogleMapsReady = (): boolean => {
  return typeof window !== 'undefined' && !!window.google?.maps?.places;
};

/**
 * Dynamically loads the Google Maps JavaScript API with Places library.
 * Reuses the in-flight Promise if already loading or resolves immediately if loaded.
 */
export const loadGoogleMaps = (apiKeyOverride?: string): Promise<typeof google.maps> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not defined (SSR)'));
  }

  if (isGoogleMapsReady()) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = apiKeyOverride || getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is not configured (VITE_GOOGLE_MAPS_API_KEY)'));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script tag is already in DOM
    const existingScript = document.getElementById('google-maps-script') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.google?.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error('Google Maps object failed to initialize.'));
        }
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Failed to load Google Maps script. Check your API key.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places,geometry,marker&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.maps?.places) {
        resolve(window.google.maps);
      } else {
        // Wait brief tick in case libraries load asynchronously
        setTimeout(() => {
          if (window.google?.maps) {
            resolve(window.google.maps);
          } else {
            reject(new Error('Google Maps SDK loaded without required libraries.'));
          }
        }, 150);
      }
    };

    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error('Failed to load Google Maps SDK. Please check your network or API key permissions.'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export interface GeocodedAddress {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

/**
 * Parse standard address components from a Google Geocoder result
 */
export const parseAddressComponents = (
  result: google.maps.GeocoderResult | google.maps.places.PlaceResult,
  fallbackLat: number,
  fallbackLng: number,
): GeocodedAddress => {
  const components = result.address_components || [];

  let streetNumber = '';
  let route = '';
  let sublocality = '';
  let locality = '';
  let administrativeArea = '';
  let country = '';
  let postalCode = '';

  for (const c of components) {
    const types = c.types;
    if (types.includes('street_number')) streetNumber = c.long_name;
    if (types.includes('route')) route = c.long_name;
    if (types.includes('sublocality') || types.includes('sublocality_level_1')) sublocality = c.long_name;
    if (types.includes('locality')) locality = c.long_name;
    if (types.includes('administrative_area_level_1')) administrativeArea = c.long_name;
    if (types.includes('country')) country = c.long_name;
    if (types.includes('postal_code')) postalCode = c.long_name;
  }

  const streetAddress = [streetNumber, route].filter(Boolean).join(' ') || sublocality || locality;
  const city = locality || sublocality || administrativeArea || 'Selected Location';
  const state = administrativeArea;

  const lat =
    typeof result.geometry?.location?.lat === 'function'
      ? result.geometry.location.lat()
      : fallbackLat;
  const lng =
    typeof result.geometry?.location?.lng === 'function'
      ? result.geometry.location.lng()
      : fallbackLng;

  return {
    address: streetAddress || city,
    city,
    state,
    country,
    postalCode,
    formattedAddress: result.formatted_address || `${city}, ${state}`,
    lat,
    lng,
  };
};

/**
 * Reverse geocode a latitude/longitude using Google Geocoder
 */
export const reverseGeocodeGoogle = async (
  lat: number,
  lng: number,
): Promise<GeocodedAddress | null> => {
  await loadGoogleMaps();
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        resolve(parseAddressComponents(results[0], lat, lng));
      } else {
        resolve(null);
      }
    });
  });
};
