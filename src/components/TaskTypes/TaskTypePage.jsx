import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Button, 
    Box 
} from '@mui/material';
import { MdAdd } from 'react-icons/md';
import TaskTypeTable from './TaskTypeTable';
import AddTaskType from './AddTaskType';
import { taskTypeService } from '../../axios/axios';
import { toast } from 'react-hot-toast';

function TaskTypePage() {
    const [taskTypes, setTaskTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

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
        setRefreshKey(prev => prev + 1); // Force a refresh
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
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '12px',
                    width: '100%'
                }}
            >
                <Typography 
                    variant="h5" 
                    sx={{ 
                        color: '#333',
                        fontSize: '22px',
                        fontWeight: 600,
                        margin: 0
                    }}
                >
                    Kategoriler
                </Typography>

                <Button 
                    variant="contained"
                    startIcon={<MdAdd />}
                    onClick={() => setAddModalOpen(true)}
                    sx={{
                        backgroundColor: '#20b494',
                        borderRadius: '8px',
                        padding: '6px 16px',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap',
                        minWidth: '130px',
                        boxShadow: '0 2px 5px rgba(32, 180, 148, 0.3)',
                        '&:hover': {
                            backgroundColor: '#18a085',
                            boxShadow: '0 4px 8px rgba(32, 180, 148, 0.4)',
                            transform: 'translateY(-1px)'
                        }
                    }}
                >
                    Kategori Ekle
                </Button>
            </Box>

            <TaskTypeTable key={refreshKey} />

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