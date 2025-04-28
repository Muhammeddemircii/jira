import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Paper,
  Grid,
  InputAdornment,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import { departmentService, tasksServices } from '../../axios/axios';
import { toast } from 'react-hot-toast';
import { taskTypeService } from '../../axios/axios';

const EditTaskModal = ({ open, handleClose, task, onTaskUpdated, isMobile }) => {
  const theme = useTheme();
  const isMobileView = isMobile !== undefined ? isMobile : useMediaQuery(theme.breakpoints.down('sm'));
  
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
    taskTypeId: '',
    tenantId: 'c35a6a8e-204b-4791-ba3b-08dd2c05ebe3'
  });
  
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  
  const [detailsMessageTab, setDetailsMessageTab] = useState(0);
  const [activitiesMessageTab, setActivitiesMessageTab] = useState(0);
  
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  
  const [taskLogModalOpen, setTaskLogModalOpen] = useState(false);
  const [taskLogForm, setTaskLogForm] = useState({
    taskId: '',
    userId: '',
    duration: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: ''
  });
  const [taskLogLoading, setTaskLogLoading] = useState(false);
  const [taskLogErrors, setTaskLogErrors] = useState({});

  const [messageFiles, setMessageFiles] = useState([]);
  const fileInputRef = useRef(null);
  const messageFileInputRef = useRef(null);

  const statusOptions = [
    { value: 'Beklemede', durationId: '9f0122da-a697-4aed-52af-08dd2c05ec2e' },
    { value: 'Yapımda', durationId: '577ba8ad-f6d8-430a-52b0-08dd2c05ec2e' },
    { value: 'Tamamlandı', durationId: '492d6a56-590c-47f1-52b1-08dd2c05ec2e' },
    { value: 'Reddedildi', durationId: '2f985dfd-f22a-4294-52b2-08dd2c05ec2e' }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (task) {

      
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
        taskTypeId: task.taskTypeId || '',
        tenantId: task.tenantId || 'c35a6a8e-204b-4791-ba3b-08dd2c05ebe3'
      };
      
      
      setFormData(newFormData);
    }
  }, [task]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const departmentsData = await departmentService.getDepartments();
        
        if (!departmentsData || departmentsData.length === 0) {
          toast.error("Departman verileri yüklenemedi");
        }
        
        setDepartments(departmentsData || []);
        
        const usersData = await tasksServices.getUsersByTenantId(formData.tenantId);
        
        if (!usersData || usersData.length === 0) {
          toast.error("Kullanıcı verileri yüklenemedi");
        } else {
          setUsers(usersData || []);
        }
        
        try {
          const taskTypesData = await taskTypeService.getTaskTypes();
          
          if (taskTypesData && Array.isArray(taskTypesData) && taskTypesData.length > 0) {
            setCategories(taskTypesData);
            
            if (task && task.departmentId) {
              const filtered = taskTypesData.filter(
                category => category.relatedDepartmentId === task.departmentId
              );
              setFilteredCategories(filtered.length > 0 ? filtered : taskTypesData);
            } else {
              setFilteredCategories(taskTypesData);
            }
          } else {
            const categoriesData = await tasksServices.getCategories();
            setCategories(categoriesData);
            setFilteredCategories(categoriesData);
          }
        } catch (categoryError) {
          const categoriesData = await tasksServices.getCategories();
          setCategories(categoriesData);
          setFilteredCategories(categoriesData);
        }
        
        const durationToStatus = {};
        categories.forEach(category => {
          let status = 'Beklemede';
          if (category.name && category.name.includes('Tamamla')) status = 'Tamamlandı';
          else if (category.name && category.name.includes('Yapım')) status = 'Yapımda';
          else if (category.name && category.name.includes('Redde')) status = 'Reddedildi';
          
          durationToStatus[category.id] = status;
        });
        setStatusMap(durationToStatus);
      } catch (error) {
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.departmentId && categories.length > 0) {
      const filtered = categories.filter(
        category => category.relatedDepartmentId === formData.departmentId
      );
      
      setFilteredCategories(filtered.length > 0 ? filtered : categories);
      
      if (filtered.length > 0 && formData.taskTypeId) {
        const exists = filtered.some(cat => cat.id === formData.taskTypeId);
        if (!exists) {
          setFormData(prev => ({
            ...prev,
            taskTypeId: ''
          }));
        }
      }
    } else {
      setFilteredCategories(categories);
    }
  }, [formData.departmentId, categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'status') {
      console.log("Durum değişti:", value);
      
      if (value === 'Reddedildi') {
        const durationId = statusOptions.find(option => option.value === value)?.durationId || '';
        
        setFormData(prev => ({
          ...prev,
          tempDurationId: durationId
        }));
        
        setRejectionDialogOpen(true);
        return;
      }
      
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
      
      if (status === 'Reddedildi' && formData.status !== 'Reddedildi') {
        setFormData(prev => ({
          ...prev,
          tempDurationId: value
        }));
        
        setRejectionDialogOpen(true);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        status: status
      }));
    } else if (name === 'departmentId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        taskTypeId: ''
      }));
      
      updateDepartment(value);
      
      if (errors.departmentId) {
        setErrors(prev => ({ ...prev, departmentId: '' }));
      }
    } else if (name === 'taskTypeId') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      updateTaskType(value);
    } else if (name === 'responsibleUsersId') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      updateResponsibleUsers(value);
    } else {
      if (name === 'priority') {
        const numValue = Number(value);
        setFormData(prev => ({
          ...prev,
          [name]: numValue
        }));
        
        updateTaskPriority(numValue);
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

  const updateDepartment = async (departmentId) => {
    try {
      setLoading(true);
      
     
      const departmentUpdateData = {
        taskId: formData.taskId,
        departmentId: departmentId,
        tenantId: formData.tenantId
      };
      
      console.log("Departman güncelleniyor:", departmentUpdateData);
      
     
      const response = await tasksServices.updateTaskDepartment(departmentUpdateData);
      
      if (response && response.isSuccess) {
        toast.success('Departman başarıyla güncellendi');
        
       
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      } else {
        toast.error(response?.message || 'Departman güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Departman güncelleme hatası:', error);
      toast.error('Departman güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskType = async (taskTypeId) => {
    try {
      setLoading(true);
      
    
      const taskTypeUpdateData = {
        taskId: formData.taskId,
        taskTypeId: taskTypeId,
        tenantId: formData.tenantId
      };
      
      console.log("Task Type güncelleniyor:", taskTypeUpdateData);
      
    
      const response = await tasksServices.updateTaskType(taskTypeUpdateData);
      
      if (response && response.isSuccess) {
        toast.success('Kategori başarıyla güncellendi');
        
       
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      } else {
        toast.error(response?.message || 'Kategori güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      toast.error('Kategori güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskPriority = async (priority) => {
    try {
      setLoading(true);
      
    
      const priorityUpdateData = {
        taskId: formData.taskId,
        priority: priority,
        tenantId: formData.tenantId
      };
      
      console.log("Öncelik güncelleniyor:", priorityUpdateData);
      
 
      const response = await tasksServices.updateTaskPriority(priorityUpdateData);
      
      if (response && response.isSuccess) {
        toast.success('Öncelik başarıyla güncellendi');
        
       
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      } else {
        toast.error(response?.message || 'Öncelik güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Öncelik güncelleme hatası:', error);
      toast.error('Öncelik güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateResponsibleUsers = async (userIds) => {
    try {
      setLoading(true);
      
    
      const responsibleUsersUpdateData = {
        taskId: formData.taskId,
        responsibleUsersId: userIds,
        tenantId: formData.tenantId
      };
      
      console.log("Sorumlu kullanıcılar güncelleniyor:", responsibleUsersUpdateData);
      
      
      const response = await tasksServices.updateTask(responsibleUsersUpdateData);
      
      if (response && response.isSuccess) {
        toast.success('Sorumlu kullanıcılar başarıyla güncellendi');
        
       
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      } else {
        toast.error(response?.message || 'Sorumlu kullanıcılar güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Sorumlu kullanıcılar güncelleme hatası:', error);
      toast.error('Sorumlu kullanıcılar güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
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
      
      console.log("Gönderilecek tüm form verisi:", formData);
      console.log("Özellikle durum değeri:", formData.status, "ve durationId:", formData.durationId);
      

      const dataToSend = { ...formData };
      
 
      if (typeof dataToSend.priority !== 'number') {
        dataToSend.priority = parseInt(dataToSend.priority, 10) || 3;
      }
      
      console.log("API'ye gönderilecek düzenlenmiş veri:", dataToSend);
      
   
      if (task && task.durationId !== dataToSend.durationId) {
        console.log("Sadece durum değişmiş, updateTaskDuration API'si kullanılıyor");
        const response = await tasksServices.updateTaskDuration(dataToSend.taskId, dataToSend.durationId);
        console.log("Durum güncelleme API yanıtı:", response);
        
        if (response && response.isSuccess) {
          toast.success('Görev durumu başarıyla güncellendi');
         
          if (onTaskUpdated) {
            onTaskUpdated();
          }
          
       
          handleClose();
      
          console.log("Sayfa yenileniyor...");
          setTimeout(() => {
            window.location.reload();
          }, 500);
          
          return;
        } else {
          toast.error(response?.message || 'Görev durumu güncellenirken bir hata oluştu');
          return;
        }
      }
      
 
      const response = await tasksServices.updateTask(dataToSend);
      console.log("Tüm görev güncelleme API yanıtı:", response);
      
      if (response && response.isSuccess) {
        toast.success('Görev başarıyla güncellendi');
        
  
        if (onTaskUpdated) {
          onTaskUpdated();
        }
        

        handleClose();
        
       
        console.log("Sayfa yenileniyor...");
        setTimeout(() => {
          window.location.reload();
        }, 500);
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


  const handleRejectTask = async () => {

    if (!rejectionReason.trim()) {
      setRejectionError('Reddetme sebebi boş olamaz');
      return;
    }
    
    setRejectionError('');
    setLoading(true);
    
    try {
 
      const rejectDurationId = statusOptions.find(option => option.value === 'Reddedildi')?.durationId;
      
      if (!rejectDurationId) {
        throw new Error('Reddetme durumu bulunamadı');
      }
      

      const statusResponse = await tasksServices.updateTaskDuration(
        formData.taskId, 
        rejectDurationId
      );
      
      if (!statusResponse || !statusResponse.isSuccess) {
        throw new Error(statusResponse?.message || 'Görev durumu güncellenirken bir hata oluştu');
      }
      

      const rejectResponse = await tasksServices.taskRejected(
        formData.taskId,
        rejectionReason
      );
      
      if (!rejectResponse || !rejectResponse.isSuccess) {
        throw new Error(rejectResponse?.message || 'Reddetme sebebi kaydedilirken bir hata oluştu');
      }
      
 
      setFormData(prev => ({
        ...prev,
        status: 'Reddedildi',
        durationId: rejectDurationId
      }));
      
 
      setRejectionDialogOpen(false);
      setRejectionReason('');
      

      toast.success('Görev başarıyla reddedildi');
      

      if (onTaskUpdated) {
        onTaskUpdated();
      }
      

      handleClose();
      

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Görev reddetme hatası:', error);
      toast.error(error.message || 'Görev reddedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  

  const handleRejectionCancel = () => {
    setRejectionDialogOpen(false);
    setRejectionReason('');
    setRejectionError('');
    

    setFormData(prev => {
      const { tempDurationId, ...rest } = prev;
      return rest;
    });
  };


  const handleOpenTaskLogModal = () => {
    setTaskLogForm({
      ...taskLogForm,
      taskId: task?.id || '',
      userId: localStorage.getItem('user-id') || '',
      date: new Date().toISOString().split('T')[0]
    });
    setTaskLogModalOpen(true);
  };

  const handleCloseTaskLogModal = () => {
    setTaskLogModalOpen(false);
    setTaskLogErrors({});
  };

  const handleTaskLogChange = (e) => {
    const { name, value } = e.target;
    setTaskLogForm({
      ...taskLogForm,
      [name]: value
    });
    

    if (taskLogErrors[name]) {
      setTaskLogErrors({
        ...taskLogErrors,
        [name]: ''
      });
    }
  };


  const validateTaskLogForm = () => {
    const errors = {};
    
    if (!taskLogForm.description.trim()) {
      errors.description = 'Açıklama zorunludur';
    }
    
    if (!taskLogForm.date) {
      errors.date = 'Tarih zorunludur';
    }
    
    if (!taskLogForm.duration || taskLogForm.duration <= 0) {
      errors.duration = 'Geçerli bir süre giriniz';
    }
    
    setTaskLogErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmitTaskLog = async () => {
    if (!validateTaskLogForm()) {
      return;
    }
    
    try {
      setTaskLogLoading(true);
      

      const dataToSend = {
        ...taskLogForm,
        duration: parseInt(taskLogForm.duration),

        startTime: taskLogForm.startTime ? taskLogForm.startTime : null,
        endTime: taskLogForm.endTime ? taskLogForm.endTime : null
      };
      
      const response = await tasksServices.addTaskLog(dataToSend);
      
      if (response && (response.isSuccess || response.data)) {
        toast.success('Görev log kaydı başarıyla eklendi');
        handleCloseTaskLogModal();

        onTaskUpdated();
      } else {
        toast.error('Görev log kaydı eklenirken bir hata oluştu');
      }
    } catch (error) {

      toast.error('Görev log kaydı eklenirken bir hata oluştu');
    } finally {
      setTaskLogLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };
  
  const handleMessageFileSelect = (e) => {
    const files = Array.from(e.target.files);

    setMessageFiles(prev => [...prev, ...files]);
  };
  
  const openFileSelector = () => {
    fileInputRef.current.click();
  };
  
  const openMessageFileSelector = () => {
    messageFileInputRef.current.click();
  };
  

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drop-area', 'active');
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('active');
  };
  
  const handleFileDrop = (e, isMessageArea = false) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('active');
    
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) return;
    
    console.log("Sürüklenen dosyalar:", files);
    
    if (isMessageArea) {
      setMessageFiles(prev => [...prev, ...files]);
    } else {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }));
    }
  };


  const renderTaskDetails = () => {
    const handleMessageTabChange = (event, newValue) => {
      setDetailsMessageTab(newValue);
    };
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobileView ? 'column' : 'row'
      }}>

        <div style={{ 
          width: isMobileView ? '100%' : '50%', 
          paddingRight: isMobileView ? '0' : '16px'
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: isMobileView ? 'column' : 'row' }}>
            <div style={{ 
              width: isMobileView ? '100%' : '30%', 
              fontWeight: '500',
              marginBottom: isMobileView ? '8px' : '0'
            }}>Oluşturan:</div>
            <div style={{ width: isMobileView ? '100%' : '70%' }}>{task?.createUserName || task?.createUser?.name || task?.createdBy || 'Belirsiz'}</div>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: isMobileView ? 'column' : 'row' }}>
            <div style={{ 
              width: isMobileView ? '100%' : '30%', 
              fontWeight: '500',
              marginBottom: isMobileView ? '8px' : '0'
            }}>Durumu:</div>
            <div style={{ width: isMobileView ? '100%' : '70%' }}>
              <FormControl fullWidth size="small">
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  displayEmpty
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: isMobileView ? 'column' : 'row' }}>
            <div style={{ 
              width: isMobileView ? '100%' : '30%', 
              fontWeight: '500',
              marginBottom: isMobileView ? '8px' : '0'
            }}>Departman:</div>
            <div style={{ width: isMobileView ? '100%' : '70%' }}>
              <FormControl fullWidth size="small" error={!!errors.departmentId}>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  displayEmpty
                  renderValue={(value) => {
                    return value ? departments.find(d => d.id === value)?.name || "Departman Seçin" : "Departman Seçin";
                  }}
                >
                  {departments.map(department => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.departmentId && <FormHelperText>{errors.departmentId}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: isMobileView ? 'column' : 'row' }}>
            <div style={{ 
              width: isMobileView ? '100%' : '30%', 
              fontWeight: '500',
              marginBottom: isMobileView ? '8px' : '0'
            }}>Kategori:</div>
            <div style={{ width: isMobileView ? '100%' : '70%' }}>
              <FormControl fullWidth size="small">
                <Select
                  name="taskTypeId"
                  value={formData.taskTypeId || ""}
                  onChange={handleInputChange}
                  displayEmpty
                  renderValue={(value) => {
                    return value ? filteredCategories.find(c => c.id === value)?.name || categories.find(c => c.id === value)?.name || "Kategori Seçin" : "Kategori Seçin";
                  }}
                >
                  <MenuItem value="">Kategori Seçin</MenuItem>
                  {filteredCategories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: isMobileView ? 'column' : 'row' }}>
            <div style={{ 
              width: isMobileView ? '100%' : '30%', 
              fontWeight: '500',
              marginBottom: isMobileView ? '8px' : '0'
            }}>Sorumlu Personeller:</div>
            <div style={{ width: isMobileView ? '100%' : '70%' }}>
              <FormControl fullWidth size="small">
                <Select
                  name="responsibleUsersId"
                  multiple
                  value={formData.responsibleUsersId || []}
                  onChange={handleInputChange}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return "Sorumlu kullanıcıları seçiniz...";
                    }
                    return selected.map(id => users.find(u => u.id === id)?.name || id).join(', ');
                  }}
                >
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: isMobileView ? 'column' : 'row' }}>
            <div style={{ 
              width: isMobileView ? '100%' : '30%', 
              fontWeight: '500',
              marginBottom: isMobileView ? '8px' : '0'
            }}>Öncelik:</div>
            <div style={{ width: isMobileView ? '100%' : '70%' }}>
              <FormControl fullWidth size="small">
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  displayEmpty
                >
                  <MenuItem value={0}>Çok Yüksek</MenuItem>
                  <MenuItem value={1}>Yüksek</MenuItem>
                  <MenuItem value={2}>Orta</MenuItem>
                  <MenuItem value={3}>Düşük</MenuItem>
                  <MenuItem value={4}>Çok Düşük</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: isMobileView ? 'column' : 'row' }}>
            <div style={{ 
              width: isMobileView ? '100%' : '30%', 
              fontWeight: '500',
              marginBottom: isMobileView ? '8px' : '0'
            }}>Açıklama:</div>
            <div style={{ width: isMobileView ? '100%' : '70%' }}>
              <TextField
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: isMobileView ? 'column' : 'row' }}>
            <div style={{ 
              width: isMobileView ? '100%' : '30%', 
              fontWeight: '500',
              marginBottom: isMobileView ? '8px' : '0'
            }}>Dosyalar:</div>
            <div style={{ width: isMobileView ? '100%' : '70%' }}>
              <div 
                style={{ 
                  border: '1px dashed #aaa', 
                  borderRadius: '4px', 
                  padding: isMobileView ? '12px' : '20px', 
                  textAlign: 'center',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: isMobileView ? '14px' : '16px'
                }}
                onClick={openFileSelector}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleFileDrop(e, false)}
                className="drop-area"
              >
                {isMobileView ? 'Dosya yüklemek için tıklayın' : 'Dosyaları buraya sürükleyin veya yüklemek için tıklayın'}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileSelect} 
                multiple 
              />
              {formData.files.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <ul className="file-list">
                    {formData.files.map((file, index) => (
                      <li key={index} className="file-item">
                        <span>{file.name}</span>
                        <Button 
                          size="small" 
                          color="error" 
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              files: prev.files.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          Kaldır
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

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
            sx={{ display: 'none' }}
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
            sx={{ display: 'none' }}
          />
        </div>
        

        <div style={{ 
          width: isMobileView ? '100%' : '50%', 
          paddingLeft: isMobileView ? '0' : '16px',
          marginTop: isMobileView ? '16px' : '0'
        }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              padding: '16px',
              height: '100%', 
              minHeight: isMobileView ? 250 : 400,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Tabs
              value={detailsMessageTab}
              onChange={handleMessageTabChange}
              variant="standard"
              sx={{ mb: 2, borderBottom: '1px solid #e0e0e0' }}
            >
              <Tab label="Departman Mesaj" sx={{ textTransform: 'none' }} />
              <Tab label="İş Sahibine Mesaj" sx={{ textTransform: 'none' }} />
            </Tabs>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={detailsMessageTab === 0 ? "Departmana mesaj yazın..." : "İş sahibine mesaj yazın..."}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <div 
              style={{ 
                border: '1px dashed #07b1a1', 
                borderRadius: '4px', 
                padding: '40px 20px', 
                marginBottom: '16px',
                textAlign: 'center',
                color: '#666',
                cursor: 'pointer'
              }}
              onClick={openMessageFileSelector}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleFileDrop(e, true)}
              className="drop-area"
            >
              Dosyaları buraya sürükleyin veya yüklemek için tıklayın.
            </div>
            <input 
              type="file" 
              ref={messageFileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleMessageFileSelect} 
              multiple 
            />
            
            {messageFiles.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <ul className="file-list">
                  {messageFiles.map((file, index) => (
                    <li key={index} className="file-item">
                      <span>{file.name}</span>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => {
                          setMessageFiles(prev => 
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        Kaldır
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div style={{ marginTop: 'auto' }}>
              <Button 
                variant="contained" 
                sx={{ 
                  backgroundColor: '#07b1a1', 
                  '&:hover': { backgroundColor: '#069b8d' },
                  textTransform: 'none'
                }}
              >
                Gönder
              </Button>
            </div>
          </Paper>
        </div>
      </div>
    );
  };


  const renderTaskActivities = () => {
    const handleMessageTabChange = (event, newValue) => {
      setActivitiesMessageTab(newValue);
    };
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobileView ? 'column' : 'row'
      }}>
 
        <div style={{ 
          width: isMobileView ? '100%' : '45%', 
          paddingRight: isMobileView ? '0' : '16px',
          marginBottom: isMobileView ? '16px' : '0'
        }}>
          <Paper variant="outlined" sx={{ p: 2, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <Tabs
              value={activitiesMessageTab}
              onChange={handleMessageTabChange}
              variant="standard"
              sx={{ mb: 2 }}
            >
              <Tab label="Departman Mesaj" />
              <Tab label="İş Sahibine Mesaj" />
            </Tabs>
            
            <div style={{ flex: 1, backgroundColor: '#f5f5f5', borderRadius: '4px', minHeight: 260, marginBottom: '10px', padding: '10px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
                {activitiesMessageTab === 0 ? 'Henüz departman mesajı bulunmamaktadır.' : 'Henüz iş sahibine mesaj bulunmamaktadır.'}
              </div>
            </div>
            
            <div>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder={activitiesMessageTab === 0 ? "Departmana mesaj yazın..." : "İş sahibine mesaj yazın..."}
                variant="outlined"
                size="small"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button variant="contained" color="primary" size="small">
                  Gönder
                </Button>
              </div>
            </div>
          </Paper>
        </div>
        
        <div style={{ 
          width: isMobileView ? '100%' : '55%', 
          paddingLeft: isMobileView ? '0' : '16px' 
        }}>

        </div>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      classes={{ 
        paper: isMobileView ? 'mobile-dialog' : ''
      }}
    >
      <DialogContent sx={{ 
        padding: isMobileView ? '16px' : '24px' 
      }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        )}
        
        {!loading && (
          <>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobileView ? 'column' : 'row',
              justifyContent: 'space-between', 
              marginBottom: '16px' 
            }}>
              <div style={{ 
                fontWeight: 500,
                marginBottom: isMobileView ? '8px' : '0'
              }}>
                {task?.name}
              </div>
              <div>
                {task?.updatedDate ? new Date(task.updatedDate).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR')}
              </div>
            </div>
            <hr style={{ 
              marginBottom: '16px',
              marginTop: '0px',
              height: '1px',
              backgroundColor: '#c7c7c7',
              border: 'none',
              width: '100%'
            }} />
            
            <Box sx={{ width: '100%', mb: 2 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                variant={ isMobileView ? "scrollable" : "fullWidth" }
                scrollButtons={ isMobileView ? "auto" : undefined }
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  '& .MuiTab-root': { 
                    fontWeight: 'bold',
                    fontSize: isMobileView ? '13px' : '14px',
                    padding: isMobileView ? '10px 12px' : '12px 16px'
                  }
                }}
              >
                <Tab label="Görev Detayları" />
                <Tab label="Görev Hareketleri" />
              </Tabs>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {activeTab === 0 ? renderTaskDetails() : renderTaskActivities()}
            </Box>
          </>
        )}
      </DialogContent>
      

      <Dialog
        open={rejectionDialogOpen}
        onClose={handleRejectionCancel}
        maxWidth="sm"
        fullWidth
        classes={{ 
          paper: isMobileView ? 'mobile-dialog' : ''
        }}
      >
        <DialogTitle>
          Görevi Reddet
          <IconButton
            aria-label="close"
            onClick={handleRejectionCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div style={{ marginTop: '16px' }}>
            <TextField
              label="Reddetme Nedeni"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              error={!!rejectionError}
              helperText={rejectionError}
              placeholder="Görevin reddedilme sebebini açıklayın..."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectionCancel} color="primary">
            İptal
          </Button>
          <Button 
            onClick={handleRejectTask} 
            color="primary" 
            variant="contained"
            disabled={loading}
            sx={{ backgroundColor: "#20b494" }}
          >
            {loading ? "İşleniyor..." : "Reddet"}
          </Button>
        </DialogActions>
      </Dialog>
      

      <Dialog
        open={taskLogModalOpen}
        onClose={handleCloseTaskLogModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{ 
          sx: { 
            borderRadius: isMobileView ? '8px' : '8px',
            padding: isMobileView ? '12px' : '16px'
          } 
        }}
        classes={{ 
          paper: isMobileView ? 'mobile-dialog' : ''
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6">Görev Log Kaydı Ekle</Typography>
          <IconButton onClick={handleCloseTaskLogModal} size="small">
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: '24px 16px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Açıklama"
                name="description"
                value={taskLogForm.description}
                onChange={handleTaskLogChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                margin="normal"
                error={!!taskLogErrors.description}
                helperText={taskLogErrors.description}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tarih"
                name="date"
                type="date"
                value={taskLogForm.date}
                onChange={handleTaskLogChange}
                fullWidth
                variant="outlined"
                margin="normal"
                error={!!taskLogErrors.date}
                helperText={taskLogErrors.date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Süre (dakika)"
                name="duration"
                type="number"
                value={taskLogForm.duration}
                onChange={handleTaskLogChange}
                fullWidth
                variant="outlined"
                margin="normal"
                error={!!taskLogErrors.duration}
                helperText={taskLogErrors.duration}
                InputProps={{
                  endAdornment: <InputAdornment position="end">dk</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Başlangıç Saati"
                name="startTime"
                type="time"
                value={taskLogForm.startTime}
                onChange={handleTaskLogChange}
                fullWidth
                variant="outlined"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Bitiş Saati"
                name="endTime"
                type="time"
                value={taskLogForm.endTime}
                onChange={handleTaskLogChange}
                fullWidth
                variant="outlined" 
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          padding: '16px', 
          borderTop: '1px solid #e0e0e0', 
          justifyContent: 'space-between' 
        }}>
          <Button 
            onClick={handleCloseTaskLogModal} 
            variant="outlined"
            color="inherit"
          >
            İptal
          </Button>
          <Button 
            onClick={handleSubmitTaskLog} 
            variant="contained" 
            color="primary"
            disabled={taskLogLoading}
          >
            {taskLogLoading ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <DialogActions sx={{ 
        padding: isMobileView ? '12px 16px' : '16px 24px', 
        borderTop: '1px solid #e0e0e0', 
        display: 'flex', 
        flexDirection: isMobileView ? 'column' : 'row',
        justifyContent: 'space-between' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          marginBottom: isMobileView ? '16px' : '0'
        }}>
          <div style={{ fontSize: '14px', color: '#555' }}>
            Başlama Tarihi: {task?.createdDate ? new Date(task.createdDate).toLocaleString('tr-TR') : '-'}
          </div>
          <div style={{ fontSize: '14px', color: '#555' }}>
            Geçen Süre: 26 gün 6 saat 47 dakika
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: isMobileView ? 'column' : 'row',
          width: isMobileView ? '100%' : 'auto',
          gap: isMobileView ? '8px' : '0'
        }}>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<span>+</span>}
            sx={{ 
              marginRight: isMobileView ? '0' : '8px',
              height: '36px',
              padding: '0 16px',
              width: isMobileView ? '100%' : 'auto'
            }}
            onClick={handleOpenTaskLogModal}
          >
            Log Ekle
          </Button>
          <Button 
            variant="contained" 
            color="error"
            sx={{ 
              marginRight: isMobileView ? '0' : '8px',
              height: '36px',
              padding: '0 16px',
              width: isMobileView ? '100%' : 'auto'
            }}
            onClick={() => setRejectionDialogOpen(true)}
          >
            Görevi Reddet
          </Button>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            color="inherit"
            sx={{ 
              height: '36px',
              padding: '0 16px',
              width: isMobileView ? '100%' : 'auto'
            }}
          >
            Kapat
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskModal; 