import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  CircularProgress,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { setEditModalOpen, updateStaffInList } from '../../store/slices/staffSlice';
import { staffService, departmentService } from '../../axios/axios';

function EditStaffModal() {
  const dispatch = useDispatch();
  const { editModalOpen, editingStaff } = useSelector(state => state.staff);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [availableUserTypes, setAvailableUserTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bloodType: '',
    birthDate: '',
    tc: '',
    departmentId: '',
    userTypeId: '',
  });


  useEffect(() => {
    const setupUserTypes = () => {
      let userTypes = [];
      const userRole = localStorage.getItem('user-type-id');
      console.log("Mevcut kullanıcı rolü:", userRole);

      switch (userRole) {
        case "1":
          userTypes = [
            { value: 2, text: "Departman Yöneticisi" },
            { value: 3, text: "Personel" },
            { value: 4, text: "Grup Yöneticisi" },
          ];
          console.log("Admin rolü: Tüm roller gösteriliyor");
          break;// Department Manager
          userTypes = [
            { value: 2, text: "Departman Yöneticisi" },
            { value: 3, text: "Personel" }
          ];
          console.log("Departman Yöneticisi rolü: Filtrelenmiş roller", userTypes);
          break;
        case "3":
          userTypes = [
            { value: 3, text: "Personel" }
          ];
          console.log("Personel rolü: Filtrelenmiş roller", userTypes);
          break;
        default:
          userTypes = [];
          console.log("Bilinmeyen rol: Roller bulunamadı");
      }

      setAvailableUserTypes(userTypes);
      console.log("Ayarlanan yerel rol listesi:", userTypes);
    };

    setupUserTypes();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        console.log("Departman verileri yükleniyor...");
        
        try {
          const departmentsResponse = await departmentService.getDepartments();
          console.log("Departman verileri başarıyla yüklendi:", departmentsResponse);
          setDepartments(departmentsResponse || []);
        } catch (deptError) {
          console.error("Departman verileri yüklenirken hata:", deptError);
          setDepartments([]);
        }
      } catch (error) {
        console.error("Veri yüklenirken genel hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (editingStaff) {
      const fetchStaffDetails = async () => {
        try {
          setLoading(true);
          console.log("Düzenlenmek üzere seçilen personel:", editingStaff);
          console.log("Personel ID:", editingStaff.id);
          

          setFormData({
            name: editingStaff.name || '',
            email: editingStaff.email || '',
            phoneNumber: editingStaff.phoneNumber || '',
            bloodType: editingStaff.bloodType || '',
            birthDate: editingStaff.birthDate ? editingStaff.birthDate.split('T')[0] : '',
            tc: editingStaff.tc || '',
            departmentId: editingStaff.userDepartmentsResponse && 
                          editingStaff.userDepartmentsResponse.length > 0 ? 
                          editingStaff.userDepartmentsResponse[0].departmentId : '',
            userTypeId: editingStaff.userTypeId || '',
          });
          
 
          try {
            const staffDetails = await staffService.getStaffById(editingStaff.id);
            console.log("API'den alınan personel detayları:", staffDetails);
            
            if (staffDetails) {
              setFormData(prev => ({
                ...prev,
                name: staffDetails.name || prev.name,
                email: staffDetails.email || prev.email,
                phoneNumber: staffDetails.phoneNumber || prev.phoneNumber,
                bloodType: staffDetails.bloodType || prev.bloodType,
                birthDate: staffDetails.birthDate ? staffDetails.birthDate.split('T')[0] : prev.birthDate,
                tc: staffDetails.tc || prev.tc,
                departmentId: staffDetails.userDepartmentsResponse && 
                              staffDetails.userDepartmentsResponse.length > 0 ? 
                              staffDetails.userDepartmentsResponse[0].departmentId : prev.departmentId,
                userTypeId: staffDetails.userTypeId || prev.userTypeId,
              }));
            }
          } catch (apiError) {
            console.warn("API'den personel detayları alınamadı, listedeki veriler kullanılacak:", apiError);
          }
          
        } catch (error) {
          console.error("Personel bilgileri yükleme hatası:", error);
          setError("Personel bilgileri yüklenirken hata oluştu.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchStaffDetails();
    }
  }, [editingStaff]);

  const handleClose = () => {
    dispatch(setEditModalOpen(false));
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      

      const staffData = {
        name: formData.name,
        email: formData.email,
        tenantId: "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3",
        bloodType: formData.bloodType || "",
        birthDate: formData.birthDate || null,
        phoneNumber: formData.phoneNumber || "",
        tc: formData.tc || "",
        departmentId: formData.departmentId || "",
        userTypeId: formData.userTypeId || ""
      };
      
      console.log("Güncellenecek personel verisi:", staffData);
      
      await staffService.updateStaff(editingStaff.id, staffData);
      console.log("Personel verisi güncellendi");
      
      const updatedStaff = {
        ...editingStaff,
        ...formData,
        userTypeId: formData.userTypeId,
        roleName: getUserTypeName(formData.userTypeId),
        userDepartmentsResponse: formData.departmentId ? [
          {
            departmentId: formData.departmentId,
            departmentName: departments.find(d => d.id === formData.departmentId)?.name || 'Bilinmiyor'
          }
        ] : []
      };
      
      function getUserTypeName(userTypeId) {
        if (!userTypeId) return editingStaff.roleName || '';
        
        const userType = availableUserTypes.find(ut => ut.value === parseInt(userTypeId));
        if (!userType) return editingStaff.roleName || '';
        
        return userType.text || editingStaff.roleName || '';
      }
      
      dispatch(updateStaffInList(updatedStaff));
      console.log("Redux store güncellendi");
      

      try {
        const freshStaff = await staffService.getStaffById(editingStaff.id);
        if (freshStaff) {
          dispatch(updateStaffInList(freshStaff));
          console.log("Redux store API verisiyle güncellendi");
        }
      } catch (apiError) {
        console.warn("API'den personel verisi alınamadı, ama store zaten güncellendi:", apiError);
      }
      

      dispatch(setEditModalOpen(false));
    } catch (error) {
      console.error("Personel güncelleme hatası:", error);
      setError("Personel güncellenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={editModalOpen} 
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: '#f8f9fa' }}>
        <Typography variant="h6">Personel Düzenle</Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress color="primary" />
          </Box>
        )}
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {!loading && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Ad Soyad"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                margin="dense"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="dense"
                variant="outlined"
                type="email"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="phoneNumber"
                label="Telefon Numarası"
                value={formData.phoneNumber}
                onChange={handleChange}
                fullWidth
                margin="dense"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="blood-type-label">Kan Grubu</InputLabel>
                <Select
                  labelId="blood-type-label"
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  label="Kan Grubu"
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="0+">0+</MenuItem>
                  <MenuItem value="0-">0-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="birthDate"
                label="Doğum Tarihi"
                value={formData.birthDate}
                onChange={handleChange}
                fullWidth
                margin="dense"
                variant="outlined"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="tc"
                label="TC Kimlik No"
                value={formData.tc}
                onChange={handleChange}
                fullWidth
                margin="dense"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="department-label">Departman</InputLabel>
                <Select
                  labelId="department-label"
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  label="Departman"
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="userType-label">Görev/Rol</InputLabel>
                <Select
                  labelId="userType-label"
                  id="userTypeId"
                  name="userTypeId"
                  value={formData.userTypeId}
                  onChange={handleChange}
                  label="Görev/Rol"
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {availableUserTypes && availableUserTypes.length > 0 ? (
                    availableUserTypes.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.text}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Rol bulunamadı</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <Button onClick={handleClose} color="secondary">
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditStaffModal; 