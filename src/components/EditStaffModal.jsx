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
import { setEditModalOpen, updateStaffInList } from '../store/slices/staffSlice';
import { staffService, departmentService, roleService } from '../axios/axios';
import api from '../axios/axios';

function EditStaffModal() {
  const dispatch = useDispatch();
  const { editModalOpen, editingStaff } = useSelector(state => state.staff);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bloodType: '',
    birthDate: '',
    tc: '',
    departmentId: '',
    roleId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Departman ve rol verileri yükleniyor...");
        
        // Departmanları ve rolleri ayrı ayrı çekelim, bir hata diğerini etkilemesin
        try {
          const departmentsResponse = await departmentService.getDepartments();
          console.log("Departman verileri başarıyla yüklendi:", departmentsResponse);
          setDepartments(departmentsResponse || []);
        } catch (deptError) {
          console.error("Departman verileri yüklenirken hata:", deptError);
          setDepartments([]);
        }
        
        try {
          console.log("roleService.getRoles() fonksiyonu çağrılıyor...");
          // Alternatif endpoint denemesi
          const response = await api.get("/api/v1/Role");
          console.log("API'den gelen rol yanıtı (raw):", response);
          
          let rolesData = [];
          
          if (response && response.data) {
            if (Array.isArray(response.data)) {
              rolesData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              rolesData = response.data.data;
            }
          }
          
          console.log("İşlenmiş rol verisi:", rolesData);
          setRoles(rolesData);
        } catch (roleError) {
          console.error("Rol verileri yüklenirken hata:", roleError);
          setRoles([]);
        }
        
      } catch (error) {
        console.error("Veri yüklenirken genel hata:", error);
        // Hata mesajını görüntüle ancak modalın çalışmasına engel olma
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (editingStaff) {
      const fetchStaffDetails = async () => {
        try {
          setLoading(true);
          console.log("Düzenlenmek üzere seçilen personel:", editingStaff);
          console.log("Personel ID:", editingStaff.id);
          
          // Direkt seçilen personel bilgisini kullan
          // API'den veri çekme başarısız olursa mevcut veri üzerinden devam et
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
            roleId: editingStaff.roleId || '',
          });
          
          // API'den detaylı veri çekmeyi dene, başarısız olursa üstteki veri kullanılacak
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
                roleId: staffDetails.roleId || prev.roleId,
              }));
            }
          } catch (apiError) {
            console.warn("API'den personel detayları alınamadı, listedeki veriler kullanılacak:", apiError);
            // Hata oluştuğunda zaten yüklenmiş veri formda kalacak, API hatası gösterme
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
      
      // API'nin beklediği formata uygun veri hazırla
      const staffData = {
        name: formData.name,
        email: formData.email,
        tenantId: "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3",
        bloodType: formData.bloodType || "",
        birthDate: formData.birthDate || null,
        phoneNumber: formData.phoneNumber || "",
        tc: formData.tc || "",
        departmentId: formData.departmentId || "",
        roleId: formData.roleId || ""
      };
      
      console.log("Güncellenecek personel verisi:", staffData);
      
      await staffService.updateStaff(editingStaff.id, staffData);
      console.log("Personel verisi güncellendi");
      
      // Redux store'daki veriyi doğrudan güncelle
      const updatedStaff = {
        ...editingStaff,
        ...formData,
        roleName: getRoleName(formData.roleId),
        userDepartmentsResponse: formData.departmentId ? [
          {
            departmentId: formData.departmentId,
            departmentName: departments.find(d => d.id === formData.departmentId)?.name || 'Bilinmiyor'
          }
        ] : []
      };
      
      function getRoleName(roleId) {
        if (!roleId) return editingStaff.roleName || '';
        
        const role = roles.find(r => r.id === roleId);
        if (!role) return editingStaff.roleName || '';
        
        return role.roleName || role.name || editingStaff.roleName || '';
      }
      
      dispatch(updateStaffInList(updatedStaff));
      console.log("Redux store güncellendi");
      
      // API'den güncel veriyi almaya çalışalım, ancak başarısız olursa da modalı kapatalım
      try {
        const freshStaff = await staffService.getStaffById(editingStaff.id);
        if (freshStaff) {
          dispatch(updateStaffInList(freshStaff));
          console.log("Redux store API verisiyle güncellendi");
        }
      } catch (apiError) {
        console.warn("API'den personel verisi alınamadı, ama store zaten güncellendi:", apiError);
      }
      
      // Close the modal
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
                <InputLabel id="role-label">Görev/Rol</InputLabel>
                <Select
                  labelId="role-label"
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  label="Görev/Rol"
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {roles && roles.length > 0 ? (
                    roles.map((role, index) => (
                      <MenuItem key={role.id || `role-${index}`} value={role.id || ''}>
                        {role.roleName || role.name || `Rol ${index + 1}`}
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