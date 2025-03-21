import React, { useCallback, useState } from 'react';
import Navbar from "../components/Navbar";
import { motion } from 'framer-motion';
import DepartmentButton from '../components/Departments/DepartmentButton';
import '../styles/Departments/DepartmentPage.css';

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
          x: isOpen ? 250 : 0,
          width: isOpen ? 'calc(100% - 280px)' : 'calc(100% - 100px)',
          margin: isOpen ? '0 0 0 30px' : '0 auto',
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`department-container main-content ${isOpen ? 'menu-open' : ''}`}
      >
        <DepartmentButton />
      </motion.div>
    </div>
  );
}

export default DepartmentPage;