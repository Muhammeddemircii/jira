import React, { useEffect, useState } from 'react';
import { taskTypeService, departmentService } from '../../axios/axios';
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Typography, 
    IconButton, 
    Box,
    CircularProgress,
    Tooltip,
    Chip
} from '@mui/material';
import EditTaskTypeModal from './EditTaskTypeModal';
import { toast } from 'react-hot-toast';

function TaskTypeTable() {
    const [taskTypes, setTaskTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTaskType, setEditingTaskType] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    // Veri yenileme fonksiyonu
    const refreshData = async () => {
        try {
            setLoading(true);
            
            // Önce departman verilerini çekelim
            const deptResponse = await departmentService.getDepartments();
            if (Array.isArray(deptResponse)) {
                setDepartments(deptResponse);
            }
            
            // Sonra görev tiplerini çekelim
            const taskTypeResponse = await taskTypeService.getTaskTypes();
            if (Array.isArray(taskTypeResponse) && taskTypeResponse.length > 0) {
                setTaskTypes(taskTypeResponse);
            } else {
                setError('Kategori verileri düzgün yüklenmedi.');
            }
        } catch (err) {
            setError('Veriler yüklenirken hata oluştu.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleEdit = (taskType) => {
        setEditingTaskType(taskType);
        setEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedTaskType) => {
        try {
            setLoading(true);
            console.log("Kategori güncelleme isteği gönderiliyor:", updatedTaskType);
            
            const response = await taskTypeService.updateTaskType(updatedTaskType);
            
            console.log("API güncelleme yanıtı:", response);
            
            if (response && response.isSuccess) {
                toast.success('Kategori başarıyla güncellendi!');
                
                // Güncellemeden sonra verileri yeniden çekelim
                await refreshData();
            } else {
                console.error("API başarısız yanıt döndü:", response);
                toast.error(response?.message || 'Güncelleme sırasında bir hata oluştu!');
            }
        } catch (error) {
            console.error("Kategori güncelleme hatası:", error);
            const errorMessage = error.response?.data?.message || 'Güncelleme sırasında bir hata oluştu!';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setEditModalOpen(false);
            setEditingTaskType(null);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`"${name}" adlı kategoriyi silmek istediğinize emin misiniz?`)) {
            try {
                setLoading(true);
                const response = await taskTypeService.deleteTaskType(id);
                
                if (response && response.isSuccess) {
                    toast.success('Kategori başarıyla silindi!');
                    // Silme işleminden sonra verileri yeniden çekelim
                    await refreshData();
                } else {
                    toast.error(response?.message || 'Silme işlemi sırasında bir hata oluştu!');
                }
            } catch (error) {
                console.error("Kategori silme hatası:", error);
                toast.error(error.response?.data?.message || 'Silme işlemi sırasında bir hata oluştu!');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
                <CircularProgress size={40} sx={{ color: '#20b494', marginBottom: '16px' }} />
                <Typography>Kategoriler yükleniyor...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ padding: '20px', color: 'error.main', textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!taskTypes || taskTypes.length === 0) {
        return (
            <Box sx={{ padding: '30px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
                <Typography variant="body1" color="text.secondary">
                    Henüz hiç kategori eklenmemiş. "Kategori Ekle" butonunu kullanarak yeni bir kategori ekleyebilirsiniz.
                </Typography>
            </Box>
        );
    }

    return (
        <Paper sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', overflow: 'hidden', width: '100%' }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'white' }}>
                            <TableCell width="8%" sx={{ fontWeight: 600, color: '#555', backgroundColor: 'white', borderBottom: '2px solid rgba(32, 180, 148, 0.2)' }}>#</TableCell>
                            <TableCell width="42%" sx={{ fontWeight: 600, color: '#555', backgroundColor: 'white', borderBottom: '2px solid rgba(32, 180, 148, 0.2)' }}>Adı</TableCell>
                            <TableCell width="25%" sx={{ fontWeight: 600, color: '#555', backgroundColor: 'white', borderBottom: '2px solid rgba(32, 180, 148, 0.2)' }}>Departman</TableCell>
                            <TableCell width="25%" align="right" sx={{ fontWeight: 600, color: '#555', backgroundColor: 'white', borderBottom: '2px solid rgba(32, 180, 148, 0.2)' }}>İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {taskTypes.map((taskType, index) => (
                            <TableRow 
                                key={taskType.id}
                                sx={{ 
                                    '&:hover': { backgroundColor: 'rgba(32, 180, 148, 0.03)' }, 
                                    transition: 'background-color 0.2s ease',
                                    backgroundColor: index % 2 === 0 ? 'white' : 'rgba(250, 250, 250, 0.7)'
                                }}
                            >
                                <TableCell sx={{ fontSize: '14px', color: '#666' }}>
                                    <Chip 
                                        label={index + 1} 
                                        size="small" 
                                        sx={{ 
                                            height: '24px', 
                                            minWidth: '24px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: '#555',
                                            backgroundColor: 'rgba(32, 180, 148, 0.1)'
                                        }} 
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500, color: '#333', fontSize: '14px' }}>
                                    {taskType.name}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={taskType.departmentName || 'Belirtilmemiş'} 
                                        size="small"
                                        sx={{ 
                                            bgcolor: 'rgba(32, 180, 148, 0.07)',
                                            color: '#20b494',
                                            fontWeight: 500,
                                            fontSize: '12px',
                                            border: '1px solid rgba(32, 180, 148, 0.2)'
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap', minWidth: '120px' }}>
                                    <Tooltip title="Düzenle">
                                        <IconButton 
                                            onClick={() => handleEdit(taskType)}
                                            size="small"
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
                                            onClick={() => handleDelete(taskType.id, taskType.name)}
                                            size="small"
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            {editModalOpen && (
                <EditTaskTypeModal
                    open={editModalOpen}
                    handleClose={() => {
                        setEditModalOpen(false);
                        setEditingTaskType(null);
                    }}
                    taskType={editingTaskType}
                    handleSave={handleSaveEdit}
                    departments={departments}
                />
            )}
        </Paper>
    );
}

export default TaskTypeTable; 