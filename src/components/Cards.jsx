import React, { useState, useEffect, useCallback, useRef } from 'react';
import "../styles/Cards.css";
import Loading from './Loading';
import { tasksServices } from "../axios/axios";
import EditTaskModal from './Tasks/EditTaskModal';
import { toast } from 'react-hot-toast';
import { TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button, CircularProgress } from '@mui/material';

function Cards({isOpen, tasks}) {
    const [tasksByCategory, setTasksByCategory] = useState({});
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [pageSize] = useState(5);
    const [currentPages, setCurrentPages] = useState({});
    const [loadingMore, setLoadingMore] = useState({});
    const [totalPages, setTotalPages] = useState({});
    // Drag-and-drop için state
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverCategory, setDragOverCategory] = useState(null);
    
    // Infinite scroll için ref'ler
    const loaderRefs = useRef({});
    const observerRefs = useRef({});

    // Rejection dialog için state
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError] = useState('');
    const [pendingTaskId, setPendingTaskId] = useState(null);
    const [pendingTargetCategory, setPendingTargetCategory] = useState(null);

    // Kategorileri ve görevleri getir
    const fetchCategoriesAndTasks = useCallback(async () => {
        try {
            setLoading(true);
            console.log("Kategoriler ve görevler getiriliyor...");
            
            // Token var mı kontrol et
            const token = localStorage.getItem("user-token");
            if (!token) {
                console.error("Kullanıcı token'ı bulunamadı! API istekleri başarısız olabilir.");
            } else {
                console.log("Token mevcut, API istekleri yapılabilir.");
            }
            
            // Kategorileri al
            const categoriesResponse = await tasksServices.getCategories();
            
            console.log("Kategoriler yanıtı:", JSON.stringify(categoriesResponse, null, 2));
            
            // Kategorileri doğrula ve filtrele
            let categoriesList = [];
            if (Array.isArray(categoriesResponse)) {
                categoriesList = categoriesResponse.map(cat => ({
                    durationId: cat.id,
                    name: cat.name
                }));
                console.log("Kategoriler dizisi olarak işlendi");
            } else if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
                categoriesList = categoriesResponse.data.map(cat => ({
                    durationId: cat.id,
                    name: cat.name
                }));
                console.log("Kategoriler data içinde dizisi olarak işlendi");
            } else {
                console.error("Geçersiz kategori yanıtı:", JSON.stringify(categoriesResponse, null, 2));
                // Yedek kategoriler
                categoriesList = [
                    { durationId: "9f0122da-a697-4aed-52af-08dd2c05ec2e", name: "Beklemede" },
                    { durationId: "577ba8ad-f6d8-430a-52b0-08dd2c05ec2e", name: "Yapımda" },
                    { durationId: "492d6a56-590c-47f1-52b1-08dd2c05ec2e", name: "Tamamlandı" },
                    { durationId: "2f985dfd-f22a-4294-52b2-08dd2c05ec2e", name: "Reddedildi" }
                ];
                console.log("API yanıtı olmadığı için sabit kategoriler kullanılıyor");
            }
            
            setCategories(categoriesList);
            console.log("Kategoriler set edildi:", categoriesList);
            
            // Her kategori için sayfa numaralarını başlat
            const newCurrentPages = {};
            const newTotalPages = {};
            const newLoadingMore = {};
            categoriesList.forEach(category => {
                newCurrentPages[category.durationId] = 1;
                newTotalPages[category.durationId] = 1;
                newLoadingMore[category.durationId] = false;
            });
            setCurrentPages(newCurrentPages);
            setTotalPages(newTotalPages);
            setLoadingMore(newLoadingMore);
            
            // Her kategori için ayrı ayrı görevleri getir
            const newTasksByCategory = {};
            
            // Tüm kategori isteklerini paralel olarak yap
            await Promise.all(
                categoriesList.map(async (category) => {
                    try {
                        console.log(`${category.name} kategorisi için görevler getiriliyor...`);
                        
                        // Bu kategori için sayfalı görevleri getir
                        const tasksResponse = await tasksServices.getTasksPaged({
                            DurationId: category.durationId,
                            PageSize: pageSize,
                            PageNumber: 1
                        });
                        
                        console.log(`${category.name} kategorisi görev yanıtı:`, tasksResponse);
                        
                        // Yanıtı doğrula ve sayfa bilgilerini güncelle
                        if (tasksResponse && Array.isArray(tasksResponse.tasks)) {
                            newTasksByCategory[category.durationId] = tasksResponse.tasks || [];
                            newTotalPages[category.durationId] = tasksResponse.totalPages || 1;
                        } else {
                            console.error(`${category.name} kategorisi için geçersiz görev yanıtı:`, tasksResponse);
                            newTasksByCategory[category.durationId] = [];
                        }
                    } catch (error) {
                        console.error(`${category.name} kategorisi görevleri alınırken hata:`, error);
                        newTasksByCategory[category.durationId] = [];
                    }
                })
            );
            
            // Her kategori için görevleri önceliğe göre sırala
            Object.keys(newTasksByCategory).forEach(categoryId => {
                newTasksByCategory[categoryId] = sortTasksByPriority(newTasksByCategory[categoryId]);
            });
            
            setTasksByCategory(newTasksByCategory);
            setTotalPages(newTotalPages);
            console.log("Tüm kategoriler için görevler set edildi:", newTasksByCategory);
            
        } catch (error) {
            console.error("Kategoriler ve görevler alınırken hata:", error);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);
    
    // Observer'ları temizle
    const cleanupObservers = () => {
        Object.keys(observerRefs.current).forEach(key => {
            if (observerRefs.current[key]) {
                observerRefs.current[key].disconnect();
            }
        });
    };
    
    // Belirli bir kategori için daha fazla görev yükle
    const loadMoreTasks = async (categoryId, categoryName) => {
        try {
            // Mevcut sayfa numarasını al
            const currentPage = currentPages[categoryId] || 1;
            const nextPage = currentPage + 1;
            
            // Eğer zaten yükleniyor durumundaysa veya toplam sayfa sayısına ulaşıldıysa yükleme yapma
            if (loadingMore[categoryId] || nextPage > (totalPages[categoryId] || 1)) {
                console.log(`${categoryName} kategorisi için daha fazla sayfa yok veya zaten yükleniyor. 
                    Mevcut/Toplam: ${currentPage}/${totalPages[categoryId]}`);
                return;
            }
            
            // Bu kategori için yükleniyor durumunu güncelle
            setLoadingMore(prev => ({
                ...prev,
                [categoryId]: true
            }));
            
            console.log(`${categoryName} kategorisi için ${nextPage}. sayfa yükleniyor...`);
            
            // Bu kategori için ek görevleri getir
            const tasksResponse = await tasksServices.getTasksPaged({
                DurationId: categoryId,
                PageSize: pageSize,
                PageNumber: nextPage
            });
            
            // Yanıtı doğrula
            if (tasksResponse && Array.isArray(tasksResponse.tasks)) {
                // Mevcut görevlere yeni görevleri ekle ve önceliğe göre sırala
                setTasksByCategory(prev => {
                    const updatedTasks = [...(prev[categoryId] || []), ...tasksResponse.tasks];
                    // Önceliğe göre sırala (0 = çok yüksek, 4 = çok düşük)
                    const sortedTasks = sortTasksByPriority(updatedTasks);
                    return {
                        ...prev,
                        [categoryId]: sortedTasks
                    };
                });
                
                // Sayfa numarasını güncelle
                setCurrentPages(prev => ({
                    ...prev,
                    [categoryId]: nextPage
                }));
                
                // Toplam sayfa sayısını güncelle
                setTotalPages(prev => ({
                    ...prev,
                    [categoryId]: tasksResponse.totalPages || prev[categoryId] || 1
                }));
                
                console.log(`${categoryName} kategorisi için ${nextPage}. sayfa yüklendi. Görev sayısı: ${tasksResponse.tasks.length}`);
            } else {
                console.error(`${categoryName} kategorisi için ${nextPage}. sayfa yüklenirken hata oluştu`);
            }
        } catch (error) {
            console.error(`Daha fazla görev yüklenirken hata: ${error}`);
        } finally {
            // Yükleniyor durumunu kapat
            setLoadingMore(prev => ({
                ...prev,
                [categoryId]: false
            }));
        }
    };
    
    // Görevleri önceliğe göre sıralama fonksiyonu
    const sortTasksByPriority = (tasks) => {
        return [...tasks].sort((a, b) => {
            // Öncelik değerlerini al, yoksa varsayılan olarak orta öncelik (2) ata
            const priorityA = a.priority !== undefined && a.priority !== null ? parseInt(a.priority) : 2;
            const priorityB = b.priority !== undefined && b.priority !== null ? parseInt(b.priority) : 2;
            
            // Önceliği küçükten büyüğe sırala (0 = çok yüksek, 4 = çok düşük)
            return priorityA - priorityB;
        });
    };
    
    // IntersectionObserver'ları ayarla
    useEffect(() => {
        if (!loading && categories.length > 0) {
            // Önce eski observer'ları temizle
            cleanupObservers();
            
            // Her kategori için observer oluştur
            categories.forEach(category => {
                const categoryId = category.durationId;
                const loaderElement = loaderRefs.current[categoryId];
                
                if (loaderElement) {
                    // Observer oluştur
                    const observer = new IntersectionObserver(
                        (entries) => {
                            const entry = entries[0];
                            if (entry.isIntersecting) {
                                // Element görünür olduğunda daha fazla görev yükle
                                loadMoreTasks(categoryId, category.name);
                            }
                        },
                        {
                            root: null,
                            rootMargin: '20px',
                            threshold: 0.1 // Elementin %10'u görünür olduğunda tetikle
                        }
                    );
                    
                    // Elemanı gözlemle
                    observer.observe(loaderElement);
                    
                    // Observer'ı sakla
                    observerRefs.current[categoryId] = observer;
                }
            });
        }
        
        // Component unmount olduğunda observer'ları temizle
        return () => {
            cleanupObservers();
        };
    }, [loading, categories, tasksByCategory, totalPages, currentPages]);
    
    useEffect(() => {
        fetchCategoriesAndTasks();
    }, [fetchCategoriesAndTasks]);

    // Drag başladığında çağrılacak
    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.setData('text/plain', JSON.stringify({
            taskId: task.id || task.taskId,
            sourceDurationId: task.durationId
        }));
        e.currentTarget.classList.add('dragging');
    };

    // Sürükleme bittiğinde çağrılacak
    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        setDragOverCategory(null);
    };

    // Sürüklenen öğe bir kategori üzerine geldiğinde
    const handleDragOver = (e, categoryId) => {
        e.preventDefault();
        setDragOverCategory(categoryId);
    };

    // Sürüklenen öğe bırakıldığında
    const handleDrop = async (e, targetCategoryId) => {
        e.preventDefault();
        const targetCategory = categories.find(cat => cat.id === targetCategoryId);
        
        try {
            // Sürüklenen görevin bilgilerini al
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const taskId = data.taskId;
            const sourceDurationId = data.sourceDurationId;
            
            // Aynı kategoriye bırakıldıysa işlem yapma
            if (sourceDurationId === targetCategoryId) {
                console.log("Görev aynı kategoriye bırakıldı, işlem yapılmayacak.");
                return;
            }
            
            console.log(`Görev taşınıyor: ${sourceDurationId} -> ${targetCategoryId}`);
            
            // If the target category is "Reddedildi", open the rejection dialog
            if (targetCategory && targetCategory.name === "Reddedildi") {
                setPendingTaskId(taskId);
                setPendingTargetCategory(targetCategoryId);
                setRejectionDialogOpen(true);
                return;
            }
            
            // API çağrısı ile durum güncelleme
            const response = await tasksServices.updateTaskDuration(taskId, targetCategoryId);
            console.log("API yanıtı:", response);
            
            if (response && response.isSuccess) {
                // Başarı bildirimi göster
                toast.success('Görev durumu başarıyla güncellendi');
                
                // Görev verilerini güncelle
                const updatedTasksByCategory = { ...tasksByCategory };
                
                // Görevi eski kategoriden kaldır
                if (updatedTasksByCategory[sourceDurationId]) {
                    updatedTasksByCategory[sourceDurationId] = updatedTasksByCategory[sourceDurationId].filter(
                        task => (task.id || task.taskId) !== taskId
                    );
                }
                
                // Görevi yeni kategoriye ekle
                if (draggedTask) {
                    const updatedTask = { ...draggedTask, durationId: targetCategoryId };
                    
                    if (!updatedTasksByCategory[targetCategoryId]) {
                        updatedTasksByCategory[targetCategoryId] = [];
                    }
                    
                    // Görevi ekle ve önceliğe göre sırala
                    updatedTasksByCategory[targetCategoryId] = sortTasksByPriority([
                        updatedTask,
                        ...updatedTasksByCategory[targetCategoryId]
                    ]);
                }
                
                // State'i güncelle
                setTasksByCategory(updatedTasksByCategory);
                
                // Sürükleme işlemini temizle
                setDraggedTask(null);
                setDragOverCategory(null);
            } else {
                console.error("API başarısız yanıt döndü:", response);
                toast.error('Görev durumu güncellenirken bir hata oluştu');
            }
        } catch (error) {
            console.error("Görev durumu güncellenirken hata:", error);
            toast.error('Görev durumu güncellenirken bir hata oluştu');
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
            
            // Kategori verilerini ve görevleri tamamen yenile
            await fetchCategoriesAndTasks();
        } catch (error) {
            console.error("Görevler yeniden yüklenirken hata:", error);
            setLoading(false);
        }
    };
    
    // Loader ref'ini oluştur
    const setLoaderRef = (categoryId, element) => {
        loaderRefs.current[categoryId] = element;
    };

    // Rejection dialog işlemleri
    const handleRejectTask = async () => {
        if (!rejectionReason.trim()) {
            setRejectionError('Reddetme sebebi boş olamaz');
            return;
        }
        
        try {
            // First update the task status to rejected
            const response = await tasksServices.updateTaskDuration(pendingTaskId, pendingTargetCategory);
            
            if (!response || !response.isSuccess) {
                throw new Error(response?.message || 'Görev durumu güncellenirken bir hata oluştu');
            }
            
            // Then send the rejection reason
            const rejectResponse = await tasksServices.taskRejected(
                pendingTaskId,
                rejectionReason
            );
            
            if (!rejectResponse || !rejectResponse.isSuccess) {
                throw new Error(rejectResponse?.message || 'Reddetme sebebi kaydedilirken bir hata oluştu');
            }
            
            // Başarı bildirimi göster
            toast.success('Görev başarıyla reddedildi');
            
            // Get source durationId from draggedTask
            const sourceDurationId = draggedTask ? draggedTask.durationId : null;
            
            if (sourceDurationId && draggedTask) {
                // Görev verilerini güncelle
                const updatedTasksByCategory = { ...tasksByCategory };
                
                // Görevi eski kategoriden kaldır
                if (updatedTasksByCategory[sourceDurationId]) {
                    updatedTasksByCategory[sourceDurationId] = updatedTasksByCategory[sourceDurationId].filter(
                        task => (task.id || task.taskId) !== pendingTaskId
                    );
                }
                
                // Görevi yeni kategoriye ekle
                const updatedTask = { ...draggedTask, durationId: pendingTargetCategory };
                
                if (!updatedTasksByCategory[pendingTargetCategory]) {
                    updatedTasksByCategory[pendingTargetCategory] = [];
                }
                
                updatedTasksByCategory[pendingTargetCategory] = [
                    updatedTask,
                    ...updatedTasksByCategory[pendingTargetCategory]
                ];
                
                // State'i güncelle
                setTasksByCategory(updatedTasksByCategory);
            } else {
                // If draggedTask is not available, reload the page
                window.location.reload();
            }
            
            // Close dialog and reset values
            setRejectionDialogOpen(false);
            setRejectionReason('');
            setRejectionError('');
            setPendingTaskId(null);
            setPendingTargetCategory(null);
            
            // Sürükleme işlemini temizle
            setDraggedTask(null);
            setDragOverCategory(null);
        } catch (error) {
            console.error("Görev reddetme hatası:", error);
            toast.error(error.message || 'Görev reddedilirken bir hata oluştu');
        }
    };

    const handleRejectionCancel = () => {
        setRejectionDialogOpen(false);
        setRejectionReason('');
        setRejectionError('');
        setPendingTaskId(null);
        setPendingTargetCategory(null);
        setDraggedTask(null);
        setDragOverCategory(null);
    };

    return (
        <div className="cards">
            {loading ? (
                <Loading />
            ) : (
                <div className={isOpen ? "card-close" : "card-open"}>
                    {categories.length === 0 ? (
                        <div className="no-data-message">
                            <p>Görüntülenecek kategori bulunamadı.</p>
                        </div>
                    ) : (
                        categories.map((category) => {
                            const categoryTasks = tasksByCategory[category.durationId] || [];
                            const isLoadingMore = loadingMore[category.durationId] || false;
                            const currentPage = currentPages[category.durationId] || 1;
                            const totalPagesForCategory = totalPages[category.durationId] || 1;
                            const hasMorePages = currentPage < totalPagesForCategory;
                            
                            return (
                                <div 
                                    key={category.durationId} 
                                    className={`pending ${dragOverCategory === category.durationId ? 'drag-over' : ''}`}
                                    onDragOver={(e) => handleDragOver(e, category.durationId)}
                                    onDrop={(e) => handleDrop(e, category.durationId)}
                                >
                                    <h3>{category.name}</h3>
                                    <p>Görev Sayısı: {categoryTasks.length}</p>
                                    
                                    <div className="pending-cards">
                                        {categoryTasks.length === 0 ? (
                                            <div className="no-tasks-message">
                                                <p>Bu kategoride görev bulunamadı.</p>
                                            </div>
                                        ) : (
                                            <>
                                                {categoryTasks.map((task, index) => (
                                                    <div 
                                                        key={task.id || task.taskId || `task-${category.durationId}-${index}`} 
                                                        onClick={() => handleCardClick(task)} 
                                                        className="task-card"
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, task)}
                                                        onDragEnd={handleDragEnd}
                                                    >
                                                        {task.priority && <span className="task-badge task-badge-visible" data-priority={task.priority}>{task.priority}</span>}
                                                        {!task.priority && index % 3 === 0 && <span className="task-badge task-badge-visible" data-priority="3">3</span>}
                                                        <h3>{task.name || "Proje bitecek"}</h3>
                                                        <p className="task-card-description">{task.description || "personelli olan bu, proje bitecek"}</p>
                                                        <div className="task-card-meta">
                                                            <span className="task-card-department">Departman: {task.department || task.departmentName || "Belirtilmemiş"}</span>
                                                            <div className="task-card-dates">
                                                                <div className="task-card-date">
                                                                    <span className="task-card-date-label">Başlangıç:</span>
                                                                    <span>{task.createdDate ? new Date(task.createdDate).toLocaleDateString('tr-TR') : "-"}</span>
                                                                </div>
                                                                <div className="task-card-date">
                                                                    <span className="task-card-date-label">Son Güncelleme:</span>
                                                                    <span>{task.updatedDate ? new Date(task.updatedDate).toLocaleDateString('tr-TR') : "-"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                {/* Infinite scroll için görünmez yükleme elemanı */}
                                                {hasMorePages && (
                                                    <div 
                                                        ref={(element) => setLoaderRef(category.durationId, element)}
                                                        className="infinite-scroll-loader"
                                                    >
                                                        {isLoadingMore && <div className="loader-dots"></div>}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
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

            {/* Rejection Dialog */}
            <Dialog
                open={rejectionDialogOpen}
                onClose={handleRejectionCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Görevi Reddet
                </DialogTitle>
                <DialogContent>
                    <div style={{ marginTop: '16px' }}>
                        <TextField
                            label="Reddetme Nedeni"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            error={!!rejectionError}
                            helperText={rejectionError}
                            placeholder="Görevin reddedilme sebebini açıklayın..."
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRejectionCancel} color="primary">
                        İptal
                    </Button>
                    <Button 
                        onClick={handleRejectTask} 
                        color="primary" 
                        variant="contained"
                        sx={{ backgroundColor: "#20b494" }}
                    >
                        Reddet
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Cards;