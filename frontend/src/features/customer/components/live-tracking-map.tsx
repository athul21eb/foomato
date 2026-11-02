import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps } from '../../../lib/google-maps-loader';
import type { RiderLiveLocation } from '../hooks/use-order-tracking';
import { Navigation, Maximize2, Bike } from 'lucide-react';

interface LocationPoint {
  lat: number;
  lng: number;
  title?: string;
  address?: string;
}

interface LiveTrackingMapProps {
  origin: LocationPoint; // Restaurant location
  destination: LocationPoint; // Customer dropoff
  riderLocation: RiderLiveLocation | null;
  orderStatus: string;
  riderName?: string;
  onSimulateTick?: (coords: [number, number], heading: number, speed: number) => void;
  className?: string;
}

// Dark & Light Google Maps Styling
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#18181b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#18181b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a1a1aa' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d4d4d8' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#71717a' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#27272a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#27272a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#3f3f46' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3f3f46' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#27272a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#09090b' }],
  },
];

const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#fed7aa' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#fdba74' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#f1f5f9' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e5e7eb' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#dbeafe' }],
  },
];

/**
 * Calculates bearing (heading angle in degrees 0-360) between two coordinates.
 */
function calculateHeading(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const lat1 = (fromLat * Math.PI) / 180;
  const lat2 = (toLat * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Projects a point P (lat, lng) onto segment [A, B] and returns the closest point on the segment.
 */
function projectPointOnSegment(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): { lat: number; lng: number; distSq: number } {
  const cosLat = Math.cos((pLat * Math.PI) / 180);
  const dx = (bLng - aLng) * cosLat;
  const dy = bLat - aLat;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    const dpx = (pLng - aLng) * cosLat;
    const dpy = pLat - aLat;
    return { lat: aLat, lng: aLng, distSq: dpx * dpx + dpy * dpy };
  }

  const dpx = (pLng - aLng) * cosLat;
  const dpy = pLat - aLat;
  let t = (dpx * dx + dpy * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projLat = aLat + t * (bLat - aLat);
  const projLng = aLng + t * (bLng - aLng);

  const diffX = (pLng - projLng) * cosLat;
  const diffY = pLat - projLat;
  const distSq = diffX * diffX + diffY * diffY;

  return { lat: projLat, lng: projLng, distSq };
}

/**
 * Snaps a given point to the nearest point along the road polyline.
 * This guarantees the rider icon sits directly inside/on the road path.
 */
function findClosestPointOnRoute(
  lat: number,
  lng: number,
  path: google.maps.LatLng[],
  maxSnapDistDeg = 0.02, // ~2.0 km snap threshold
): { lat: number; lng: number; segmentIndex: number } {
  if (path.length === 0) return { lat, lng, segmentIndex: 0 };
  if (path.length === 1) {
    return { lat: path[0].lat(), lng: path[0].lng(), segmentIndex: 0 };
  }

  let minDistSq = Infinity;
  let bestLat = path[0].lat();
  let bestLng = path[0].lng();
  let bestSegment = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const proj = projectPointOnSegment(
      lat,
      lng,
      a.lat(),
      a.lng(),
      b.lat(),
      b.lng(),
    );

    if (proj.distSq < minDistSq) {
      minDistSq = proj.distSq;
      bestLat = proj.lat;
      bestLng = proj.lng;
      bestSegment = i;
    }
  }

  // If reported coordinates are within road vicinity (~2km), snap cleanly onto the road polyline.
  // If tester inputs coordinates far away (e.g. testing with Sensors), use exact coordinates so movement is visible.
  if (Math.sqrt(minDistSq) <= maxSnapDistDeg) {
    return { lat: bestLat, lng: bestLng, segmentIndex: bestSegment };
  }

  return { lat, lng, segmentIndex: bestSegment };
}

/**
 * Approximates path length in kilometers for LatLng points.
 */
function computePathKm(path: google.maps.LatLng[]): number {
  if (path.length < 2) return 0;
  let totalMeters = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const dLat = ((p2.lat() - p1.lat()) * Math.PI) / 180;
    const dLng = ((p2.lng() - p1.lng()) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.lat() * Math.PI) / 180) *
        Math.cos((p2.lat() * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalMeters += 6371000 * c;
  }
  return totalMeters / 1000;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  origin,
  destination,
  riderLocation,
  orderStatus,
  riderName = 'Delivery Partner',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const gMapsRef = useRef<typeof google.maps | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const originMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const riderMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const riderIconElementRef = useRef<HTMLDivElement | null>(null);

  // Full Road Points from Directions / OSRM
  const fullRoadPathRef = useRef<google.maps.LatLng[]>([]);

  // Current Snapped Rider Position
  const currentCoordsRef = useRef<{ lat: number; lng: number }>({
    lat: riderLocation?.lat ?? origin.lat,
    lng: riderLocation?.lng ?? origin.lng,
  });
  const animationFrameRef = useRef<number | null>(null);

  const [routeDistanceText, setRouteDistanceText] = useState<string>('');
  const [routeDurationText, setRouteDurationText] = useState<string>('');

  const isDarkMode =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  // ─── Update Yellow Polyline From Rider to Delivery ─────────────────────────
  const updateRemainingPolyline = useCallback(
    (currentLat: number, currentLng: number) => {
      const gMaps = gMapsRef.current;
      const map = mapRef.current;
      if (!gMaps || !map || fullRoadPathRef.current.length === 0) return;

      const path = fullRoadPathRef.current;
      const { lat: snappedLat, lng: snappedLng, segmentIndex } =
        findClosestPointOnRoute(currentLat, currentLng, path);

      // Remaining path starts precisely at the snapped rider position and continues to destination
      const remainingPath: google.maps.LatLng[] = [
        new gMaps.LatLng(snappedLat, snappedLng),
        ...path.slice(segmentIndex + 1),
      ];

      // Ensure destination point is always present at the end
      const destLatLng = new gMaps.LatLng(destination.lat, destination.lng);
      if (remainingPath.length === 1) {
        remainingPath.push(destLatLng);
      }

      if (routePolylineRef.current) {
        routePolylineRef.current.setPath(remainingPath);
        routePolylineRef.current.setOptions({
          strokeColor: '#facc15', // Vibrant yellow from rider to destination
          strokeOpacity: 0.95,
          strokeWeight: 5,
        });
      } else {
        routePolylineRef.current = new gMaps.Polyline({
          path: remainingPath,
          geodesic: true,
          strokeColor: '#facc15', // Vibrant yellow from rider to destination
          strokeOpacity: 0.95,
          strokeWeight: 5,
          zIndex: 100,
          map,
        });
      }

      // Compute remaining distance & ETA dynamically from remaining path
      const km = computePathKm(remainingPath);
      const distStr = `${km.toFixed(1)} km`;
      const mins = Math.max(Math.round(km * 3.5), 2); // Average urban delivery pace ~18-20 km/h
      setRouteDistanceText(distStr);
      setRouteDurationText(`${mins} mins`);
    },
    [destination.lat, destination.lng],
  );

  // ─── 1. Initialize Google Map ───────────────────────────────────────────────
  useEffect(() => {
    let isCancelled = false;

    loadGoogleMaps()
      .then((gMaps) => {
        if (isCancelled || !mapContainerRef.current) return;
        gMapsRef.current = gMaps;

        const defaultCenter = {
          lat: (origin.lat + destination.lat) / 2 || origin.lat,
          lng: (origin.lng + destination.lng) / 2 || origin.lng,
        };

        const map = new gMaps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 14,
          mapId: 'DEMO_MAP_ID', // Enables AdvancedMarkerElement
          disableDefaultUI: true,
          zoomControl: true,
          styles: isDarkMode ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
          gestureHandling: 'greedy',
        });

        mapRef.current = map;

        // Create Origin (Restaurant) Marker
        const originEl = document.createElement('div');
        originEl.className = 'group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110';
        originEl.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-1 rounded-2xl bg-amber-500/30 blur-xs"></div>
            <div class="relative w-9 h-9 rounded-2xl bg-linear-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 ring-2 ring-white dark:ring-zinc-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
              </svg>
            </div>
            <div class="absolute -bottom-6 px-2 py-0.5 rounded-md bg-zinc-900/90 text-[10px] font-bold text-white whitespace-nowrap shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              ${origin.title || 'Restaurant'}
            </div>
          </div>
        `;

        if (gMaps.marker?.AdvancedMarkerElement) {
          originMarkerRef.current = new gMaps.marker.AdvancedMarkerElement({
            map,
            position: { lat: origin.lat, lng: origin.lng },
            content: originEl,
            title: origin.title || 'Store Pickup',
          });
        } else {
          originMarkerRef.current = new gMaps.Marker({
            map,
            position: { lat: origin.lat, lng: origin.lng },
            title: origin.title || 'Store Pickup',
          });
        }

        // Create Destination (Customer) Marker
        const destEl = document.createElement('div');
        destEl.className = 'group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110';
        destEl.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-1 rounded-2xl bg-emerald-500/30 blur-xs"></div>
            <div class="relative w-9 h-9 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-2 ring-white dark:ring-zinc-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="absolute -bottom-6 px-2 py-0.5 rounded-md bg-zinc-900/90 text-[10px] font-bold text-white whitespace-nowrap shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              ${destination.title || 'Delivery Address'}
            </div>
          </div>
        `;

        if (gMaps.marker?.AdvancedMarkerElement) {
          destMarkerRef.current = new gMaps.marker.AdvancedMarkerElement({
            map,
            position: { lat: destination.lat, lng: destination.lng },
            content: destEl,
            title: destination.title || 'Delivery Destination',
          });
        } else {
          destMarkerRef.current = new gMaps.Marker({
            map,
            position: { lat: destination.lat, lng: destination.lng },
            title: destination.title || 'Delivery Destination',
          });
        }

        // Compact, Precision-Centered Rider Marker (Sitting snugly directly on the road line)
        const riderEl = document.createElement('div');
        riderEl.style.cssText =
          'position: relative; width: 26px; height: 26px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; pointer-events: auto; cursor: pointer;';
        riderEl.innerHTML = `
          <div class="relative flex items-center justify-center w-full h-full">
            <!-- Small Rider Disc (Fits snugly directly on the road line) -->
            <div id="rider-icon-disc" class="w-6.5 h-6.5 rounded-full bg-linear-to-tr from-amber-400 to-yellow-300 text-zinc-950 flex items-center justify-center shadow-md shadow-yellow-500/40 ring-2 ring-white dark:ring-zinc-900 transition-transform duration-300 ease-out">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
              </svg>
            </div>

            <!-- Micro Floating Rider Name Tag (Anchored cleanly above without offsetting the disc) -->
            <div style="position: absolute; top: -19px; left: 50%; transform: translateX(-50%);" class="px-2 py-0.5 rounded-full bg-zinc-900/90 text-white text-[9px] font-bold tracking-tight shadow-md border border-yellow-400/40 whitespace-nowrap flex items-center gap-1 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>${riderName}</span>
            </div>
          </div>
        `;
        riderIconElementRef.current = riderEl.querySelector('#rider-icon-disc');

        const initialRawPos = {
          lat: riderLocation?.lat ?? origin.lat,
          lng: riderLocation?.lng ?? origin.lng,
        };

        if (gMaps.marker?.AdvancedMarkerElement) {
          riderMarkerRef.current = new gMaps.marker.AdvancedMarkerElement({
            map,
            position: initialRawPos,
            content: riderEl,
            title: riderName,
            zIndex: 999,
          });
        } else {
          riderMarkerRef.current = new gMaps.Marker({
            map,
            position: initialRawPos,
            title: riderName,
            zIndex: 999,
          });
        }

        // Direct Fallback Path generator if directions API is unavailable
        const buildFallbackPath = (): google.maps.LatLng[] => {
          const steps = 30;
          const pts: google.maps.LatLng[] = [];
          for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            const lat = origin.lat + (destination.lat - origin.lat) * ratio;
            const lng = origin.lng + (destination.lng - origin.lng) * ratio;
            pts.push(new gMaps.LatLng(lat, lng));
          }
          return pts;
        };

        const onRoadRouteReady = (roadPath: google.maps.LatLng[]) => {
          fullRoadPathRef.current = roadPath;

          // Determine initial rider position snapped to road
          const initialTargetLat = riderLocation?.lat ?? origin.lat;
          const initialTargetLng = riderLocation?.lng ?? origin.lng;
          const snapped = findClosestPointOnRoute(
            initialTargetLat,
            initialTargetLng,
            roadPath,
          );

          currentCoordsRef.current = { lat: snapped.lat, lng: snapped.lng };

          // Update Rider Marker position to snapped road coordinate
          const marker = riderMarkerRef.current;
          if (marker) {
            if ('position' in marker) {
              (marker as google.maps.marker.AdvancedMarkerElement).position = {
                lat: snapped.lat,
                lng: snapped.lng,
              };
            } else if (
              'setPosition' in marker &&
              typeof (marker as google.maps.Marker).setPosition === 'function'
            ) {
              (marker as google.maps.Marker).setPosition({
                lat: snapped.lat,
                lng: snapped.lng,
              });
            }
          }

          // Draw yellow line ONLY from rider position to destination
          updateRemainingPolyline(snapped.lat, snapped.lng);

          // Fit viewport to encompass remaining route and origin comfortably
          const bounds = new gMaps.LatLngBounds();
          bounds.extend(new gMaps.LatLng(snapped.lat, snapped.lng));
          bounds.extend(new gMaps.LatLng(destination.lat, destination.lng));
          bounds.extend(new gMaps.LatLng(origin.lat, origin.lng));
          map.fitBounds(bounds, { top: 65, right: 65, bottom: 65, left: 65 });
        };

        // Helper to fetch real street road network coordinates via OSRM
        const fetchRoadRoute = async (): Promise<boolean> => {
          try {
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
            const res = await fetch(osrmUrl);
            const data = await res.json();

            if (
              data?.code === 'Ok' &&
              data?.routes?.[0]?.geometry?.coordinates?.length
            ) {
              const roadPath: google.maps.LatLng[] =
                data.routes[0].geometry.coordinates.map(
                  ([lng, lat]: [number, number]) =>
                    new gMaps.LatLng(lat, lng),
                );
              onRoadRouteReady(roadPath);
              return true;
            }
          } catch (err) {
            console.warn('[LiveTrackingMap] OSRM road fetch failed:', err);
          }
          return false;
        };

        // Fetch Google Driving Directions Route
        const directionsService = new gMaps.DirectionsService();
        directionsService.route(
          {
            origin: { lat: origin.lat, lng: origin.lng },
            destination: { lat: destination.lat, lng: destination.lng },
            travelMode: gMaps.TravelMode.DRIVING,
          },
          async (result, status) => {
            if (
              status === gMaps.DirectionsStatus.OK &&
              result?.routes?.[0]?.overview_path?.length
            ) {
              onRoadRouteReady(result.routes[0].overview_path);
            } else {
              console.warn(
                '[LiveTrackingMap] Google Directions returned status:',
                status,
                '— fetching real street network via OSRM road routing...',
              );

              const gotRoad = await fetchRoadRoute();
              if (!gotRoad) {
                onRoadRouteReady(buildFallbackPath());
              }
            }
          },
        );
      })
      .catch((err) => {
        console.error('Failed to initialize Google Maps in LiveTrackingMap:', err);
      });

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
      }
      const clearMarker = (
        marker:
          | google.maps.marker.AdvancedMarkerElement
          | google.maps.Marker
          | null,
      ) => {
        if (!marker) return;
        if ('map' in marker) {
          (marker as google.maps.marker.AdvancedMarkerElement).map = null;
        } else if (
          'setMap' in marker &&
          typeof (marker as google.maps.Marker).setMap === 'function'
        ) {
          (marker as google.maps.Marker).setMap(null);
        }
      };

      clearMarker(originMarkerRef.current);
      clearMarker(destMarkerRef.current);
      clearMarker(riderMarkerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Initial route/markers setup; live rider movement is animated smoothly via dedicated effect
  }, [origin.lat, origin.lng, destination.lat, destination.lng, isDarkMode, riderName, updateRemainingPolyline]);

  // ─── 2. Smooth Interpolation Animation Snapped to Road Line ────────────────
  const animateMarkerTo = useCallback(
    (targetLat: number, targetLng: number, heading = 0) => {
      if (!riderMarkerRef.current) return;

      // Snap the target coordinate directly onto the road polyline
      const path = fullRoadPathRef.current;
      const snapped =
        path.length > 0
          ? findClosestPointOnRoute(targetLat, targetLng, path)
          : { lat: targetLat, lng: targetLng };

      const startLat = currentCoordsRef.current.lat;
      const startLng = currentCoordsRef.current.lng;
      const startTime = performance.now();
      const duration = 2000; // Smooth 2s glide between GPS ticks

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Calculate bearing towards snapped target if heading is 0
      const effectiveHeading =
        heading || calculateHeading(startLat, startLng, snapped.lat, snapped.lng);

      if (riderIconElementRef.current) {
        riderIconElementRef.current.style.transform = `rotate(${effectiveHeading}deg)`;
      }

      // If the target position is outside the current map viewport, pan smoothly to keep rider visible
      if (mapRef.current && gMapsRef.current) {
        const bounds = mapRef.current.getBounds();
        if (bounds && !bounds.contains(new gMapsRef.current.LatLng(snapped.lat, snapped.lng))) {
          mapRef.current.panTo(snapped);
        }
      }

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

        const currentLat = startLat + (snapped.lat - startLat) * ease;
        const currentLng = startLng + (snapped.lng - startLng) * ease;

        currentCoordsRef.current = { lat: currentLat, lng: currentLng };

        const marker = riderMarkerRef.current;
        if (marker) {
          if ('position' in marker) {
            (marker as google.maps.marker.AdvancedMarkerElement).position = {
              lat: currentLat,
              lng: currentLng,
            };
          } else if (
            'setPosition' in marker &&
            typeof (marker as google.maps.Marker).setPosition === 'function'
          ) {
            (marker as google.maps.Marker).setPosition({
              lat: currentLat,
              lng: currentLng,
            });
          }
        }

        // Continuously update the yellow route line from rider's current position to destination
        updateRemainingPolyline(currentLat, currentLng);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [updateRemainingPolyline],
  );

  // Trigger smooth marker move whenever real rider coordinates arrive via socket
  useEffect(() => {
    if (riderLocation) {
      animateMarkerTo(
        riderLocation.lat,
        riderLocation.lng,
        riderLocation.heading,
      );
    }
  }, [riderLocation, animateMarkerTo]);

  // ─── 3. Viewport Controls ──────────────────────────────────────────────────
  const handleRecenterRider = () => {
    if (mapRef.current && riderMarkerRef.current) {
      const pos = currentCoordsRef.current;
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(16);
    }
  };

  const handleFitRoute = () => {
    const gMaps = gMapsRef.current;
    if (mapRef.current && gMaps) {
      const bounds = new gMaps.LatLngBounds();
      bounds.extend(new gMaps.LatLng(currentCoordsRef.current.lat, currentCoordsRef.current.lng));
      bounds.extend(new gMaps.LatLng(destination.lat, destination.lng));
      bounds.extend(new gMaps.LatLng(origin.lat, origin.lng));
      mapRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  };

  return (
    <div className={`relative w-full h-full min-h-95 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-950 ${className}`}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-95" />

      {/* Floating Header Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg border border-zinc-200/70 dark:border-zinc-800/70 flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live GPS Telemetry</span>
          {orderStatus === 'picked_up' && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-extrabold uppercase tracking-wide">
              On Route
            </span>
          )}
        </div>

        {routeDurationText && (
          <div className="px-3 py-1.5 rounded-2xl bg-zinc-900/90 text-white backdrop-blur-md shadow-lg text-xs font-bold flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-yellow-400" />
            <span>ETA ~{routeDurationText}</span>
            <span className="text-zinc-400">({routeDistanceText})</span>
          </div>
        )}
      </div>

      {/* Floating Action Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleRecenterRider}
          title="Center on Rider"
          className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-200 hover:text-yellow-500 dark:hover:text-yellow-400 shadow-lg border border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <button
          onClick={handleFitRoute}
          title="Fit Route Bounds"
          className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-200 hover:text-yellow-500 dark:hover:text-yellow-400 shadow-lg border border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg border border-zinc-200/70 dark:border-zinc-800/70 pointer-events-auto flex items-center gap-3 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
            <span className="truncate max-w-30 sm:max-w-none">{origin.title || 'Store'}</span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 ring-2 ring-yellow-400/30" />
            <span>Rider</span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span className="truncate max-w-30 sm:max-w-none">Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
