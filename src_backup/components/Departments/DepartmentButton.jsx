import React, { useState } from 'react';
import { Button, Typography, useMediaQuery, Box, Paper, Fab } from '@mui/material';
import DepartmentTable from './DepartmentTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faUsers } from '@fortawesome/free-solid-svg-icons';
import EditDepartmentModal from '../Departments/EditDepartmentModal';
import AddDepartment from './AddDepartment';

function DepartmentButton() {
    const [loadingDepartmentButton, setLoadingDepartmentButton] = useState(false);
    const [openAddDepartment, setOpenAddDepartment] = useState(false);
    const isMobile = useMediaQuery('(max-width:768px)');
    
    const handleAddDepartment = () => {
        setLoadingDepartmentButton(true);
        setOpenAddDepartment(true);

        setTimeout(() => {
            setLoadingDepartmentButton(false);
        }, 1000);
    };

    return (
        <Box sx={{ width: '96%', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'rgba(32, 180, 148, 0.08)',
                    border: '1px solid rgba(32, 180, 148, 0.2)'
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
                        {isMobile ? "Departmanlar" : "Departman Yönetimi"}
                    </Typography>
                </Box>
                
                {!isMobile && (
                    <Button
                        onClick={handleAddDepartment}
                        variant="contained"
                        disabled={loadingDepartmentButton}
                        startIcon={
                            <FontAwesomeIcon
                                icon={loadingDepartmentButton ? faSpinner : faPlus}
                                spin={loadingDepartmentButton}
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
                        {loadingDepartmentButton ? "Ekleniyor..." : "Yeni"}
                    </Button>
                )}
            </Paper>
            
            <DepartmentTable />

            {isMobile && (
                <Fab 
                    color="primary" 
                    aria-label="add"
                    onClick={handleAddDepartment}
                    disabled={loadingDepartmentButton}
                    sx={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        bgcolor: "#20b494",
                        '&:hover': {
                            bgcolor: "#18a085"
                        },
                        zIndex: 1000
                    }}
                >
                    <FontAwesomeIcon
                        icon={loadingDepartmentButton ? faSpinner : faPlus}
                        spin={loadingDepartmentButton}
                    />
                </Fab>
            )}

            {openAddDepartment && (
                <AddDepartment
                    onClose={() => setOpenAddDepartment(false)}
                />
            )}
            
            <EditDepartmentModal />
        </Box>
    );
}

export default DepartmentButton;