// inventory-management/src/HODCabin.js
import React, { useState, useEffect } from 'react';
import { Briefcase, Monitor, Printer, Package, ChevronRight, Download, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const HODCabin = () => {
    const navigate = useNavigate();
    const [hodDevices, setHodDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHodDevices();
    }, []);

    const fetchHodDevices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/devices'); // Fetch all devices
            // Filter for devices not assigned to any lab or faculty
            // This is a simplification; a real system might have a specific 'HOD' faculty_id or lab_id
            const filtered = response.data.filter(device => device.lab_id === null && device.faculty_id === null);
            setHodDevices(filtered);
        } catch (err) {
            setError('Failed to fetch HOD Cabin devices.');
            console.error('Error fetching HOD Cabin devices:', err);
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'computer':
                return <Monitor size={28} className="text-blue-600" />;
            case 'laptop':
                return <Monitor size={28} className="text-blue-600" />;
            case 'printer':
                return <Printer size={28} className="text-blue-600" />;
            default:
                return <Package size={28} className="text-blue-600" />;
        }
    };

    if (loading) return <div>Loading HOD Cabin inventory...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-800 font-medium">HOD Cabin</span>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">HOD Cabin Inventory</h2>
                    <p className="text-gray-600">Head of Department Office Equipment</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            <div className="space-y-4">
                {hodDevices.length > 0 ? (
                    hodDevices.map((item) => (
                        <div key={item.device_id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {getDeviceIcon(item.device_type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-semibold text-gray-800">{item.device_name}</h3>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                            {item.device_type}
                                        </span>
                                    </div>
                                    <p className="text-gray-600">{item.configuration}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/devices/${item.device_id}`)}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2">
                                        <Edit2 size={16} />
                                        View/Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-gray-600">
                        <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
                        No devices found in HOD Cabin.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HODCabin;
