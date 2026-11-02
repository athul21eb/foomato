import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { orderApiSlice } from '../../../slices/order/orderApiSlice';
import { ENV } from '../../../config/env';

export interface RiderLiveLocation {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  updatedAt: number;
}

export function useOrderTracking(orderId?: string) {
  const dispatch = useAppDispatch();
  const authInfo = useAppSelector((state) => state.auth?.authInfo);
  const token = authInfo?.accessToken;

  const [isConnected, setIsConnected] = useState(false);
  const [riderLocation, setRiderLocation] = useState<RiderLiveLocation | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !orderId) {
      return;
    }

    const socket: Socket = io(ENV.REALTIME_WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:order', { orderId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Listen for live rider GPS ticks
    socket.on(
      'order:rider:location',
      (payload: {
        orderId?: string;
        coordinates?: [number, number]; // [lng, lat]
        heading?: number;
        speed?: number;
        updatedAt?: number;
      }) => {
        if (!payload?.coordinates || payload.coordinates.length < 2) return;
        if (payload.orderId && payload.orderId !== orderId) return;

        setRiderLocation({
          lng: payload.coordinates[0],
          lat: payload.coordinates[1],
          heading: typeof payload.heading === 'number' ? payload.heading : 0,
          speed: typeof payload.speed === 'number' ? payload.speed : 0,
          updatedAt: payload.updatedAt || Date.now(),
        });
      },
    );

    // Listen for order status updates
    socket.on(
      'order:status_updated',
      (payload: { orderId?: string; status?: string }) => {
        if (payload?.orderId === orderId) {
          dispatch(orderApiSlice.util.invalidateTags([{ type: 'Order', id: orderId }]));
        }
      },
    );

    return () => {
      if (socket.connected) {
        socket.emit('leave:order', { orderId });
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, orderId, dispatch]);

  // Dev Sensor Bridge: Allows testing GPS updates directly in Chrome DevTools "Sensors"
  // from this customer tracking tab during local development
  useEffect(() => {
    if (!import.meta.env.DEV || !orderId || !isConnected) {
      return;
    }

    if (!('geolocation' in navigator)) {
      return;
    }

    let lastLat = 0;
    let lastLng = 0;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading, speed } = pos.coords;
        // Ignore duplicate emissions if coordinates did not change
        if (
          Math.abs(latitude - lastLat) < 0.000001 &&
          Math.abs(longitude - lastLng) < 0.000001
        ) {
          return;
        }
        lastLat = latitude;
        lastLng = longitude;

        if (socketRef.current?.connected) {
          socketRef.current.emit('rider:location', {
            orderId,
            coordinates: [longitude, latitude], // [lng, lat] GeoJSON format
            heading: typeof heading === 'number' && !isNaN(heading) ? heading : 0,
            speed: typeof speed === 'number' && !isNaN(speed) ? speed : 0,
          });
        }
      },
      (err) => {
        console.debug('Dev sensor tracking watchPosition error:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [orderId, isConnected]);

  /**
   * Helper to emit a simulated rider coordinate tick to the Realtime service.
   * Useful for development, manual testing, or previewing live movement.
   */
  const emitSimulatedLocation = useCallback(
    (coords: [number, number], heading = 0, speed = 25) => {
      if (!socketRef.current || !orderId) return;
      socketRef.current.emit('rider:location', {
        orderId,
        coordinates: coords,
        heading,
        speed,
      });
    },
    [orderId],
  );

  return {
    isConnected,
    riderLocation,
    emitSimulatedLocation,
  };
}
