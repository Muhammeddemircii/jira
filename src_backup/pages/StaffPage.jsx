import React, { useCallback, useState } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import StaffButton from '../components/Staffs/StaffButton';
import { Box } from '@mui/material';

function StaffPage() {
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
        <StaffButton />
      </Box>
    </Box>
  );
}

export default StaffPage;
