import { configureStore } from '@reduxjs/toolkit'
import authReducer from "./slices/authSlice";
import departmentReducer from './slices/departmanSlice';
import staffReducer from './slices/staffSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer,
    staff: staffReducer
  },
})