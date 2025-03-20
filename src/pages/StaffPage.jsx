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
          x: isOpen ? 245 : 45,
          width: isOpen ? 'calc(100% - 245px)' : 'calc(100% - 45px)',
        }}
        transition={{ type: 'spring', stiffness: 100 }}
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
