import React, { useState, useCallback } from 'react';
import { 
    Button, 
    Box, 
    Typography, 
    Paper
} from '@mui/material';
import AddStaff from "./AddStaff";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faUsers } from '@fortawesome/free-solid-svg-icons';
import StaffTable from './StaffTable';
import '../../styles/Staffs/StaffButton.css';
import '../../styles/Staffs/AddStaff.css';

function StaffButton() {
    const [loadingStaffButton, setLoadingStaffButton] = useState(false);
    const [openAddStaff, setOpenAddStaff] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddStaff = () => {
        setLoadingStaffButton(true);
        setOpenAddStaff(true);

        setTimeout(() => {
            setLoadingStaffButton(false);
        }, 500);
    };
    
    const handleStaffAdded = useCallback(() => {

        setRefreshTrigger(prev => prev + 1);
        setOpenAddStaff(false);
    }, []);

    return (
        <Box className="staff-container" sx={{ width: '96%', maxWidth: '1400px', margin: '0 auto' }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#f7f9fc',
                    border: '1px solid #e0e7ff'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FontAwesomeIcon 
                        icon={faUsers} 
                        style={{ 
                            fontSize: '24px', 
                            color: '#20b494',
                            padding: '12px',
                            backgroundColor: 'rgba(32, 180, 148, 0.1)',
                            borderRadius: '50%'
                        }} 
                    />
                    <Typography variant="h6" fontWeight={600}>
                        Personel Yönetimi
                    </Typography>
                </Box>
                
                <Button
                    onClick={handleAddStaff}
                    variant="contained"
                    disabled={loadingStaffButton}
                    startIcon={
                        <FontAwesomeIcon
                            icon={loadingStaffButton ? faSpinner : faPlus}
                            spin={loadingStaffButton}
                        />
                    }
                    sx={{ 
                        bgcolor: "#20b494",
                        '&:hover': {
                            bgcolor: "#18a085"
                        },
                        px: 3
                    }}
                >
                    {loadingStaffButton ? "Yükleniyor..." : "Personel Ekle"}
                </Button>
            </Paper>
            
            <StaffTable refreshTrigger={refreshTrigger} />

            {openAddStaff && (
                <AddStaff
                    setOpenAddStaff={setOpenAddStaff}
                    setLoadingStaffButton={setLoadingStaffButton}
                    onStaffAdded={handleStaffAdded}
                />
            )}
        </Box>
    );
}

export default StaffButton;
