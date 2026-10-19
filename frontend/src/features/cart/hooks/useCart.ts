import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  addToCart as localAddToCart,
  removeFromCart as localRemoveFromCart,
  updateQuantity as localUpdateQuantity,
  setCart as localSetCart,
  clearCart as localClearCart,
  type CartItem,
} from '../../../slices/cart/cartSlice';
import {
  useGetMyCartQuery,
  useAddToCartMutation,
  useIncrementCartItemMutation,
  useDecrementCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from '../../../slices/cart/cartApiSlice';
import { useAuth } from '../../../context/use-auth';
import { toast } from 'sonner';

export type CartItemInput = Omit<CartItem, 'quantity'>;

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const cartState = useAppSelector((state) => state.cart);

  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<CartItemInput | null>(null);

  // Fetch backend cart only when user is authenticated
  const {
    data: backendCart,
    isLoading: isCartLoading,
    refetch: refetchCart,
  } = useGetMyCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [apiAddToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [apiIncrement, { isLoading: isIncrementing }] =
    useIncrementCartItemMutation();
  const [apiDecrement, { isLoading: isDecrementing }] =
    useDecrementCartItemMutation();
  const [apiRemove, { isLoading: isRemoving }] = useRemoveCartItemMutation();
  const [apiClear, { isLoading: isClearing }] = useClearCartMutation();

  // Sync backend cart into redux state when loaded
  useEffect(() => {
    if (isAuthenticated && backendCart) {
      const items: CartItem[] = backendCart.cart.map((entry) => ({
        id: entry.itemId,
        name: entry.item?.name || 'Dish',
        price: Number(entry.item?.price || 0),
        image: entry.item?.image || '',
        isVeg: entry.item?.isVeg ?? true,
        quantity: entry.quantity,
        sellerId: entry.sellerId,
        sellerName: entry.seller?.name || '',
        description: entry.item?.description,
      }));

      const sellerId = backendCart.cart[0]?.sellerId || null;
      const sellerName = backendCart.cart[0]?.seller?.name || null;

      dispatch(
        localSetCart({
          items,
          sellerId,
          sellerName,
        }),
      );
    }
  }, [isAuthenticated, backendCart, dispatch]);

  const addToCart = useCallback(
    async (item: CartItemInput) => {
      // Check multi-restaurant conflict before sending
      if (
        cartState.items.length > 0 &&
        cartState.sellerId &&
        cartState.sellerId !== item.sellerId
      ) {
        setPendingItem(item);
        setConflictModalOpen(true);
        return;
      }

      if (isAuthenticated) {
        try {
          await apiAddToCart({
            sellerId: item.sellerId,
            itemId: item.id,
          }).unwrap();
          toast.success(`Added ${item.name} to cart`);
        } catch (error: unknown) {
          const errMessage =
            (error as { data?: { message?: string } })?.data?.message ||
            (error as { message?: string })?.message ||
            'Failed to add item to cart';

          if (
            typeof errMessage === 'string' &&
            errMessage.includes('one restaurant')
          ) {
            setPendingItem(item);
            setConflictModalOpen(true);
            return;
          }

          toast.error(errMessage);
          return;
        }
      } else {
        dispatch(localAddToCart(item));
        toast.success(`Added ${item.name} to cart`);
      }
    },
    [cartState.items.length, cartState.sellerId, isAuthenticated, apiAddToCart, dispatch],
  );

  const incrementItem = useCallback(
    async (itemId: string) => {
      const existing = cartState.items.find((i) => i.id === itemId);
      if (!existing) return;

      if (isAuthenticated) {
        try {
          await apiIncrement(itemId).unwrap();
        } catch (error: unknown) {
          const errMessage =
            (error as { data?: { message?: string } })?.data?.message ||
            'Failed to update item';
          toast.error(errMessage);
          return;
        }
      }
      dispatch(localUpdateQuantity({ id: itemId, quantity: existing.quantity + 1 }));
    },
    [cartState.items, isAuthenticated, apiIncrement, dispatch],
  );

  const decrementItem = useCallback(
    async (itemId: string) => {
      const existing = cartState.items.find((i) => i.id === itemId);
      if (!existing) return;

      if (isAuthenticated) {
        try {
          await apiDecrement(itemId).unwrap();
        } catch (error: unknown) {
          const errMessage =
            (error as { data?: { message?: string } })?.data?.message ||
            'Failed to update item';
          toast.error(errMessage);
          return;
        }
      }

      if (existing.quantity <= 1) {
        dispatch(localRemoveFromCart(itemId));
        toast.info(`Removed ${existing.name} from cart`);
      } else {
        dispatch(localUpdateQuantity({ id: itemId, quantity: existing.quantity - 1 }));
      }
    },
    [cartState.items, isAuthenticated, apiDecrement, dispatch],
  );

  const removeItem = useCallback(
    async (itemId: string, name?: string) => {
      if (isAuthenticated) {
        try {
          await apiRemove(itemId).unwrap();
        } catch (error: unknown) {
          const errMessage =
            (error as { data?: { message?: string } })?.data?.message ||
            'Failed to remove item';
          toast.error(errMessage);
          return;
        }
      }
      dispatch(localRemoveFromCart(itemId));
      if (name) {
        toast.info(`Removed ${name} from cart`);
      }
    },
    [isAuthenticated, apiRemove, dispatch],
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await apiClear().unwrap();
      } catch (error: unknown) {
        const errMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          'Failed to clear cart';
        toast.error(errMessage);
        return;
      }
    }
    dispatch(localClearCart());
    toast.info('Cart cleared');
  }, [isAuthenticated, apiClear, dispatch]);

  const confirmSwitchRestaurantAndAdd = useCallback(async () => {
    if (!pendingItem) return;

    if (isAuthenticated) {
      try {
        await apiClear().unwrap();
        await apiAddToCart({
          sellerId: pendingItem.sellerId,
          itemId: pendingItem.id,
        }).unwrap();
      } catch (error: unknown) {
        const errMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          'Failed to switch restaurant';
        toast.error(errMessage);
        setConflictModalOpen(false);
        setPendingItem(null);
        return;
      }
    }

    dispatch(localClearCart());
    dispatch(localAddToCart(pendingItem));
    toast.success(`Cleared old cart and added ${pendingItem.name}`);
    setConflictModalOpen(false);
    setPendingItem(null);
  }, [pendingItem, isAuthenticated, apiClear, apiAddToCart, dispatch]);

  const cancelConflict = useCallback(() => {
    setConflictModalOpen(false);
    setPendingItem(null);
  }, []);

  const isMutating =
    isAdding || isIncrementing || isDecrementing || isRemoving || isClearing;

  return {
    items: cartState.items,
    sellerId: cartState.sellerId,
    sellerName: cartState.sellerName,
    totalQuantity: cartState.totalQuantity,
    totalAmount: cartState.totalAmount,
    isLoading: isCartLoading || isMutating,
    addToCart,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    refetchCart,
    conflictModalOpen,
    pendingItem,
    confirmSwitchRestaurantAndAdd,
    cancelConflict,
  };
};
