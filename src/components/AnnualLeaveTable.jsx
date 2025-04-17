import React, { useState, useEffect } from 'react';
import '../styles/AnnualLeave.css';
import { AnnualLeavesService } from '../axios/axios';
import Loading from './Loading';

const AnnualLeaveTable = ({ apiData, isGroupView, onLeaveUpdated }) => {
  // Use API data if provided, otherwise use default data
  const [leaveData, setLeaveData] = useState([]);
  // State for modal
  const [showModal, setShowModal] = useState(false);
  // Loading state
  const [loading, setLoading] = useState(true);
  // State for leave request form
  const [leaveRequest, setLeaveRequest] = useState({
    startDate: '',
    endDate: '',
    startWorkDate: '',
    leaveDays: 0
  });
  
  // Check if current user is a group manager
  const isGroupManager = localStorage.getItem('user-role') === 'GroupManager';
  
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
      setLoading(false);
      console.log("İzin verileri yüklendi:", dataWithSequentialIds);
    } else {
      console.error("API yanıtı geçersiz format veya boş:", apiData);
      setLeaveData([]);
      // Eğer apiData null ise yükleniyor olabilir, undefined ise hata olabilir
      setLoading(apiData === null);
    }
  }, [apiData]);

  // State for filtered data
  const [filteredLeaveData, setFilteredLeaveData] = useState([]);
  
  // Update filtered data when leaveData changes
  useEffect(() => {
    setFilteredLeaveData(leaveData || []);
  }, [leaveData]);

  // Summary calculations - Grup yöneticisi görünümünde toplam özete personel izin toplamlarını gösterme
  const totalLeaveDays = 14; // Annual allowance - this would come from your user data
  
  // Grup görünümünde personel başına kalan izinleri hesapla
  const usedLeaveDays = leaveData?.reduce((total, leave) => 
    leave.status === 'Onaylandı' ? total + leave.leaveDays : total, 0) || 0;
  const remainingLeaveDays = totalLeaveDays - usedLeaveDays;

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveRequest({
      ...leaveRequest,
      [name]: value
    });

    // Calculate leave days if both start and end dates are filled
    if ((name === 'startDate' || name === 'endDate') && leaveRequest.startDate && leaveRequest.endDate) {
      const start = new Date(name === 'startDate' ? value : leaveRequest.startDate);
      const end = new Date(name === 'endDate' ? value : leaveRequest.endDate);
      
      // Calculate business days between dates
      let days = 0;
      const tempDate = new Date(start);
      while (tempDate <= end) {
        const dayOfWeek = tempDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
          days++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
      
      setLeaveRequest(prev => ({
        ...prev,
        leaveDays: days
      }));

      // If start work date is not set, default to day after end date
      if (!leaveRequest.startWorkDate) {
        const nextWorkDay = new Date(end);
        nextWorkDay.setDate(nextWorkDay.getDate() + 1);
        
        // Skip to Monday if next day is weekend
        const dayOfWeek = nextWorkDay.getDay();
        if (dayOfWeek === 0) { // Sunday
          nextWorkDay.setDate(nextWorkDay.getDate() + 1);
        } else if (dayOfWeek === 6) { // Saturday
          nextWorkDay.setDate(nextWorkDay.getDate() + 2);
        }
        
        setLeaveRequest(prev => ({
          ...prev,
          startWorkDate: nextWorkDay.toISOString().split('T')[0]
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Get current user ID from localStorage
    const userId = localStorage.getItem('user-id');
    
    // Create the leave request object for API
    const leaveRequestData = {
      userId: userId,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      startWorkDate: leaveRequest.startWorkDate,
      leaveDays: leaveRequest.leaveDays,
      // Only visible to group manager
      visibleToGroupManager: true,
      // Initial status is pending
      status: 'Beklemede'
    };
    
    // Set loading state
    setLoading(true);
    
    // Call the API service
    AnnualLeavesService.createAnnualLeave(leaveRequestData)
      .then(response => {
        // Add the new leave to the list
        const newLeave = {
          ...leaveRequestData,
          id: leaveData.length + 1
        };
        setLeaveData([...leaveData, newLeave]);
        setShowModal(false);
        // Reset form
        setLeaveRequest({
          startDate: '',
          endDate: '',
          startWorkDate: '',
          leaveDays: 0
        });
        
        // Verileri yenilemek için callback fonksiyonunu çağır
        if (onLeaveUpdated) {
          onLeaveUpdated();
        }
        
        // Başarılı mesajı göster
        alert("İzin talebiniz başarıyla oluşturuldu!");
        setLoading(false);
      })
      .catch(error => {
        console.error("İzin talebi oluşturulurken hata:", error);
        alert("İzin talebi oluşturulurken bir hata oluştu!");
        setLoading(false);
      });
  };

  // Handle approve/reject leave request
  const handleApproveReject = (leaveId, approved) => {
    const leave = leaveData.find(item => item.id === leaveId);
    if (!leave) return;

    const status = approved ? 'Onaylandı' : 'Reddedildi';
    
    // Set loading state
    setLoading(true);
    
    AnnualLeavesService.updateLeaveStatus(leave.annualLeaveId || leave.id, status)
      .then(response => {
        // Update the leave status in the local state
        const updatedLeaveData = leaveData.map(item => {
          if (item.id === leaveId) {
            return { ...item, status };
          }
          return item;
        });
        setLeaveData(updatedLeaveData);
        
        // Verileri yenilemek için callback fonksiyonunu çağır
        if (onLeaveUpdated) {
          onLeaveUpdated();
        }
        
        // Başarılı mesajı göster
        alert(`İzin talebi başarıyla ${approved ? 'onaylandı' : 'reddedildi'}!`);
        setLoading(false);
      })
      .catch(error => {
        console.error(`İzin talebi ${approved ? 'onaylanırken' : 'reddedilirken'} hata:`, error);
        alert(`İzin talebi ${approved ? 'onaylanırken' : 'reddedilirken'} bir hata oluştu!`);
        setLoading(false);
      });
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Onaylandı':
        return 'status-badge approved';
      case 'Reddedildi':
        return 'status-badge rejected';
      case 'Beklemede':
      default:
        return 'status-badge pending';
    }
  };

  // Custom loading message based on view type
  const getLoadingMessage = () => {
    return isGroupView 
      ? "Personel izin talepleri yükleniyor..." 
      : "İzin talepleri yükleniyor...";
  };

  return (
    <div className="annual-leave-container">
      <h2 className="annual-leave-title">
        {isGroupView ? 'Personel Yıllık İzin Talepleri' : 'Yıllık İzin Tablosu'}
      </h2>
      
      {!isGroupView && (
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
      )}
      
      <table className="annual-leave-table">
        <thead>
          <tr>
            <th>#</th>
            {isGroupView && <th>Personel</th>}
            <th>Başlangıç Tarihi</th>
            <th>Bitiş Tarihi</th>
            <th>İşe Başlama Tarihi</th>
            <th>İzin Gün Sayısı</th>
            {isGroupManager && <th>İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={isGroupView ? (isGroupManager ? "7" : "6") : (isGroupManager ? "6" : "5")}>
                <Loading />
              </td>
            </tr>
          ) : (
            <>
              {filteredLeaveData?.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.id}</td>
                  {isGroupView && <td>{leave.userName || "Bilinmiyor"}</td>}
                  <td>{formatDate(leave.startDate)}</td>
                  <td>{formatDate(leave.endDate)}</td>
                  <td>{formatDate(leave.startWorkDate)}</td>
                  <td>{leave.leaveDays}</td>
                  {isGroupManager && (
                    <td>
                      {leave.status === 'Beklemede' && (
                        <div className="action-buttons">
                          <button 
                            className="approve-button"
                            onClick={() => handleApproveReject(leave.id, true)}
                          >
                            Onayla
                          </button>
                          <button 
                            className="reject-button"
                            onClick={() => handleApproveReject(leave.id, false)}
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                      {leave.status && leave.status !== 'Beklemede' && (
                        <span className="action-completed">
                          {leave.status === 'Onaylandı' ? 'Onaylandı' : 'Reddedildi'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {!loading && (!filteredLeaveData || filteredLeaveData.length === 0) && (
                <tr>
                  <td colSpan={isGroupView ? (isGroupManager ? "7" : "6") : (isGroupManager ? "6" : "5")} style={{ textAlign: 'center', padding: '20px' }}>
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
      
      <div className="annual-leave-actions">
        <button 
          className="annual-leave-button request"
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          İzin Al
        </button>
      </div>

      {/* Leave Request Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Yeni İzin Talebi</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="startDate">Başlangıç Tarihi:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={leaveRequest.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">Bitiş Tarihi:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={leaveRequest.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="startWorkDate">İşe Başlama Tarihi:</label>
                <input
                  type="date"
                  id="startWorkDate"
                  name="startWorkDate"
                  value={leaveRequest.startWorkDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="leaveDays">İzin Gün Sayısı:</label>
                <input
                  type="number"
                  id="leaveDays"
                  name="leaveDays"
                  value={leaveRequest.leaveDays}
                  readOnly
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>İptal</button>
                <button type="submit" disabled={loading}>Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualLeaveTable; 