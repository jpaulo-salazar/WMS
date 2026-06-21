import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import './DeliveryIn.css';

const DeliveryIn = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        item_code: '',
        description: '',
        qty: '',
        item_category_id: '',
        po_number: '',
        supplier_id: '',
        dr_number: '',
        delivery_date: new Date().toISOString().slice(0, 16)
    });

    useEffect(() => {
        fetchDeliveries();
        fetchCategories();
        fetchSuppliers();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const response = await api.get('/delivery-in/');
            setDeliveries(response.data);
        } catch (error) {
            toast.error('Failed to fetch deliveries');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/master/categories');
            setCategories(response.data);
        } catch (error) {
            toast.error('Failed to fetch categories');
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/master/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            toast.error('Failed to fetch suppliers');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                qty: parseInt(formData.qty),
                item_category_id: parseInt(formData.item_category_id),
                supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
                delivery_date: formData.delivery_date || new Date().toISOString()
            };
            await api.post('/delivery-in/', payload);
            toast.success('Delivery recorded successfully');
            setShowModal(false);
            setFormData({
                item_code: '',
                description: '',
                qty: '',
                item_category_id: '',
                po_number: '',
                supplier_id: '',
                dr_number: '',
                delivery_date: new Date().toISOString().slice(0, 16)
            });
            fetchDeliveries();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record delivery');
        }
    };

    const handleScan = () => {
        const itemCode = prompt('Scan or enter item code:');
        if (itemCode) {
            setFormData(prev => ({ ...prev, item_code: itemCode }));
            setShowModal(true);
        }
    };

    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <h1>Delivery In - Scanner</h1>
                    <div className="header-actions">
                        <button onClick={handleScan} className="btn-scan">
                            📷 Scan Item
                        </button>
                        <button onClick={() => setShowModal(true)} className="btn-primary">
                            + New Delivery
                        </button>
                    </div>
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <h3>Total Received</h3>
                        <p className="stat-value">{deliveries.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Pending Transfer</h3>
                        <p className="stat-value">{deliveries.filter(d => d.status === 'received').length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Transferred</h3>
                        <p className="stat-value">{deliveries.filter(d => d.status === 'transferred').length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Stored</h3>
                        <p className="stat-value">{deliveries.filter(d => d.status === 'stored').length}</p>
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
                                <th>PO#</th>
                                <th>Supplier</th>
                                <th>DR#</th>
                                <th>Date/Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map(d => (
                                <tr key={d.id}>
                                    <td><strong>{d.item_code}</strong></td>
                                    <td>{d.description}</td>
                                    <td>{d.qty}</td>
                                    <td>{d.item_category?.name}</td>
                                    <td>{d.po_number || '-'}</td>
                                    <td>{d.supplier?.name || '-'}</td>
                                    <td>{d.dr_number || '-'}</td>
                                    <td>{new Date(d.delivery_date).toLocaleString()}</td>
                                    <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h2>Record Delivery In</h2>
                                <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Item Code *</label>
                                    <input type="text" value={formData.item_code} onChange={(e) => setFormData({ ...formData, item_code: e.target.value })} placeholder="Scan or enter item code" required />
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
                                        <label>PO Number</label>
                                        <input type="text" value={formData.po_number} onChange={(e) => setFormData({ ...formData, po_number: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Supplier / DR</label>
                                        <select value={formData.supplier_id} onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}>
                                            <option value="">Select Supplier</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>DR Number</label>
                                        <input type="text" value={formData.dr_number} onChange={(e) => setFormData({ ...formData, dr_number: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Date & Time</label>
                                        <input type="datetime-local" value={formData.delivery_date} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                    <button type="submit" className="btn-primary">Record Delivery</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryIn;
