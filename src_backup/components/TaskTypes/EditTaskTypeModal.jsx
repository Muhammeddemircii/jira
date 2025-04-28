import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    CircularProgress
} from '@mui/material';
import { MdClose } from 'react-icons/md';

function EditTaskTypeModal({ open, handleClose, taskType, handleSave, departments }) {
    const [name, setName] = useState('');
    const [relatedDepartmentId, setRelatedDepartmentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        if (taskType) {
            setName(taskType.name || '');
            setRelatedDepartmentId(taskType.relatedDepartmentId || '');
        }
    }, [taskType]);

    const resetForm = () => {
        setName('');
        setRelatedDepartmentId('');
        setNameError('');
    };

    const validateForm = () => {
        let isValid = true;
        

        if (!name.trim()) {
            setNameError('Kategori adı boş olamaz');
            isValid = false;
        } else {
            setNameError('');
        }
        
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            

            const updatedTaskType = {
                id: taskType.id,
                taskTypeId: taskType.id,
                name: name.trim(),
                title: name.trim(),
                relatedDepartmentId: relatedDepartmentId || ""
            };
            
            await handleSave(updatedTaskType);
            resetForm();
        } catch (error) {
            console.error("Kategori güncelleme hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        handleClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '16px 24px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #eee' 
            }}>
                Kategori Düzenle
                <IconButton 
                    onClick={handleCancel}
                    size="small"
                    sx={{ 
                        color: '#888',
                        '&:hover': { color: '#333' }
                    }}
                >
                    <MdClose />
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ padding: '24px', marginTop: '8px' }}>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Kategori Adı"
                    type="text"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!!nameError}
                    helperText={nameError}
                    sx={{ marginBottom: '16px' }}
                />
                
                <FormControl fullWidth sx={{ marginBottom: '16px' }}>
                    <InputLabel id="department-label">Departman</InputLabel>
                    <Select
                        labelId="department-label"
                        id="department-select"
                        value={relatedDepartmentId}
                        onChange={(e) => setRelatedDepartmentId(e.target.value)}
                        label="Departman"
                    >
                        <MenuItem value="">
                            <em>Seçilmemiş</em>
                        </MenuItem>
                        {departments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>
                                {dept.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            
            <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
                <Button 
                    onClick={handleCancel}
                    sx={{ 
                        color: '#666',
                        '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                >
                    İptal
                </Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    sx={{ 
                        backgroundColor: '#20b494',
                        '&:hover': { backgroundColor: '#18a085' },
                        minWidth: '100px'
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                        'Kaydet'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditTaskTypeModal; 