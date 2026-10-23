import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateOrderMutation } from '../../../slices/order/orderApiSlice';
import {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  usePayWithStripeMutation,
} from '../../../slices/payment/paymentApiSlice';
import { loadRazorpayScript, type RazorpayOptions } from '../../../lib/razorpay-loader';
import type { CustomerAddress } from '../../customer/types/address.types';
import type { CartItem } from '../../../slices/cart/cartSlice';
import type { PaymentGateway, PendingOrderSession } from '../types';
import { readSavedPendingOrder, savePendingOrder } from '../utils/checkout-session';

export interface UseCheckoutPaymentParams {
  user: { name?: string; email?: string } | null;
  selectedAddress: CustomerAddress | null;
  items: CartItem[];
  subTotal: number;
  paymentMethod: PaymentGateway;
  isRestaurantClosed: boolean;
  hasUnavailableItems: boolean;
  queryOrderId: string | null;
  queryOrderNumber: string | null;
  clearLocalCart: () => void;
}

export interface UseCheckoutPaymentReturn {
  activeOrder: PendingOrderSession | null;
  isProcessing: boolean;
  handleInitiatePayment: () => Promise<void>;
}

export const useCheckoutPayment = ({
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
}: UseCheckoutPaymentParams): UseCheckoutPaymentReturn => {
  const navigate = useNavigate();

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder, { isLoading: isCreatingRazorpay }] =
    useCreateRazorpayOrderMutation();
  const [verifyRazorpayPayment, { isLoading: isVerifyingRazorpay }] =
    useVerifyRazorpayPaymentMutation();
  const [payWithStripe, { isLoading: isCreatingStripe }] =
    usePayWithStripeMutation();

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeOrder, setActiveOrder] = useState<PendingOrderSession | null>(() =>
    readSavedPendingOrder(),
  );

  const updateActiveOrder = (order: PendingOrderSession | null) => {
    setActiveOrder(order);
    savePendingOrder(order);
  };

  const isOverallProcessing =
    isCreatingOrder ||
    isCreatingRazorpay ||
    isVerifyingRazorpay ||
    isCreatingStripe ||
    isProcessingPayment;

  const handleInitiatePayment = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (isRestaurantClosed) {
      toast.error('This kitchen is currently closed and not accepting orders');
      return;
    }

    if (hasUnavailableItems) {
      toast.error('Please remove out-of-stock items from your cart before paying');
      navigate('/cart');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Check if existing pending order is still valid for current address and cart amount (< 14 mins old)
      const isOrderReusable = Boolean(
        activeOrder &&
        (!selectedAddress || activeOrder.addressId === selectedAddress.id) &&
        activeOrder.subTotal === subTotal &&
        Date.now() - activeOrder.createdAt < 14 * 60 * 1000,
      );

      let orderId = (isOrderReusable ? activeOrder?.orderId : undefined) || queryOrderId || undefined;
      let orderNumber = (isOrderReusable ? activeOrder?.orderNumber : undefined) || queryOrderNumber || undefined;
      let razorpayOrder = isOrderReusable ? activeOrder?.razorpayOrder : undefined;

      // If switching payment gateways on an existing pending order, update session state
      if (isOrderReusable && activeOrder && activeOrder.paymentMethod !== paymentMethod) {
        updateActiveOrder({
          ...activeOrder,
          paymentMethod,
        });
      }

      // Step 1: Create or reuse pending order in Seller microservice only if no active reusable order exists
      if (!orderId) {
        const orderResult = await createOrder({
          addressId: selectedAddress.id,
          paymentMethod,
        }).unwrap();

        orderId = orderResult.orderId;
        orderNumber = orderResult.orderNumber;
        razorpayOrder = undefined;

        updateActiveOrder({
          orderId,
          orderNumber,
          createdAt: Date.now(),
          addressId: selectedAddress.id,
          subTotal,
          paymentMethod,
        });
      } else if (!activeOrder || activeOrder.orderId !== orderId) {
        updateActiveOrder({
          orderId,
          orderNumber,
          createdAt: Date.now(),
          addressId: selectedAddress.id,
          subTotal,
          paymentMethod,
        });
      }

      // Step 2: Route according to chosen payment gateway
      if (paymentMethod === 'razorpay') {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded || !window.Razorpay) {
          toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
          setIsProcessingPayment(false);
          return;
        }

        // Reuse existing Razorpay order for this orderId or create a new one
        if (!razorpayOrder) {
          razorpayOrder = await createRazorpayOrder({ orderId }).unwrap();
          updateActiveOrder({
            orderId: orderId!,
            orderNumber,
            createdAt: activeOrder?.createdAt || Date.now(),
            addressId: selectedAddress.id,
            subTotal,
            paymentMethod: 'razorpay',
            razorpayOrder,
          });
        }

        let isPaymentFailed = false;

        const options: RazorpayOptions = {
          key: razorpayOrder.key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Foomato Foods',
          description: `Order #${(orderNumber || orderId.slice(-6)).toUpperCase()}`,
          order_id: razorpayOrder.razorpayOrderId,
          handler: async (response) => {
            try {
              setIsProcessingPayment(true);
              await verifyRazorpayPayment({
                orderId: orderId!,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }).unwrap();

              updateActiveOrder(null);
              clearLocalCart();
              toast.success('Payment verified! Your order has been placed.');
              navigate(`/order-success/${orderId}`, { replace: true });
            } catch (err: unknown) {
              const errObj = err as { data?: { message?: string } };
              const message =
                errObj?.data?.message ||
                'Payment verification failed. Please contact support.';
              toast.error(message);
              navigate(
                `/payment-failed?orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber || '')}&reason=${encodeURIComponent(message)}`,
                { replace: true }
              );
            } finally {
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: selectedAddress.mobile ? String(selectedAddress.mobile) : undefined,
          },
          theme: {
            color: '#f97316',
          },
          modal: {
            ondismiss: () => {
              setIsProcessingPayment(false);
              if (!isPaymentFailed) {
                toast.info('Payment was dismissed. Your cart is safe.');
              }
            },
          },
        };

        const rzp = new window.Razorpay(options);

        // Capture Razorpay payment failure event and navigate to payment-failed page
        rzp.on(
          'payment.failed',
          (response: unknown) => {
            isPaymentFailed = true;
            setIsProcessingPayment(false);
            const errData = response as {
              error?: { description?: string; reason?: string };
            };
            const failureReason =
              errData?.error?.description ||
              errData?.error?.reason ||
              'Transaction was declined by payment gateway';
            try {
              rzp.close();
            } catch {
              // Ignore if already closing
            }
            navigate(
              `/payment-failed?orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber || '')}&reason=${encodeURIComponent(failureReason)}`,
            );
          },
        );

        rzp.open();
      } else if (paymentMethod === 'stripe') {
        const stripeResult = await payWithStripe({ orderId }).unwrap();
        if (stripeResult.url) {
          // Preserve active order in sessionStorage before leaving SPA
          updateActiveOrder({
            orderId: orderId!,
            orderNumber,
            createdAt: activeOrder?.createdAt || Date.now(),
            addressId: selectedAddress.id,
            subTotal,
            paymentMethod: 'stripe',
          });
          window.location.href = stripeResult.url;
        } else {
          throw new Error('No checkout URL received from Stripe');
        }
      }
    } catch (err: unknown) {
      setIsProcessingPayment(false);
      const errObj = err as { data?: { message?: string } };
      toast.error(
        errObj?.data?.message || 'Failed to initiate order checkout. Please try again.',
      );
    }
  };

  return {
    activeOrder,
    isProcessing: isOverallProcessing,
    handleInitiatePayment,
  };
};
