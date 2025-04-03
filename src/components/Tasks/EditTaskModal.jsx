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
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import { departmentService, tasksServices } from '../../axios/axios';
import { toast } from 'react-hot-toast';

const EditTaskModal = ({ open, handleClose, task, onTaskUpdated }) => {
  const [formData, setFormData] = useState({
    taskId: '',
    name: '',
    description: '',
    note: '',
    departmentId: '',
    durationId: '',
    responsibleUsersId: [],
    files: [],
    priority: 3,
    tenantId: 'c35a6a8e-204b-4791-ba3b-08dd2c05ebe3'
  });
  
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  // Form verilerini başlatma
  useEffect(() => {
    if (task) {
      setFormData({
        taskId: task.id || '',
        name: task.name || '',
        description: task.description || '',
        note: task.note || '',
        departmentId: task.departmentId || '',
        durationId: task.durationId || '',
        responsibleUsersId: task.responsibleUserIds || [],
        files: [],
        priority: task.priority || 3,
        tenantId: task.tenantId || 'c35a6a8e-204b-4791-ba3b-08dd2c05ebe3'
      });
    }
  }, [task]);

  // Departman ve kategori verilerini yükleme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Departman verilerini getir
        const departmentsData = await departmentService.getDepartments();
        setDepartments(departmentsData);
        
        // Kategori (durum) verilerini getir
        const categoriesData = await tasksServices.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Form girdisi değişimini işleme
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata temizleme
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form doğrulama
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Görev adı boş olamaz';
    }
    
    if (!formData.departmentId) {
      newErrors.departmentId = 'Departman seçilmelidir';
    }
    
    if (!formData.durationId) {
      newErrors.durationId = 'Durum seçilmelidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formu gönderme
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await tasksServices.updateTask(formData);
      
      if (response && response.isSuccess) {
        toast.success('Görev başarıyla güncellendi');
        if (onTaskUpdated) {
          onTaskUpdated();
        }
        handleClose();
      } else {
        toast.error(response?.message || 'Görev güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
      toast.error('Görev güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 24px'
      }}>
        Görev Düzenle
        <IconButton onClick={handleClose} size="small">
          <MdClose />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ padding: '24px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        )}
        
        {!loading && (
          <>
            <TextField
              name="name"
              label="Görev Adı"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            
            <TextField
              name="description"
              label="Açıklama"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
            
            <TextField
              name="note"
              label="Not"
              value={formData.note}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            
            <FormControl fullWidth margin="normal" error={!!errors.departmentId} required>
              <InputLabel id="department-label">Departman</InputLabel>
              <Select
                labelId="department-label"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                label="Departman"
              >
                {departments.map(department => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.departmentId && <FormHelperText>{errors.departmentId}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth margin="normal" error={!!errors.durationId} required>
              <InputLabel id="duration-label">Durum</InputLabel>
              <Select
                labelId="duration-label"
                name="durationId"
                value={formData.durationId}
                onChange={handleInputChange}
                label="Durum"
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.durationId && <FormHelperText>{errors.durationId}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="priority-label">Öncelik</InputLabel>
              <Select
                labelId="priority-label"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                label="Öncelik"
              >
                <MenuItem value={1}>Yüksek</MenuItem>
                <MenuItem value={2}>Orta</MenuItem>
                <MenuItem value={3}>Düşük</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={handleClose} variant="outlined">
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Güncelleniyor...' : 'Güncelle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskModal; 