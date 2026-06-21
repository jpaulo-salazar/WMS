import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        deliveryIn: 0,
        deliveryOut: 0,
        transfers: 0,
        pendingStaging: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [inRes, outRes] = await Promise.all([
                    api.get('/delivery-in/'),
                    api.get('/delivery-out/')
                ]);
                setStats({
                    deliveryIn: inRes.data.length,
                    deliveryOut: outRes.data.length,
                    transfers: 0,
                    pendingStaging: outRes.data.filter(d => d.status === 'staging').length
                });
            } catch (error) { }
        };
        fetchStats();
    }, []);

    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <h1>Dashboard</h1>
                </div>
                <div className="dashboard-grid">
                    <div className="dash-card dash-blue">
                        <div className="dash-icon">📥</div>
                        <div className="dash-info">
                            <h3>{stats.deliveryIn}</h3>
                            <p>Delivery In</p>
                        </div>
                    </div>
                    <div className="dash-card dash-green">
                        <div className="dash-icon">📤</div>
                        <div className="dash-info">
                            <h3>{stats.deliveryOut}</h3>
                            <p>Delivery Out</p>
                        </div>
                    </div>
                    <div className="dash-card dash-purple">
                        <div className="dash-icon">📦</div>
                        <div className="dash-info">
                            <h3>{stats.pendingStaging}</h3>
                            <p>In Staging</p>
                        </div>
                    </div>
                    <div className="dash-card dash-orange">
                        <div className="dash-icon">🔄</div>
                        <div className="dash-info">
                            <h3>{stats.transfers}</h3>
                            <p>Transfers</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
