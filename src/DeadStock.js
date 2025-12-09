// inventory-management/src/DeadStock.js
import React, { useState, useEffect } from 'react';
import { Trash2, Monitor, Printer, ChevronRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from './api';

const DeadStock = () => {
    const navigate = useNavigate();
    const [deadStockDevices, setDeadStockDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('All'); // 'All', 'computer', 'printer', 'laptop'

    useEffect(() => {
        fetchDeadStockDevices();
    }, [filterType]);

    const fetchDeadStockDevices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/devices', { params: { status: 'dead_stock' } });
            setDeadStockDevices(response.data);
        } catch (err) {
            setError('Failed to fetch dead stock devices.');
            console.error('Error fetching dead stock devices:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDisplayDevices = deadStockDevices.filter(device =>
        filterType === 'All' ? true : device.device_type === filterType
    );

    if (loading) return <div>Loading dead stock...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-800 font-medium">Dead Stock</span>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Dead Stock Inventory</h2>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium">Filter by Type:</span>
                    {['All', 'computer', 'printer', 'laptop'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterType === type
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                    <span className="ml-auto text-gray-600">
                        Total Items: <span className="font-semibold text-gray-800">{filteredDisplayDevices.length}</span>
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Item Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Configuration</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Remark</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Invoice #</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date Added to Dead Stock</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Download Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDisplayDevices.length > 0 ? (
                            filteredDisplayDevices.map((item, index) => (
                                <tr key={item.device_id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-6 py-4 text-gray-800 font-medium">{item.device_name}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                                            {item.device_type === 'computer' || item.device_type === 'laptop' ? <Monitor size={14} /> : <Printer size={14} />}
                                            {item.device_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{item.configuration}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        <div style={{ maxHeight: '4rem', overflowY: 'auto', maxWidth: '15rem', overflowX: 'auto', wordWrap: 'break-word' }}>
                                            {item.remark || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{item.invoice_number}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{new Date(item.updated_at.replace(' ', 'T')).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/devices/${item.device_id}`)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.has_invoice_pdf ? (
                                            <a
                                                href={`${API_BASE_URL}devices/${item.device_id}/invoice`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                <Download size={14} />
                                                Invoice
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">Not available</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="py-12 text-center text-gray-600">
                                    <Trash2 size={48} className="text-gray-300 mx-auto mb-4" />
                                    No dead stock items found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DeadStock;
