import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { WishlistItem } from '../../types';
import { VehaApi } from '../../utils/api';

const KEY = 'veha_wishlist';

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const getLocalWishlist = (): WishlistItem[] => {
  try {
    const r = localStorage.getItem(KEY);
    return r ? JSON.parse(r) : [];
  } catch (e) {
    return [];
  }
};

const setLocalWishlist = (list: WishlistItem[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {}
};

const initialState: WishlistState = {
  items: getLocalWishlist(),
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    const isLoggedIn = !!localStorage.getItem('veha_token');
    if (isLoggedIn) {
      try {
        const data = await VehaApi.getWishlist();
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: item.price,
          wasPrice: item.wasPrice,
          discountPercent: item.discountPercent,
          svgRender: item.svgRender
        }));
      } catch (err: any) {
        return rejectWithValue(err.message || 'Failed to fetch wishlist');
      }
    } else {
      return getLocalWishlist();
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (product: any, { getState, dispatch }) => {
    const isLoggedIn = !!localStorage.getItem('veha_token');
    const items = getLocalWishlist();
    const isSaved = items.some(i => i.id === product.id);

    if (isLoggedIn) {
      const stateWishlist = (getState() as any).wishlist.items as WishlistItem[];
      const exists = stateWishlist.some(i => i.id === product.id);
      if (exists) {
        await VehaApi.removeFromWishlist(product.id);
      } else {
        await VehaApi.addToWishlist(product.id);
      }
      dispatch(fetchWishlist());
    } else {
      let newList = [...items];
      if (isSaved) {
        newList = newList.filter(i => i.id !== product.id);
      } else {
        newList.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          wasPrice: product.wasPrice,
          discountPercent: product.discountPercent,
          svgRender: product.svgRender || product.svg
        });
      }
      setLocalWishlist(newList);
      return newList;
    }
  }
);

export const mergeWishlist = createAsyncThunk(
  'wishlist/mergeWishlist',
  async (_, { dispatch }) => {
    const guestItems = getLocalWishlist();
    if (guestItems.length > 0) {
      for (const item of guestItems) {
        try {
          await VehaApi.addToWishlist(item.id);
        } catch (e) {
          console.error('Failed to sync wishlist item:', e);
        }
      }
      localStorage.removeItem(KEY);
    }
    dispatch(fetchWishlist());
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistState(state) {
      state.items = [];
      localStorage.removeItem(KEY);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items = action.payload;
        }
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload;
        }
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
