import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Order } from '../../types';
import { VehaApi } from '../../utils/api';
import { clearCartState } from '../cart/cartSlice';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  placementLoading: boolean;
  error: string | null;
  placementSuccess: boolean;
  lastPlacedOrderId: number | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  placementLoading: false,
  error: null,
  placementSuccess: false,
  lastPlacedOrderId: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await VehaApi.getOrders();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await VehaApi.getOrderDetails(id);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch order details');
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (checkoutData: any, { dispatch, rejectWithValue }) => {
    try {
      const data = await VehaApi.placeOrder(checkoutData);
      dispatch(clearCartState());
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to place order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetPlacementState(state) {
      state.placementSuccess = false;
      state.lastPlacedOrderId = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.selectedOrder = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      // Place order
      .addCase(placeOrder.pending, (state) => {
        state.placementLoading = true;
        state.error = null;
        state.placementSuccess = false;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placementLoading = false;
        state.placementSuccess = true;
        state.lastPlacedOrderId = action.payload.id;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placementLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPlacementState } = orderSlice.actions;
export default orderSlice.reducer;
