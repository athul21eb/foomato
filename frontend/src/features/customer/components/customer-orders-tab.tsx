import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Utensils,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { useGetMyOrdersQuery } from '../../../slices/order/orderApiSlice';
import {
  AnimatedOrderList,
  AnimatedOrderCard,
  AnimatedStatusTab,
  AnimatePresence,
} from '../../../lib/animations';
import { formatCurrency } from '../../../lib/utils';
import { CustomerOrderDetailView } from './customer-order-detail-view';

export type CustomerOrderFilterTab =
  | 'all'
  | 'in_progress'
  | 'delivered'
  | 'cancelled';

interface CustomerOrdersTabProps {
  socketConnected?: boolean;
}

function formatOrderDate(dateStr?: string) {
  if (!dateStr) return 'Recent Order';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'delivered':
      return {
        label: 'Delivered',
        className:
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dotColor: 'bg-emerald-500',
        pulse: false,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        className:
          'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        dotColor: 'bg-rose-500',
        pulse: false,
      };
    case 'placed':
      return {
        label: 'Order Placed',
        className:
          'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        dotColor: 'bg-blue-500',
        pulse: true,
      };
    case 'accepted':
      return {
        label: 'Confirmed',
        className:
          'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        dotColor: 'bg-indigo-500',
        pulse: true,
      };
    case 'preparing':
      return {
        label: 'In Kitchen',
        className:
          'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        dotColor: 'bg-amber-500',
        pulse: true,
      };
    case 'ready_for_rider':
      return {
        label: 'Food Packed',
        className:
          'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        dotColor: 'bg-purple-500',
        pulse: true,
      };
    case 'rider_assigned':
    case 'picked_up':
      return {
        label: 'Out for Delivery',
        className:
          'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        dotColor: 'bg-orange-500',
        pulse: true,
      };
    default:
      return {
        label: status,
        className:
          'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
        dotColor: 'bg-zinc-500',
        pulse: false,
      };
  }
}

export const CustomerOrdersTab: React.FC<CustomerOrdersTabProps> = ({
  socketConnected = false,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialOrderId,
  );

  const [activeTab, setActiveTab] = useState<CustomerOrderFilterTab>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 5;

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSearchParams({ orderId }, { replace: true });
  };

  const handleBackToOrders = () => {
    setSelectedOrderId(null);
    setSearchParams({}, { replace: true });
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetMyOrdersQuery(
    {
      page,
      limit,
      tab: activeTab,
    },
    {
      // Skip fetching list when viewing a specific order's details
      skip: Boolean(selectedOrderId),
    },
  );

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const counts = data?.counts || {
    all: 0,
    inProgress: 0,
    delivered: 0,
    cancelled: 0,
  };

  const handleTabChange = (tab: CustomerOrderFilterTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  if (selectedOrderId) {
    return (
      <CustomerOrderDetailView
        orderId={selectedOrderId}
        onBack={handleBackToOrders}
        socketConnected={socketConnected}
      />
    );
  }

  const TAB_ITEMS: Array<{
    id: CustomerOrderFilterTab;
    label: string;
    count: number;
    hasActivePulse?: boolean;
  }> = [
    {
      id: 'all',
      label: 'All Orders',
      count: counts.all,
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: counts.inProgress,
      hasActivePulse: counts.inProgress > 0,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      count: counts.delivered,
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      count: counts.cancelled,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TAB_ITEMS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <AnimatedStatusTab
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer select-none border ${
                  isSelected
                    ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md shadow-orange-500/20'
                    : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {tab.count}
                </span>
                {tab.hasActivePulse && !isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </AnimatedStatusTab>
            );
          })}
        </div>

        {/* Live Socket Sync Badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 shrink-0 self-end sm:self-center">
          <span
            className={`w-2 h-2 rounded-full ${
              socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
            }`}
          />
          <span>{socketConnected ? 'Live Updates Active' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Orders Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50 animate-pulse border border-zinc-200/60 dark:border-zinc-800/60"
            />
          ))}
        </div>
      ) : isError ? (
        /* Error State with Retry */
        <div className="text-center py-14 px-4 rounded-3xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
            Unable to load orders
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            We could not fetch your orders. Please check your connection or retry.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            No orders found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
            {activeTab === 'in_progress'
              ? 'You have no active orders in kitchen or out for delivery right now.'
              : activeTab === 'delivered'
              ? 'You do not have any completed deliveries yet.'
              : 'You have not placed any orders yet. Discover delicious kitchens and start ordering!'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Explore Restaurants</span>
          </button>
        </div>
      ) : (
        /* Orders List */
        <AnimatedOrderList className="space-y-4">
          <AnimatePresence mode="popLayout">
            {orders.map((order, idx) => {
              const badge = getStatusBadge(order.status);
              const displayNum =
                order.orderNumber ||
                `#ORD-${order.id.slice(-6).toUpperCase()}`;
         
              return (
                <AnimatedOrderCard
                  key={order.id}
                  index={idx}
                  className="rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl p-5 sm:p-6 shadow-xs hover:border-orange-500/30 transition-all space-y-4 group"
                >
                  {/* Header: Restaurant info & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-orange-500/10 to-amber-500/10 text-orange-500 flex items-center justify-center shrink-0 border border-orange-500/20">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                          {order.restaurantName || 'Restaurant Kitchen'}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span>{displayNum}</span>
                          <span>•</span>
                          <span>{formatOrderDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.className}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${badge.dotColor} ${
                            badge.pulse ? 'animate-ping' : ''
                          }`}
                        />
                        <span>{badge.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body: Items Preview & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Dishes summary */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Order Items ({order.items?.length || 0})
                      </p>
                      <div className="space-y-1">
                        {order.items?.slice(0, 3).map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="flex items-center justify-between text-zinc-700 dark:text-zinc-300"
                          >
                            <span className="truncate pr-2">
                              <span className="font-bold text-orange-500 mr-1.5">
                                {item.quauntity || item.quantity || 1}x
                              </span>
                              {item.name}
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-white shrink-0">
                              {formatCurrency(
                                (item.price || 0) *
                                  (item.quauntity || item.quantity || 1),
                              )}
                            </span>
                          </div>
                        ))}
                        {(order.items?.length || 0) > 3 && (
                          <p className="text-[11px] text-zinc-400 font-medium">
                            +{(order.items?.length || 0) - 3} more items...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Delivery Destination
                      </p>
                      <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-zinc-400 shrink-0" />
                        <span className="line-clamp-2">
                          {order.deliveryAddress?.formattedAddress ||
                            order.deliveryAddress?.fromattedAddress ||
                            'Delivery Location'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Total amount, Payment status & Details CTA */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                          Total Amount
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-zinc-900 dark:text-white">
                            {formatCurrency(order.totalAmount)}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectOrder(order.id)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <span>View Order Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </AnimatedOrderCard>
              );
            })}
          </AnimatePresence>
        </AnimatedOrderList>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1">
          <p className="text-xs text-zinc-400 font-medium">
            Showing Page <span className="font-bold text-zinc-900 dark:text-white">{page}</span> of{' '}
            <span className="font-bold text-zinc-900 dark:text-white">{totalPages}</span> ({total} orders)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
