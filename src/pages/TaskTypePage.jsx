import React from 'react';
import Navbar from '../components/Navbar';
import TaskTypePage from '../components/TaskTypes/TaskTypePage';
import { useState } from 'react';
import { motion } from 'framer-motion';

function TaskTypePageContainer() {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="full-page">
            <Navbar setIsOpen={setIsOpen} isOpen={isOpen} />
            <motion.div
                initial={{ x: 0 }}
                animate={{
                    x: isOpen ? 250 : 0,
                    width: isOpen ? 'calc(100% - 280px)' : 'calc(100% - 100px)',
                    margin: isOpen ? '0 0 0 30px' : '0 auto',
                }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className={`main-content ${isOpen ? 'menu-open' : ''}`}
            >
                <TaskTypePage />
            </motion.div>
        </div>
    );
}

export default TaskTypePageContainer; 