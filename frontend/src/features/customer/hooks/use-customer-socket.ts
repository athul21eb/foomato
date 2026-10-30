import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { orderApiSlice } from '../../../slices/order/orderApiSlice';
import { ENV } from '../../../config/env';
import { toast } from 'sonner';

const STATUS_DISPLAY_INFO: Record<string, { title: string; desc: string }> = {
  placed: {
    title: 'Order Placed',
    desc: 'Your order was sent to the restaurant.',
  },
  accepted: {
    title: 'Order Accepted',
    desc: 'The restaurant has confirmed your order.',
  },
  preparing: {
    title: 'Kitchen Preparing',
    desc: 'Chefs are now preparing your delicious food!',
  },
  ready_for_rider: {
    title: 'Order Packed',
    desc: 'Your meal is freshly packed and waiting for the rider.',
  },
  rider_assigned: {
    title: 'Rider Assigned',
    desc: 'A delivery partner has been assigned to your order.',
  },
  picked_up: {
    title: 'Out for Delivery',
    desc: 'Your rider picked up your food and is heading your way!',
  },
  delivered: {
    title: 'Order Delivered 🎉',
    desc: 'Your meal has arrived safely. Enjoy your food!',
  },
  cancelled: {
    title: 'Order Cancelled',
    desc: 'Your order was cancelled.',
  },
};

export function useCustomerSocket() {
  const dispatch = useAppDispatch();
  const authInfo = useAppSelector((state) => state.auth?.authInfo);
  const token = authInfo?.accessToken;
  const userId = authInfo?.user?.id;

  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !userId) {
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
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Handle order status transitions
    socket.on(
      'order:status_updated',
      (payload: {
        orderId?: string;
        orderNumber?: string;
        status?: string;
        restaurantName?: string;
        reason?: string;
        [key: string]: unknown;
      }) => {
        // Invalidate active customer orders tag to trigger real-time refresh
        dispatch(orderApiSlice.util.invalidateTags(['Order']));

        const statusKey = payload?.status || '';
        const info = STATUS_DISPLAY_INFO[statusKey] || {
          title: `Status: ${statusKey}`,
          desc: 'Your order status has changed.',
        };

        const displayNum =
          payload?.orderNumber ||
          (payload?.orderId
            ? `#ORD-${payload.orderId.slice(-6).toUpperCase()}`
            : 'Order');

        const toastTitle = `🔔 ${displayNum}: ${info.title}`;
        const toastDesc = payload?.restaurantName
          ? `${payload.restaurantName} • ${info.desc}`
          : info.desc;

        if (statusKey === 'cancelled') {
          toast.error(toastTitle, {
            description: payload?.reason ? `Reason: ${payload.reason}` : toastDesc,
            duration: 6000,
          });
        } else if (statusKey === 'delivered') {
          toast.success(toastTitle, {
            description: toastDesc,
            duration: 7000,
          });
        } else {
          toast.info(toastTitle, {
            description: toastDesc,
            duration: 5000,
          });
        }
      },
    );

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
        dispatch(orderApiSlice.util.invalidateTags(['Order']));

        const displayNum =
          payload?.orderNumber ||
          (payload?.orderId
            ? `#ORD-${payload.orderId.slice(-6).toUpperCase()}`
            : 'Order');

        toast.info(`🛵 ${displayNum}: Rider Assigned`, {
          description: payload?.riderName
            ? `${payload.riderName} has been assigned and is heading to pick up your order.`
            : 'A delivery partner has been assigned to your order.',
          duration: 6000,
        });
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, userId, dispatch]);

  return {
    isConnected,
  };
}
