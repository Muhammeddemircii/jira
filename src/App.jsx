import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPages from './pages/ForgotPasswordPages';
import { setUser } from './store/slices/authSlice';
import './App.css';
import StaffPage from './pages/StaffPage';
import DepartmentPage from './pages/DepartmentPage';
import TaskTypePage from './pages/TaskTypePage';
import { store } from './store/store';
import ProfilePage from './pages/ProfilePage';
import AnnualLeavesPage from './pages/AnnualLeavesPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import CompaniesPage from './pages/CompaniesPage';
import DepartmentTasksPage from './pages/DepartmentTasksPage';
import PersonelTasksPage from './pages/PersonelTasksPage';
import OvertimePage from './pages/OvertimePage';
function AppContent() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    
  useEffect(() => {
    const userData = localStorage.getItem('user-data');
    if (userData) {
      dispatch(setUser(JSON.parse(userData)));
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/HomePage"
          element={<Navigate to="/" />}
        />
        <Route path="/ForgotPasswordPages" element={<ForgotPasswordPages />} />
        <Route path="/StaffPage" element={<StaffPage />} />
        <Route path="/DepartmentPage" element={<DepartmentPage />} />
        <Route path="/TaskTypePage" element={<TaskTypePage />} />
        <Route path="/ProfilePage" element={<ProfilePage />} />
        <Route path="/AnnualLeavesPage/:id" element={<AnnualLeavesPage />} />
        <Route path="/NotificationsPage" element={<NotificationsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/DepartmentTasksPage" element={<DepartmentTasksPage />} />
        <Route path="/PersonelTasksPage" element={<PersonelTasksPage />} />
        <Route path="/OvertimePage/:id" element={<OvertimePage />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;