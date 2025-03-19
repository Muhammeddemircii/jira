import { Button } from '@mui/material'
import React, { useState } from 'react'
import DepartmentTable from './DepartmentTable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import EditDepartmentModal from './EditDepartmentModal';

function DepartmentButton() {
    const [LoadingStaffButton, setLoadingStaffButton] = useState(false);
    const [openAddStaff, setOpenAddStaff] = useState(false);
    const handleAddStaff = () => {
        setLoadingStaffButton(true);
        setOpenAddStaff(true);

        setTimeout(() => {
            setLoadingStaffButton(false);
        }, 1000);
    };

    return (
        <div>
            <div>
                <Button
                    onClick={handleAddStaff}
                    variant="contained"
                    disabled={LoadingStaffButton}
                    sx={{ backgroundColor: "#20b494" }}
                >
                    <FontAwesomeIcon
                        className="icon-margin"
                        icon={LoadingStaffButton ? faSpinner : faPlus}
                        spin={LoadingStaffButton}
                    />
                    {LoadingStaffButton ? " Ekleniyor..." : " Departman Ekle"}
                </Button> 
                <DepartmentTable />

                {openAddStaff && (
                    <div>
                        <EditDepartmentModal/>
                    </div>
                )}
            </div>

        </div>
    )
}

export default DepartmentButton