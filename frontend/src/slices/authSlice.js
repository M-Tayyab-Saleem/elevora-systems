import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../axios";
import { setUser } from "./userSlice";

// Demo Login
export const loginAsDemoUser = createAsyncThunk(
  "auth/loginAsDemoUser",
  async (role, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/auth/demo-login", { role }, { ignoreAuthRedirect: true });
      const userData = response.data?.user || response.data;
      const token = response.data?.token || response.data?.accessToken;
      
      // Store in localStorage so it persists across reloads
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      
      dispatch(setUser(userData));
      return { user: userData, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Demo login failed");
    }
  }
);

export const syncUser = createAsyncThunk(
  "auth/syncUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/auth/me", { ignoreAuthRedirect: true });
      const userData = response.data?.user || response.data;
      dispatch(setUser(userData));
      return userData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Sync failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem('accessToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('accessToken');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.user;
    },
  },
  extraReducers: (builder) => {
    builder
      // Demo Login
      .addCase(loginAsDemoUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAsDemoUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(loginAsDemoUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('accessToken');
      })
      // Sync User
      .addCase(syncUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(syncUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { logout, setLoading, setAuthUser } = authSlice.actions;
export default authSlice.reducer;