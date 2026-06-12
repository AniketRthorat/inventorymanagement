import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Monitor, Laptop, Printer, Mouse, Keyboard, Smartphone, Cpu, Box, AlertCircle, MapPin, User, ChevronLeft } from 'lucide-react';
import api from './api';

const PublicDeviceDetail = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                // We use a separate public endpoint that doesn't require Auth
                const response = await api.get(`public/devices/${code}`);
                setDevice(response.data);
            } catch (err) {
                setError(err.response?.data || 'Failed to fetch device details. Please try again later.');
                console.error('Error fetching public device:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDevice();
    }, [code]);

    const getDeviceIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'desktop': return <Monitor className="w-12 h-12 text-blue-500" />;
            case 'laptop': return <Laptop className="w-12 h-12 text-blue-500" />;
            case 'printer': return <Printer className="w-12 h-12 text-blue-500" />;
            case 'mouse': return <Mouse className="w-12 h-12 text-blue-500" />;
            case 'keyboard': return <Keyboard className="w-12 h-12 text-blue-500" />;
            case 'cpu': return <Cpu className="w-12 h-12 text-blue-500" />;
            default: return <Box className="w-12 h-12 text-blue-500" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button 
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium shadow-sm hover:bg-blue-600 transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-blue-500 p-6 flex flex-col items-center text-white">
                    <div className="bg-white p-4 rounded-full shadow-inner mb-4">
                        {getDeviceIcon(device.device_type)}
                    </div>
                    <h1 className="text-2xl font-bold text-center">{device.device_name}</h1>
                    <span className="mt-1 px-3 py-1 bg-blue-400 bg-opacity-50 rounded-full text-sm font-medium">
                        {code}
                    </span>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Type</p>
                            <p className="text-gray-800 font-medium capitalize">{device.device_type}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-sm font-bold ${
                                device.status === 'active' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                                {device.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <MapPin className="text-blue-500 w-5 h-5" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                                <p className="text-gray-800 font-medium">{device.lab_name || 'Not Assigned'}</p>
                            </div>
                        </div>

                        {device.company && (
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <Box className="text-blue-500 w-5 h-5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Company</p>
                                    <p className="text-gray-800 font-medium">{device.company}</p>
                                </div>
                            </div>
                        )}

                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Specifications</p>
                            <div className="grid grid-cols-1 gap-y-2 text-sm text-gray-700">
                                {device.cpu && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">CPU</span>
                                        <span className="font-medium">{device.cpu}</span>
                                    </div>
                                )}
                                {device.ram && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">RAM</span>
                                        <span className="font-medium">{device.ram} GB</span>
                                    </div>
                                )}
                                {device.storage && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">Storage</span>
                                        <span className="font-medium">{device.storage} GB</span>
                                    </div>
                                )}
                                {device.display_size && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">Display Size</span>
                                        <span className="font-medium">{device.display_size} "</span>
                                    </div>
                                )}
                                {device.ip_generation && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">IP Generation</span>
                                        <span className="font-medium">{device.ip_generation}</span>
                                    </div>
                                )}
                                {device.last_maintenance_date && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">Last Maint.</span>
                                        <span className="font-medium">{device.last_maintenance_date}</span>
                                    </div>
                                )}
                                {device.invoice_number && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Invoice #</span>
                                        <span className="font-medium">{device.invoice_number}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => {
                                const subject = encodeURIComponent(`Issue Report: ${device.device_name} (${code})`);
                                const body = encodeURIComponent(`Device: ${device.device_name}\nTag: ${code}\nLocation: ${device.lab_name || 'N/A'}\n\nPlease describe the issue below:\n\n`);
                                window.location.href = `mailto:admin@sgiinstitute.in?subject=${subject}&body=${body}`;
                            }}
                            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100"
                        >
                            <AlertCircle size={18} />
                            Report an Issue
                        </button>
                    </div>
                </div>

                <div className="p-6 pt-0">
                    <p className="text-center text-xs text-gray-400 mb-4">
                        SGI Inventory Management System
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <ChevronLeft size={18} />
                        Back to System
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublicDeviceDetail;
