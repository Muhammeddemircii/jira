import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { departmentService } from '../axios/axios';
import { setDepartments } from '../store/departmentSlice';

function AddDepartment() {
    const dispatch = useDispatch();
    const { departments } = useSelector(state => state.departments);
    const [departmentName, setDepartmentName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!departmentName.trim()) {
            setError('Departman adı boş olamaz.');
            return;
        }

        try {
            const newDepartment = await departmentService.createDepartment({ name: departmentName });
            dispatch(setDepartments([...departments, newDepartment]));
            setDepartmentName('');
            setError('');
        } catch (err) {
            setError('Departman eklenirken bir hata oluştu.');
        }
    };

    return (
        <div className="add-department">
            <h2>Yeni Departman Ekle</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="newDepartmentName">Departman Adı</label>
                    <input
                        type="text"
                        id="newDepartmentName"
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Ekle</button>
            </form>
        </div>
    );
}

export default AddDepartment;