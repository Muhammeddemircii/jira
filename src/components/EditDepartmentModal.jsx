import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { departmentService } from '../axios/axios';
import { setEditModalOpen, setEditingDepartment, setDepartments } from '../store/slices/departmanSlice';
import { 
    Dialog, 
    DialogContent, 
    Button, 
    TextField, 
    IconButton,
    Box,
    Typography
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/DepartmentPage.css';

function EditDepartmentModal() {
    const dispatch = useDispatch();
    const { isEditModalOpen, editingDepartment, departments } = useSelector(state => state.departments);
    const [departmentName, setDepartmentName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingDepartment && editingDepartment.name) {
            setDepartmentName(editingDepartment.name);
            setDescription(editingDepartment.description || '');
        }
    }, [editingDepartment]);

    const handleClose = () => {
        dispatch(setEditModalOpen(false));
        dispatch(setEditingDepartment(null));
        setDepartmentName('');
        setDescription('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!departmentName.trim()) {
            setError('Departman adı boş olamaz.');
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedDepartment = {
                ...editingDepartment,
                name: departmentName,
                description: description
            };

            const result = await departmentService.updateDepartment(
                editingDepartment.id, 
                updatedDepartment
            );

            // Update the department in the redux store
            const updatedDepartments = departments.map(dept => 
                dept.id === editingDepartment.id ? updatedDepartment : dept
            );
            
            dispatch(setDepartments(updatedDepartments));
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Departman güncellenirken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isEditModalOpen) return null;

    return (
        <Dialog 
            open={isEditModalOpen} 
            onClose={handleClose}
            className="department-modal"
            maxWidth="sm"
            fullWidth
        >
            <Box className="department-modal-content">
                <Box className="department-modal-header">
                    <Typography className="department-modal-title">
                        Departman Düzenle
                    </Typography>
                    <IconButton onClick={handleClose} className="department-modal-close">
                        <FontAwesomeIcon icon={faTimes} />
                    </IconButton>
                </Box>
                
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Departman Adı"
                            variant="outlined"
                            fullWidth
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            error={!!error}
                            helperText={error}
                            margin="normal"
                            required
                            className="department-form-field"
                        />
                        
                        <TextField
                            label="Açıklama (Opsiyonel)"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            margin="normal"
                            className="department-form-field"
                        />
                        
                        <Box className="department-form-actions">
                            <Button 
                                onClick={handleClose}
                                variant="outlined" 
                                className="department-form-cancel"
                            >
                                İptal
                            </Button>
                            <Button 
                                type="submit"
                                variant="contained"
                                className="department-form-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
                            </Button>
                        </Box>
                    </form>
                </DialogContent>
            </Box>
        </Dialog>
    );
}

export default EditDepartmentModal;
