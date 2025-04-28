import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Button, 
    Box,
    Paper,
    Grid,
    Divider,
    useTheme,
    useMediaQuery,
    Card,
    CardContent
} from '@mui/material';
import { MdAdd } from 'react-icons/md';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import TaskTypeTable from './TaskTypeTable';
import AddTaskType from './AddTaskType';
import { taskTypeService } from '../../axios/axios';
import { toast } from 'react-hot-toast';

function TaskTypePage() {
    const [taskTypes, setTaskTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchTaskTypes = async () => {
            try {
                setLoading(true);
                const response = await taskTypeService.getTaskTypes();
                if (Array.isArray(response)) {
                    setTaskTypes(response);
                }
            } catch (error) {
                console.error("Kategoriler yüklenirken hata oluştu:", error);
                toast.error("Kategoriler yüklenirken bir hata oluştu!");
            } finally {
                setLoading(false);
            }
        };

        fetchTaskTypes();
    }, [refreshKey]);

    const handleTaskTypeAdded = (newTaskType) => {
        setTaskTypes(prev => [...prev, newTaskType]);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <Container 
            sx={{ 
                padding: '20px', 
                backgroundColor: '#f8f9fa',
                minHeight: 'calc(100vh - 64px)',
                maxWidth: '100%',
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}
        >
            <Box sx={{ width: '96%', maxWidth: '1400px', margin: '0 auto' }}>
                <Card 
                    elevation={3} 
                    sx={{ 
                        mb: 4, 
                        borderRadius: '16px',
                        overflow: 'visible',
                        position: 'relative',
                        backgroundImage: 'linear-gradient(to right, rgba(32, 180, 148, 0.03), rgba(32, 180, 148, 0.08))'
                    }}
                >
                    <CardContent sx={{ p: 0 }}>
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                top: '-20px', 
                                left: isMobile ? '20px' : '40px',
                                width: '64px',
                                height: '64px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                boxShadow: '0 4px 20px rgba(32, 180, 148, 0.2)',
                                zIndex: 1,
                                border: '2px solid rgba(32, 180, 148, 0.3)'
                            }}
                        >
                            <FontAwesomeIcon 
                                icon={faLayerGroup} 
                                style={{ 
                                    fontSize: '24px', 
                                    color: '#20b494'
                                }} 
                            />
                        </Box>

                        <Box 
                            sx={{ 
                                pt: 6, 
                                pb: 3, 
                                px: isMobile ? 3 : 5,
                                backgroundColor: 'white',
                                borderTopLeftRadius: '16px',
                                borderTopRightRadius: '16px' 
                            }}
                        >
                            <Typography 
                                variant="h5" 
                                fontWeight={700} 
                                color="#444"
                                sx={{ ml: isMobile ? 5 : 9 }}
                            >
                                Kategoriler
                            </Typography>
                            
                            <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ mt: 1, ml: isMobile ? 5 : 9 }}
                            >
                                Şirket kategorilerinizi oluşturun ve yönetin
                            </Typography>
                        </Box>
                        
                        <Divider />
                        
                        <Box 
                            sx={{ 
                                p: isMobile ? 2 : 3, 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                borderBottomLeftRadius: '16px',
                                borderBottomRightRadius: '16px'
                            }}
                        >
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {loading ? 'Yükleniyor...' : `${taskTypes.length} kategori bulundu`}
                                </Typography>
                            </Box>
                            
                            <Button 
                                variant="contained"
                                onClick={() => setAddModalOpen(true)}
                                startIcon={<MdAdd />}
                                sx={{ 
                                    bgcolor: "#20b494",
                                    '&:hover': {
                                        bgcolor: "#18a085"
                                    },
                                    px: 3,
                                    py: 1,
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 10px rgba(32, 180, 148, 0.3)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Kategori Ekle
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
                <Box sx={{ mt: 2, borderRadius: '16px', overflow: 'hidden' }}>
                    <TaskTypeTable key={refreshKey} />
                </Box>
            </Box>

            {addModalOpen && (
                <AddTaskType 
                    open={addModalOpen}
                    setOpen={setAddModalOpen}
                    onTaskTypeAdded={handleTaskTypeAdded}
                />
            )}
        </Container>
    );
}

export default TaskTypePage; 