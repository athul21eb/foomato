import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  UtensilsCrossed,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "../../features/cart/hooks/useCart";
import { useSellerDetails } from "../../features/seller/hooks/use-sellers";
import { ClearCartModal } from "../../features/cart/components/clear-cart-modal";
import { formatCurrency } from "../../lib/utils";
import { toast } from "sonner";
import { FadeInUp, CardRevealStagger, CardRevealItem } from "../../lib/animations";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    sellerId,
    sellerName,
    totalQuantity,
    totalAmount,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const activeSellerId = sellerId || items[0]?.sellerId;
  const { data: sellerDetails, isLoading: isSellerLoading } =
    useSellerDetails(activeSellerId);

  const isRestaurantClosed = Boolean(
    sellerDetails && sellerDetails.isOpen === false,
  );
  const hasUnavailableItems = items.some((item) => item.isAvailable === false);

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      setIsClearModalOpen(false);
    } finally {
      setIsClearing(false);
    }
  };

  const subTotal = totalAmount;
  const deliveryFee = subTotal < 350 ? 49 : 0;
  const platfromFee = 7;
  const grandTotal = Math.round((subTotal + deliveryFee + platfromFee) * 100) / 100;

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Page Title */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
              <span>Your Cart</span>
              {totalQuantity > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500">
                  {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                </span>
              )}
            </h1>
            {sellerName && items.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
                  <span>Ordering from</span>
                  <Link to={`/restaurant/${sellerId}`} className="font-bold text-zinc-800 dark:text-zinc-200">
                    {sellerName}
                  </Link>
                </p>

                {sellerDetails && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      sellerDetails.isOpen ?
                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {sellerDetails.isOpen ? "Open Now" : "Closed"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart Content */}
        {items.length === 0 ?
          /* Blank / Empty Cart State */
          <FadeInUp className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md">
            <div className="w-20 h-20 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-5 shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
              Looks like you haven&apos;t added any food items to your cart yet.
              Explore our kitchens and order your favorite dishes!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Kitchens</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </FadeInUp>
        : /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: Cart Items List */}
            <CardRevealStagger className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CardRevealItem key={item.id}>
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs transition-colors"
                >
                  {/* Dish Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full border ${
                          item.isVeg ?
                            "border-emerald-500 bg-emerald-500/20"
                          : "border-rose-500 bg-rose-500/20"
                        }`}
                        title={item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                      />
                      <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      {item.isAvailable === false && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider shrink-0">
                          Unavailable
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-extrabold text-orange-500">
                      {formatCurrency(item.price)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 p-1">
                      <button
                        type="button"
                        onClick={() => decrementItem(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 hover:text-orange-500 transition-colors cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-zinc-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementItem(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 hover:text-orange-500 transition-colors cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.name)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardRevealItem>
              ))}
            </CardRevealStagger>

            {/* Right: Order Summary */}
            <FadeInUp delay={0.1} className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs space-y-5">
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
                Bill Summary
              </h2>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between">
                  <span>Item Total</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(subTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>Delivery Fee</span>
                    {subTotal >= 350 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Free
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-500 font-bold">FREE</span>
                    ) : (
                      formatCurrency(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Platform Fee</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(platfromFee)}
                  </span>
                </div>

                {subTotal < 350 && (
                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[11px] font-medium flex items-center justify-between">
                    <span>Add {formatCurrency(350 - subTotal)} more for FREE delivery</span>
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-sm font-black text-zinc-900 dark:text-white">
                  <span>To Pay</span>
                  <span className="text-orange-500 font-extrabold text-base">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {isRestaurantClosed && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      Restaurant is Currently Closed
                    </span>
                    <span className="text-[11px] opacity-90">
                      {sellerName || "This kitchen"} is closed and not accepting
                      orders at this time.
                    </span>
                  </div>
                </div>
              )}

              {hasUnavailableItems && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      Item(s) Out of Stock
                    </span>
                    <span className="text-[11px] opacity-90">
                      Some dishes in your cart are currently unavailable. Please remove them before checking out.
                    </span>
                  </div>
                </div>
              )}

              {!isRestaurantClosed && (
                <button
                  type="button"
                  disabled={isRestaurantClosed || isSellerLoading || hasUnavailableItems}
                  onClick={() => {
                    if (isRestaurantClosed) {
                      toast.error(
                        `${sellerName || "This restaurant"} is currently closed and not accepting orders.`,
                      );
                      return;
                    }
                    if (hasUnavailableItems) {
                      toast.error(
                        "Please remove out-of-stock items before proceeding to checkout.",
                      );
                      return;
                    }
                    navigate("/checkout");
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
                    isRestaurantClosed || hasUnavailableItems ?
                      "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-zinc-300/80 dark:border-zinc-700/80"
                    : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 cursor-pointer"
                  }`}
                >
                  {isRestaurantClosed ?
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Restaurant Closed — Cannot Checkout</span>
                    </>
                  : hasUnavailableItems ?
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Items Out of Stock — Cannot Checkout</span>
                    </>
                  : <>
                      <span>Proceed to Checkout</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  }
                </button>
              )}

              <div className="flex items-center gap-2 text-[10px] text-zinc-400 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Safe and Secure Payment</span>
              </div>
            </FadeInUp>
          </div>
        }

        {/* Clear Cart Confirmation Modal */}
        <ClearCartModal
          isOpen={isClearModalOpen}
          itemCount={totalQuantity}
          sellerName={sellerName}
          onConfirm={handleConfirmClear}
          onCancel={() => setIsClearModalOpen(false)}
          isClearing={isClearing}
        />
      </div>
    </div>
  );
};
