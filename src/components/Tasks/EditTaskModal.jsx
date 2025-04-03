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
    status: '',
    responsibleUsersId: [],
    files: [],
    priority: 3,
    tenantId: 'c35a6a8e-204b-4791-ba3b-08dd2c05ebe3'
  });
  
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [errors, setErrors] = useState({});
  
  const statusOptions = [
    { value: 'Beklemede', durationId: '19841b9d-e98a-474e-6eae-08dd72b2e88e' },
    { value: 'Yapımda', durationId: '0fc8818d-27a3-4e8b-6eaf-08dd72b2e88e' },
    { value: 'Tamamlandı', durationId: '9f3fd5a1-7f18-4e27-6eb1-08dd72b2e88e' },
    { value: 'Reddedildi', durationId: 'ba861628-2b0d-48cd-6eb0-08dd72b2e88e' }
  ];

  useEffect(() => {
    if (task) {
      console.log("---------------------------------------");
      console.log("TASK DÜZENLEME FORMU DEBUG BAŞLANGIÇ");
      console.log("---------------------------------------");
      console.log("Düzenlenecek ham görev verisi:", task);
      
      let priorityValue = 3;
      
      if (task.priority !== undefined && task.priority !== null) {
        if (typeof task.priority === 'string') {
          priorityValue = parseInt(task.priority, 10) || 3;
        } else if (typeof task.priority === 'number') {
          priorityValue = task.priority;
        }
      }
      
      console.log("Öncelik değeri dönüşümü:", {
        raw: task.priority,
        rawType: typeof task.priority,
        converted: priorityValue,
        convertedType: typeof priorityValue
      });
      
      const currentDurationId = task.durationId || '';
      const currentStatus = statusOptions.find(s => s.durationId === currentDurationId)?.value || 'Beklemede';
      
      console.log("Mevcut DurationId:", currentDurationId);
      console.log("Belirlenen durum:", currentStatus);
      
      const newFormData = {
        taskId: task.id || '',
        name: task.name || '',
        description: task.description || '',
        note: task.note || '',
        departmentId: task.departmentId || '',
        durationId: currentDurationId,
        status: currentStatus,
        responsibleUsersId: task.responsibleUserIds || [],
        files: [],
        priority: priorityValue,
        tenantId: task.tenantId || 'c35a6a8e-204b-4791-ba3b-08dd2c05ebe3'
      };
      
      console.log("Form verileri hazırlandı:", newFormData);
      console.log("---------------------------------------");
      
      setFormData(newFormData);
    }
  }, [task]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const departmentsData = await departmentService.getDepartments();
        setDepartments(departmentsData);
        
        const categoriesData = await tasksServices.getCategories();
        setCategories(categoriesData);
        
        const durationToStatus = {};
        categoriesData.forEach(category => {
          let status = 'Beklemede';
          if (category.name.includes('Tamamla')) status = 'Tamamlandı';
          else if (category.name.includes('Yapım')) status = 'Yapımda';
          else if (category.name.includes('Redde')) status = 'Reddedildi';
          
          durationToStatus[category.id] = status;
        });
        setStatusMap(durationToStatus);
        
        console.log("DurationId-Status eşleşmesi:", durationToStatus);
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'status') {
      console.log("Durum değişti:", value);
      
      const durationId = statusOptions.find(option => option.value === value)?.durationId || '';
      console.log("Duruma göre yeni DurationId:", durationId);
      
      setFormData(prev => ({
        ...prev,
        status: value,
        durationId: durationId
      }));
      
      if (errors.durationId) {
        setErrors(prev => ({ ...prev, durationId: '' }));
      }
    } else if (name === 'durationId') {
      console.log("DurationId değişti:", value);
      
      const matchingOption = statusOptions.find(option => option.durationId === value);
      const status = matchingOption?.value || formData.status;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        status: status
      }));
    } else {
      if (name === 'priority') {
        const numValue = Number(value);
        setFormData(prev => ({
          ...prev,
          [name]: numValue
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      console.log("---------------------------------------");
      console.log("FORM GÖNDERİMİ DEBUG");
      console.log("---------------------------------------");
      console.log("Gönderilecek tüm form verisi:", formData);
      console.log("Öncelik değeri:", formData.priority, "tipi:", typeof formData.priority);
      
      const dataToSend = { ...formData };
      
      if (typeof dataToSend.priority !== 'number') {
        dataToSend.priority = parseInt(dataToSend.priority, 10) || 3;
      }
      
      console.log("API'ye gönderilecek düzenlenmiş veri:", dataToSend);
      
      const response = await tasksServices.updateTask(dataToSend);
      console.log("API yanıtı:", response);
      
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
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="status-label">Durum</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Durum"
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal" error={!!errors.durationId} required sx={{ display: 'none' }}>
              <InputLabel id="duration-label">Durum (DurationId)</InputLabel>
              <Select
                labelId="duration-label"
                name="durationId"
                value={formData.durationId}
                onChange={handleInputChange}
                label="Durum (DurationId)"
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