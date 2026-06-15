import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types';
import { VehaApi } from '../../utils/api';

const KEY = 'veha_cart_v1';
const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING_CHARGE = 49;
const GST_RATE = 0.03;

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  loading: boolean;
  error: string | null;
}

const getLocalItems = (): CartItem[] => {
  try {
    const r = localStorage.getItem(KEY);
    return r ? JSON.parse(r) : [];
  } catch (e) {
    return [];
  }
};

const setLocalItems = (items: CartItem[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (e) {}
};

const initialState: CartState = {
  items: getLocalItems(),
  couponCode: null,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState, rejectWithValue }) => {
    const isLoggedIn = !!localStorage.getItem('veha_token');
    if (isLoggedIn) {
      try {
        const data = await VehaApi.getCart();
        return data.items.map((item: any) => ({
          id: String(item.id),
          productId: item.productId,
          name: item.productName,
          variant: item.variantInfo,
          price: item.priceEach,
          qty: item.quantity,
          svg: item.svgRender
        }));
      } catch (err: any) {
        return rejectWithValue(err.message || 'Failed to fetch cart');
      }
    } else {
      return getLocalItems();
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    payload: { productId: number; name: string; variant: string; price: number; qty: number; svg?: string },
    { getState, dispatch }
  ) => {
    const isLoggedIn = !!localStorage.getItem('veha_token');
    if (isLoggedIn) {
      await VehaApi.addToCart(payload.productId, payload.variant, payload.qty);
      dispatch(fetchCart());
    } else {
      const items = getLocalItems();
      const slugId = `${payload.productId}-${payload.variant.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const found = items.find(i => i.id === slugId);
      if (found) {
        found.qty += payload.qty;
      } else {
        items.push({
          id: slugId,
          productId: payload.productId,
          name: payload.name,
          variant: payload.variant,
          price: payload.price,
          qty: payload.qty,
          svg: payload.svg
        });
      }
      setLocalItems(items);
      return items;
    }
  }
);

export const updateCartQty = createAsyncThunk(
  'cart/updateCartQty',
  async (payload: { id: string; qty: number }, { getState, dispatch }) => {
    const isLoggedIn = !!localStorage.getItem('veha_token');
    if (isLoggedIn) {
      const dbId = parseInt(payload.id);
      await VehaApi.updateCartItem(dbId, payload.qty);
      dispatch(fetchCart());
    } else {
      const items = getLocalItems();
      const found = items.find(i => i.id === payload.id);
      if (found) {
        found.qty = Math.max(1, payload.qty);
        setLocalItems(items);
      }
      return items;
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (id: string, { getState, dispatch }) => {
    const isLoggedIn = !!localStorage.getItem('veha_token');
    if (isLoggedIn) {
      const dbId = parseInt(id);
      await VehaApi.removeCartItem(dbId);
      dispatch(fetchCart());
    } else {
      let items = getLocalItems();
      items = items.filter(i => i.id !== id);
      setLocalItems(items);
      return items;
    }
  }
);

export const mergeGuestCart = createAsyncThunk(
  'cart/mergeGuestCart',
  async (_, { dispatch }) => {
    const guestItems = getLocalItems();
    if (guestItems.length > 0) {
      const requests = guestItems.map(item => ({
        productId: item.productId,
        variantInfo: item.variant,
        quantity: item.qty
      }));
      try {
        await VehaApi.mergeCart(requests);
        localStorage.removeItem(KEY);
      } catch (e) {
        console.error('Failed to merge cart:', e);
      }
    }
    dispatch(fetchCart());
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    applyCoupon(state, action: PayloadAction<string | null>) {
      state.couponCode = action.payload;
    },
    clearCartState(state) {
      state.items = [];
      state.couponCode = null;
      localStorage.removeItem(KEY);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items = action.payload;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Local Fallbacks
      .addCase(addToCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload;
        }
      })
      .addCase(updateCartQty.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload;
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload;
        }
      });
  },
});

export const selectCartSummary = (state: { cart: CartState }) => {
  const items = state.cart.items;
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // 10% discount for VEHA10
  const discountRate = state.cart.couponCode === 'VEHA10' ? 0.10 : 0.0;
  const discount = Math.round(subtotal * discountRate);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * GST_RATE);
  const shipping = (subtotal > 0 && taxable < FREE_SHIPPING_THRESHOLD) ? FLAT_SHIPPING_CHARGE : 0;
  const total = taxable + tax + shipping;
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return {
    items,
    subtotal,
    discount,
    tax,
    shipping,
    total,
    count
  };
};

export const { applyCoupon, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
