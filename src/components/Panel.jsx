import React, { useState } from 'react';
import { Button, Modal } from '@mui/material';
import '../styles/Panel.css';
import AddTask from '../components/Tasks/AddTask';
function Panel({ setTasks }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleAddTask = () => {
        setLoading(true);
        setOpen(true);
    };

    const handleSaveAddTask = (newTask) => {
        setTasks((prevTasks) => [...prevTasks, newTask]);
        setLoading(false);

        setOpen(false);
    };

    return (
        <div>
            <div className='panel'>
                <Button
                    onClick={handleAddTask}
                    variant="contained"
                    disabled={loading}
                    className='panel-button'
                    sx={{ backgroundColor: "#20b494" }}
                >
                    {loading ? "Görev Ekleniyor..." : "Görev Ekle"}
                </Button>

                <Modal
                    open={open}
                    onClose={() => setOpen(false)}
                >
                    <div className={`panel-task ${open ? "open" : "close"}`}>
                        <AddTask

                            setOpen={setOpen}
                            setLoading={setLoading}
                            handleSave={handleSaveAddTask}
                            currentUserId="ccb883c0-0df5-4a04-beb5-08dd1dbad75d" 
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default Panel;
