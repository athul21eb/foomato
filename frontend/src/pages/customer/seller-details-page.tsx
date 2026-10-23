import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  UtensilsCrossed,
  Search,
  AlertCircle,
  Plus,
  Minus,
  ShoppingBag,
} from 'lucide-react';
import {
  useSellerDetails,
  useSellerMenu,
} from '../../features/seller/hooks/use-sellers';
import { SellerProfileView } from '../../features/seller/components/seller-profile-view';
import { LoadingScreen } from '../../components/feedback/loading-screen';
import type { Seller } from '../../features/seller/types/seller.types';
import { useCart } from '../../features/cart/hooks/useCart';
import { RestaurantConflictModal } from '../../features/cart/components/restaurant-conflict-modal';
import { formatCurrency } from '../../lib/utils';
import { CardRevealStagger, CardRevealItem, FadeInUp } from '../../lib/animations';

export const SellerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const routeSeller = location.state?.seller as Seller | undefined;

  const {
    items: cartItems,
    sellerId: cartSellerId,
    sellerName: cartSellerName,
    totalQuantity: cartTotalQuantity,
    totalAmount: cartTotalAmount,
    addToCart: addDishToCart,
    incrementItem,
    decrementItem,
    conflictModalOpen,
    pendingItem,
    confirmSwitchRestaurantAndAdd,
    cancelConflict,
  } = useCart();

  const {
    data: fetchedSeller,
    isLoading: isSellerLoading,
    error: sellerError,
  } = useSellerDetails(id);

  const seller = fetchedSeller
    ? {
        ...fetchedSeller,
        distanceKm: fetchedSeller.distanceKm ?? routeSeller?.distanceKm,
        distance: fetchedSeller.distance ?? routeSeller?.distance,
      }
    : routeSeller;

  const {
    data: menuItems = [],
    isLoading: isMenuLoading,
  } = useSellerMenu(id);

  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');

  if (isSellerLoading && !seller) {
    return (
      <LoadingScreen
        message="Loading seller details..."
        subtext="Fetching live menu items"
        fullScreen={false}
      />
    );
  }

  if (sellerError || !seller) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
          Seller Not Found
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
          The seller profile you are looking for does not exist or may be temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Kitchens
        </Link>
      </div>
    );
  }

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVeg =
      vegFilter === 'all' ||
      (vegFilter === 'veg' && item.isVeg) ||
      (vegFilter === 'nonveg' && !item.isVeg);

    return matchesSearch && matchesVeg;
  });

  return (
    <div className="min-h-screen pb-20 pt-4 sm:pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to nearby kitchens
          </Link>
        </div>

        {/* Seller Header View */}
        <SellerProfileView seller={seller} mode="public" />

        {/* Menu Section */}
        <div className="space-y-6 pt-4">
          {/* Header & Filter Controls */}
          <FadeInUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Menu Catalog</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500">
                  {menuItems.length} items
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Freshly prepared and made to order
              </p>
            </div>

            {/* Search & Veg Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Veg / Non-Veg Toggle Pills */}
              <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => setVegFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vegFilter === 'all'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setVegFilter('veg')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vegFilter === 'veg'
                      ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Veg
                </button>
                <button
                  type="button"
                  onClick={() => setVegFilter('nonveg')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vegFilter === 'nonveg'
                      ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Non-Veg
                </button>
              </div>

              {/* Dish Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 sm:w-56 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </FadeInUp>

          {/* Menu Items Grid */}
          {isMenuLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50 animate-pulse"
                />
              ))}
            </div>
          ) : filteredMenuItems.length > 0 ? (
            <CardRevealStagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => (
                <CardRevealItem key={item.id}>
                <div
                  key={item.id}
                  className="group relative flex items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md hover:border-orange-500/30 transition-all duration-300"
                >
                  {/* Dish Details */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full border ${
                          item.isVeg
                            ? 'border-emerald-500 bg-emerald-500/20'
                            : 'border-rose-500 bg-rose-500/20'
                        }`}
                        title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      />
                      <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                        {item.name}
                      </h4>
                    </div>

                    <div className="text-sm font-extrabold text-orange-500 mb-1.5">
                      {formatCurrency(item.price)}
                    </div>

                    {item.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {!item.isAvailable && (
                      <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                        Currently Sold Out
                      </span>
                    )}
                  </div>

                  {/* Dish Image + Add Button */}
                  <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.isAvailable && (() => {
                      const cartItem = cartItems.find((ci) => ci.id === item.id);
                      const qtyInCart = cartItem?.quantity || 0;

                      if (qtyInCart === 0) {
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              addDishToCart({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                image: item.image,
                                isVeg: item.isVeg,
                                sellerId: seller.id,
                                sellerName: seller.name,
                                description: item.description,
                              });
                            }}
                            className="group/btn absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-zinc-950 shadow-md hover:bg-orange-500 hover:text-white transition-all duration-200 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                            title="Add to cart"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-orange-500 group-hover/btn:text-white transition-colors" />
                            <span>Add</span>
                          </button>
                        );
                      }

                      return (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-orange-500 text-white rounded-lg shadow-md p-0.5 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => decrementItem(item.id)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded-md transition-colors cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-extrabold text-xs">
                            {qtyInCart}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementItem(item.id)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded-md transition-colors cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardRevealItem>
            ))}
            </CardRevealStagger>
          ) : (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                No dishes found
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {searchQuery
                  ? `No menu items matching "${searchQuery}"`
                  : 'This kitchen does not have any active menu items yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Floating View Cart Bar */}
        {cartTotalQuantity > 0 && cartSellerId === seller.id && (
          <div className="fixed bottom-6 left-4 right-4 z-30 max-w-lg mx-auto">
            <Link
              to="/cart"
              className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/30 hover:brightness-110 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black">
                    {cartTotalQuantity} {cartTotalQuantity === 1 ? 'item' : 'items'} in cart
                  </span>
                  <span className="text-[11px] opacity-90">
                    {formatCurrency(cartTotalAmount)} total
                  </span>
                </div>
              </div>

              <span className="text-xs font-black tracking-wide flex items-center gap-1">
                View Cart →
              </span>
            </Link>
          </div>
        )}

        {/* Multi-Restaurant Switch Conflict Modal */}
        <RestaurantConflictModal
          isOpen={conflictModalOpen}
          currentRestaurantName={cartSellerName}
          pendingItem={pendingItem}
          onConfirm={confirmSwitchRestaurantAndAdd}
          onCancel={cancelConflict}
        />
      </div>
    </div>
  );
};

// Backward-compatible alias
export const RestaurantDetailsPage = SellerDetailsPage;
