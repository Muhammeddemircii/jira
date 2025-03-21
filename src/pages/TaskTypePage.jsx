import React from 'react';
import Navbar from '../components/Navbar';
import TaskTypePage from '../components/TaskTypes/TaskTypePage';
import { useState } from 'react';

function TaskTypePageContainer() {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="full-page">
            <Navbar setIsOpen={setIsOpen} isOpen={isOpen} />
            <div className={`main-content ${isOpen ? 'menu-open' : ''}`}>
                <TaskTypePage />
            </div>
        </div>
    );
}

export default TaskTypePageContainer; 