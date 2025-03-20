import React, { useEffect, useState } from 'react';
import '../../styles/Staffs/AddStaff.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { 
  Button, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Box, 
  Paper, 
  Typography, 
  Divider,
  IconButton,
  Grid,
  FormHelperText,
  Chip,
  Stack
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { departmentService, roleService, staffService } from '../../axios/axios';
import { useLocation } from 'react-router-dom';
import 'dayjs/locale/tr';


function AddStaff({ setOpenAddStaff, setLoadingStaffButton, onStaffAdded }) {
  const location = useLocation();
  const staffFromTable = location.state?.staff;
  const [availableUserTypes, setAvailableUserTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(staffFromTable ? dayjs(staffFromTable.birthDate) : null);
  const [departmanListesi, setDepartmanListesi] = useState([]);
  const [roleListesi, setRoleListesi] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [staffData, setStaffData] = useState({
    name: staffFromTable?.name || '',
    email: staffFromTable?.email || '',
    bloodType: staffFromTable?.bloodType || '',
    birthDate: staffFromTable?.birthDate || '',
    phoneNumber: staffFromTable?.phoneNumber || '',
    tc: staffFromTable?.tc || '',
    departmentIdList: staffFromTable?.departmentIdList || [],
    roleId: staffFromTable?.roleId || '',
    tenantId: 'c35a6a8e-204b-4791-ba3b-08dd2c05ebe3',
    userTypeId: staffFromTable?.userTypeId || '',
  });

  const [animationStaffClass, setAnimationStaffClass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserTypes = () => {
      let availableUserTypes = [];
      const userRole = localStorage.getItem('user-type-id');

      switch (userRole) {
        case "1":
          availableUserTypes = [
            { value: 2, text: "Departman Yöneticisi" },
            { value: 3, text: "Personel" },
            { value: 4, text: "Grup Yöneticisi" },
          ];
          break;
        case "2":
          availableUserTypes = [
            { value: 2, text: "Departman Yöneticisi" },
            { value: 3, text: "Personel" }
          ];
          break;
        case "3":
          availableUserTypes = [
            { value: 3, text: "Personel" }
          ];
          break;
        default:
          availableUserTypes = [];
      }

      setUserTypes(availableUserTypes);
      setAvailableUserTypes(availableUserTypes);
      console.log("Ayarlanan yerel rol listesi:", availableUserTypes);
    };

    fetchUserTypes();
    setLoadingStaffButton(false);
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departments = await departmentService.getDepartments();
        setDepartmanListesi(departments);
      } catch (error) {
        console.error("Departman verileri alınırken hata oluştu:", error);
      }
    };
    
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'departmentIdList') {
      setStaffData((prev) => ({
        ...prev,
        departmentIdList: [...prev.departmentIdList, value]
      }));
    } else {
      setStaffData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when user updates it
    if (formErrors[name]) {
      setFormErrors(prev => ({...prev, [name]: null}));
    }
  };
  
  const handleRemoveDepartment = (deptId) => {
    setStaffData(prev => ({
      ...prev,
      departmentIdList: prev.departmentIdList.filter(id => id !== deptId)
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!staffData.name.trim()) {
      errors.name = 'Ad alanı zorunludur';
    }
    
    if (!staffData.email.trim()) {
      errors.email = 'E-posta alanı zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(staffData.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (staffData.departmentIdList.length === 0) {
      errors.departmentIdList = 'En az bir departman seçilmelidir';
    }
    
    if (!staffData.userTypeId) {
      errors.userTypeId = 'Rol seçimi zorunludur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddStaff = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formattedDate = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : null;
      const updatedStaffData = { ...staffData, birthDate: formattedDate };

      if (staffFromTable) {
        // If it's an edit, we update the staff
        await staffService.updateStaff(staffFromTable.id, updatedStaffData);
      } else {
        // If it's a new staff, we add it
        await staffService.addStaff(updatedStaffData);
      }

      setAnimationStaffClass("scroll-down");

      // Call the onStaffAdded callback if provided
      if (typeof onStaffAdded === 'function') {
        // Give the API a small time to process before refreshing
        setTimeout(() => {
          onStaffAdded();
        }, 300);
      } else {
        // Otherwise just close the modal
        setTimeout(() => {
          setOpenAddStaff(false);
        }, 700);
      }

    } catch (error) {
      console.error("Personel eklenirken hata oluştu:", error);
      alert("İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setAnimationStaffClass("scroll-down");
    setTimeout(() => {
      setOpenAddStaff(false);
    }, 700);
  };

  return (
    <div className={`staff ${animationStaffClass}`}>
      <Paper className='add-staff' elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Box className='staff-header' sx={{ bgcolor: 'white', position: 'relative', padding: '30px 20px' }}>
          <IconButton 
            sx={{ position: 'absolute', right: 12, top: 12 }}
            onClick={handleCancel}
          >
            <FontAwesomeIcon icon={faTimes} size="sm" />
          </IconButton>
          <FontAwesomeIcon icon={faUserPlus} />
          <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
            {staffFromTable ? "Personel Düzenle" : "Personel Ekle"}
          </Typography>
        </Box>
        
        <Divider />
        
        <Box className='staff-body' sx={{ bgcolor: '#f8f9fa', p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField 
                name='name' 
                label='Ad' 
                fullWidth 
                value={staffData.name} 
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name='email' 
                label='E-posta' 
                fullWidth 
                value={staffData.email} 
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField 
                name='bloodType' 
                label='Kan Grubu' 
                fullWidth 
                value={staffData.bloodType} 
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                <DatePicker
                  label='Doğum Tarihi'
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField 
                name='phoneNumber' 
                label='Telefon Numarası' 
                fullWidth 
                value={staffData.phoneNumber} 
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name='tc' 
                label='TC Kimlik Numarası' 
                fullWidth 
                value={staffData.tc} 
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.departmentIdList} required>
                <InputLabel>Departman Seçiniz</InputLabel>
                <Select
                  name='departmentIdList'
                  value=""
                  onChange={handleChange}
                  label="Departman Seçiniz"
                  variant="outlined"
                >
                  {departmanListesi.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
                {formErrors.departmentIdList && (
                  <FormHelperText>{formErrors.departmentIdList}</FormHelperText>
                )}
              </FormControl>
              
              {staffData.departmentIdList.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {staffData.departmentIdList.map(deptId => {
                      const department = departmanListesi.find(d => d.id === deptId);
                      return (
                        <Chip 
                          key={deptId}
                          label={department?.name || deptId}
                          onDelete={() => handleRemoveDepartment(deptId)}
                          sx={{ mb: 1 }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.userTypeId} required>
                <InputLabel>Görev/Rol</InputLabel>
                <Select
                  labelId="userType-label"
                  id="userTypeId"
                  name="userTypeId"
                  value={staffData.userTypeId}
                  onChange={handleChange}
                  label="Görev/Rol"
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {availableUserTypes.length > 0 ? (
                    availableUserTypes.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.text}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Rol bulunamadı</MenuItem>
                  )}
                </Select>
                {formErrors.userTypeId && <FormHelperText>{formErrors.userTypeId}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>

          <Box className="staff-buttons" sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleCancel}
              sx={{ minWidth: '120px' }}
            >
              İptal
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveAddStaff}
              disabled={isSubmitting}
              sx={{ 
                minWidth: '120px',
                bgcolor: '#20b494',
                '&:hover': {
                  bgcolor: '#18a085',
                }
              }}
            >
              {isSubmitting ? 'İşleniyor...' : (staffFromTable ? 'Güncelle' : 'Kaydet')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </div>
  );
}

export default AddStaff;
