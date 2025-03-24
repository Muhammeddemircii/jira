import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { AnnualLeavesService } from '../axios/axios';
import "../styles/AnnualLeave.css";
import AnnualLeaveTable from '../components/AnnualLeaveTable';
import { useParams } from 'react-router-dom';

function AnnualLeavesPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const { id } = useParams();

    const updateMenuState = useCallback((newState) => {
        setIsOpen(newState);
    }, []);

    useEffect(() => {
        console.log("AnnualLeavesPage - URL parametresi id:", id);
        if (id) {
            AnnualLeavesService.getAnnualLeaves(id)
                .then(data => {
                    console.log("API'den gelen izin verileri:", data);
                    setApiResponse(data);
                })
                .catch(error => {
                    console.error("İzin verileri alınırken hata:", error);
                });
        } else {
            console.error("URL'den id parametresi alınamadı");
        }
    }, [id]);

    return (
        <div>
            <Navbar isOpen={isOpen} setIsOpen={updateMenuState} />
            <div className="page-content" style={{ marginLeft: isOpen ? "250px" : "0", padding: "20px" }}>
                <AnnualLeaveTable apiData={apiResponse} />
            </div>
        </div>
    );
}

export default AnnualLeavesPage;
