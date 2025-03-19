import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    staffList: [],
    editModalOpen: false,
    editingStaff: null,
    loading: false,
    error: null
};

const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        setStaffList: (state, action) => {
            state.staffList = action.payload;
        },
        setEditModalOpen: (state, action) => {
            state.editModalOpen = action.payload;
        },
        setEditingStaff: (state, action) => {
            state.editingStaff = action.payload;
        },
        updateStaffInList: (state, action) => {
            const updatedStaff = action.payload;
            const index = state.staffList.findIndex(staff => staff.id === updatedStaff.id);
            if (index !== -1) {
                state.staffList[index] = updatedStaff;
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setStaffList,
    setEditModalOpen,
    setEditingStaff,
    updateStaffInList,
    setLoading,
    setError
} = staffSlice.actions;

export default staffSlice.reducer; 