// inventory-management/src/DeadStock.js
import React, { useState, useEffect } from 'react';
import { Trash2, Monitor, Printer as PrinterIcon, ChevronRight, Download, Laptop, Server, Keyboard, Mouse, Projector, Cpu, Presentation, MousePointer2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from './api';

const DeadStock = () => {
    const navigate = useNavigate();
    const [deadStockDevices, setDeadStockDevices] = useState([]);
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLabId, setSelectedLabId] = useState('All');

    useEffect(() => {
        fetchDeadStockDevices();
        fetchLabs();
    }, []);

    const fetchLabs = async () => {
        try {
            const response = await api.get('/labs');
            setLabs(response.data);
        } catch (err) {
            console.error('Error fetching labs:', err);
        }
    };

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

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'desktop':
                return <Monitor size={14} />;
            case 'laptop':
                return <Laptop size={14} />;
            case 'printer':
                return <PrinterIcon size={14} />;
            case 'mouse':
                return <Mouse size={14} />;
            case 'keyboard':
                return <Keyboard size={14} />;
            case 'monitor':
                return <Monitor size={14} />;
            case 'server':
                return <Server size={14} />;
            case 'digital_board':
                return <Presentation size={14} />;
            case 'pointer':
                return <MousePointer2 size={14} />;
            case 'projector':
                return <Projector size={14} />;
            case 'cpu':
                return <Cpu size={14} />;
            default:
                return null;
        }
    };

    const filteredDisplayDevices = deadStockDevices.filter(device => {
        const matchesType = filterType === 'All' ? true : device.device_type === filterType;
        const matchesSearch = device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (device.configuration && device.configuration.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLab = selectedLabId === 'All' ? true : device.lab_id === parseInt(selectedLabId);
        return matchesType && matchesSearch && matchesLab;
    });

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
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[300px]">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Search size={18} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by device name or configuration..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
                                />
                            </div>
                        </div>
                        <select
                            value={selectedLabId}
                            onChange={(e) => setSelectedLabId(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700"
                        >
                            <option value="All">All Locations</option>
                            {labs.map(lab => (
                                <option key={lab.lab_id} value={lab.lab_id}>{lab.lab_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                        <span className="text-gray-700 font-medium">Type:</span>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'desktop', 'printer', 'laptop', 'mouse'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === type
                                            ? 'bg-blue-500 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                        <span className="ml-auto text-gray-600 text-sm">
                            Showing <span className="font-semibold text-gray-800">{filteredDisplayDevices.length}</span> items
                        </span>
                    </div>
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
                                            {getDeviceIcon(item.device_type)}
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
