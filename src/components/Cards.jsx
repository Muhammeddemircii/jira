import React, { useEffect, useState } from "react";
import { tasksServices } from "../axios/axios";
import "../styles/Cards.css";

function Cards({isOpen, setOpenDetails, tasks, setSelectedTask}) {
    const [taskList, setTaskList] = useState([]);
    const [categories, setCategories] = useState([]);
    
    useEffect(() => {
        const fetchCategoriesAndTasks = async () => {
            try {
                const categoriesResponse = await tasksServices.getCategories();
                setCategories(categoriesResponse);
                
                const tasksData = await tasksServices.getTasks();
                console.log("API'den alınan görevler:", tasksData);
                setTaskList(tasksData);
            } catch (error) {
                console.error("Veri çekerken hata oluştu:", error);
            }
        };
        
        fetchCategoriesAndTasks();
    }, []);
    
    // tasks prop'u değiştiğinde çalışacak effect
    useEffect(() => {
        if (Array.isArray(tasks) && tasks.length > 0) {
            console.log("Panel'den alınan yeni görev:", tasks);
            // Yeni görev eklendiğinde tekrar API'den tüm verileri almak yerine 
            // API'den verileri yeniden yükleyelim
            tasksServices.getTasks().then(updatedTasks => {
                console.log("Görev ekledikten sonra güncel görevler:", updatedTasks);
                setTaskList(updatedTasks);
            }).catch(error => {
                console.error("Güncel görevler alınırken hata:", error);
            });
        }
    }, [tasks]);
    
    const handleCardClick = (task) => {
        console.log("Seçilen görev:", task);
        setSelectedTask(task);
        setOpenDetails(true);
    }
    
    return (
        <div className="cards">
            <div className={isOpen ? "card-close" : "card-open"}>
                {categories.length === 0 ? <p>Kategori bulunamadı</p> : null}
                {taskList.length === 0 ? <p>Görev bulunamadı</p> : null}
                
                {categories.map((category) => (
                    <div key={category.id} className="pending">
                        <h3>{category.name}</h3>
                        <p>Görevi Liste Arasında Sürükleyiniz</p>
                        
                        <div className="pending-cards">
                            {taskList.filter(task => {
                                return task.durationId === category.id;
                            }).map(task => (
                                <div key={task.id} onClick={() => handleCardClick(task)} className="task-card">
                                    <h3>{task.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Cards;