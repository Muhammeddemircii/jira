import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { departmentService } from '../axios/axios';
import '../styles/Departments/DepartmentTasks.css';
import Navbar from '../components/Navbar';

function PersonnelTasksPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Navbar setIsOpen={setIsOpen} isOpen={isOpen} />

      <div className={`department-tasks-container main-content ${isOpen ? 'menu-open' : ''}`}>
        <Typography variant="h4" component="h1" className="page-title">
          Personel Görevleri
        </Typography>

        {loading ? (
          <Box className="loading-container">
            <CircularProgress />
            <Typography>Yükleniyor...</Typography>
          </Box>
        ) : (
          <Box className="empty-state">
            <Typography>Bu sayfa yapım aşamasındadır.</Typography>
          </Box>
        )}
      </div>
    </div>
  );
}

export default PersonnelTasksPage; 