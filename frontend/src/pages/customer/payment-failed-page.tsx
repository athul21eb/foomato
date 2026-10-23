import React from 'react';
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Receipt,
  Headphones,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useCart } from '../../features/cart/hooks/useCart';
import { formatCurrency } from '../../lib/utils';

export const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orderId: paramOrderId } = useParams<{ orderId?: string }>();

  const orderId = searchParams.get('orderId') || paramOrderId || '';
  const orderNumber = searchParams.get('orderNumber') || '';
  const reason =
    searchParams.get('reason') ||
    'The transaction could not be processed by the payment provider.';

  const displayReference =
    orderNumber ||
    (orderId
      ? orderId.startsWith('FOO-')
        ? orderId
        : `FOO-${orderId.slice(-6).toUpperCase()}`
      : '');

  const { items, grandTotal, totalQuantity } = useCart();

  const retryCheckoutUrl =
    '/checkout' +
    (orderId
      ? `?orderId=${encodeURIComponent(orderId)}${orderNumber ? `&orderNumber=${encodeURIComponent(orderNumber)}` : ''}`
      : '');

  return (
    <div className="min-h-[85vh] py-6 sm:py-10 lg:py-12 px-3 sm:px-6 lg:px-8">
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
            <Link
              to={retryCheckoutUrl}
              className="hover:text-orange-500 transition-colors font-medium"
            >
              Checkout
            </Link>
            <span>/</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              Payment Incomplete
            </span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Action Required</span>
          </div>
        </div>

        {/* Responsive Horizontal Layout for Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Hero Failure Card & Alternative Actions (7 cols on Desktop) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Failure Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-xl shadow-zinc-900/5 p-6 sm:p-8 space-y-6">
              {/* Subtle Ambient Red Glow */}
              <div
                className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6 relative z-10">
                {/* Warning Icon Badge */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/10 ring-8 ring-rose-500/10 animate-in zoom-in-75 duration-300">
                  <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>

                {/* Headings & Reassurance */}
                <div className="space-y-2 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="w-3 h-3 stroke-[3]" />
                    <span>Payment Incomplete</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                    Payment Could Not Be Completed
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
                    Don&apos;t worry! Your cart is safe and no money has been deducted from your account. You can retry with the same or an alternate payment method.
                  </p>
                </div>
              </div>

              {/* Failure Reason Callout */}
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200/60 dark:border-rose-900/40 text-left flex items-start gap-3 relative z-10">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    Reason Reported
                  </span>
                  <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 font-medium break-words mt-0.5">
                    {reason}
                  </p>
                </div>
              </div>

              {/* Order Reference Pill if Available */}
              {displayReference && (
                <div className="pt-4 border-t border-zinc-200/70 dark:border-zinc-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Order Reference
                    </span>
                    <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      <Receipt className="w-3.5 h-3.5 text-orange-500" />
                      <span>#{displayReference}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    Status: <span className="text-amber-500 font-bold">Unpaid / Safe</span>
                  </span>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(retryCheckoutUrl)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Payment</span>
                </button>

                <Link
                  to="/cart"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                >
                  <span>Review Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Alternative Gateways & Reassurance Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md space-y-2">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Try Alternate Gateway
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Switch seamlessly between Razorpay (UPI, Google Pay, NetBanking, Cards) and Stripe on the checkout screen.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  100% Payment Security
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Transactions are encrypted end-to-end. In case of duplicate bank debits, automated refunds trigger within 24-48 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Cart Summary & Help Center (5 cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Cart & Financial Breakdown Card */}
            <div className="rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xl shadow-zinc-900/5 overflow-hidden">
              {/* Card Header */}
              <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                      Your Cart is Reserved
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} ready for checkout
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Safe & Active
                </span>
              </div>

              {/* Items List (Compact Scrollable if items exist) */}
              {items.length > 0 ? (
                <div className="p-5 sm:p-6 space-y-3.5 max-h-[260px] overflow-y-auto custom-scrollbar border-b border-zinc-100 dark:border-zinc-800">
                  {items.map((cartItem) => (
                    <div
                      key={cartItem.id}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
                          {cartItem.quantity}x
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {cartItem.name || 'Dish'}
                        </span>
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-white shrink-0">
                        {formatCurrency(cartItem.price * cartItem.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                  Cart refreshed. Return to home to pick dishes.
                </div>
              )}

              {/* Amount Breakdown */}
              <div className="p-5 sm:p-6 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Cart Total</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-sm sm:text-base">
                  <span className="font-black text-zinc-900 dark:text-white">
                    Amount Due
                  </span>
                  <span className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Help & Customer Support Card */}
            <div className="p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                    Need Help With Payment?
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Our support team is active 24/7.
                  </p>
                </div>
              </div>

              <Link
                to="/account"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 transition-colors whitespace-nowrap"
              >
                <span>Help Center</span>
                <HelpCircle className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
