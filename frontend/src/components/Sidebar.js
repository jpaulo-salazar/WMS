import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>WMS</h2>
                <p className="company-name">CHERENZ GLOBAL MFG. INC.</p>
                <p className="user-info">{user?.full_name} ({user?.role})</p>
            </div>
            <nav className="sidebar-nav">
                <Link to="/dashboard" className={isActive('/dashboard')}>
                    <span className="nav-icon">📊</span> Dashboard
                </Link>
                <Link to="/delivery-in" className={isActive('/delivery-in')}>
                    <span className="nav-icon">📥</span> Delivery In
                </Link>
                <Link to="/transfers" className={isActive('/transfers')}>
                    <span className="nav-icon">🔄</span> Transfer
                </Link>
                <Link to="/delivery-out" className={isActive('/delivery-out')}>
                    <span className="nav-icon">📤</span> Delivery Out
                </Link>
                {isAdmin() && (
                    <Link to="/users" className={isActive('/users')}>
                        <span className="nav-icon">👥</span> Users
                    </Link>
                )}
            </nav>
            <div className="sidebar-footer">
                <button onClick={logout} className="logout-btn">Logout</button>
            </div>
        </div>
    );
};

export default Sidebar;
