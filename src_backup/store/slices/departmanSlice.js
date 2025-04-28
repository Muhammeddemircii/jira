// src/store/departmentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  departments: [],
  isLoading: false,
  error: null,
  editingDepartment: null,
  isEditModalOpen: false
};

export const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    setDepartments: (state, action) => {
      state.departments = action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setEditingDepartment: (state, action) => {
      state.editingDepartment = action.payload;
    },
    setEditModalOpen: (state, action) => {
      state.isEditModalOpen = action.payload;
    }
  }
});

export const { 
  setDepartments, 
  setLoading, 
  setError, 
  setEditingDepartment,
  setEditModalOpen
} = departmentSlice.actions;

export default departmentSlice.reducer;