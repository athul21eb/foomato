import React, { useState } from 'react';
import {
  Bike,
  Package,
  Navigation,
  Compass,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Phone,
  MapPin,
  Store,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { RiderProfile } from '../types/rider.types';
import { RiderVerificationGuard } from './rider-verification-guard';
import {
  FadeInUp,
  StaggerContainer,
  RevealItem,
  InteractiveCard,
  AnimatedDutyBeacon,
  SlideInBottom,
  ScaleIn,
  AnimatedStatusTab,
} from '../../../lib/animations';
import { useRiderSocket } from '../hooks/use-rider-socket';
import { useRiderLocationName } from '../hooks/use-rider-location-name';
import {
  useGetCurrentOrderQuery,
  useAcceptOrderMutation,
  useUpdateOrderStatusMutation,
  useGetPastOrdersQuery,
} from '../api/rider.api';
import { toast } from 'sonner';

interface RiderOrdersTabProps {
  rider: RiderProfile;
  onEditClick: () => void;
}

export const RiderOrdersTab: React.FC<RiderOrdersTabProps> = ({
  rider,
  onEditClick,
}) => {
  const [lng, lat] = rider.location?.coordinates || [0, 0];
  const hasCoordinates = !(lat === 0 && lng === 0);

  const { placeName } = useRiderLocationName(
    rider.location?.coordinates,
    rider.location?.formattedAddress,
  );

  const [activeTab, setActiveTab] = useState<
    'all' | 'incoming' | 'active' | 'completed'
  >('all');

  const {
    isMuted,
    toggleMute,
    incomingOrders,
    dismissAlert,
  } = useRiderSocket({
    riderId: rider.id,
    isAvailable: rider.isAvailable,
    enabled: rider.isVerified,
  });

  const { data: currentOrderData } = useGetCurrentOrderQuery(undefined, {
    pollingInterval: 15000,
    skip: !rider.isVerified,
  });

  const { data: pastOrdersData } = useGetPastOrdersQuery(undefined, {
    skip: !rider.isVerified,
  });

  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();

  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);

  if (!rider.isVerified) {
    return (
      <RiderVerificationGuard
        rider={rider}
        featureName="Orders"
        onEditClick={onEditClick}
      />
    );
  }

  const activeOrder = currentOrderData?.order;

  const totalCount = incomingOrders.length + (activeOrder ? 1 : 0);

  const statusPills = [
    { id: 'all', label: 'All Orders', count: totalCount },
    {
      id: 'incoming',
      label: 'Incoming Requests',
      count: incomingOrders.length,
      highlight: true,
    },
    {
      id: 'active',
      label: 'Active Delivery',
      count: activeOrder ? 1 : 0,
    },
    { id: 'completed', label: 'Past Trips', count: pastOrdersData?.total ?? 0 },
  ];

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setAcceptingOrderId(orderId);
      const res = await acceptOrder({ orderId }).unwrap();
      toast.success(
        res.message || 'Delivery request accepted! Head to the restaurant.',
      );
      dismissAlert(orderId);
      setActiveTab('active');
    } catch (err: unknown) {
      const errorMsg =
        typeof err === 'object' && err && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message ||
            'Failed to accept order'
          : 'Failed to accept order';
      toast.error(errorMsg);
      dismissAlert(orderId);
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const handleAdvanceStatus = async (orderId: string) => {
    try {
      const res = await updateOrderStatus({ orderId }).unwrap();
      toast.success(res.message || 'Delivery status updated');
      if (res.order?.status === 'delivered') {
        toast.success(
          '🎉 Delivery completed! You are now back online and available for new orders.',
        );
        setActiveTab('completed');
      }
    } catch (err: unknown) {
      const errorMsg =
        typeof err === 'object' && err && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message ||
            'Failed to advance status'
          : 'Failed to update order status';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Dispatch Radar Banner */}
      <FadeInUp>
        <div className="p-6 rounded-3xl bg-linear-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border border-orange-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Compass className="w-7 h-7" />
              </div>
              <div className="absolute -top-1 -right-1">
                <AnimatedDutyBeacon active={rider.isAvailable} color="bg-emerald-500">
                  <span
                    className={`block w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                      rider.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'
                    }`}
                  />
                </AnimatedDutyBeacon>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  Dispatch Radar
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    rider.isAvailable
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30'
                  }`}
                >
                  {rider.isAvailable ? 'Scanning for Orders' : 'Fleet Idle'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="truncate max-w-xs sm:max-w-md">
                  Base Hub:{' '}
                  <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                    {placeName}
                  </strong>
                  {hasCoordinates && (
                    <span className="text-[11px] text-zinc-400 font-mono ml-1.5">
                      ({lat.toFixed(4)}, {lng.toFixed(4)})
                    </span>
                  )}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300"
              title={isMuted ? 'Unmute Dispatch Chime' : 'Mute Dispatch Chime'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-500" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Sound Active</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium hidden md:inline">
                Status:
              </span>
              <span className="font-extrabold text-emerald-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> High Priority Courier
              </span>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Segmented Orders Tabs Bar matching Seller */}
      <div className="p-1 sm:p-1.5 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-4 w-full">
          {statusPills.map((tab) => {
            const isSelected = activeTab === tab.id;
            const hasCount = typeof tab.count === 'number' && tab.count > 0;
            const isIncomingWithOrders = tab.id === 'incoming' && hasCount;

            return (
              <AnimatedStatusTab
                key={tab.id}
                type="button"
                isPulseYellowWhite={isIncomingWithOrders}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`relative px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0 sm:shrink ${
                  isSelected && !isIncomingWithOrders
                    ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                    : !isIncomingWithOrders
                    ? 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-700/50'
                    : ''
                }`}
              >
                <span>{tab.label}</span>
                {hasCount && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isIncomingWithOrders
                        ? 'bg-zinc-900 text-yellow-300 border border-yellow-400'
                        : isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </AnimatedStatusTab>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: INCOMING REQUESTS (Rendered if 'all' or 'incoming') */}
      {(activeTab === 'all' || activeTab === 'incoming') && (
        <>
          {incomingOrders.length > 0 && rider.isAvailable && !activeOrder ? (
            <SlideInBottom className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
                  </span>
                  New Dispatch Alerts ({incomingOrders.length})
                </h4>
                <span className="text-xs text-orange-600 dark:text-orange-400 font-bold">
                  Tap Accept to claim ride
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {incomingOrders.map((alert) => (
                  <InteractiveCard
                    key={alert.orderId}
                    className="p-5 rounded-2xl bg-linear-to-r from-orange-500/10 via-amber-500/5 to-white/70 dark:to-zinc-900/70 border border-orange-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white text-xs font-bold">
                          {alert.orderNumber ||
                            `#ORD-${alert.orderId.slice(-6).toUpperCase()}`}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Rider Earning: ₹{alert.riderAmount || 45}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                        <Store className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>
                          Pickup: {alert.restaurantName || 'Restaurant Hub'}
                        </span>
                        {alert.pickupLocation?.formattedAddress && (
                          <span className="text-xs text-zinc-400 font-normal truncate max-w-xs">
                            ({alert.pickupLocation.formattedAddress})
                          </span>
                        )}
                      </div>

                      {(alert.dropoffLocation?.formattedAddress ||
                        alert.dropoffLocation?.address) && (
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate max-w-md">
                            Dropoff:{' '}
                            {alert.dropoffLocation.formattedAddress ||
                              alert.dropoffLocation.address}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => dismissAlert(alert.orderId)}
                        disabled={
                          isAccepting && acceptingOrderId === alert.orderId
                        }
                        className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        Decline
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcceptOrder(alert.orderId)}
                        disabled={isAccepting}
                        className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isAccepting && acceptingOrderId === alert.orderId ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Accepting...</span>
                          </>
                        ) : (
                          <>
                            <span>Accept Delivery</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </InteractiveCard>
                ))}
              </div>
            </SlideInBottom>
          ) : activeTab === 'incoming' ? (
            <FadeInUp>
              <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 p-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                  <Compass className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  No Incoming Delivery Requests
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {rider.isAvailable
                    ? `Radar is scanning for ready food orders within 5km of ${placeName}. New dispatch alerts will sound here automatically.`
                    : 'You are currently Offline. Turn your duty status to Online to begin receiving nearby pickup requests.'}
                </p>
              </div>
            </FadeInUp>
          ) : null}
        </>
      )}

      {/* TAB CONTENT: ACTIVE DELIVERY (Rendered if 'all' or 'active') */}
      {(activeTab === 'all' || activeTab === 'active') && (
        <>
          {activeOrder ? (
            <ScaleIn>
              <div className="rounded-3xl border border-orange-500/30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl overflow-hidden">
                {/* Header / Status Banner */}
                <div className="bg-linear-to-r from-orange-500 to-amber-600 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Bike className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                          Active Order
                        </span>
                        <h3 className="text-lg font-black">
                          {activeOrder.orderNumber}
                        </h3>
                      </div>
                      <p className="text-xs text-orange-100 mt-0.5">
                        Assigned to your fleet • ₹
                        {activeOrder.riderAmount || activeOrder.deliveryFee || 40} Courier Payout
                      </p>
                    </div>
                  </div>

                  {/* Status Stepper Indicator */}
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full text-xs font-bold">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        activeOrder.status === 'rider_assigned'
                          ? 'bg-amber-400 animate-pulse'
                          : activeOrder.status === 'picked_up' ||
                            activeOrder.status === 'out_for_delivery'
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-zinc-300'
                      }`}
                    />
                    <span className="capitalize">
                      {activeOrder.status === 'picked_up'
                        ? 'Out for Delivery (Picked Up)'
                        : activeOrder.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Stepper Progress Visualizer */}
                <div className="grid grid-cols-3 border-b border-zinc-200 dark:border-zinc-800 text-center text-xs py-3 px-6 bg-zinc-50 dark:bg-zinc-950/40">
                  <div
                    className={`flex items-center justify-center gap-1.5 font-bold ${
                      [
                        'rider_assigned',
                        'picked_up',
                        'out_for_delivery',
                        'delivered',
                      ].includes(activeOrder.status)
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>1. Head to Pickup</span>
                  </div>
                  <div
                    className={`flex items-center justify-center gap-1.5 font-bold ${
                      ['picked_up', 'out_for_delivery', 'delivered'].includes(
                        activeOrder.status,
                      )
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>2. Out for Delivery</span>
                  </div>
                  <div
                    className={`flex items-center justify-center gap-1.5 font-bold ${
                      activeOrder.status === 'delivered'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>3. Dropped Off</span>
                  </div>
                </div>

                {/* Content Body: Restaurant & Customer Details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pickup Point (Restaurant) */}
                  <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-500 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5" /> Pickup Restaurant
                      </span>
                      {activeOrder.restaurantPhone && (
                        <a
                          href={`tel:${activeOrder.restaurantPhone}`}
                          className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Kitchen
                        </a>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                        {activeOrder.restaurantName || 'Restaurant Hub'}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>
                          {activeOrder.pickupAddress ||
                            activeOrder.restaurantAddress ||
                            'Address on file'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Dropoff Point (Customer) */}
                  <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Customer Dropoff
                      </span>
                      {activeOrder.customerPhone && (
                        <a
                          href={`tel:${activeOrder.customerPhone}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Customer
                        </a>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                        {activeOrder.customerName || 'Customer'}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>
                          {typeof activeOrder.deliveryAddress === 'string'
                            ? activeOrder.deliveryAddress
                            : activeOrder.deliveryAddress
                            ? `${activeOrder.deliveryAddress.street || ''}${
                                activeOrder.deliveryAddress.city
                                  ? `, ${activeOrder.deliveryAddress.city}`
                                  : ''
                              }${
                                activeOrder.deliveryAddress.pincode
                                  ? ` - ${activeOrder.deliveryAddress.pincode}`
                                  : ''
                              }`.trim() || 'Address on file'
                            : 'Delivery address on order ticket'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Summary & Financials */}
                <div className="px-6 pb-4">
                  <div className="p-4 rounded-2xl bg-zinc-100/60 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-900 dark:text-white">
                          Order Items (
                          {activeOrder.items && activeOrder.items.length > 0
                            ? `${activeOrder.items.length} item${
                                activeOrder.items.length > 1 ? 's' : ''
                              }`
                            : activeOrder.itemsSummary
                            ? `${activeOrder.itemsSummary.split(',').length} item${
                                activeOrder.itemsSummary.split(',').length > 1
                                  ? 's'
                                  : ''
                              }`
                            : 'Food Package'}
                          )
                        </h5>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-sm">
                          {activeOrder.items && activeOrder.items.length > 0
                            ? activeOrder.items
                                .map((i) => `${i.quantity}x ${i.name}`)
                                .join(', ')
                            : activeOrder.itemsSummary || 'Food package'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                          Payment
                        </span>
                        <span className="text-zinc-900 dark:text-white uppercase">
                          {activeOrder.paymentMethod
                            ? `${activeOrder.paymentMethod} (${
                                activeOrder.paymentStatus || 'PAID'
                              })`
                            : 'ONLINE (PAID)'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                          Order Bill
                        </span>
                        <span className="text-emerald-500 font-black">
                          ₹{activeOrder.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Bar Footer */}
                <div className="p-6 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>
                      {activeOrder.status === 'rider_assigned'
                        ? 'Verify items with kitchen staff before confirming pickup.'
                        : 'Collect customer signature or delivery confirmation upon dropoff.'}
                    </span>
                  </p>

                  {activeOrder.status === 'rider_assigned' && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(activeOrder.orderId)}
                      disabled={isUpdatingStatus}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-black shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Order Picked Up</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}

                  {(activeOrder.status === 'picked_up' ||
                    activeOrder.status === 'out_for_delivery') && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(activeOrder.orderId)}
                      disabled={isUpdatingStatus}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-black shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Completing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete & Mark Delivered</span>
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </ScaleIn>
          ) : activeTab === 'active' ? (
            <FadeInUp>
              <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 p-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                  <Package className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  No Active Delivery In Progress
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Accept an incoming dispatch request to start pickup navigation
                  and tracking.
                </p>
                {incomingOrders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('incoming')}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                  >
                    View Incoming Requests ({incomingOrders.length})
                  </button>
                )}
              </div>
            </FadeInUp>
          ) : !incomingOrders.length ? (
            /* Empty State for 'all' tab when neither active order nor incoming orders exist */
            <FadeInUp delay={0.1}>
              <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto shadow-inner">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                    No Active Delivery Assigned
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                    {rider.isAvailable
                      ? `Stay online near restaurant hubs. New incoming delivery requests within 5km of ${placeName} will beep right here.`
                      : 'Turn your duty status to Online to begin receiving nearby pickup requests.'}
                  </p>
                </div>
              </div>
            </FadeInUp>
          ) : null}
        </>
      )}

      {/* TAB CONTENT: COMPLETED / PAST TRIPS (Rendered if 'all' or 'completed') */}
      {(activeTab === 'all' || activeTab === 'completed') && (
        <div className="space-y-4 pt-2">
          {/* Header & Metrics */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" />
              <span>Fulfilled Deliveries ({pastOrdersData?.total ?? 0})</span>
            </h4>
            {typeof pastOrdersData?.totalEarnings === 'number' && pastOrdersData.totalEarnings > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Total Payout: ₹{pastOrdersData.totalEarnings.toFixed(2)}
              </span>
            )}
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RevealItem>
              <InteractiveCard className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Completed Trips
                  </span>
                  <h4 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                    {pastOrdersData?.total ?? 0}
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    Lifetime dispatches
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </InteractiveCard>
            </RevealItem>

            <RevealItem>
              <InteractiveCard className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Total Earnings
                  </span>
                  <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹{pastOrdersData?.totalEarnings ?? 0}
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    Direct fleet payout
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                  <Sparkles className="w-5 h-5" />
                </div>
              </InteractiveCard>
            </RevealItem>

            <RevealItem>
              <InteractiveCard className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Fleet Rating
                  </span>
                  <h4 className="text-xl font-black text-amber-500 mt-1">
                    ★ 5.0
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    Customer feedback
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                  <Bike className="w-5 h-5" />
                </div>
              </InteractiveCard>
            </RevealItem>
          </StaggerContainer>

          {/* Past Trips List */}
          {pastOrdersData?.orders && pastOrdersData.orders.length > 0 ? (
            <div className="space-y-3 pt-2">
              {pastOrdersData.orders.map((trip) => {
                const tripDropoff =
                  typeof trip.deliveryAddress === 'string'
                    ? trip.deliveryAddress
                    : trip.deliveryAddress
                    ? `${trip.deliveryAddress.street || ''}${
                        trip.deliveryAddress.city ? `, ${trip.deliveryAddress.city}` : ''
                      }`.trim() || 'Dropoff location'
                    : 'Customer dropoff';

                return (
                  <InteractiveCard
                    key={trip.orderId}
                    className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-emerald-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-black">
                          {trip.orderNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Delivered</span>
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {trip.itemsSummary || 'Food package'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 truncate">
                          <Store className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="truncate">
                            From: <strong className="font-semibold">{trip.restaurantName}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">To: {tripDropoff}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">
                        Payout Credited
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        +₹{trip.riderAmount || 40}
                      </span>
                    </div>
                  </InteractiveCard>
                );
              })}
            </div>
          ) : activeTab === 'completed' ? (
            <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                No Completed Trips Yet
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Your fulfilled delivery history and earnings will be recorded here after you complete your drops.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
