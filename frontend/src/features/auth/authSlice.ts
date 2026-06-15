import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { VehaApi } from '../../utils/api';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  verifiedStatus: boolean | null;
}

const getStoredUser = (): User | null => {
  try {
    const u = localStorage.getItem('veha_user');
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: localStorage.getItem('veha_token'),
  refreshToken: localStorage.getItem('veha_refresh_token'),
  loading: false,
  error: null,
  verifiedStatus: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await VehaApi.login(credentials.email, credentials.password);
      localStorage.setItem('veha_token', data.token);
      localStorage.setItem('veha_refresh_token', data.refreshToken);
      const user = { email: data.email, name: data.name, roles: data.roles };
      localStorage.setItem('veha_user', JSON.stringify(user));
      return { user, token: data.token, refreshToken: data.refreshToken };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await VehaApi.logout();
    } catch (e) {}
    localStorage.removeItem('veha_token');
    localStorage.removeItem('veha_refresh_token');
    localStorage.removeItem('veha_user');
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await VehaApi.getProfile();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: { name: string; phone?: string }, { rejectWithValue }) => {
    try {
      const data = await VehaApi.updateProfile(profileData);
      const userStr = localStorage.getItem('veha_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        u.name = data.name;
        u.phone = data.phone;
        localStorage.setItem('veha_user', JSON.stringify(u));
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setToken(state, action: PayloadAction<{ token: string; refreshToken: string }>) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      // Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.name = action.payload.name;
          state.user.phone = action.payload.phone;
        }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.name = action.payload.name;
          state.user.phone = action.payload.phone;
        }
      });
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
