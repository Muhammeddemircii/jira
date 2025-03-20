import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { departmentService } from '../axios/axios';
import { setDepartments } from '../store/slices/departmanSlice';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    IconButton,
    Box,
    Typography
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/DepartmentPage.css';

function AddDepartment({ onClose }) {
    const dispatch = useDispatch();
    const { departments } = useSelector(state => state.departments);
    const [departmentName, setDepartmentName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!departmentName.trim()) {
            setError('Departman adı boş olamaz.');
            return;
        }

        setIsSubmitting(true);
        try {
            const newDepartment = await departmentService.addDepartment(departmentName);
            if (newDepartment && newDepartment.data) {
                dispatch(setDepartments([...departments, newDepartment.data]));
                onClose();
            } else {
                setError('Departman eklenirken beklenmeyen bir hata oluştu.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Departman eklenirken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog 
            open={true} 
            onClose={onClose}
            className="department-modal"
            maxWidth="sm"
            fullWidth
        >
            <Box className="department-modal-content">
                <Box className="department-modal-header">
                    <Typography className="department-modal-title">
                        Yeni Departman Ekle
                    </Typography>
                    <IconButton onClick={onClose} className="department-modal-close">
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
                                onClick={onClose}
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
                                {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
                            </Button>
                        </Box>
                    </form>
                </DialogContent>
            </Box>
        </Dialog>
    );
}

export default AddDepartment;