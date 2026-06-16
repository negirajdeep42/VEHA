import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category } from '../../types';
import { VehaApi } from '../../utils/api';
import { mockProducts } from '../../utils/mockProducts';

interface ProductState {
  items: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  activeCategory: string;
  searchQuery: string;
  sortBy: string;
  minPrice: number;
  maxPrice: number;
  loading: boolean;
  categoriesLoading: boolean;
  detailsLoading: boolean;
  error: string | null;
  // pagination
  page: number;
  totalPages: number;
  totalElements: number;
}

const initialState: ProductState = {
  items: mockProducts,
  categories: [],
  selectedProduct: null,
  activeCategory: '',
  searchQuery: '',
  sortBy: 'featured',
  minPrice: 0,
  maxPrice: 10000,
  loading: false,
  categoriesLoading: false,
  detailsLoading: false,
  error: null,
  page: 0,
  totalPages: 1,
  totalElements: mockProducts.length,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { page?: number; size?: number } | undefined, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as any).products as ProductState;
      const queryParams: Record<string, any> = {
        category: state.activeCategory || undefined,
        search: state.searchQuery || undefined,
        sort: state.sortBy || undefined,
        minPrice: state.minPrice || undefined,
        maxPrice: state.maxPrice || undefined,
        page: params?.page !== undefined ? params.page : state.page,
        size: params?.size !== undefined ? params.size : 12,
      };

      const data = await VehaApi.getProducts(queryParams);
      
      // If backend returns a paginated structure (e.g. content, totalPages), resolve it.
      // Else default to list format.
      if (data && data.content) {
        const items = data.content.length > 0 ? data.content : mockProducts;
        return {
          items,
          page: data.number,
          totalPages: data.content.length > 0 ? data.totalPages : 1,
          totalElements: data.content.length > 0 ? data.totalElements : mockProducts.length,
        };
      } else {
        const items = Array.isArray(data) && data.length > 0 ? data : mockProducts;
        return {
          items,
          page: 0,
          totalPages: 1,
          totalElements: items.length,
        };
      }
    } catch (err: any) {
      console.warn("Backend API failed. Falling back to local mock catalog.", err);
      return {
        items: mockProducts,
        page: 0,
        totalPages: 1,
        totalElements: mockProducts.length,
      };
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await VehaApi.getCategories();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return [
        { id: 1, name: 'Rings', slug: 'rings', icon: '' },
        { id: 2, name: 'Earrings', slug: 'earrings', icon: '' },
        { id: 3, name: 'Necklaces', slug: 'necklaces', icon: '' },
        { id: 4, name: 'Bracelets', slug: 'bracelets', icon: '' },
        { id: 5, name: 'Bangles', slug: 'bangles', icon: '' },
      ];
    } catch (err: any) {
      return [
        { id: 1, name: 'Rings', slug: 'rings', icon: '' },
        { id: 2, name: 'Earrings', slug: 'earrings', icon: '' },
        { id: 3, name: 'Necklaces', slug: 'necklaces', icon: '' },
        { id: 4, name: 'Bracelets', slug: 'bracelets', icon: '' },
        { id: 5, name: 'Bangles', slug: 'bangles', icon: '' },
      ];
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await VehaApi.getProductById(id);
      return data;
    } catch (err: any) {
      const fallback = mockProducts.find(p => p.id === id);
      if (fallback) {
        return fallback;
      }
      return rejectWithValue(err.message || 'Failed to fetch product details');
    }
  }
);

export const fetchProductDetailsBySlug = createAsyncThunk(
  'products/fetchProductDetailsBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const data = await VehaApi.getProductBySlug(slug);
      return data;
    } catch (err: any) {
      const fallback = mockProducts.find(p => p.slug === slug);
      if (fallback) {
        return fallback;
      }
      return rejectWithValue(err.message || 'Failed to fetch product details');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<string>) {
      state.activeCategory = action.payload;
      state.page = 0; // reset page when filter changes
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.page = 0;
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
      state.page = 0;
    },
    setPriceRange(state, action: PayloadAction<{ min: number; max: number }>) {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
      state.page = 0;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    clearFilters(state) {
      state.activeCategory = '';
      state.searchQuery = '';
      state.sortBy = 'featured';
      state.minPrice = 0;
      state.maxPrice = 10000;
      state.page = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      // Fetch details
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.selectedProduct = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      })
      // Fetch details by slug
      .addCase(fetchProductDetailsBySlug.pending, (state) => {
        state.detailsLoading = true;
        state.selectedProduct = null;
      })
      .addCase(fetchProductDetailsBySlug.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedProduct = action.payload;
      });
  },
});

export const { setCategory, setSearchQuery, setSortBy, setPriceRange, setPage, clearFilters } = productSlice.actions;
export default productSlice.reducer;
