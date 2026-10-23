import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ChevronRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/use-auth';
import { useCart } from '../../features/cart/hooks/useCart';
import { useSellerDetails } from '../../features/seller/hooks/use-sellers';
import { useGetMyAddressesQuery } from '../../slices/address/addressApiSlice';
import type { CustomerAddress } from '../../features/customer/types/address.types';
import {
  type PaymentGateway,
  AddressSelectorCard,
  AddressSelectionModal,
  PaymentMethodSelector,
  CheckoutItemsPreview,
  CheckoutBillSummary,
  useCheckoutPayment,
} from '../../features/checkout';

export const CheckoutPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get('orderId');
  const queryOrderNumber = searchParams.get('orderNumber');

  const {
    items,
    sellerId,
    sellerName,
    totalQuantity,
    totalAmount,
    clearCart: clearLocalCart,
  } = useCart();

  const activeSellerId = sellerId || items[0]?.sellerId;
  const { data: sellerDetails } = useSellerDetails(activeSellerId);

  const {
    data: addressesData,
    isLoading: isAddressesLoading,
  } = useGetMyAddressesQuery(undefined, { skip: !isAuthenticated });

  const [userSelectedAddress, setUserSelectedAddress] =
    useState<CustomerAddress | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>('razorpay');

  const addresses: CustomerAddress[] = useMemo(
    () => addressesData || [],
    [addressesData],
  );

  const defaultAddress = useMemo(
    () => addresses.find((addr) => addr.isDefault) || addresses[0] || null,
    [addresses],
  );

  const selectedAddress = userSelectedAddress || defaultAddress;

  const subTotal = totalAmount;
  const deliveryFee = subTotal < 350 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = Math.round((subTotal + deliveryFee + platformFee) * 100) / 100;

  // Protect Checkout route
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast.error('Please sign in to proceed with checkout');
      navigate('/login', { state: { returnTo: '/checkout' }, replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const isRestaurantClosed = Boolean(
    sellerDetails && sellerDetails.isOpen === false,
  );
  const hasUnavailableItems = items.some((item) => item.isAvailable === false);

  const { isProcessing, handleInitiatePayment } = useCheckoutPayment({
    user,
    selectedAddress,
    items,
    subTotal,
    paymentMethod,
    isRestaurantClosed,
    hasUnavailableItems,
    queryOrderId,
    queryOrderNumber,
    clearLocalCart,
  });

  // Empty cart view
  if (items.length === 0) {
    return (
      <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center space-y-4 p-8 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md">
          <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Your cart is empty
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            There are no items in your cart to checkout. Browse our top kitchens and discover tasty meals!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <span>Explore Restaurants</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">Secure Checkout</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <span>Checkout</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500">
              {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review delivery destination, select payment method, and complete your order.
          </p>
        </div>

        {/* Checkout Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (2 Cols): Address, Payment Gateway, Items */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. Delivery Address Card */}
            <AddressSelectorCard
              selectedAddress={selectedAddress}
              addresses={addresses}
              isLoading={isAddressesLoading}
              onOpenAddressModal={() => setIsAddressModalOpen(true)}
            />

            {/* 2. Payment Method Selector */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
              disabled={isProcessing}
            />

            {/* 3. Order Items Preview */}
            <CheckoutItemsPreview
              items={items}
              sellerName={sellerName}
              sellerId={sellerId}
            />
          </div>

          {/* Right Column (1 Col): Bill Details & Sticky Pay Button */}
          <div className="lg:col-span-1">
            <CheckoutBillSummary
              subTotal={subTotal}
              deliveryFee={deliveryFee}
              platformFee={platformFee}
              grandTotal={grandTotal}
              paymentMethod={paymentMethod}
              isProcessing={isProcessing}
              hasAddress={Boolean(selectedAddress)}
              isRestaurantClosed={isRestaurantClosed}
              onPay={handleInitiatePayment}
            />
          </div>
        </div>

        {/* Address Selection Modal */}
        <AddressSelectionModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          addresses={addresses}
          selectedAddressId={selectedAddress?.id || null}
          onSelectAddress={setUserSelectedAddress}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
