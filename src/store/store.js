import { configureStore } from '@reduxjs/toolkit'
import authReducer from "./slices/authSlice";
import departmentReducer from './slices/departmanSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer
  },
})