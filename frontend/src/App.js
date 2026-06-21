import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import DeliveryIn from './pages/DeliveryIn';
import Transfers from './pages/Transfers';
import DeliveryOut from './pages/DeliveryOut';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/delivery-in" element={<ProtectedRoute><DeliveryIn /></ProtectedRoute>} />
            <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
            <Route path="/delivery-out" element={<ProtectedRoute><DeliveryOut /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
                <ToastContainer position="top-right" autoClose={3000} />
            </Router>
        </AuthProvider>
    );
}

export default App;
