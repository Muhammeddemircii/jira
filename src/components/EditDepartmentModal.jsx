import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { departmentService } from '../axios/axios';
import { setEditModalOpen, setEditingDepartment, setDepartments } from '../store/slices/departmanSlice';

function EditDepartmentModal() {
    const dispatch = useDispatch();
    const { isEditModalOpen, editingDepartment, departments } = useSelector(state => state.departments);
    const [departmentName, setDepartmentName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (editingDepartment && editingDepartment.name) {
            setDepartmentName(editingDepartment.name);
        }
    }, [editingDepartment]);

    const handleClose = () => {
        dispatch(setEditModalOpen(false));
        dispatch(setEditingDepartment(null));
        setDepartmentName('');
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!departmentName.trim()) {
            setError("Departman adı boş olamaz.");
            return;
        }
        setError("");
    
        try {
            let response;
            if (editingDepartment) {
                // Departmanı güncelleme işlemi
                response = await departmentService.updateDepartment(editingDepartment.id, {
                    id: editingDepartment.id,
                    name: departmentName,
                });
                console.log("API Yanıtı (Güncelleme):", response);
                
                // Güncellenmiş departmanla listeyi güncelle
                const updatedDepartments = departments.map(dept => 
                    dept.id === editingDepartment.id ? { ...dept, name: departmentName } : dept
                );
                dispatch(setDepartments(updatedDepartments));
            } else {
                // Yeni departman ekleme işlemi
                response = await departmentService.addDepartment(departmentName);
                console.log("API Yanıtı (Yeni Ekleme):", response);

                // Eğer response.data ile yeni departman bilgileri geliyorsa:
                const newDepartment = response.data || response; // Geriye dönen veri formatını kontrol et!

                // Yeni departmanı listeye ekle
                dispatch(setDepartments([...departments, newDepartment]));
            }
    
            handleClose();  // Modal'ı kapat
        } catch (err) {
            console.error("Departman işlemi sırasında hata oluştu:", err);
            setError("Departman işlemi sırasında bir hata oluştu.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{editingDepartment ? "Departman Düzenle" : "Departman Ekle"}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="departmentName">Departman Adı</label>
                        <input
                            type="text"
                            id="departmentName"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={handleClose}>İptal</button>
                        <button type="submit">{editingDepartment ? "Güncelle" : "Ekle"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditDepartmentModal;
