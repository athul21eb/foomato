import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  Utensils,
  Receipt,
  Printer,
  AlertCircle,
  Sparkles,
  Bike,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetOrderByIdQuery } from '../../../slices/order/orderApiSlice';
import { formatCurrency } from '../../../lib/utils';
import { generateOrderReceiptPdf } from '../utils/order-receipt-pdf';
import {
  AnimatedDetailTransition,
  AnimatedStepItem,
  AnimatedReceiptRow,
  AnimatedLivePulseBadge,
} from '../../../lib/animations';

interface MilestoneStep {
  key: string;
  title: string;
  subtitle: string;
}

const ORDER_STEPS: MilestoneStep[] = [
  { key: 'placed', title: 'Order Placed', subtitle: 'Sent to restaurant' },
  { key: 'accepted', title: 'Confirmed', subtitle: 'Kitchen accepted' },
  { key: 'preparing', title: 'Preparing', subtitle: 'Cooking fresh' },
  {
    key: 'picked_up',
    title: 'Out for Delivery',
    subtitle: 'Rider on the way',
  },
  { key: 'delivered', title: 'Delivered', subtitle: 'Enjoy your food!' },
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'placed':
      return 0;
    case 'accepted':
      return 1;
    case 'preparing':
      return 2;
    case 'ready_for_rider':
    case 'rider_assigned':
    case 'picked_up':
      return 3;
    case 'delivered':
      return 4;
    default:
      return 0;
  }
}

interface CustomerOrderDetailViewProps {
  orderId: string;
  onBack: () => void;
  socketConnected?: boolean;
}

export const CustomerOrderDetailView: React.FC<CustomerOrderDetailViewProps> = ({
  orderId,
  onBack,
  socketConnected = false,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(orderId);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-9 w-40 rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60" />
        <div className="h-56 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-52 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50" />
          <div className="h-52 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <AnimatedDetailTransition className="text-center py-12 px-4 rounded-3xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
          Order Details Unavailable
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          We could not retrieve this order's live status.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs hover:bg-orange-500 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders List</span>
        </button>
      </AnimatedDetailTransition>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const canPrintReceipt = isDelivered || isCancelled;
  const currentStep = getStepIndex(order.status);
  const displayNum =
    order.orderNumber || `#ORD-${order.id.slice(-6).toUpperCase()}`;

  const handleDownloadReceipt = async () => {
    if (!canPrintReceipt || isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      toast.info('Generating official Foomato receipt PDF...');
      await generateOrderReceiptPdf(order);
      toast.success('Receipt PDF downloaded successfully!');
    } catch {
      toast.error('Failed to generate receipt. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <AnimatedDetailTransition className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        <div className="flex items-center gap-3">
          {canPrintReceipt && (
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadReceipt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Receipt'}</span>
            </button>
          )}

          <AnimatedLivePulseBadge className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span
              className={`w-2 h-2 rounded-full ${
                socketConnected ? 'bg-emerald-500' : 'bg-zinc-400'
              }`}
            />
            <span>{socketConnected ? 'Live Synchronized' : 'Connecting'}</span>
          </AnimatedLivePulseBadge>
        </div>
      </div>

      {/* Hero Milestone Stepper Card */}
      <div className="rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {displayNum}
              </h2>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                {order.paymentStatus === 'paid'
                  ? `PAID VIA ${order.paymentMethod || 'ONLINE'}`
                  : 'PAYMENT PENDING'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Ordered from{' '}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {order.restaurantName}
              </span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] text-zinc-400 font-medium">Total Paid</p>
            <p className="text-xl font-black text-zinc-900 dark:text-white">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* Milestone Steps or Cancelled Reason */}
        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Order Cancelled
              </h4>
              <p className="text-xs text-rose-500/90 mt-0.5">
                {order.reason
                  ? `Reason: ${order.reason}`
                  : 'This order was cancelled and could not be fulfilled.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 rounded-full" />
              <div
                className={`hidden sm:block absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full transition-all duration-500 ${
                  isDelivered
                    ? 'bg-emerald-500'
                    : 'bg-linear-to-r from-orange-500 to-amber-500'
                }`}
                style={{
                  width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%`,
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                {ORDER_STEPS.map((step, idx) => {
                  const isPassed = idx <= currentStep;
                  const isCurrent = idx === currentStep && !isDelivered;

                  return (
                    <AnimatedStepItem
                      key={step.key}
                      delay={idx * 0.05}
                      className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 cursor-default"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs shrink-0 ${
                          isCurrent
                            ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white ring-4 ring-orange-500/20'
                            : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isPassed && !isCurrent ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isCurrent ? (
                          <Sparkles className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      <div>
                        <p
                          className={`text-xs font-bold leading-tight ${
                            isCurrent
                              ? 'text-orange-500'
                              : isPassed
                              ? 'text-zinc-900 dark:text-white'
                              : 'text-zinc-400'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {step.subtitle}
                        </p>
                      </div>
                    </AnimatedStepItem>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Info Grid: Items on Left, Delivery Destination & Bill on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Itemized Dishes */}
        <div className="rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Utensils className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Itemized Dishes ({order.items?.length || 0})
            </h3>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {order.items?.map((item, idx) => (
              <AnimatedReceiptRow
                key={idx}
                index={idx}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Quantity: {item.quauntity || item.quantity || 1} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="font-bold text-zinc-900 dark:text-white shrink-0">
                  {formatCurrency(
                    (item.price || 0) * (item.quauntity || item.quantity || 1),
                  )}
                </span>
              </AnimatedReceiptRow>
            ))}
          </div>

          {/* Rider Partner snippet if assigned */}
          {order.riderName && (
            <div className="mt-4 p-3.5 rounded-2xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bike className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  Delivery Rider: {order.riderName}
                </p>
                {order.riderPhone && (
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{order.riderPhone}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Details & Invoice */}
        <div className="space-y-5">
          {/* Destination Card */}
          <div className="rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <MapPin className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Delivery Destination
              </h3>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-medium text-zinc-700 dark:text-zinc-300">
                {order.deliveryAddress?.formattedAddress ||
                  order.deliveryAddress?.fromattedAddress ||
                  'Customer Drop-off Address'}
              </p>
              {order.deliveryAddress?.mobile && (
                <p className="text-zinc-400 flex items-center gap-1.5 pt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact: {order.deliveryAddress.mobile}</span>
                </p>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Receipt className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Payment Summary
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Item Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Delivery Fee</span>
                <span>
                  {order.deliveryFee === 0 ? (
                    <span className="text-emerald-500 font-bold uppercase">FREE</span>
                  ) : (
                    formatCurrency(order.deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Platform Fee</span>
                <span>{formatCurrency(order.platformFee)}</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-sm text-zinc-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-orange-500">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedDetailTransition>
  );
};
