import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, Box, Card, CardContent, CircularProgress,
  Grid, Tooltip, Chip
} from '@mui/material';
import { departmentService } from '../axios/axios';
import '../styles/Departments/DepartmentTasks.css';
import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';

// For charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip as ChartTooltip, Cell } from 'recharts';

function DepartmentTasksPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [departmentTasks, setDepartmentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get userData from localStorage
  const userData = JSON.parse(localStorage.getItem('user-data') || '{}');
  // Get tenantId from userData or fallback to a default if needed
  const tenantId = userData?.tenantId || '3109afd0-319c-4e1a-151e-08dd1dbad71d';

  // Status colors for charts and chips
  const statusColors = {
    'Beklemede': '#FFC107', // yellow
    'Atandı': '#2196F3',    // blue
    'Tamamlandı': '#4CAF50', // green
    'Reddedildi': '#F44336', // red
    'İşlemde': '#9C27B0'     // purple
  };

  useEffect(() => {
    const fetchDepartmentTasks = async () => {
      try {
        setLoading(true);
        console.log('Fetching department tasks with tenantId:', tenantId);
        const response = await departmentService.getDepartmentTasks(tenantId);
        console.log('Department tasks response:', response);
        setDepartmentTasks(response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching department tasks:', err);
        setError('Departman görevleri yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchDepartmentTasks();
  }, [tenantId]);

  // Prepare chart data for each department
  const prepareChartData = (durationTaskInfo) => {
    return durationTaskInfo.map(item => ({
      name: item.name,
      count: item.count,
      color: statusColors[item.name] || '#999'
    }));
  };

  return (
    <div className="department-tasks-page">
    
      <div className={`department-tasks-container ${isOpen ? 'menu-open' : ''}`}>  <Navbar setIsOpen={setIsOpen} isOpen={isOpen} />
        <Box sx={{ width: '96%', maxWidth: '1400px', margin: '0 auto', mb: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(32, 180, 148, 0.08)',
                border: '1px solid rgba(32, 180, 148, 0.2)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FontAwesomeIcon 
                    icon={faListCheck} 
                    style={{ 
                        fontSize: '24px', 
                        color: '#20b494',
                        padding: '12px',
                        backgroundColor: 'rgba(32, 180, 148, 0.1)',
                        borderRadius: '50%'
                    }} 
                />
                <Typography variant="h6" fontWeight={600}>
                    Departman Görevleri
                </Typography>
            </Box>
          </Paper>
        </Box>

        {loading ? (
          <Box className="loading-container">
            <CircularProgress />
            <Typography>Yükleniyor...</Typography>
          </Box>
        ) : error ? (
          <Box className="error-container">
            <Typography color="error">{error}</Typography>
          </Box>
        ) : departmentTasks.length === 0 ? (
          <Box className="empty-state">
            <Typography>Henüz departman görevi bulunmamaktadır.</Typography>
          </Box>
        ) : (
          <Box className="department-tasks-stats">
            <Grid container spacing={3} className="stats-grid">
              {departmentTasks.map((dept) => (
                <Grid item xs={12} md={6} lg={4} key={dept.id}>
                  <Card className="stat-card">
                    <CardContent>
                      <Typography variant="h6" className="stat-title">
                        {dept.name}
                      </Typography>

                      <Box className="stat-summary">
                        <Box className="stat-item">
                          <Typography variant="body2" className="stat-label">
                            Proje Sayısı
                          </Typography>
                          <Typography variant="h5" className="stat-value">
                            {dept.projectCount}
                          </Typography>
                        </Box>
                        <Box className="stat-item">
                          <Typography variant="body2" className="stat-label">
                            Personel Sayısı
                          </Typography>
                          <Typography variant="h5" className="stat-value">
                            {dept.personelCount}
                          </Typography>
                        </Box>
                      </Box>

                      <Box className="status-chips">
                        {dept.durationTaskInfo.map((status) => (
                          <Tooltip 
                            key={status.durationId} 
                            title={`${status.name}: ${status.count} görev`}
                            arrow
                          >
                            <Chip
                              label={`${status.name}: ${status.count}`}
                              className="status-chip"
                              style={{ 
                                backgroundColor: statusColors[status.name] || '#999',
                                opacity: status.count > 0 ? 1 : 0.5
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Box>

                      <Box className="chart-container">
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={prepareChartData(dept.durationTaskInfo)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              fontSize={11}
                              tickLine={false}
                              axisLine={{ stroke: '#E0E0E0' }}
                            />
                            <YAxis 
                              allowDecimals={false}
                              tickLine={false}
                              axisLine={{ stroke: '#E0E0E0' }}
                              fontSize={10}
                            />
                            <ChartTooltip 
                              formatter={(value, name) => [`${value} görev`, name]}
                              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            />
                            <Bar 
                              dataKey="count" 
                              radius={[4, 4, 0, 0]}
                            >
                              {prepareChartData(dept.durationTaskInfo).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <div className="table-container">
              <TableContainer component={Paper} className="tasks-table">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Departman</TableCell>
                      <TableCell align="center">Proje Sayısı</TableCell>
                      <TableCell align="center">Personel Sayısı</TableCell>
                      <TableCell align="center">Beklemede</TableCell>
                      <TableCell align="center">Atandı</TableCell>
                      <TableCell align="center">İşlemde</TableCell>
                      <TableCell align="center">Tamamlandı</TableCell>
                      <TableCell align="center">Reddedildi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentTasks.map((dept) => {
                      // Create a map of status names to counts for easy access
                      const statusMap = dept.durationTaskInfo.reduce((acc, status) => {
                        acc[status.name] = status.count;
                        return acc;
                      }, {});
                      
                      return (
                        <TableRow key={dept.id} className="table-row">
                          <TableCell className="department-name">{dept.name}</TableCell>
                          <TableCell align="center">{dept.projectCount}</TableCell>
                          <TableCell align="center">{dept.personelCount}</TableCell>
                          <TableCell align="center" className="status-cell" style={{ color: statusColors['Beklemede'] }}>
                            {statusMap['Beklemede'] || 0}
                          </TableCell>
                          <TableCell align="center" className="status-cell" style={{ color: statusColors['Atandı'] }}>
                            {statusMap['Atandı'] || 0}
                          </TableCell>
                          <TableCell align="center" className="status-cell" style={{ color: statusColors['İşlemde'] }}>
                            {statusMap['İşlemde'] || 0}
                          </TableCell>
                          <TableCell align="center" className="status-cell" style={{ color: statusColors['Tamamlandı'] }}>
                            {statusMap['Tamamlandı'] || 0}
                          </TableCell>
                          <TableCell align="center" className="status-cell" style={{ color: statusColors['Reddedildi'] }}>
                            {statusMap['Reddedildi'] || 0}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Box>
        )}
      </div>
    </div>
  );
}

export default DepartmentTasksPage; 