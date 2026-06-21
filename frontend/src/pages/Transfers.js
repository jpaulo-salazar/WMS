import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import './Transfers.css';

const Transfers = () => {
    const [transfers, setTransfers] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [bins, setBins] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [transferType, setTransferType] = useState('bin');
    const [formData, setFormData] = useState({
        delivery_in_id: '',
        from_bin_id: '',
        to_bin_id: '',
        from_aisle: '',
        to_aisle: '',
        qty: ''
    });

    useEffect(() => {
        fetchTransfers();
        fetchDeliveries();
        fetchBins();
    }, []);

    const fetchTransfers = async () => {
        try {
            const response = await api.get('/transfers/');
            setTransfers(response.data);
        } catch (error) {
            toast.error('Failed to fetch transfers');
        }
    };

    const fetchDeliveries = async () => {
        try {
            const response = await api.get('/delivery-in/');
            setDeliveries(response.data.filter(d => d.status === 'received' || d.status === 'transferred'));
        } catch (error) {
            toast.error('Failed to fetch deliveries');
        }
    };

    const fetchBins = async () => {
        try {
            const response = await api.get('/master/bins');
            setBins(response.data);
        } catch (error) {
            toast.error('Failed to fetch bins');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                delivery_in_id: parseInt(formData.delivery_in_id),
                transfer_type: transferType,
                from_bin_id: formData.from_bin_id ? parseInt(formData.from_bin_id) : null,
                to_bin_id: parseInt(formData.to_bin_id),
                from_aisle: formData.from_aisle || null,
                to_aisle: formData.to_aisle || null,
                qty: parseInt(formData.qty)
            };
            await api.post('/transfers/', payload);
            toast.success('Transfer completed successfully');
            setShowModal(false);
            setFormData({ delivery_in_id: '', from_bin_id: '', to_bin_id: '', from_aisle: '', to_aisle: '', qty: '' });
            fetchTransfers();
            fetchDeliveries();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete transfer');
        }
    };

    const selectedDelivery = deliveries.find(d => d.id === parseInt(formData.delivery_in_id));

    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <h1>Transfer To - Bin / Aisle</h1>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        + New Transfer
                    </button>
                </div>

                <div className="transfer-type-selector">
                    <button className={`type-btn ${transferType === 'bin' ? 'active' : ''}`} onClick={() => setTransferType('bin')}>
                        Transfer to Bin
                    </button>
                    <button className={`type-btn ${transferType === 'aisle' ? 'active' : ''}`} onClick={() => setTransferType('aisle')}>
                        Aisle to Bin
                    </button>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Transfer Type</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Qty</th>
                                <th>Transferred By</th>
                                <th>Date/Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map(t => (
                                <tr key={t.id}>
                                    <td><strong>{t.delivery_in?.item_code}</strong></td>
                                    <td><span className={`badge badge-${t.transfer_type}`}>{t.transfer_type}</span></td>
                                    <td>{t.from_bin?.bin_number || t.from_aisle || '-'}</td>
                                    <td>{t.to_bin?.bin_number || t.to_aisle || '-'}</td>
                                    <td>{t.qty}</td>
                                    <td>{t.transfer_user?.full_name || '-'}</td>
                                    <td>{new Date(t.transfer_date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h2>New Transfer</h2>
                                <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Select Delivery Item *</label>
                                    <select value={formData.delivery_in_id} onChange={(e) => setFormData({ ...formData, delivery_in_id: e.target.value })} required>
                                        <option value="">Select Item</option>
                                        {deliveries.map(d => (
                                            <option key={d.id} value={d.id}>{d.item_code} - {d.description} (Qty: {d.qty})</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedDelivery && (
                                    <div className="item-info">
                                        <p><strong>Item:</strong> {selectedDelivery.item_code} - {selectedDelivery.description}</p>
                                        <p><strong>Available Qty:</strong> {selectedDelivery.qty}</p>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Quantity *</label>
                                    <input type="number" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} min="1" required />
                                </div>

                                {transferType === 'bin' && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>From Bin</label>
                                            <select value={formData.from_bin_id} onChange={(e) => setFormData({ ...formData, from_bin_id: e.target.value })}>
                                                <option value="">Select Source Bin</option>
                                                {bins.map(b => (
                                                    <option key={b.id} value={b.id}>{b.bin_number} (Aisle: {b.aisle})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>To Bin *</label>
                                            <select value={formData.to_bin_id} onChange={(e) => setFormData({ ...formData, to_bin_id: e.target.value })} required>
                                                <option value="">Select Destination Bin</option>
                                                {bins.map(b => (
                                                    <option key={b.id} value={b.id}>{b.bin_number} (Aisle: {b.aisle})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {transferType === 'aisle' && (
                                    <>
                                        <div className="form-group">
                                            <label>From Aisle</label>
                                            <input type="text" value={formData.from_aisle} onChange={(e) => setFormData({ ...formData, from_aisle: e.target.value })} placeholder="Enter source aisle" />
                                        </div>
                                        <div className="form-group">
                                            <label>Transfer to Bin Number *</label>
                                            <select value={formData.to_bin_id} onChange={(e) => setFormData({ ...formData, to_bin_id: e.target.value })} required>
                                                <option value="">Select Destination Bin</option>
                                                {bins.map(b => (
                                                    <option key={b.id} value={b.id}>{b.bin_number} (Aisle: {b.aisle})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                    <button type="submit" className="btn-primary">Complete Transfer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transfers;
