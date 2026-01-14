// inventory-management/src/LabDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Monitor, Printer as PrinterIcon, ChevronRight, Edit2, Trash2, Laptop, Server, Keyboard, Mouse, Projector, Cpu, Presentation, MousePointer2, MonitorDot, Plus, Mic, Usb, Cable, ScanLine, Plug, Router, Network, HardDrive, Webcam } from 'lucide-react';
import api from './api';

const LabDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lab, setLab] = useState(null);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('desktops'); // Default to desktops

    const fetchLabDetails = useCallback(async () => {
        try {
            const response = await api.get(`/labs/${id}`);
            setLab(response.data);
        } catch (err) {
            setError('Failed to fetch lab details.');
            console.error('Error fetching lab details:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchLabDevices = useCallback(async () => {
        try {
            // Assuming an API endpoint to get devices by lab_id
            const response = await api.get(`/devices?lab_id=${id}`);
            setDevices(response.data);
        } catch (err) {
            setError('Failed to fetch lab devices.');
            console.error('Error fetching lab devices:', err);
        }
    }, [id]);

    useEffect(() => {
        fetchLabDetails();
        fetchLabDevices();
    }, [id, fetchLabDetails, fetchLabDevices]);

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

    // Create more granular categories for devices
    const labDesktops = devices.filter(device => device.device_type === 'desktop');
    const labLaptops = devices.filter(device => device.device_type === 'laptop');
    const labServers = devices.filter(device => device.device_type === 'server');
    const labMonitors = devices.filter(device => device.device_type === 'monitor');
    const labPrinters = devices.filter(device => device.device_type === 'printer');
    const labPeripherals = devices.filter(device => ['mouse', 'keyboard'].includes(device.device_type));
    const labProjectors = devices.filter(device => device.device_type === 'projector');
    const labDigitalBoards = devices.filter(device => device.device_type === 'digital_board');
    const labPointers = devices.filter(device => device.device_type === 'pointer');

    const labCpus = devices.filter(device => device.device_type === 'cpu');
    const labNetworking = devices.filter(device => ['router', 'switch', 'lan_cable'].includes(device.device_type));
    const labStorage = devices.filter(device => ['pendrive', 'hard_disk', 'ssd'].includes(device.device_type));
    const labAudioVideo = devices.filter(device => ['collar_mic', 'webcam'].includes(device.device_type));
    const labAccessories = devices.filter(device => ['hdmi_cable', 'extension_board'].includes(device.device_type));
    const labScanners = devices.filter(device => device.device_type === 'scanner');

    const deviceCategories = [
        { key: 'desktops', label: 'Desktops', items: labDesktops },
        { key: 'laptops', label: 'Laptops', items: labLaptops },
        { key: 'servers', label: 'Servers', items: labServers },
        { key: 'monitors', label: 'Monitors', items: labMonitors },
        { key: 'printers', label: 'Printers', items: labPrinters },
        { key: 'peripherals', label: 'Peripherals', items: labPeripherals },
        { key: 'projectors', label: 'Projectors', items: labProjectors },
        { key: 'digital_boards', label: 'Digital Boards', items: labDigitalBoards },
        { key: 'pointers', label: 'Pointers', items: labPointers },
        { key: 'cpus', label: 'CPUs', items: labCpus },
        { key: 'networking', label: 'Networking', items: labNetworking },
        { key: 'storage', label: 'Storage', items: labStorage },
        { key: 'audio_video', label: 'Audio/Video', items: labAudioVideo },
        { key: 'accessories', label: 'Accessories', items: labAccessories },
        { key: 'scanners', label: 'Scanners', items: labScanners },
    ];

    const totalDevices = devices.length;
    const displayItems = deviceCategories.find(cat => cat.key === activeTab)?.items || [];

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'desktop':
                return <MonitorDot size={24} />;
            case 'laptop':
                return <Laptop size={24} />;
            case 'printer':
                return <PrinterIcon size={24} />;
            case 'mouse':
                return <Mouse size={24} />;
            case 'keyboard':
                return <Keyboard size={24} />;
            case 'monitor':
                return <Monitor size={24} />;
            case 'server':
                return <Server size={24} />;
            case 'digital_board':
                return <Presentation size={24} />;
            case 'pointer':
                return <MousePointer2 size={24} />;
            case 'projector':
                return <Projector size={24} />;
            case 'cpu':
                return <Cpu size={24} />;
            case 'collar_mic':
                return <Mic size={24} />;
            case 'pendrive':
                return <Usb size={24} />;
            case 'hdmi_cable':
            case 'lan_cable':
                return <Cable size={24} />;
            case 'scanner':
                return <ScanLine size={24} />;
            case 'extension_board':
                return <Plug size={24} />;
            case 'router':
                return <Router size={24} />;
            case 'switch':
                return <Network size={24} />;
            case 'hard_disk':
            case 'ssd':
                return <HardDrive size={24} />;
            case 'webcam':
                return <Webcam size={24} />;
            default:
                return null;
        }
    };

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
                    <button
                        onClick={() => navigate(`/devices/add?labId=${id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        <Plus size={18} />
                        Add Device
                    </button>
                    <button
                        onClick={() => navigate(`/labs/${id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
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

            {totalDevices > 0 ? (
                <>
                    <div className="flex gap-4 mb-6 border-b border-gray-200">
                        {deviceCategories.map(cat => (
                            cat.items.length > 0 && (
                                <button
                                    key={cat.key}
                                    onClick={() => setActiveTab(cat.key)}
                                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === cat.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                                        }`}>
                                    {cat.label} ({cat.items.length})
                                </button>
                            )
                        ))}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {displayItems.length > 0 ? (
                            displayItems.map((item) => (
                                <div
                                    key={item.device_id}
                                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => navigate(`/devices/${item.device_id}`, { state: { from: `/labs/${id}`, label: lab.lab_name } })} // Navigate to device detail page with state
                                >
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${item.status === 'active' ? 'bg-green-50' : 'bg-orange-50'
                                        }`}>
                                        {getDeviceIcon(item.device_type)}
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-1">{item.device_name}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{item.configuration}</p>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-4 text-center py-8 text-gray-600">No devices of this type found in this lab.</div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-gray-600">
                    <p>No devices found in this lab.</p>
                </div>
            )}
        </div>
    );
};

export default LabDetail;