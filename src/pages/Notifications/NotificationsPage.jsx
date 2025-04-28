import React, { useCallback, useState } from 'react';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Badge } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle } from '@fortawesome/free-solid-svg-icons';

function NotificationsPage() {
  const [isOpen, setIsOpen] = useState(false);


  const updateMenuState = useCallback((newState) => {
    setIsOpen(newState);
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f9fafc'
    }}>
      <div>
        <Navbar isOpen={isOpen} setIsOpen={updateMenuState} />
      </div>
    </Box>
  );
}

export default NotificationsPage; 