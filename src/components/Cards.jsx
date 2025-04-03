import React, { useState, useEffect } from 'react';
import "../styles/Cards.css";
import Loading from './Loading';
import { tasksServices } from "../axios/axios";
import EditTaskModal from './Tasks/EditTaskModal';

function Cards({isOpen, setOpenDetails, tasks, setSelectedTask}) {
    const [taskList, setTaskList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);

    // Sayfa yüklendiğinde ve tasks prop'u değiştiğinde çalışacak effect
    useEffect(() => {
        console.log("Cards component - useEffect çalıştı");
        fetchCategoriesAndTasks();
    }, [tasks]);

    const fetchCategoriesAndTasks = async () => {
        try {
            setLoading(true);
            console.log("Kategoriler ve görevler yükleniyor...");
            
            // Kategorileri getir
            const categoriesResponse = await tasksServices.getCategories();
            console.log("API'den alınan kategoriler:", categoriesResponse);
            
            if (categoriesResponse && Array.isArray(categoriesResponse)) {
                setCategories(categoriesResponse);
            } else if (categoriesResponse && categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
                setCategories(categoriesResponse.data);
            } else {
                console.warn("Kategoriler geçerli bir formatta değil:", categoriesResponse);
                // Test için statik veri ekleyin
                setCategories([
                    { id: 1, name: "Bekleyen" },
                    { id: 2, name: "Devam Eden" },
                    { id: 3, name: "Tamamlanan" }
                ]);
            }
            
            // Görevleri ayarla
            if (Array.isArray(tasks) && tasks.length > 0) {
                console.log("Props'tan gelen görevler kullanılıyor:", tasks);
                setTaskList(tasks);
            } else {
                console.log("Props'tan görevler alınamadı, API'den yükleniyor...");
                // Propstan gelen görevler yoksa API'den yükle
                const tasksData = await tasksServices.getTasks();
                console.log("API'den alınan görevler:", tasksData);
                
                if (tasksData && Array.isArray(tasksData)) {
                    setTaskList(tasksData);
                } else if (tasksData && tasksData.data && Array.isArray(tasksData.data)) {
                    setTaskList(tasksData.data);
                } else {
                    console.warn("Görevler geçerli bir formatta değil:", tasksData);
                    // Test için statik veri ekleyin
                    setTaskList([
                        { id: 1, name: "Rapor hazırla", durationId: 1 },
                        { id: 2, name: "Toplantı düzenle", durationId: 2 },
                        { id: 3, name: "Doküman oluştur", durationId: 3 }
                    ]);
                }
            }
            
            // Veri yükleme tamamlandı, göstergeyi kapat
            setTimeout(() => {
                setLoading(false);
            }, 300); // Küçük bir gecikme ekleyelim (kullanıcı deneyimi için)
            
        } catch (error) {
            console.error("Kategoriler veya görevler alınırken hata:", error);
            // Hata durumunda bile test verisi göster
            setCategories([
                { id: 1, name: "Bekleyen" },
                { id: 2, name: "Devam Eden" },
                { id: 3, name: "Tamamlanan" }
            ]);
            setTaskList([
                { id: 1, name: "Rapor hazırla", durationId: 1 },
                { id: 2, name: "Toplantı düzenle", durationId: 2 },
                { id: 3, name: "Doküman oluştur", durationId: 3 }
            ]);
            
            // Hata durumunda da göstergeyi kapat
            setTimeout(() => {
                setLoading(false);
            }, 300);
        }
    };
    
    const handleCardClick = (task) => {
        console.log("Seçilen görev:", task);
        setCurrentTask(task);
        setEditModalOpen(true);
    };
    
    const handleTaskUpdated = async () => {
        try {
            console.log("Görev güncellendi, veriler tamamen yenileniyor...");
            
            // Önce loading durumuna geç
            setLoading(true);
            
            // Kategori verilerini taze bir şekilde yükle
            const categoriesResponse = await tasksServices.getCategories();
            if (categoriesResponse && Array.isArray(categoriesResponse)) {
                setCategories(categoriesResponse);
                console.log("Kategoriler yenilendi:", categoriesResponse.length);
            } else if (categoriesResponse && categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
                setCategories(categoriesResponse.data);
                console.log("Kategoriler yenilendi (data içinden):", categoriesResponse.data.length);
            }
            
            // Ardından görevleri taze şekilde yükle (API'den direk çek, props'a bakma)
            const tasksData = await tasksServices.getTasks();
            console.log("Yenilenen API görev verileri:", tasksData);
            
            if (tasksData && Array.isArray(tasksData)) {
                // Yeni bir dizi oluşturarak referansı değiştirip render'ı zorla
                setTaskList([...tasksData]);
                console.log("Görev listesi sıfırdan yenilendi:", tasksData.length);
            } else if (tasksData && tasksData.data && Array.isArray(tasksData.data)) {
                setTaskList([...tasksData.data]);
                console.log("Görev listesi sıfırdan yenilendi (data içinden):", tasksData.data.length);
            } else {
                console.warn("Güncellenmiş görev listesi alınamadı");
            }
            
            // Yeniden render için küçük bir gecikme ekle
            setTimeout(() => {
                setLoading(false);
                // Sayfadaki tüm veriler yenilendi
                console.log("Veri yenileme tamamlandı");
            }, 300);
            
            // Üst bileşene de bildir
            if (typeof setSelectedTask === 'function') {
                setSelectedTask(null); // Seçimi sıfırla
            }
        } catch (error) {
            console.error("Görevler yeniden yüklenirken hata:", error);
            setLoading(false);
        }
    };
    
    return (
        <div className="cards">
            {loading ? (
                <Loading />
            ) : (
                <div className={isOpen ? "card-close" : "card-open"}>
                    {categories.length === 0 && taskList.length === 0 ? (
                        <div className="no-data-message">
                            <p>Görüntülenecek veri bulunamadı.</p>
                        </div>
                    ) : (
                        categories.map((category) => (
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
                        ))
                    )}
                </div>
            )}
            
            {editModalOpen && currentTask && (
                <EditTaskModal
                    open={editModalOpen}
                    handleClose={() => setEditModalOpen(false)}
                    task={currentTask}
                    onTaskUpdated={handleTaskUpdated}
                />
            )}
        </div>
    );
}

export default Cards;