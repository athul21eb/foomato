import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
  isAvailable?: boolean;
  quantity: number;
  sellerId: string;
  sellerName?: string;
  description?: string;
}

export interface CartState {
  items: CartItem[];
  sellerId: string | null;
  sellerName: string | null;
  totalQuantity: number;
  totalAmount: number;
}

const CART_STORAGE_KEY = 'foomato_cart';

const calculateTotals = (items: CartItem[]) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  return {
    totalQuantity,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
};

const loadSavedCart = (): CartState => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return {
        items: [],
        sellerId: null,
        sellerName: null,
        totalQuantity: 0,
        totalAmount: 0,
      };
    }
    const parsed = JSON.parse(raw);
    const { totalQuantity, totalAmount } = calculateTotals(parsed.items || []);
    return {
      items: parsed.items || [],
      sellerId: parsed.sellerId || null,
      sellerName: parsed.sellerName || null,
      totalQuantity,
      totalAmount,
    };
  } catch {
    return {
      items: [],
      sellerId: null,
      sellerName: null,
      totalQuantity: 0,
      totalAmount: 0,
    };
  }
};

const saveCartToStorage = (state: CartState) => {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        items: state.items,
        sellerId: state.sellerId,
        sellerName: state.sellerName,
      }),
    );
  } catch {
    // Ignore storage errors in private browsing
  }
};

const initialState: CartState = loadSavedCart();

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<Omit<CartItem, 'quantity'>>,
    ) => {
      const { id, name, price, image, isVeg, isAvailable, sellerId, sellerName, description } =
        action.payload;

      // If cart already contains items from a different seller, replace cart with new seller's items
      if (state.sellerId && state.sellerId !== sellerId) {
        state.items = [
          {
            id,
            name,
            price: Number(price),
            image,
            isVeg,
            isAvailable: isAvailable ?? true,
            quantity: 1,
            sellerId,
            sellerName,
            description,
          },
        ];
        state.sellerId = sellerId;
        state.sellerName = sellerName || null;
      } else {
        const existingItem = state.items.find((item) => item.id === id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.items.push({
            id,
            name,
            price: Number(price),
            image,
            isVeg,
            isAvailable: isAvailable ?? true,
            quantity: 1,
            sellerId,
            sellerName,
            description,
          });
        }
        state.sellerId = sellerId;
        if (sellerName) {
          state.sellerName = sellerName;
        }
      }

      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCartToStorage(state);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.items.length === 0) {
        state.sellerId = null;
        state.sellerName = null;
      }
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCartToStorage(state);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const existingItem = state.items.find((item) => item.id === id);
        if (existingItem) {
          existingItem.quantity = quantity;
        }
      }

      if (state.items.length === 0) {
        state.sellerId = null;
        state.sellerName = null;
      }

      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCartToStorage(state);
    },

    setCart: (
      state,
      action: PayloadAction<{
        items: CartItem[];
        sellerId: string | null;
        sellerName: string | null;
      }>,
    ) => {
      state.items = action.payload.items;
      state.sellerId = action.payload.sellerId;
      state.sellerName = action.payload.sellerName;
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCartToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.sellerId = null;
      state.sellerName = null;
      state.totalQuantity = 0;
      state.totalAmount = 0;
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch {
        // Ignore
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, setCart, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
