import React, { useCallback, useState } from 'react';
import Navbar from  "../components/Navbar";
import { motion } from 'framer-motion';
import DepartmentButton from '../components/DepartmentButton';

function DepartmentPage() {
      const [isOpen, setIsOpen] = useState(false);
    
      const updateMenuState = useCallback((newState) => {
        setIsOpen(newState);
      }, []);
  return (
    <div>
        <div>
            <Navbar isOpen={isOpen} setIsOpen={updateMenuState} />  

        </div>
        <hr />
      <div>
        <motion.div
          initial={{ x: 0 }}
          animate={{
            x: isOpen ? 245 : 45,
            width: isOpen ? 'calc(100% - 200px)' : '100%',
          }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="flex flex-col items-center"
        >
          <DepartmentButton />
        </motion.div>
      </div>
    </div>
  )
}

export default DepartmentPage;