import React, { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { AnnualLeavesService } from '../axios/axios';
import "../styles/AnnualLeave.css";
import AnnualLeaveTable from '../components/AnnualLeaveTable';

function AnnualLeavesPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const updateMenuState = useCallback((newState) => {
        setIsOpen(newState);
    }, []);
    
    useEffect(() => {
      const getAnnualLeaves = async () => {
        try {
            const response = await AnnualLeavesService.getAnnualLeaves();
            
            // Format API response for the table component
            setApiResponse({
                data: response.data,
                message: response.message || "İşlem Başarılı",
                isSuccess: response.isSuccess || true
            });
            
            console.log("API response:", response);
        } catch (error) {
            console.log(error);
            setApiResponse(null);
        }
      }
      getAnnualLeaves();
    }, []);
    
    return (
        <div>
            <div>
                <Navbar isOpen={isOpen} setIsOpen={updateMenuState} />
            </div>
            <div className="page-content" style={{ marginLeft: isOpen ? "250px" : "0", padding: "20px" }}>
                <AnnualLeaveTable apiData={apiResponse} />
            </div>
        </div>
    )
}

export default AnnualLeavesPage