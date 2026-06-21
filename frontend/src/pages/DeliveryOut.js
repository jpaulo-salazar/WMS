import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import './DeliveryOut.css';

const DeliveryOut = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [stagingAreas, setStagingAreas] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showStagingModal, setShowStagingModal] = useState(false);
    const [showReleaseModal, setShowReleaseModal] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [formData, setFormData] = useState({
        item_code: '',
        description: '',
        qty: '',
        item_category_id: '',
        so_number: '',
        customer_id: '',
        delivery_out_date: new Date().toISOString().slice(0, 16)
    });
    const [stagingData, setStagingData] = useState({
        staging_area_id: '',
        moved_at: new Date().toISOString().slice(0, 16)
    });
    const [releaseData, setReleaseData] = useState({
        release_date: new Date().toISOString().slice(0, 10),
        departure_time: new Date().toISOString().slice(0, 16)
    });

    useEffect(() => {
        fetchDeliveries();
        fetchCategories();
        fetchCustomers();
        fetchStagingAreas();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const response = await api.get('/delivery-out/');
            setDeliveries(response.data);
        } catch (error) {
            toast.error('Failed to fetch deliveries');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/master/categories');
            setCategories(response.data);
        } catch (error) { }
    };

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/master/customers');
            setCustomers(response.data);
        } catch (error) { }
    };

    const fetchStagingAreas = async () => {
        try {
            const response = await api.get('/master/staging-areas');
            setStagingAreas(response.data);
        } catch (error) { }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                qty: parseInt(formData.qty),
                item_category_id: parseInt(formData.item_category_id),
                customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
                delivery_out_date: formData.delivery_out_date || new Date().toISOString()
            };
            await api.post('/delivery-out/', payload);
            toast.success('Delivery out recorded');
            setShowCreateModal(false);
            setFormData({
                item_code: '',
                description: '',
                qty: '',
                item_category_id: '',
                so_number: '',
                customer_id: '',
                delivery_out_date: new Date().toISOString().slice(0, 16)
            });
            fetchDeliveries();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record delivery');
        }
    };

    const handleMoveToStaging = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/delivery-out/${selectedDelivery.id}/move-to-staging`, {
                staging_area_id: parseInt(stagingData.staging_area_id),
                moved_at: stagingData.moved_at || new Date().toISOString()
            });
            toast.success('Moved to staging area');
            setShowStagingModal(false);
            setSelectedDelivery(null);
            setStagingData({ staging_area_id: '', moved_at: new Date().toISOString().slice(0, 16) });
            fetchDeliveries();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to move to staging');
        }
    };

    const handleRelease = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/delivery-out/${selectedDelivery.id}/release`, {
                release_date: releaseData.release_date || new Date().toISOString(),
                departure_time: releaseData.departure_time || new Date().toISOString()
            });
            toast.success('Delivery released successfully');
            setShowReleaseModal(false);
            setSelectedDelivery(null);
            setReleaseData({ release_date: new Date().toISOString().slice(0, 10), departure_time: new Date().toISOString().slice(0, 16) });
            fetchDeliveries();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to release');
        }
    };

    const openStagingModal = (delivery) => {
        setSelectedDelivery(delivery);
        setShowStagingModal(true);
    };

    const openReleaseModal = (delivery) => {
        setSelectedDelivery(delivery);
        setShowReleaseModal(true);
    };

    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <h1>Delivery Out</h1>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                        + New Delivery Out
                    </button>
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <h3>Total Out</h3>
                        <p className="stat-value">{deliveries.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Pending</h3>
                        <p className="stat-value">{deliveries.filter(d => d.status === 'pending').length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>In Staging</h3>
                        <p className="stat-value">{deliveries.filter(d => d.status === 'staging').length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Released</h3>
                        <p className="stat-value">{deliveries.filter(d => d.status === 'released').length}</p>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Category</th>
                                <th>SO#</th>
                                <th>Customer</th>
                                <th>Staging Area</th>
                                <th>Date/Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map(d => (
                                <tr key={d.id}>
                                    <td><strong>{d.item_code}</strong></td>
                                    <td>{d.description}</td>
                                    <td>{d.qty}</td>
                                    <td>{d.item_category?.name}</td>
                                    <td>{d.so_number || '-'}</td>
                                    <td>{d.customer?.name || '-'}</td>
                                    <td>{d.staging_area?.name || '-'}</td>
                                    <td>{new Date(d.delivery_out_date).toLocaleString()}</td>
                                    <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                                    <td className="action-cell">
                                        {d.status === 'pending' && (
                                            <button onClick={() => openStagingModal(d)} className="btn-sm btn-staging">Move to Staging</button>
                                        )}
                                        {d.status === 'staging' && (
                                            <button onClick={() => openReleaseModal(d)} className="btn-sm btn-release">Release</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showCreateModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h2>Delivery Out</h2>
                                <button onClick={() => setShowCreateModal(false)} className="modal-close">&times;</button>
                            </div>
                            <form onSubmit={handleCreate}>
                                <div className="form-group">
                                    <label>Item Code *</label>
                                    <input type="text" value={formData.item_code} onChange={(e) => setFormData({ ...formData, item_code: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Description *</label>
                                    <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Quantity *</label>
                                        <input type="number" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} min="1" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Item Category *</label>
                                        <select value={formData.item_category_id} onChange={(e) => setFormData({ ...formData, item_category_id: e.target.value })} required>
                                            <option value="">Select Category</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>SO Number</label>
                                        <input type="text" value={formData.so_number} onChange={(e) => setFormData({ ...formData, so_number: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Transfer To / Sold To</label>
                                        <select value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}>
                                            <option value="">Select Customer</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Date & Time</label>
                                    <input type="datetime-local" value={formData.delivery_out_date} onChange={(e) => setFormData({ ...formData, delivery_out_date: e.target.value })} />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                                    <button type="submit" className="btn-primary">Record Delivery Out</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showStagingModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h2>Move to Staging Area</h2>
                                <button onClick={() => setShowStagingModal(false)} className="modal-close">&times;</button>
                            </div>
                            <form onSubmit={handleMoveToStaging}>
                                <div className="item-info">
                                    <p><strong>Item:</strong> {selectedDelivery?.item_code} - {selectedDelivery?.description}</p>
                                    <p><strong>Qty:</strong> {selectedDelivery?.qty}</p>
                                </div>
                                <div className="form-group">
                                    <label>Staging Area *</label>
                                    <div className="staging-grid">
                                        {stagingAreas.map(area => (
                                            <button
                                                key={area.id}
                                                type="button"
                                                className={`staging-btn ${stagingData.staging_area_id === String(area.id) ? 'selected' : ''}`}
                                                onClick={() => setStagingData({ ...stagingData, staging_area_id: String(area.id) })}
                                            >
                                                {area.name}
                                                <span className="staging-qty">Current: {area.current_qty}/{area.capacity}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Date & Time</label>
                                    <input type="datetime-local" value={stagingData.moved_at} onChange={(e) => setStagingData({ ...stagingData, moved_at: e.target.value })} />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowStagingModal(false)} className="btn-secondary">Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={!stagingData.staging_area_id}>Move to Staging</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showReleaseModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h2>Release Delivery</h2>
                                <button onClick={() => setShowReleaseModal(false)} className="modal-close">&times;</button>
                            </div>
                            <form onSubmit={handleRelease}>
                                <div className="item-info">
                                    <p><strong>Item:</strong> {selectedDelivery?.item_code} - {selectedDelivery?.description}</p>
                                    <p><strong>Qty:</strong> {selectedDelivery?.qty}</p>
                                    <p><strong>Staging:</strong> {selectedDelivery?.staging_area?.name}</p>
                                </div>
                                <div className="form-group">
                                    <label>Release Date</label>
                                    <input type="date" value={releaseData.release_date} onChange={(e) => setReleaseData({ ...releaseData, release_date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Departure Time</label>
                                    <input type="datetime-local" value={releaseData.departure_time} onChange={(e) => setReleaseData({ ...releaseData, departure_time: e.target.value })} />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowReleaseModal(false)} className="btn-secondary">Cancel</button>
                                    <button type="submit" className="btn-release-confirm">Confirm Release & Departure</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryOut;
