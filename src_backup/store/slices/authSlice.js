import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('user-data')) || null,
        token: localStorage.getItem('user-token') || null,
        isAuthenticated: !!localStorage.getItem('user-token'),
        loading: false,
        error: null
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem('user-data', JSON.stringify(action.payload));
        },
        setToken: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = !!action.payload;
            localStorage.setItem('user-token', action.payload);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user-token');
            localStorage.removeItem('user-data');
            localStorage.removeItem('user-name');
            localStorage.removeItem('tenant-name');
            localStorage.removeItem('user-role');
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const { setUser, setToken, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;