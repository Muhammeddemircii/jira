import React, { useState, useEffect } from 'react';
import { Button, Modal } from '@mui/material';
import '../styles/Panel.css';
import AddTask from '../components/Tasks/AddTask';
import { tasksServices } from '../axios/axios';
import AddIcon from '@mui/icons-material/Add';

function Panel({ setTasks }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkIfMobile();
        

        window.addEventListener('resize', checkIfMobile);
        

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const handleAddTask = () => {
        setLoading(true);
        setOpen(true);
    };

    const handleSaveAddTask = async (newTask) => {
        console.log("Yeni eklenen görev detayları:", newTask);
        
        try {

            const updatedTasks = await tasksServices.getTasks();
            console.log("Güncel görev listesi:", updatedTasks);
            

            setTasks(updatedTasks);
            

            console.log("Görev listesi başarıyla güncellendi");
        } catch (error) {
            console.error("Görev listesi güncellenirken hata:", error);
        }
        
        setLoading(false);
        setOpen(false);
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    return (
        <div>
            <div className='panel'>
                {!isMobile && (
                    <Button
                        onClick={handleAddTask}
                        variant="contained"
                        disabled={loading}
                        className='panel-button'
                        sx={{ backgroundColor: "#20b494" }}
                    
                    >
                        {loading ? "Görev Ekleniyor..." : "Görev Ekle"}
                    </Button>
                )}

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
