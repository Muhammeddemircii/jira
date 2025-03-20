import React, { useState } from 'react';
import { Button, Typography, useMediaQuery } from '@mui/material';
import DepartmentTable from './DepartmentTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
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
        <div>
            <div className="department-header">
                <Typography variant="h1">{isMobile ? "Departmanlar" : "Departman Yönetimi"}</Typography>
                <Button
                    onClick={handleAddDepartment}
                    variant="contained"
                    disabled={loadingDepartmentButton}
                    className="department-add-button"
                    size={isMobile ? "small" : "medium"}
                >
                    <FontAwesomeIcon
                        className="icon-margin"
                        icon={loadingDepartmentButton ? faSpinner : faPlus}
                        spin={loadingDepartmentButton}
                        style={{ marginRight: '8px' }}
                    />
                    {loadingDepartmentButton ? "Ekleniyor..." : isMobile ? "Ekle" : "Departman Ekle"}
                </Button>
            </div>
            
            <DepartmentTable />

            {openAddDepartment && (
                <AddDepartment
                    onClose={() => setOpenAddDepartment(false)}
                />
            )}
            
            <EditDepartmentModal />
        </div>
    );
}

export default DepartmentButton;