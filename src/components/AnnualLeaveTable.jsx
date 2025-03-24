import React, { useState, useEffect } from 'react';
import '../styles/AnnualLeave.css';

const AnnualLeaveTable = ({ apiData }) => {
  // Use API data if provided, otherwise use default data
  const [leaveData, setLeaveData] = useState([]);
  
  // Update leaveData when apiData changes
  useEffect(() => {
    console.log("AnnualLeaveTable - Received apiData:", apiData);
    
    if (apiData && Array.isArray(apiData)) {
      // Assign sequential IDs (1, 2, 3...) to the API data
      const dataWithSequentialIds = apiData.map((item, index) => ({
        ...item,
        id: index + 1
      }));
      setLeaveData(dataWithSequentialIds);
      console.log("İzin verileri yüklendi:", dataWithSequentialIds);
    } else {
      console.error("API yanıtı geçersiz format veya boş:", apiData);
      setLeaveData([]);
    }
  }, [apiData]);

  // State for filtered data
  const [filteredLeaveData, setFilteredLeaveData] = useState([]);
  
  // Update filtered data when leaveData changes
  useEffect(() => {
    setFilteredLeaveData(leaveData || []);
  }, [leaveData]);

  // Summary calculations
  const totalLeaveDays = 14; // Annual allowance - this would come from your user data
  const usedLeaveDays = leaveData?.reduce((total, leave) => total + leave.leaveDays, 0) || 0;
  const remainingLeaveDays = totalLeaveDays - usedLeaveDays;

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="annual-leave-container">
      <h2 className="annual-leave-title">Yıllık İzin Tablosu</h2>
      
      <div className="annual-leave-summary">
        <div className="annual-leave-summary-item total">
          <div className="label">Toplam İzin</div>
          <div className="value">{totalLeaveDays} gün</div>
        </div>
        <div className="annual-leave-summary-item used">
          <div className="label">Kullanılan</div>
          <div className="value">{usedLeaveDays} gün</div>
        </div>
        <div className="annual-leave-summary-item remaining">
          <div className="label">Kalan</div>
          <div className="value">{remainingLeaveDays} gün</div>
        </div>
      </div>
      
      <table className="annual-leave-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Başlangıç Tarihi</th>
            <th>Bitiş Tarihi</th>
            <th>İşe Başlama Tarihi</th>
            <th>İzin Gün Sayısı</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeaveData?.map((leave) => (
            <tr key={leave.id}>
              <td>{leave.id}</td>
              <td>{formatDate(leave.startDate)}</td>
              <td>{formatDate(leave.endDate)}</td>
              <td>{formatDate(leave.startWorkDate)}</td>
              <td>{leave.leaveDays}</td>
            </tr>
          ))}
          {(!filteredLeaveData || filteredLeaveData.length === 0) && (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                Kayıt bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div className="annual-leave-actions">
        <button className="annual-leave-button request">
          Yeni İzin Talebi
        </button>

      </div>
    </div>
  );
};

export default AnnualLeaveTable; 