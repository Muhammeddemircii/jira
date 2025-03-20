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
import { store } from './store/store';
import ProfilePage from './pages/ProfilePage';

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
        <Route path="/ProfilePage" element={<ProfilePage />} />
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