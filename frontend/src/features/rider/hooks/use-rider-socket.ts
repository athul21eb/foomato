import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { riderApiSlice } from '../../../slices/rider/riderApiSlice';
import { ENV } from '../../../config/env';
import { toast } from 'sonner';
import type { IncomingOrderAlert } from '../types/rider.types';

const SOUND_STORAGE_KEY = 'foomato_rider_order_sound_muted';
const NOTIFICATION_SOUND_URL = '/notifications/rider.mp3';

interface UseRiderSocketOptions {
  riderId?: string;
  isAvailable?: boolean;
  enabled?: boolean;
  activeOrderId?: string;
  activeOrderStatus?: string;
}

export function useRiderSocket({
  riderId,
  isAvailable,
  enabled = true,
  activeOrderId,
  activeOrderStatus,
}: UseRiderSocketOptions) {
  const dispatch = useAppDispatch();
  const authInfo = useAppSelector((state) => state.auth?.authInfo);
  const token = authInfo?.accessToken;

  const [isConnected, setIsConnected] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState<IncomingOrderAlert[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Notification Audio
  useEffect(() => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.preload = 'auto';
      audioRef.current = audio;
    } catch (err) {
      console.warn('Could not initialize rider audio element:', err);
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (isMuted) return;
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('Audio play prevented by browser autoplay policy:', error);
          });
        }
      }
    } catch (err) {
      console.warn('Failed to play rider notification sound:', err);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }

      if (!next && audioRef.current) {
        audioRef.current.load();
        toast.info('Rider dispatch sound enabled');
      } else if (next) {
        toast.info('Rider dispatch sound muted');
      }

      return next;
    });
  }, []);

  const dismissAlert = useCallback((orderId: string) => {
    setIncomingOrders((prev) => prev.filter((o) => o.orderId !== orderId));
  }, []);

  const clearAlerts = useCallback(() => {
    setIncomingOrders([]);
  }, []);

  // Manage Realtime WebSocket Connection
  useEffect(() => {
    if (!enabled || !token || !riderId) {
      return;
    }

    const socket: Socket = io(ENV.REALTIME_WS_URL, {
      auth: {
        token,
        riderId,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join explicit rider room
      socket.emit('join:rider', { riderId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle incoming dispatch delivery alert
    socket.on('order:available', (payload: IncomingOrderAlert) => {
      if (!payload || !payload.orderId) return;

      playNotificationSound();

      setIncomingOrders((prev) => {
        // Avoid duplicates
        if (prev.some((item) => item.orderId === payload.orderId)) {
          return prev;
        }
        return [payload, ...prev];
      });

      const displayNum =
        payload.orderNumber ||
        `#ORD-${payload.orderId.slice(-6).toUpperCase()}`;

      toast.warning(`⚡ New Delivery Available: ${displayNum}`, {
        description: `Pickup from ${payload.restaurantName || 'Restaurant'} • Earn ₹${
          payload.riderAmount || 40
        }`,
        duration: 10000,
      });
    });

    // Handle order lifecycle updates (status changes by restaurant, customer, or system)
    socket.on(
      'order:status_updated',
      (payload: { orderId?: string; status?: string }) => {
        dispatch(riderApiSlice.util.invalidateTags(['RiderCurrentOrder', 'Rider']));

        // If this order was in the incoming list, remove it because someone accepted/updated it
        if (payload?.orderId) {
          setIncomingOrders((prev) =>
            prev.filter((o) => o.orderId !== payload.orderId),
          );
        }

        if (payload?.status) {
          toast.info(`Delivery update: Status is now ${payload.status}`);
        }
      },
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, token, riderId, dispatch, playNotificationSound]);

  const isDelivering =
    Boolean(activeOrderId) &&
    (activeOrderStatus === 'rider_assigned' || activeOrderStatus === 'picked_up');

  // Live GPS broadcast: when rider is on duty and actively delivering an order
  useEffect(() => {
    if (!isDelivering || !isConnected || !socketRef.current) {
      return;
    }

    if (!('geolocation' in navigator)) {
      console.warn('Geolocation is not supported by this browser/device.');
      return;
    }

    let lastLat = 0;
    let lastLng = 0;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading, speed } = pos.coords;
        if (
          Math.abs(latitude - lastLat) < 0.000001 &&
          Math.abs(longitude - lastLng) < 0.000001
        ) {
          return;
        }
        lastLat = latitude;
        lastLng = longitude;

        if (socketRef.current?.connected && activeOrderId) {
          socketRef.current.emit('rider:location', {
            orderId: activeOrderId,
            coordinates: [longitude, latitude], // [lng, lat] GeoJSON format
            heading: typeof heading === 'number' && !isNaN(heading) ? heading : 0,
            speed: typeof speed === 'number' && !isNaN(speed) ? speed : 0,
          });
        }
      },
      (err) => {
        console.warn('Rider geolocation watch error:', err.message);
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
  }, [activeOrderId, activeOrderStatus, isConnected, isDelivering]);

  return {
    isConnected,
    isDelivering,
    isMuted,
    toggleMute,
    incomingOrders: isAvailable ? incomingOrders : [],
    dismissAlert,
    clearAlerts,
    playNotificationSound,
  };
}
