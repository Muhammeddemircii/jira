import React, { useCallback, useState } from 'react';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Badge } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle } from '@fortawesome/free-solid-svg-icons';

function NotificationsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Yıllık izin talebiniz onaylandı.", read: false, date: "21/04/2023" },
    { id: 2, message: "Yeni bir görev atandı: Rapor hazırlama.", read: true, date: "20/04/2023" },
    { id: 3, message: "Departman toplantısı: 22 Nisan, 14:00", read: false, date: "19/04/2023" },
    { id: 4, message: "Mesai saatleriniz güncellendi.", read: true, date: "15/04/2023" },
  ]);

  const updateMenuState = useCallback((newState) => {
    setIsOpen(newState);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };
  

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f9fafc'
    }}>
      <div>
        <Navbar isOpen={isOpen} setIsOpen={updateMenuState} />
      </div>
      <Box 
        component={motion.div}
        initial={{ x: 0 }}
        animate={{
          x: isOpen ? 250 : 0,
          width: isOpen ? 'calc(100% - 280px)' : 'calc(100% - 100px)',
          margin: isOpen ? '0 0 0 30px' : '0 auto',
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`main-content ${isOpen ? 'menu-open' : ''}`}
        sx={{ 
          pt: 2, 
          pb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box sx={{ width: '96%', maxWidth: '1400px', margin: '0 auto' }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2, 
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: '#f7f9fc',
              border: '1px solid #e0e7ff'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FontAwesomeIcon 
                icon={faBell} 
                style={{ 
                  fontSize: '24px', 
                  color: '#20b494',
                  padding: '12px',
                  backgroundColor: 'rgba(32, 180, 148, 0.1)',
                  borderRadius: '50%'
                }} 
              />
              <Typography variant="h6" fontWeight={600}>
                Bildirimler
              </Typography>
            </Box>
            
            <Box>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'transparent',
                  border: '1px solid #20b494',
                  color: '#20b494',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
                onClick={markAllAsRead}
              >
                Tümünü Okundu İşaretle
              </motion.button>
            </Box>
          </Paper>
          
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Tüm Bildirimler
                <Badge 
                  badgeContent={notifications.filter(n => !n.read).length} 
                  color="error" 
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
            
            <Divider />
            
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <React.Fragment key={notification.id}>
                    <ListItem 
                      disablePadding
                      secondaryAction={
                        <Typography variant="caption" color="text.secondary">
                          {notification.date}
                        </Typography>
                      }
                    >
                      <ListItemButton onClick={() => markAsRead(notification.id)}>
                        <ListItemIcon>
                          {!notification.read && (
                            <FontAwesomeIcon 
                              icon={faCircle} 
                              style={{ 
                                color: '#ff4d4f', 
                                fontSize: '10px' 
                              }} 
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={notification.message}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: notification.read ? 'normal' : 'bold'
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="Hiç bildiriminiz yok"
                    secondary="Yeni bildirimleriniz burada görünecek"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default NotificationsPage; 