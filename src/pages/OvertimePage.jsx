import React, { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { overTimeServices } from '../axios/axios';
import { useParams } from 'react-router-dom';
import '../styles/OvertimePage.css';

function OvertimePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [overtimes, setOvertimes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    entryTime: '',
    exitTime: ''
  });
  
  const id = useParams();
  
  const updateMenuState = useCallback((newState) => {
    setIsOpen(newState);
  }, []);

  useEffect(() => {
    const fetchOvertimeServices = async () => {
      const response = await overTimeServices.getOverTimeServices(id);
      if(response && response.data){
        setOvertimes(response.data);
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your submission logic here
    // For example: await overTimeServices.createOverTime(formData);
    
    setShowForm(false);
    setFormData({
      entryTime: '',
      exitTime: ''
    });
    
    // Refetch data after submit
    const response = await overTimeServices.getOverTimeServices(id);
    if(response && response.data){
      setOvertimes(response.data);
    }
  };
  
  // Helper function to calculate duration between entry and exit times
  const calculateDuration = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) return "N/A";
    
    try {
      const entry = new Date(entryTime);
      const exit = new Date(exitTime);
      const diff = Math.abs(exit - entry);
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch (e) {
      return "Invalid time";
    }
  };
  
  // Helper function to format date
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
  
  // Helper function to format time
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
          <h1 className="overtime-header">Mesai Kayıtları</h1>
          
          <div className="overtime-actions">
            <button 
              className="overtime-button add" 
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'İptal Et' : 'Yeni Mesai Ekle'}
            </button>
          </div>
          
          {showForm && (
            <div className="overtime-form">
              <h2 className="overtime-form-title">Yeni Mesai Bilgileri</h2>
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