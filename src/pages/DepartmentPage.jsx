import React, { useCallback, useState } from 'react';
import Navbar from "../components/Navbar";
import { motion } from 'framer-motion';
import DepartmentButton from '../components/DepartmentButton';
import '../styles/DepartmentPage.css';

function DepartmentPage() {
  const [isOpen, setIsOpen] = useState(false);

  const updateMenuState = useCallback((newState) => {
    setIsOpen(newState);
  }, []);
  
  return (
    <div className="page-wrapper">
      <div>
        <Navbar isOpen={isOpen} setIsOpen={updateMenuState} />  
      </div>
      <hr />
      <motion.div
        initial={{ x: 0 }}
        animate={{
          x: isOpen ? 245 : 45,
          width: isOpen ? 'calc(100% - 245px)' : 'calc(100% - 45px)',
        }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="department-container"
      >
        <DepartmentButton />
      </motion.div>
    </div>
  );
}

export default DepartmentPage;