import React, { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { overTimeServices } from '../axios/axios';
import { useParams } from 'react-router-dom';
import '../styles/OvertimePage.css';
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { Tooltip, IconButton } from '@mui/material';

function OvertimePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [overtimes, setOvertimes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    entryTime: '',
    exitTime: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const { id } = useParams(); // Destructured correctly
  
  const updateMenuState = useCallback((newState) => {
    setIsOpen(newState);
  }, []);

  useEffect(() => {
    const fetchOvertimeServices = async () => {
      try {
        const response = await overTimeServices.getOverTimeServices();
        if(response && response.data){
          setOvertimes(response.data);
        }
      } catch (error) {
        console.error('Mesai kayıtları yüklenirken hata:', error);
        alert('Mesai kayıtları yüklenemedi.');
      }
    }
    fetchOvertimeServices();
  }, [])
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleEdit = (overtime) => {
    setEditMode(true);
    setEditId(overtime.id);
    setFormData({
      entryTime: overtime.entryTime ? overtime.entryTime.substring(0, 16) : '', // Format for datetime-local
      exitTime: overtime.exitTime ? overtime.exitTime.substring(0, 16) : ''     // Format for datetime-local
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Bu mesai kaydını silmek istediğinize emin misiniz?')) {
      try {
        await overTimeServices.deleteOvertime(id);
        
        // Refresh overtime list
        const updatedOvertimes = await overTimeServices.getOverTimeServices();
        if (updatedOvertimes && updatedOvertimes.data) {
          setOvertimes(updatedOvertimes.data);
        }
        
        alert('Mesai kaydı başarıyla silindi.');
      } catch (error) {
        console.error('Mesai kaydı silinirken hata oluştu:', error);
        alert('Mesai kaydı silinirken bir hata oluştu.');
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare the overtime data for submission
      const overtimeData = {
        userId: localStorage.getItem('user-id'), // Get user ID from local storage
        entryTime: formData.entryTime,
        exitTime: formData.exitTime
      };

      if (editMode && editId) {
        // Update existing overtime
        await overTimeServices.updateOvertime(editId, overtimeData);

      } else {
        // Create new overtime
        await overTimeServices.createOvertime(overtimeData);

      }

      // Reset form state
      setShowForm(false);
      setFormData({
        entryTime: '',
        exitTime: ''
      });
      setEditMode(false);
      setEditId(null);

      // Refresh the overtime list
      const updatedOvertimes = await overTimeServices.getOverTimeServices();
      if (updatedOvertimes && updatedOvertimes.data) {
        setOvertimes(updatedOvertimes.data);
      }

    } catch (error) {
      // Handle any errors during submission
      console.error('Mesai kaydı işlemi sırasında hata oluştu:', error);
      alert('Mesai kaydı işlemi sırasında bir hata oluştu.');
    }
  };
  
  const calculateDuration = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) return "N/A";
    
    try {
      const entry = new Date(entryTime);
      const exit = new Date(exitTime);
      const diff = Math.abs(exit - entry);
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours} saat ${minutes} dakika`;
    } catch (e) {
      return "Invalid time";
    }
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div>
      <div>
        <Navbar isOpen={isOpen} setIsOpen={updateMenuState} />
        <div className="overtime-container">
          <div className="overtime-header-card">
            <h1 className="overtime-header">Mesai Kayıtları</h1>
          </div>
          
          <div className="overtime-actions">
            <button 
              className="overtime-button add" 
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  setEditMode(false);
                  setEditId(null);
                  setFormData({
                    entryTime: '',
                    exitTime: ''
                  });
                }
              }}
            >
              {showForm ? 'İptal Et' : 'Yeni Mesai Ekle'}
            </button>
          </div>
          
          {showForm && (
            <div className="overtime-form">
              <h2 className="overtime-form-title">{editMode ? 'Mesai Düzenle' : 'Yeni Mesai Bilgileri'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="overtime-form-row">
                  <div className="overtime-form-group">
                    <label className="overtime-form-label">Başlangıç Saati</label>
                    <input
                      type="datetime-local"
                      name="entryTime"
                      value={formData.entryTime}
                      onChange={handleInputChange}
                      className="overtime-form-input"
                      required
                    />
                  </div>
                  <div className="overtime-form-group">
                    <label className="overtime-form-label">Bitiş Saati</label>
                    <input
                      type="datetime-local"
                      name="exitTime"
                      value={formData.exitTime}
                      onChange={handleInputChange}
                      className="overtime-form-input"
                      required
                    />
                  </div>
                </div>
                <div className="overtime-form-actions">
                  <button type="submit" className="overtime-submit-button">Kaydet</button>
                  <button 
                    type="button" 
                    className="overtime-cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {overtimes.length > 0 ? (
            <div className="overtime-cards-container">
              {overtimes.map((overtime) => (
                <div key={overtime.id} className="overtime-card">
                  <div className="overtime-card-header">
                    <span className="overtime-date">{formatDate(overtime.entryTime)}</span>
                    <div className="overtime-card-actions">
                      <Tooltip title="Düzenle">
                        <IconButton 
                          size="small"
                          onClick={() => handleEdit(overtime)}
                          sx={{ 
                            color: '#20b494', 
                            marginRight: '8px', 
                            padding: '6px',
                            backgroundColor: 'rgba(32, 180, 148, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(32, 180, 148, 0.2)' }
                          }}
                        >
                          <FaRegEdit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton 
                          size="small"
                          onClick={() => handleDelete(overtime.id)}
                          sx={{ 
                            color: '#e74c3c', 
                            padding: '6px',
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.2)' }
                          }}
                        >
                          <MdDeleteForever />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="overtime-times">
                    <div className="overtime-time-item">
                      <div className="overtime-time-label">Başlangıç</div>
                      <div className="overtime-entry-time">{formatTime(overtime.entryTime)}</div>
                    </div>
                    <div className="overtime-time-item">
                      <div className="overtime-time-label">Bitiş</div>
                      <div className="overtime-exit-time">{formatTime(overtime.exitTime)}</div>
                    </div>
                  </div>
                  <div className="overtime-duration">
                    <div className="overtime-duration-label">Toplam Süre</div>
                    <div className="overtime-duration-value">
                      {calculateDuration(overtime.entryTime, overtime.exitTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-overtime-message">
              <i className="fa fa-clock-o"></i>
              Henüz mesai kaydı bulunmamaktadır.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OvertimePage