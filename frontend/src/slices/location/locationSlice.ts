import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends LocationCoordinates {
  city: string | null;
  address: string | null;
  country: string | null;
  postalCode: string | null;
  formattedAddress: string | null;
}

export interface LocationState {
  coords: LocationCoordinates | null;
  city: string | null;
  address: string | null;
  country: string | null;
  postalCode: string | null;
  formattedAddress: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed' | 'denied';
  error: string | null;
  lastUpdated: number | null;
}

const STORAGE_KEY = 'foomato_user_location';

const loadSavedLocation = (): Partial<LocationState> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const savedLocation = loadSavedLocation();

const initialState: LocationState = {
  coords: savedLocation?.coords || null,
  city: savedLocation?.city || null,
  address: savedLocation?.address || null,
  country: savedLocation?.country || null,
  postalCode: savedLocation?.postalCode || null,
  formattedAddress: savedLocation?.formattedAddress || null,
  status: savedLocation?.coords ? 'succeeded' : 'idle',
  error: null,
  lastUpdated: savedLocation?.lastUpdated || null,
};

export const fetchCurrentLocation = createAsyncThunk<
  LocationData,
  void,
  { rejectValue: string }
>('location/fetchCurrentLocation', async (_, { rejectWithValue }) => {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return rejectWithValue('Geolocation is not supported by your browser.');
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Force fresh position, never return stale cache
      });
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const addressObj = data.address || {};
        const city =
          addressObj.city ||
          addressObj.town ||
          addressObj.village ||
          addressObj.suburb ||
          addressObj.county ||
          'Local Hub';

        const road =
          addressObj.road ||
          addressObj.neighbourhood ||
          addressObj.residential ||
          '';
        const country = addressObj.country || null;
        const postalCode = addressObj.postcode || null;
        const formattedAddress = data.display_name || `${city}, ${country || ''}`;
        const address = [road, city].filter(Boolean).join(', ') || formattedAddress;

        return {
          latitude,
          longitude,
          city,
          address,
          country,
          postalCode,
          formattedAddress,
        };
      }
    } catch {
      // Reverse geocoding fetch failed, fallback to coordinate labels
    }

    return {
      latitude,
      longitude,
      city: 'Current Location',
      address: `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`,
      country: null,
      postalCode: null,
      formattedAddress: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };
  } catch (error) {
    const geoError = error as GeolocationPositionError;
    if (geoError.code === 1) {
      return rejectWithValue('Location access was denied. Please allow permission.');
    }
    if (geoError.code === 2) {
      return rejectWithValue('Location information is currently unavailable.');
    }
    if (geoError.code === 3) {
      return rejectWithValue('Request to fetch location timed out.');
    }
    return rejectWithValue(geoError.message || 'Unable to retrieve location.');
  }
});

export const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setManualLocation: (
      state,
      action: PayloadAction<{
        latitude: number;
        longitude: number;
        city: string;
        address: string;
        country?: string | null;
        postalCode?: string | null;
        formattedAddress?: string | null;
      }>,
    ) => {
      state.coords = {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      };
      state.city = action.payload.city;
      state.address = action.payload.address;
      state.country = action.payload.country || null;
      state.postalCode = action.payload.postalCode || null;
      state.formattedAddress =
        action.payload.formattedAddress ||
        `${action.payload.address}, ${action.payload.city}`;
      state.status = 'succeeded';
      state.error = null;
      state.lastUpdated = Date.now();

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            coords: state.coords,
            city: state.city,
            address: state.address,
            country: state.country,
            postalCode: state.postalCode,
            formattedAddress: state.formattedAddress,
            lastUpdated: state.lastUpdated,
          }),
        );
      } catch {
        // Ignore storage write issues
      }
    },
    clearLocation: (state) => {
      state.coords = null;
      state.city = null;
      state.address = null;
      state.country = null;
      state.postalCode = null;
      state.formattedAddress = null;
      state.status = 'idle';
      state.error = null;
      state.lastUpdated = null;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage removal issues
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentLocation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentLocation.fulfilled, (state, action) => {
        const { latitude, longitude, city, address, country, postalCode, formattedAddress } =
          action.payload;
        state.coords = { latitude, longitude };
        state.city = city;
        state.address = address;
        state.country = country;
        state.postalCode = postalCode;
        state.formattedAddress = formattedAddress;
        state.status = 'succeeded';
        state.error = null;
        state.lastUpdated = Date.now();

        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              coords: state.coords,
              city: state.city,
              address: state.address,
              country: state.country,
              postalCode: state.postalCode,
              formattedAddress: state.formattedAddress,
              lastUpdated: state.lastUpdated,
            }),
          );
        } catch {
          // Ignore storage write issues
        }
      })
      .addCase(fetchCurrentLocation.rejected, (state, action) => {
        state.status = action.payload?.includes('denied') ? 'denied' : 'failed';
        state.error = action.payload || 'Failed to detect location';
      });
  },
});

export const { setManualLocation, clearLocation } = locationSlice.actions;

export default locationSlice.reducer;
