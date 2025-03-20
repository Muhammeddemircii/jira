import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import '../../styles/Staffs/StaffTable.css';
import { departmentService, staffService } from '../../axios/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setStaffList, setEditModalOpen, setEditingStaff, setLoading, setError } from '../../store/slices/staffSlice';
import { 
  FormControl, 
  MenuItem, 
  Select, 
  InputLabel, 
  Button, 
  Menu,
  Paper,
  Typography,
  Box,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditStaffModal from './EditStaffModal';

function StaffTable({ refreshTrigger = 0 }) {
  const dispatch = useDispatch();
  const { staffList, loading, error } = useSelector(state => state.staff);
  const [departman, setDepartman] = useState('');
  const [departmanListesi, setDepartmanListesi] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const lastStaffElementRef = useRef();
  const initialFetchDone = useRef(false);
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const fetchStaff = useCallback(async (pageNumber, departmentId = '', shouldAppend = false) => {
    try {
      dispatch(setLoading(true));
      let endpoint = `api/v1/User/GetPaged?PageNumber=${pageNumber}&TenantId=c35a6a8e-204b-4791-ba3b-08dd2c05ebe3&PageSize=${pageSize}`;
      if (departmentId) {
        endpoint += `&DepartmentId=${departmentId}`;
      }

      const response = await staffService.getPagedStaff(endpoint);
      console.log("API response:", response);
      
      if (response && response.data) {
        const data = response.data;
        const totalPages = response.totalPages || 1;

        if (shouldAppend && Array.isArray(staffList)) {
          dispatch(setStaffList([...staffList, ...data]));
        } else {
          dispatch(setStaffList(data));
        }

        setHasMore(pageNumber < totalPages);
      } else {
        dispatch(setError('API yanıtı geçersiz format içeriyor'));
        console.error("Geçersiz API yanıtı:", response);
      }
    } catch (err) {
      dispatch(setError('Personel verileri yüklenirken hata oluştu.'));
      console.error("Fetch staff error:", err);
    } finally {
      dispatch(setLoading(false));
    }
  }, [pageSize, dispatch, staffList]);

  useEffect(() => {
    const fetchDepartman = async () => {
      try {
        const response = await departmentService.getDepartments();
        setDepartmanListesi(response);
      } catch (err) {
        dispatch(setError('Departman verileri yüklenirken hata oluştu.'));
      }
    };
    fetchDepartman();
  }, [dispatch]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      initialFetchDone.current = false;
      setPage(1);
      fetchStaff(1, departman, false);
    }
  }, [refreshTrigger, departman, fetchStaff]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchStaff(1, departman, false);
      initialFetchDone.current = true;
    } else if (departman) {
      setPage(1);
      fetchStaff(1, departman, false);
    }
  }, [departman, fetchStaff]);

  // Initial data load
  useEffect(() => {
    fetchStaff(1, '', false);
  }, []);

  const loadMoreStaff = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStaff(nextPage, departman, true);
    }
  }, [loading, hasMore, page, fetchStaff, departman]);

  useEffect(() => {
    if (loading) return;

    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreStaff();
      }
    }, options);

    if (lastStaffElementRef.current) {
      observer.current.observe(lastStaffElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loadMoreStaff, loading, hasMore]);

  const getDepartmentName = (staff) => {
    if (staff.userDepartmentsResponse && staff.userDepartmentsResponse.length > 0) {
      return staff.userDepartmentsResponse[0].departmentName;
    }
    return staff.departmentName || 'Belirtilmemiş';
  };

  const deduplicatedStaff = useMemo(() => {
    if (!staffList || !Array.isArray(staffList)) {
      console.log("Staff list is not an array:", staffList);
      return [];
    }
    
    const uniqueIds = new Set();
    return staffList.filter(staff => {
      if (!staff || !staff.id || uniqueIds.has(staff.id)) {
        return false;
      }
      uniqueIds.add(staff.id);
      return true;
    });
  }, [staffList]);

  const handleMenuOpen = (event, staff) => {
    setMenuAnchor(event.currentTarget);
    setSelectedStaff(staff);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedStaff(null);
  };

  const handleEdit = (staff) => {
    console.log("Düzenlenecek personel:", staff);
    if (!staff || !staff.id) {
      console.error("Düzenlenecek personel verisi geçersiz:", staff);
      dispatch(setError("Personel verisi geçersiz"));
      return;
    }
    dispatch(setEditingStaff(staff));
    dispatch(setEditModalOpen(true));
    handleMenuClose();
  };

  const handlePasswordReset = (staff) => {
    if (!staff || !staff.email) {
      console.error("Şifre sıfırlanacak personel verisi geçersiz:", staff);
      dispatch(setError("Personel verisi geçersiz"));
      return;
    }
    
    handleMenuClose();
    
    console.log("Şifre sıfırlama işlemi başlatılıyor - Personel:", staff.name);
    
    // Loading state set
    dispatch(setLoading(true));
    
    staffService.resetPassword(staff.email)
      .then((response) => {
        // Başarılı mesaj göster
        console.log("Şifre sıfırlama maili gönderildi:", response);
        alert("Şifre sıfırlama maili LED Asistan tarafından gönderildi.");
      })
      .catch(error => {
        console.error("Şifre sıfırlama hatası:", error);
        // Hata detaylarını göster
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.errors?.join(', ') || 
                           "Şifre sıfırlama işlemi sırasında bir hata oluştu.";
        alert(errorMessage);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleDelete = (staff) => {
    const exitReason = 'deneme';
    const userId = staff.id;
    
    handleMenuClose();
    
    console.log("Silinecek ID:", userId);
    
    staffService.deleteUser(userId, exitReason)
      .then(() => {
        console.log("Personel başarıyla silindi.");
        dispatch(setStaffList(staffList.filter(item => item.id !== userId)));
      })
      .catch(error => {
        console.error("Silme işlemi başarısız:", error);
      });
  };

  useEffect(() => {
    console.log("Staff List:", staffList);
  }, [staffList]);

  return ( 
    <div className="staffs">
      <Paper elevation={2} className="staff-table" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
          <Typography variant="h6" fontWeight="600">
            Tüm Personeller 
            <Chip 
              label={deduplicatedStaff.length} 
              size="small" 
              sx={{ ml: 1, bgcolor: '#20b494', color: 'white' }} 
            />
          </Typography>
        </Box>
        
        <Divider />
        
        <Box sx={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
          <FilterListIcon color="action" />
          <Typography variant="subtitle2" fontWeight="600">Filtreler</Typography>
          
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel id="departman-label">Departman Seçiniz</InputLabel>
            <Select
              labelId="departman-label"
              id="departman-select"
              value={departman}
              onChange={(e) => setDepartman(e.target.value)}
              label="Departman Seçiniz"
              size="small"
            >
              <MenuItem value="">Tüm Departmanlar</MenuItem>
              {departmanListesi.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading && page === 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
            <CircularProgress size={30} sx={{ color: '#20b494' }} />
          </Box>
        )}
        
        {error && (
          <Box sx={{ padding: '20px', color: 'error.main', textAlign: 'center' }}>
            {error}
          </Box>
        )}

        {!loading && deduplicatedStaff.length === 0 && (
          <Box sx={{ padding: '30px', textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Görüntülenecek personel bulunamadı.
            </Typography>
          </Box>
        )}

        {(deduplicatedStaff.length > 0) && (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th style={{ width: '180px' }}>Ad</th>
                  <th>Email</th>
                  <th>Kan Grubu</th>
                  <th>Doğum Tarihi</th>
                  <th>T.C</th>
                  <th>Tel No</th>
                  <th>Departman</th>
                  <th>Görev</th>
                  <th style={{ width: '100px' }}>İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {deduplicatedStaff.map((staff, index) => (
                  <tr
                    key={`${staff.id}-${index}`}
                    ref={index === deduplicatedStaff.length - 1 ? lastStaffElementRef : undefined}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#20b494' }}>
                          {staff.name ? staff.name.charAt(0).toUpperCase() : <PersonIcon fontSize="small" />}
                        </Avatar>
                        <Typography variant="body2">{staff.name}</Typography>
                      </Box>
                    </td>
                    <td>{staff.email}</td>
                    <td>{staff.bloodType || '-'}</td>
                    <td>{staff.birthDate || '-'}</td>
                    <td>{staff.tc || '-'}</td>
                    <td>{staff.phoneNumber || '-'}</td>
                    <td>
                      <Chip 
                        label={getDepartmentName(staff)} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(32, 180, 148, 0.1)', 
                          color: '#20b494',
                          fontWeight: '500',
                          fontSize: '0.7rem'
                        }} 
                      />
                    </td>
                    <td>
                      <Chip 
                        label={staff.roleName || '-'} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }} 
                      />
                    </td>
                    <td>
                      <Tooltip title="İşlemler">
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, staff)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          elevation={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => handleEdit(selectedStaff)}>Düzenle</MenuItem>
          <MenuItem onClick={() => handleDelete(selectedStaff)}>Sil</MenuItem>
          <MenuItem onClick={() => handlePasswordReset(selectedStaff)}>Şifre Sıfırla</MenuItem>
        </Menu>

        {loading && page > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress size={24} sx={{ color: '#20b494' }} />
            <Typography variant="body2" sx={{ ml: 1 }}>Daha fazla veri yükleniyor...</Typography>
          </Box>
        )}
      </Paper>
      <EditStaffModal />
    </div>
  );
}

export default StaffTable;
