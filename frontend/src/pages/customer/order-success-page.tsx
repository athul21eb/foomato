import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Printer,
  Store,
  Sparkles,
  Phone,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetOrderByIdQuery } from '../../slices/order/orderApiSlice';
import { useVerifyStripePaymentMutation } from '../../slices/payment/paymentApiSlice';
import { useCart } from '../../features/cart/hooks/useCart';
import { formatCurrency } from '../../lib/utils';
import { ConfettiCanvas } from '../../features/checkout/components/confetti-canvas';
import { springBouncy } from '../../lib/motion';

export const OrderSuccessPage: React.FC = () => {
  const { orderId: paramOrderId } = useParams<{ orderId?: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { clearCart } = useCart();
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(
    paramOrderId || null,
  );
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Clear cart & pending order session upon reaching success page
  useEffect(() => {
    clearCart();
    try {
      sessionStorage.removeItem('foomato_pending_order');
    } catch {
      // Ignore storage errors
    }
  }, [clearCart]);

  const [verifyStripe, { isLoading: isVerifyingStripe }] =
    useVerifyStripePaymentMutation();

  // If redirected from Stripe Checkout with session_id
  useEffect(() => {
    if (sessionId && !resolvedOrderId) {
      verifyStripe({ sessionId })
        .unwrap()
        .then((res) => {
          if (res.orderId) {
            setResolvedOrderId(res.orderId);
          }
        })
        .catch((err: unknown) => {
          const errObj = err as { data?: { message?: string } };
          setStripeError(
            errObj?.data?.message || 'Failed to verify Stripe payment session',
          );
        });
    }
  }, [sessionId, resolvedOrderId, verifyStripe]);

  const activeOrderId = resolvedOrderId || paramOrderId || '';
  const {
    data: order,
    isLoading: isOrderLoading,
  } = useGetOrderByIdQuery(activeOrderId, {
    skip: !activeOrderId,
  });

  const isLoading =
    isVerifyingStripe || (Boolean(activeOrderId) && isOrderLoading);

  const displayOrderReference = order?.orderNumber || activeOrderId;

  const handleCopyOrderId = () => {
    if (!displayOrderReference) return;
    navigator.clipboard.writeText(displayOrderReference);
    setCopiedId(true);
    toast.success('Order Reference copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/10 ring-4 ring-orange-500/10 animate-pulse">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Confirming Your Order...
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Please wait while we verify your transaction and notify the kitchen.
          </p>
        </div>
      </div>
    );
  }

  if (stripeError) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/10 ring-4 ring-rose-500/10">
          <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            Payment Verification Notice
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {stripeError}. If money was debited, our automated reconciliation will reflect the order shortly.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            Return to Home
          </Link>
          <Link
            to="/account"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const items = order?.items || [];
  const deliveryAddress =
    order?.deliveryAddress?.formattedAddress ||
    order?.deliveryAddress?.fromattedAddress ||
    'Saved address';

  return (
    <div className="min-h-[85vh] py-6 sm:py-10 lg:py-12 px-3 sm:px-6 lg:px-8">
      {/* Celebration Festive Particles */}
      <ConfettiCanvas />

      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hover:text-orange-500 transition-colors font-medium"
            >
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-zinc-900 dark:text-white">
              Order Confirmation
            </span>
          </div>

          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Order Confirmed</span>
          </div>
        </div>

        {/* Main 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Hero Celebration, Metrics & Delivery Details */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            {/* Celebration Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-orange-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-orange-950/20 border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 backdrop-blur-md shadow-xl shadow-zinc-900/5">
              {/* Background ambient glow circle */}
              <div
                className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6 relative z-10">
                {/* Multi-ring Glowing Success Badge */}
                <div className="relative shrink-0">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={springBouncy}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-8 ring-emerald-500/15"
                  >
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, ...springBouncy }}
                    className="absolute -bottom-1 -right-1 bg-amber-400 text-zinc-950 p-1.5 rounded-xl shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </motion.div>
                </div>

                {/* Hero Headings & Meta */}
                <div className="space-y-2 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Payment Confirmed</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                    Order Placed Successfully!
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
                    Thank you for ordering with Foomato! The kitchen has received your ticket and is preparing your meal with care.
                  </p>
                </div>
              </div>

              {/* Order ID Pill with One-Click Copy */}
              {displayOrderReference && (
                <div className="mt-6 pt-5 border-t border-zinc-200/70 dark:border-zinc-800/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Order Reference
                    </span>
                    <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80">
                      <Receipt className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {displayOrderReference.startsWith('#')
                          ? displayOrderReference
                          : `#${displayOrderReference}`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyOrderId}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 transition-colors cursor-pointer active:scale-95"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Copied!
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Estimated Delivery Time Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 shadow-inner">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                    Estimated Arrival
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
                      30 - 45
                    </span>
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      Minutes
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    On-time guarantee
                  </span>
                </div>
              </div>

              {/* Kitchen / Restaurant Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 shadow-inner">
                  <Store className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                    Kitchen
                  </span>
                  <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-white truncate block">
                    {order?.restaurantName || 'Restaurant Kitchen'}
                  </span>
                  {order?.restaurantId && (
                    <Link
                      to={`/restaurant/${order.restaurantId}`}
                      className="text-[11px] font-bold text-orange-500 hover:text-orange-600 inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>Store details</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Destination Card */}
            <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-black uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>Delivery Location</span>
              </div>

              <div className="flex items-start gap-3.5 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                    {deliveryAddress}
                  </p>
                  {order?.deliveryAddress?.mobile && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Contact: +91 {order.deliveryAddress.mobile}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety & Guarantee Badge */}
              <div className="flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-2xl border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                <span className="font-semibold leading-tight">
                  100% Contactless Delivery Guaranteed • Sanitized Containers
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Order Invoice & Actions (5 cols)            */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Bill Summary & Dishes Card */}
            <div className="rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-xl shadow-zinc-900/5 overflow-hidden">
              {/* Receipt Header */}
              <div className="p-5 sm:p-6 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                      Order Summary
                    </h3>
                    <span className="text-[11px] text-zinc-400 block font-medium">
                      {items.length} {items.length === 1 ? 'item' : 'items'} ordered
                    </span>
                  </div>
                </div>

                {/* Print button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  title="Print receipt"
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* Itemized Dishes List */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {items.map((item, idx) => {
                    const quantity = item.quantity || item.quauntity || 1;
                    const itemTotal = item.price * quantity;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 first:pt-0 last:pb-0 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black text-[10px] flex items-center justify-center shrink-0">
                            {quantity}x
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-extrabold text-zinc-900 dark:text-white shrink-0">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Breakdown */}
                <div className="pt-4 border-t border-zinc-200/70 dark:border-zinc-800/70 space-y-2.5 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {formatCurrency(order?.subtotal || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span>Delivery Fee</span>
                      {order?.deliveryFee === 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {order?.deliveryFee === 0 ? (
                        <span className="text-emerald-500 font-extrabold">
                          ₹0.00
                        </span>
                      ) : (
                        formatCurrency(order?.deliveryFee || 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Platform Fee</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {formatCurrency(order?.platformFee || 0)}
                    </span>
                  </div>

                  {/* Total Pill */}
                  <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-sm sm:text-base">
                    <div>
                      <span className="font-black text-zinc-900 dark:text-white block leading-none">
                        Total Paid
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {order?.paymentMethod === 'razorpay'
                          ? 'Via Razorpay UPI/Card'
                          : 'Via Stripe Checkout'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        {formatCurrency(order?.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="p-5 sm:p-6 bg-zinc-50/70 dark:bg-zinc-800/40 border-t border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
                <Link
                  to="/account"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer text-center"
                >
                  <span>Track in My Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer text-center"
                >
                  <span>Explore More Restaurants</span>
                </Link>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                <span>Need assistance with your order?</span>
              </div>
              <Link
                to="/account"
                className="font-bold text-orange-600 dark:text-orange-400 hover:underline"
              >
                Help & Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
