import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Paper, Typography, Box, CircularProgress, Card, CardContent, Grid,
  Chip, Divider, List, ListItem, ListItemText, Tooltip, LinearProgress
} from '@mui/material';
import { tasksServices } from '../axios/axios';
import '../styles/Departments/DepartmentTasks.css';
import '../styles/Tasks/TaskTypes.css';
import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTasks, faBuilding, faUserTie, faCheckCircle, faClock, faChartPie } from '@fortawesome/free-solid-svg-icons';

function PersonnelTasksPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userTasks, setUserTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        setLoading(true);
        const tenantId = "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3";
        const response = await tasksServices.getGroupTasksByUser(tenantId);
        console.log("User tasks response:", response);
        
        if (response && Array.isArray(response)) {
          setUserTasks(response);
        } else {
          setUserTasks([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user tasks:", err);
        setError('Personel görevleri yüklenirken bir hata oluştu.');
      setLoading(false);
      }
    };

    fetchUserTasks();
  }, []);

  const calculateProgress = (completed, total) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  return (
    <div>
      <Navbar setIsOpen={setIsOpen} isOpen={isOpen} />

      <div className={`department-tasks-container main-content ${isOpen ? 'menu-open' : ''}`}>
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
                icon={faChartPie} 
                style={{ 
                  fontSize: '24px', 
                  color: '#20b494',
                  padding: '12px',
                  backgroundColor: 'rgba(32, 180, 148, 0.1)',
                  borderRadius: '50%'
                }} 
              />
              <Typography variant="h6" fontWeight={600}>
                Personel Görev Analizi
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
        ) : userTasks.length === 0 ? (
          <Box className="empty-state">
            <Typography>Henüz personel görevi bulunmamaktadır.</Typography>
          </Box>
        ) : (
          <Box className="task-types-container">
            <Grid container spacing={3}>
              {userTasks.map((user) => (
                <Grid item xs={12} key={user.userId}>
                  <Card className="task-type-card">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={100}
                            size={60}
                            thickness={4}
                            sx={{ color: 'rgba(32, 180, 148, 0.1)' }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FontAwesomeIcon 
                              icon={faUserTie} 
                              style={{ 
                                fontSize: '24px', 
                                color: '#20b494'
                              }} 
                            />
                          </Box>
                        </Box>
                        <Typography variant="h6" className="task-type-title">
                          {user.userName}
                        </Typography>
                      </Box>

                      {user.departments.map((department) => (
                        <Box key={department.departmentId} sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <FontAwesomeIcon icon={faBuilding} style={{ color: '#666' }} />
                            <Typography variant="subtitle1" fontWeight={600}>
                              {department.departmentName}
                            </Typography>
                          </Box>
                          
                          <Grid container spacing={2}>
                            {department.taskTypes.map((taskType) => (
                              <Grid item xs={12} sm={6} md={4} key={taskType.taskTypeId}>
                                <Card 
                                  sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    bgcolor: 'rgba(0,0,0,0.02)',
                                    borderRadius: '12px',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                      transform: 'translateY(-4px)',
                                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                    }
                                  }}
                                >
                                  <CardContent>
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                        {taskType.taskTypeName}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                          <CircularProgress
                                            variant="determinate"
                                            value={calculateProgress(taskType.completedTasks, taskType.taskCount)}
                                            size={40}
                                            thickness={4}
                                            sx={{ color: '#20b494' }}
                                          />
                                          <Box
                                            sx={{
                                              top: 0,
                                              left: 0,
                                              bottom: 0,
                                              right: 0,
                                              position: 'absolute',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                            }}
                                          >
                                            <Typography variant="caption" component="div" color="text.secondary">
                                              {`${Math.round(calculateProgress(taskType.completedTasks, taskType.taskCount))}%`}
                                            </Typography>
                                          </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Tamamlanma Oranı
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Görev Dağılımı
                                      </Typography>
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: '100%' }}>
                                            <LinearProgress
                                              variant="determinate"
                                              value={calculateProgress(taskType.completedTasks, taskType.taskCount)}
                                              sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: 'rgba(32, 180, 148, 0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                  backgroundColor: '#20b494'
                                                }
                                              }}
                                            />
                                          </Box>
                                          <Typography variant="body2" color="text.secondary">
                                            {taskType.completedTasks}/{taskType.taskCount}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Toplam Görev
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                          {taskType.taskCount}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Tamamlanan
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} color="success.main">
                                          {taskType.completedTasks}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Bekleyen
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} color="warning.main">
                                          {taskType.incompleteTasks}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Tahmini Süre: {taskType.duration}
                                      </Typography>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </div>
    </div>
  );
}

export default PersonnelTasksPage; 