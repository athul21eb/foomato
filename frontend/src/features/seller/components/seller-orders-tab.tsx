import React, { useState, useEffect } from 'react';
import type { Seller } from '../types/seller.types';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  MapPin,
  CookingPot,
  Bike,
  Bell,
  BellOff,
  Volume2,
  XCircle,
  AlertCircle,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { Pagination } from '../../../components/ui/pagination';
import {
  AnimatePresence,
  AnimatedOrderList,
  AnimatedOrderCard,
  AnimatedStatusTab,
} from '../../../lib/animations';
import { toast } from 'sonner';
import { formatCurrency } from '../../../lib/utils';
import {
  useGetSellerOrdersQuery,
  useUpdateOrderStatusMutation,
  useRetryRiderDispatchMutation,
} from '../../../slices/order/orderApiSlice';
import { useSellerSocket } from '../hooks/use-seller-socket';
import type { OrderDetails } from '../../checkout/types/checkout.types';

interface SellerRiderDispatchRetryProps {
  orderId: string;
  riderId?: string | null;
  riderName?: string | null;
  onRetry: (orderId: string) => Promise<void>;
  isRetrying: boolean;
}

const SellerRiderDispatchRetry: React.FC<SellerRiderDispatchRetryProps> = ({
  orderId,
  riderId,
  riderName,
  onRetry,
  isRetrying,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);

  useEffect(() => {
    setSecondsRemaining(10);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (riderId) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <Bike className="w-4 h-4 text-emerald-500" />
        <span>Rider Assigned: {riderName || 'Courier Partner'}</span>
      </div>
    );
  }

  const handleRetryClick = async () => {
    await onRetry(orderId);
    setSecondsRemaining(10);
  };

  if (secondsRemaining > 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-300">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        <span>Finding Rider ({secondsRemaining}s)</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isRetrying}
      onClick={handleRetryClick}
      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-linear-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
      <span>Retry Finding Rider</span>
    </button>
  );
};

interface SellerOrdersTabProps {
  seller: Seller;
  socketProps?: ReturnType<typeof useSellerSocket>;
}

export const SellerOrdersTab: React.FC<SellerOrdersTabProps> = ({
  seller,
  socketProps,
}) => {
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cancelModalOrder, setCancelModalOrder] = useState<OrderDetails | null>(
    null,
  );
  const [cancellationReason, setCancellationReason] = useState<string>('');

  const ORDERS_PER_PAGE = 5;

  // Initialize or inherit Realtime WebSocket Connection & Sound Chimes
  const fallbackSocket = useSellerSocket({
    sellerId: socketProps ? undefined : seller.id,
  });
  const { isConnected, isMuted, toggleMute, playNotificationSound } =
    socketProps ?? fallbackSocket;

  // Live RTK Query
  const {
    data: ordersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetSellerOrdersQuery({
    page: currentPage,
    limit: ORDERS_PER_PAGE,
    status: activeStatus === 'all' ? undefined : activeStatus,
  });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [retryDispatch, { isLoading: isRetryingDispatch }] =
    useRetryRiderDispatchMutation();
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  const handleRetryDispatch = async (orderId: string) => {
    try {
      setRetryingOrderId(orderId);
      await retryDispatch({ orderId }).unwrap();
      toast.success('Rider broadcast resent! Nearby riders notified.');
    } catch (err: unknown) {
      const errorMsg =
        typeof err === 'object' && err && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message || 'Failed to retry dispatch'
          : 'Failed to retry dispatch';
      toast.error(errorMsg);
    } finally {
      setRetryingOrderId(null);
    }
  };

  const orders = ordersData?.orders || [];
  const totalOrders = ordersData?.total || 0;
  const totalPages = ordersData?.totalPages || 1;
  const counts = ordersData?.counts;

  // Handle status update
  const handleUpdateStatus = async (
    orderId: string,
    nextStatus: string,
    reason?: string,
  ) => {
    try {
      await updateStatus({
        orderId,
        status: nextStatus,
        reason,
      }).unwrap();

      const labels: Record<string, string> = {
        accepted: 'Order accepted! Moved to preparation queue.',
        preparing: 'Kitchen started cooking this order.',
        ready_for_rider: 'Order marked ready for delivery rider pickup!',
        cancelled: 'Order has been cancelled.',
      };

      toast.success(labels[nextStatus] || `Order updated to ${nextStatus}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data: { message?: string } }).data.message
          : 'Failed to update order status';
      toast.error(message || 'Failed to update status');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    await handleUpdateStatus(
      cancelModalOrder.id,
      'cancelled',
      cancellationReason.trim() || undefined,
    );
    setCancelModalOrder(null);
    setCancellationReason('');
  };

  const formatOrderTime = (dateStr?: string): string => {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const statusPills = [
    { id: 'all', label: 'All', count: counts?.all ?? totalOrders },
    {
      id: 'placed',
      label: 'Incoming',
      count: counts?.placed ?? 0,
      highlight: true,
    },
    { id: 'accepted', label: 'Accepted', count: counts?.accepted ?? 0 },
    { id: 'preparing', label: 'In Kitchen', count: counts?.preparing ?? 0 },
    {
      id: 'ready_for_rider',
      label: 'Ready',
      count: counts?.ready_for_rider ?? 0,
    },
    { id: 'delivered', label: 'Completed', count: counts?.delivered ?? 0 },
    { id: 'cancelled', label: 'Cancelled', count: counts?.cancelled ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Live Orders
            </h2>
            {totalOrders > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
                {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Accept incoming customer orders and coordinate kitchen preparation
            for {seller.name}
          </p>
        </div>

        {/* Live Controls: Bell Sound Toggle + Kitchen Live Sync Active */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Notification Sound Bell Button */}
          <button
            type="button"
            onClick={toggleMute}
            title={
              isMuted
                ? 'Sound muted. Click to enable audio chime on new orders'
                : 'Audio chime active. Click to mute'
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              isMuted
                ? 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-500/10'
            }`}
          >
            {isMuted ? (
              <>
                <BellOff className="w-4 h-4 text-zinc-400" />
                <span className="text-[11px]">Sound Off</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
                <span className="text-[11px]">Sound On</span>
              </>
            )}
          </button>

          {/* Test Sound Chime Button */}
          {!isMuted && (
            <button
              type="button"
              onClick={playNotificationSound}
              title="Test chime playback"
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Live Sync Pill */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-semibold ${
              isConnected
                ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-500 animate-ping'
              }`}
            />
            <span>{isConnected ? 'Kitchen Live Sync' : 'Connecting...'}</span>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh order queue"
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-orange-500 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-orange-500' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar - Segmented Allocation */}
      <div className="p-1 sm:p-1.5 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-7 w-full">
          {statusPills.map((tab) => {
            const isSelected = activeStatus === tab.id;
            const hasCount = typeof tab.count === 'number' && tab.count > 0;
            const isIncomingWithOrders = tab.id === 'placed' && hasCount;

            return (
              <AnimatedStatusTab
                key={tab.id}
                type="button"
                isPulseYellowWhite={isIncomingWithOrders}
                onClick={() => {
                  setActiveStatus(tab.id);
                  setCurrentPage(1);
                }}
                className={`relative py-2 px-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 sm:shrink sm:w-full select-none ${
                  isIncomingWithOrders
                    ? 'font-black ring-1 ring-amber-400'
                    : isSelected
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs ring-1 ring-zinc-900/5 dark:ring-white/10'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-700/50'
                }`}
              >
                <span className="truncate">{tab.label}</span>

                {/* Badge count */}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold transition-colors shrink-0 ${
                    isIncomingWithOrders
                      ? 'bg-zinc-900 text-white font-black shadow-xs'
                      : isSelected
                        ? 'bg-orange-500 text-white shadow-2xs'
                        : hasCount
                          ? 'bg-zinc-200/90 dark:bg-zinc-700/90 text-zinc-800 dark:text-zinc-200'
                          : 'bg-zinc-200/50 dark:bg-zinc-700/50 text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {tab.count ?? 0}
                </span>
              </AnimatedStatusTab>
            );
          })}
        </div>
      </div>

      {/* Orders List View */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-semibold">
            Loading kitchen orders...
          </p>
        </div>
      ) : orders.length > 0 ? (
        <AnimatedOrderList className="space-y-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {orders.map((order, index) => {
              const isPlaced = order.status === 'placed';
              const isAccepted = order.status === 'accepted';
              const isPreparing = order.status === 'preparing';
              const isReady = order.status === 'ready_for_rider';
              const isDelivered = order.status === 'delivered';
              const isCancelled = order.status === 'cancelled';

              const formattedAddress =
                order.deliveryAddress?.formattedAddress ||
                order.deliveryAddress?.fromattedAddress ||
                'Standard Delivery Location';

              const customerPhone = order.deliveryAddress?.mobile
                ? String(order.deliveryAddress.mobile)
                : '';

              const orderDisplayNum = order.orderNumber
                ? `#${order.orderNumber}`
                : `#ORD-${order.id.slice(-6).toUpperCase()}`;

              return (
                <AnimatedOrderCard
                  key={order.id}
                  index={index}
                  className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow space-y-4"
                >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-sm shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                          {orderDisplayNum}
                        </span>
                        <span className="text-xs text-zinc-400">
                          • {formatOrderTime(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 mt-0.5">
                        {customerPhone && (
                          <span className="inline-flex items-center gap-1 text-zinc-500">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            {customerPhone}
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.2 rounded-full font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {order.paymentMethod?.toUpperCase()} • {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div>
                    {isPlaced && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Action Required</span>
                      </span>
                    )}
                    {isAccepted && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accepted Order</span>
                      </span>
                    )}
                    {isPreparing && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        <CookingPot className="w-3.5 h-3.5 animate-spin" />
                        <span>Cooking in Kitchen</span>
                      </span>
                    )}
                    {isReady && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <Bike className="w-3.5 h-3.5" />
                        <span>Awaiting Rider Pickup</span>
                      </span>
                    )}
                    {isDelivered && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Fulfilled</span>
                      </span>
                    )}
                    {isCancelled && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelled</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="space-y-2 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Ordered Dishes
                  </span>
                  <div className="space-y-1.5">
                    {order.items?.map((it, idx) => {
                      const qty = it.quantity || it.quauntity || 1;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-zinc-100 dark:border-zinc-800/50 last:border-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-500 font-bold text-xs flex items-center justify-center shrink-0">
                              {qty}x
                            </span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {it.name}
                            </span>
                          </div>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">
                            {formatCurrency(it.price * qty)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Address & Financial Summary */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400 max-w-lg">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{formattedAddress}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Cancellation Reason if cancelled */}
                {order.reason && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Reason: {order.reason}</span>
                  </div>
                )}

                {/* Action Buttons Workflow */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  {/* When status is 'placed' (Incoming) */}
                  {isPlaced && (
                    <>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setCancelModalOrder(order)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateStatus(order.id, 'accepted')
                        }
                        className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-linear-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
                      >
                        Accept Order
                      </button>
                    </>
                  )}

                  {/* When status is 'accepted' */}
                  {isAccepted && (
                    <>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setCancelModalOrder(order)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateStatus(order.id, 'preparing')
                        }
                        className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                      >
                        Start Cooking
                      </button>
                    </>
                  )}

                  {/* When status is 'preparing' */}
                  {isPreparing && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleUpdateStatus(order.id, 'ready_for_rider')
                      }
                      className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                    >
                      Food Ready for Rider
                    </button>
                  )}

                  {/* When status is 'ready_for_rider' */}
                  {isReady && (
                    <SellerRiderDispatchRetry
                      orderId={order.id}
                      riderId={order.riderId}
                      riderName={order.riderName}
                      onRetry={handleRetryDispatch}
                      isRetrying={isRetryingDispatch && retryingOrderId === order.id}
                    />
                  )}

                  {/* Terminal states */}
                  {isDelivered && (
                    <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Order Delivered</span>
                    </div>
                  )}
                  {isCancelled && (
                    <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Cancelled Order</span>
                    </div>
                  )}
                </div>
              </AnimatedOrderCard>
            );
          })}
        </AnimatePresence>

          {/* Reusable Common Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalOrders}
            itemName="orders"
            disabled={isFetching}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </AnimatedOrderList>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            No orders found under &quot;{activeStatus}&quot;
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            When customer orders are confirmed, they will stream directly into
            this live kitchen queue with sound notifications.
          </p>
        </div>
      )}

      {/* Decline / Cancel Reason Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                  Decline / Cancel Order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to decline order{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">
                {cancelModalOrder.orderNumber ||
                  `#${cancelModalOrder.id.slice(-6).toUpperCase()}`}
              </strong>
              ? Please provide a reason for the customer.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Reason (Optional)
              </label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Out of ingredients, Kitchen at maximum capacity, Store closing early..."
                className="w-full p-3 text-xs rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
