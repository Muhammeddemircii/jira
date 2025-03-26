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
import { companyService } from '../../axios/axios';
import '../../styles/Companies/Companies.css';
import { toast } from 'react-hot-toast';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
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
      setCompanies(response.data || []);
    } catch (error) {
      console.error("Şirket verileri alınırken hata:", error);
      toast.error("Şirket verileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company) => {
    // TODO: Implement edit functionality
    console.log("Edit company:", company);
    toast.info("Düzenleme özelliği yakında eklenecek.");
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
      const users = await companyService.getCompanyUsers(company.id);
      console.log("Company users:", users);
      // TODO: Implement user list view
      toast.info("Kullanıcı listesi özelliği yakında eklenecek.");
    } catch (error) {
      console.error("Kullanıcılar alınırken hata:", error);
      toast.error("Kullanıcılar alınırken bir hata oluştu.");
    }
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
              {companies.map((company) => (
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
    </Box>
  );
}

export default Companies; 