import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { departmentService } from '../axios/axios';
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { ImProfile } from "react-icons/im";
import { setDepartments, setError, setLoading, setEditingDepartment, setEditModalOpen } from '../store/slices/departmanSlice';
import EditDepartmentModal from './EditDepartmentModal';
import '../styles/DepartmentTable.css';

function DepartmentTable() {
    const dispatch = useDispatch();
    const { departments, error } = useSelector(state => state.departments);

    useEffect(() => {
        const fetchDepartman = async () => {
            try {
                dispatch(setLoading(true));
                const response = await departmentService.getDepartments();
                console.log("API Yanıtı:", response);
                if (Array.isArray(response) && response.length > 0) {
                    dispatch(setDepartments(response));
                } else {
                    dispatch(setError('Departman verileri düzgün yüklenmedi.'));
                }
            } catch (err) {
                dispatch(setError('Departman verileri yüklenirken hata oluştu.'));
            } finally {
                dispatch(setLoading(false));
            }
        };
        fetchDepartman();
    }, [dispatch]);

    const handleEdit = (department) => {
        console.log("Düzenleme butonuna basıldı:", department);
        dispatch(setEditingDepartment(department));
        dispatch(setEditModalOpen(true));
    };

    return (
        <div className='departments'>
            <div className='department-table'>
                <p>Departmanlar ({departments.length})</p>
                <hr />
                <table style={{ width: '100%', height: '290px', borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Departman adı</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments && departments.length > 0 ? (
                            departments.slice().reverse().map((dept, index) => {
                                if (!dept || !dept.name) { 
                                    return null;
                                }
                                return (
                                    <tr key={dept.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                                        <td>{index + 1}</td>
                                        <td>{dept.name}</td>
                                        <td>
                                            <span className='icon-container-edit' onClick={() => handleEdit(dept)}>
                                                <FaRegEdit />
                                            </span>
                                            <span className='icon-container-delete'>
                                                <MdDeleteForever />
                                            </span>
                                            <span className='icon-container-profile'>
                                                <ImProfile />
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="3">Departman bulunamadı.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <EditDepartmentModal />
        </div>
    );
}

export default DepartmentTable;
