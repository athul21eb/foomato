import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { orderApiSlice } from '../../../slices/order/orderApiSlice';
import { ENV } from '../../../config/env';
import { toast } from 'sonner';

const SOUND_STORAGE_KEY = 'foomato_seller_order_sound_muted';
const NOTIFICATION_SOUND_URL = '/notifications/seller.mp3';

interface UseSellerSocketOptions {
  sellerId?: string;
}

export function useSellerSocket({ sellerId }: UseSellerSocketOptions) {
  const dispatch = useAppDispatch();
  const authInfo = useAppSelector((state) => state.auth?.authInfo);
  const token = authInfo?.accessToken;

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.preload = 'auto';
      audioRef.current = audio;
    } catch (err) {
      console.warn('Could not initialize audio element:', err);
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
      console.warn('Failed to play notification sound:', err);
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

      // Pre-warm audio on unmute to satisfy browser autoplay policy
      if (!next && audioRef.current) {
        audioRef.current.load();
        toast.info('Sound notifications enabled');
      } else if (next) {
        toast.info('Sound notifications muted');
      }

      return next;
    });
  }, []);

  // Manage Socket connection
  useEffect(() => {
    if (!token || !sellerId) {
      return;
    }

    const socket: Socket = io(ENV.REALTIME_WS_URL, {
      auth: {
        token,
        sellerId,
        restaurantId: sellerId,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join seller room dynamically as fallback
      socket.emit('join:seller', { sellerId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle new incoming order notification
    socket.on(
      'order:new',
      (payload: {
        orderId?: string;
        orderNumber?: string;
        totalAmount?: number;
        itemsCount?: number;
        [key: string]: unknown;
      }) => {
        playNotificationSound();
        dispatch(orderApiSlice.util.invalidateTags(['SellerOrders']));

        const displayNum =
          payload?.orderNumber ||
          (payload?.orderId
            ? `#ORD-${payload.orderId.slice(-6).toUpperCase()}`
            : null);

        toast.success(
          displayNum ? `🔔 New Order ${displayNum}` : '🔔 New Order Incoming!',
          {
            description: displayNum
              ? `Order ${displayNum} placed in your kitchen${
                  payload?.totalAmount ? ` (₹${payload.totalAmount})` : ''
                }`
              : 'A new ticket has arrived in your live kitchen queue.',
            duration: 6000,
          },
        );
      },
    );

    // Also invalidate when order status updates
    socket.on('order:status_updated', () => {
      dispatch(orderApiSlice.util.invalidateTags(['SellerOrders']));
    });

    // Invalidate immediately when rider accepts/assigned to order
    socket.on(
      'order:rider_assigned',
      (payload: {
        orderId?: string;
        orderNumber?: string;
        riderName?: string;
        riderPhone?: string;
        [key: string]: unknown;
      }) => {
        dispatch(orderApiSlice.util.invalidateTags(['SellerOrders']));

        const displayNum =
          payload?.orderNumber ||
          (payload?.orderId
            ? `#ORD-${payload.orderId.slice(-6).toUpperCase()}`
            : 'Order');

        toast.info(
          payload?.riderName
            ? `🛵 Rider ${payload.riderName} assigned to ${displayNum}`
            : `🛵 Rider assigned to ${displayNum}`,
          {
            description:
              'Courier partner has accepted the order and is navigating to your kitchen.',
            duration: 6000,
          },
        );
      },
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, sellerId, dispatch, playNotificationSound]);

  return {
    isConnected,
    isMuted,
    toggleMute,
    playNotificationSound,
  };
}
