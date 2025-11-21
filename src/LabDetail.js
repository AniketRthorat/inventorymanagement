// inventory-management/src/LabDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Monitor, Printer, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import api from './api';

const LabDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lab, setLab] = useState(null);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('computers'); // 'computers' or 'printers'

    useEffect(() => {
        fetchLabDetails();
        fetchLabDevices();
    }, [id]);

    const fetchLabDetails = async () => {
        try {
            const response = await api.get(`/labs/${id}`);
            setLab(response.data);
        } catch (err) {
            setError('Failed to fetch lab details.');
            console.error('Error fetching lab details:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLabDevices = async () => {
        try {
            // Assuming an API endpoint to get devices by lab_id
            const response = await api.get(`/devices?lab_id=${id}`);
            setDevices(response.data);
        } catch (err) {
            setError('Failed to fetch lab devices.');
            console.error('Error fetching lab devices:', err);
        }
    };

    const handleDeleteLab = async () => {
        if (window.confirm('Are you sure you want to delete this lab?')) {
            try {
                await api.delete(`/labs/${id}`);
                navigate('/labs'); // Redirect to labs list after deletion
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete lab.');
                console.error('Error deleting lab:', err);
            }
        }
    };

    if (loading) return <div>Loading lab details...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!lab) return <div>Lab not found.</div>;

    const labComputers = devices.filter(device => device.device_type === 'computer');
    const labPrinters = devices.filter(device => device.device_type === 'printer');

    const displayItems = activeTab === 'computers' ? labComputers : labPrinters;

    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/labs')}>Labs</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-800 font-medium">{lab.lab_name}</span>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">{lab.lab_name}</h2>
                    <p className="text-gray-600">{lab.location} (Capacity: {lab.capacity})</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <Edit2 size={18} />
                        Edit Lab
                    </button>
                    <button
                        onClick={handleDeleteLab}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Trash2 size={18} />
                        Delete Lab
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('computers')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'computers' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                    Computers ({labComputers.length})
                </button>
                <button
                    onClick={() => setActiveTab('printers')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'printers' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                    Printers ({labPrinters.length})
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {displayItems.length > 0 ? (
                    displayItems.map((item) => (
                        <div
                            key={item.device_id}
                            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                            onClick={() => navigate(`/devices/${item.device_id}`)} // Navigate to device detail page
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                                item.status === 'active' ? 'bg-green-50' : 'bg-orange-50'
                            }`}>
                                {item.device_type === 'computer' ? (
                                    <Monitor size={24} className={item.status === 'active' ? 'text-green-600' : 'text-orange-600'} />
                                ) : (
                                    <Printer size={24} className="text-purple-600" />
                                )}
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-1">{item.device_name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{item.configuration}</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                                {item.status}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="col-span-4 text-center py-8 text-gray-600">No devices found in this lab.</div>
                )}
            </div>
        </div>
    );
};

export default LabDetail;
