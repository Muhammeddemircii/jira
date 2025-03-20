import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { departmentService } from '../../axios/axios';
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { ImProfile } from "react-icons/im";
import { setDepartments, setError, setLoading, setEditingDepartment, setEditModalOpen } from '../../store/slices/departmanSlice';
import EditDepartmentModal from '../Departments/EditDepartmentModal';
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
    Tooltip
} from '@mui/material';
import { FaUsers } from 'react-icons/fa';
import '../../styles/Departments/DepartmentPage.css';
import { toast } from 'react-hot-toast';

function DepartmentTable() {
    const dispatch = useDispatch();
    const { departments, error, loading } = useSelector(state => state.departments);

    useEffect(() => {
        const fetchDepartman = async () => {
            try {
                dispatch(setLoading(true));
                const response = await departmentService.getDepartments();
                console.log("API Yanıtı:", response);
                if (Array.isArray(response) && response.length > 0) {
                    dispatch(setDepartments(response));
                } else {
                    dispatch(setError('Departman verileri düzgün yüklenmedi.'));
                }
            } catch (err) {
                dispatch(setError('Departman verileri yüklenirken hata oluştu.'));
            } finally {
                dispatch(setLoading(false));
            }
        };
        fetchDepartman();
    }, [dispatch]);

    const handleEdit = (department) => {
        console.log("Düzenleme butonuna basıldı:", department);
        dispatch(setEditingDepartment(department));
        dispatch(setEditModalOpen(true));
    };

    const handleDelete = async (departmentId, departmentName) => {
        if (window.confirm(`"${departmentName}" departmanını silmek istediğinize emin misiniz?`)) {
            try {
                dispatch(setLoading(true));
                
                const result = await departmentService.deleteDepartment(departmentId);
                
                const updatedDepartments = departments.filter(dept => dept.id !== departmentId);
                dispatch(setDepartments(updatedDepartments));
                
                toast.success(`"${departmentName}" departmanı başarıyla silindi.`);
                
                setTimeout(async () => {
                    try {
                        const refreshedData = await departmentService.getDepartments();                        
                        if (Array.isArray(refreshedData)) {
                            const stillExists = refreshedData.some(dept => dept.id === departmentId);
                            
                            if (stillExists) {
                                console.warn(`Departman ID ${departmentId} hala veritabanında mevcut.`);
                                toast.warning("Silme işlemi UI'da başarılı göründü ancak sunucudan doğrulama bekleniyor.");
                            } else {
                                console.log("Silme işlemi sunucu tarafında da doğrulandı.");
                            }
                            
                            dispatch(setDepartments(refreshedData));
                        }
                    } catch (refreshError) {
                        console.error("Veri yenilenirken hata:", refreshError);
                    }
                }, 800);
                
            } catch (error) {
                console.error("Departman silme hatası:", error);
                
                let errorMessage = "Departman silinirken bir hata oluştu.";
                if (error.response) {
                    console.error("API yanıt kodu:", error.response.status);
                    console.error("API hata detayları:", error.response.data);
                    
                    if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.status === 404) {
                        errorMessage = "Silinecek departman bulunamadı. Sayfa yenilendikten sonra tekrar deneyin.";
                    } else if (error.response.status === 403) {
                        errorMessage = "Bu işlem için yetkiniz bulunmuyor.";
                    } else if (error.response.status === 401) {
                        errorMessage = "Oturum süresi dolmuş olabilir. Lütfen yeniden giriş yapın.";
                    }
                }
                
                toast.error(errorMessage);
            } finally {
                dispatch(setLoading(false));
            }
        }
    };

    const handleViewDetails = (department) => {
        console.log("View details for department:", department);

    };

    if (loading) {
        return (
            <Box className="department-loading-container">
                <CircularProgress size={40} className="department-loading-spinner" />
                <Typography>Departmanlar yükleniyor...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="department-error">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!departments || departments.length === 0) {
        return (
            <div className="department-empty-state">
                <div className="department-empty-icon">
                    <FaUsers />
                </div>
                <Typography className="department-empty-text">
                    Henüz hiç departman eklenmemiş. "Departman Ekle" butonunu kullanarak yeni bir departman ekleyebilirsiniz.
                </Typography>
            </div>
        );
    }

    return (
        <Paper className="department-table-container">
            <Typography variant="h6" className="department-table-title">
                Departmanlar ({departments.length})
            </Typography>
            
            <TableContainer>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell width="8%">#</TableCell>
                            <TableCell width="67%">Departman Adı</TableCell>
                            <TableCell width="25%" align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {departments.slice().reverse().map((dept, index) => (
                            <TableRow key={dept.id} className="department-table-row">
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <Typography className="department-table-name">
                                        {dept.name}
                                    </Typography>
                                    {dept.description && (
                                        <Typography variant="body2" color="text.secondary" className="department-table-description">
                                            {dept.description}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell align="right" className="action-buttons-cell">
                                    <Tooltip title="Düzenle">
                                        <IconButton 
                                            className="department-table-edit-button" 
                                            onClick={() => handleEdit(dept)}
                                            size="small"
                                        >
                                            <FaRegEdit />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Sil">
                                        <IconButton 
                                            className="department-table-delete-button" 
                                            onClick={() => handleDelete(dept.id, dept.name)}
                                            size="small"
                                        >
                                            <MdDeleteForever />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Kullanıcılar">
                                        <IconButton 
                                            className="department-table-profile-button" 
                                            onClick={() => handleViewDetails(dept)}
                                            size="small"
                                        >
                                            <ImProfile />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default DepartmentTable;
