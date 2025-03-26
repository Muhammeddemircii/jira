import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  IconButton, 
  Box,
  CircularProgress,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  DialogContentText
} from '@mui/material';
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaUsers } from 'react-icons/fa';
import { Add as AddIcon } from '@mui/icons-material';
import { companyService } from '../../axios/axios';
import '../../styles/Companies/Companies.css';
import { toast } from 'react-hot-toast';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    logo: '',
    domain: '',
    tenantGrupId: localStorage.getItem('tenant-grup-id') || '1160fc5a-dd69-452e-83af-da3510419b90'
  });
  const userTypeId = localStorage.getItem('user-type-id');

  useEffect(() => {
    // Check if user is Group Manager
    if (userTypeId !== "4") {
      setError("Bu sayfaya erişim yetkiniz bulunmamaktadır.");
      setLoading(false);
      return;
    }

    fetchCompanies();
  }, [userTypeId]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getCompanies();
      const companiesData = response?.data || [];
      setCompanies(companiesData);
    } catch (error) {
      console.error("Şirket verileri alınırken hata:", error);
      toast.error("Şirket verileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      title: '',
      logo: '',
      domain: '',
      tenantGrupId: localStorage.getItem('tenant-grup-id') || '1160fc5a-dd69-452e-83af-da3510419b90'
    });
    setAddDialogOpen(true);
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      title: company.title,
      logo: company.logo || '',
      domain: company.domain,
      tenantGrupId: localStorage.getItem('tenant-grup-id') || '1160fc5a-dd69-452e-83af-da3510419b90'
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await companyService.deleteCompany(selectedCompany.id);
      toast.success("Şirket başarıyla silindi.");
      fetchCompanies();
    } catch (error) {
      console.error("Şirket silinirken hata:", error);
      toast.error("Şirket silinirken bir hata oluştu.");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCompany(null);
    }
  };

  const handleViewUsers = async (company) => {
    try {
      const response = await companyService.getCompanyUsers(company.id);
      const usersData = response?.data || [];
      setUsers(usersData);
      setSelectedCompany(company);
      setUsersDialogOpen(true);
    } catch (error) {
      console.error("Kullanıcılar alınırken hata:", error);
      toast.error("Kullanıcılar alınırken bir hata oluştu.");
    }
  };

  const handleSubmit = async (isEdit = false) => {
    try {
      // TenantGrupId'nin formData içinde olduğundan emin olalım
      const submitData = {
        ...formData,
        tenantGrupId: localStorage.getItem('tenant-grup-id') || '1160fc5a-dd69-452e-83af-da3510419b90'
      };
      
      console.log("Gönderilen veri:", submitData);
      
      if (isEdit && selectedCompany) {
        await companyService.updateCompany(selectedCompany.id, submitData);
        toast.success("Şirket başarıyla güncellendi.");
      } else {
        await companyService.createCompany(submitData);
        toast.success("Şirket başarıyla eklendi.");
      }
      fetchCompanies();
      setAddDialogOpen(false);
      setEditDialogOpen(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error("Şirket işlemi sırasında hata:", error);
      toast.error("İşlem sırasında bir hata oluştu.");
      if (error.response) {
        console.error("API hata yanıtı:", error.response.data);
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <Box className="companies-loading-container">
        <CircularProgress className="companies-loading-spinner" />
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="companies-error">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="companies-container">
      <Paper elevation={2} className="companies-table">
        <Box className="companies-header">
          <Typography variant="h6" className="companies-title">
            Şirketler
            <Chip 
              label={companies.length} 
              size="small" 
              sx={{ ml: 1, bgcolor: '#20b494', color: 'white' }} 
            />
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ ml: 2 }}
          >
            Şirket Ekle
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Adı</TableCell>
                <TableCell>Başlığı</TableCell>
                <TableCell>Grubu</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(companies) && companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.title}</TableCell>
                  <TableCell>{company.grupName}</TableCell>
                  <TableCell>{company.domain}</TableCell>
                  <TableCell align="right" className="action-buttons-cell">
                    <Tooltip title="Düzenle">
                      <IconButton 
                        className="companies-table-edit-button" 
                        onClick={() => handleEdit(company)}
                        size="small"
                      >
                        <FaRegEdit />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Sil">
                      <IconButton 
                        className="companies-table-delete-button" 
                        onClick={() => handleDelete(company)}
                        size="small"
                      >
                        <MdDeleteForever />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Kullanıcılar">
                      <IconButton 
                        className="companies-table-users-button" 
                        onClick={() => handleViewUsers(company)}
                        size="small"
                      >
                        <FaUsers />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Company Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Yeni Şirket Ekle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Şirket Adı"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="title"
            label="Başlık"
            type="text"
            fullWidth
            value={formData.title}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="domain"
            label="Domain"
            type="text"
            fullWidth
            value={formData.domain}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>İptal</Button>
          <Button onClick={() => handleSubmit(false)} color="primary">
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Şirket Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Şirket Adı"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="title"
            label="Başlık"
            type="text"
            fullWidth
            value={formData.title}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="domain"
            label="Domain"
            type="text"
            fullWidth
            value={formData.domain}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button onClick={() => handleSubmit(true)} color="primary">
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Şirketi Sil
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {selectedCompany?.name} şirketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Users Dialog */}
      <Dialog 
        open={usersDialogOpen} 
        onClose={() => setUsersDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCompany?.name} - Kullanıcılar
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ad Soyad</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Telefon</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(users) && users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name} {user.surname}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsersDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Companies; 