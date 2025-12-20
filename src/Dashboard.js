import React, { useState, useEffect, useCallback } from 'react';
import { Printer, Cpu, Presentation, MousePointer2, Projector as ProjectorIcon, Mouse, Keyboard, MonitorDot } from 'lucide-react'; // Import X for close button
import api from './api'; // Import the API client
import InfoModal from './InfoModal';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalLabs: 0,
        totalFaculty: 0,
        totalDevices: 0,
        totalComputers: 0,
        totalPrinters: 0,
        totalMice: 0,
        totalKeyboards: 0,
        computersByStatus: {}, // Initialize with an empty object
    });
    const [devicesByLab, setDevicesByLab] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', items: [] });


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all dashboard stats
                const statsResponse = await api.get('/dashboard');
                const data = statsResponse.data;
                setStats(data);
                setDevicesByLab(data.devicesByLab || []);

            } catch (err) {
                window.alert('Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleCardClick = useCallback(async (type, filter = {}) => {
        try {
            let title = '';
            let apiResponse; // To hold the full response object
            let items = [];

            switch (type) {
                case 'totalComputers':
                    title = 'All Computers';
                    apiResponse = await api.get('/devices', {
                        params: {
                            device_type: ['laptop', 'desktop', 'server', 'monitor'],
                        }
                    });
                    items = apiResponse.data.filter(item => item.status === 'active');
                    break;
                case 'totalPrinters':
                    title = 'All Printers';
                    apiResponse = await api.get('/devices', { params: { device_type: 'printer' } });
                    items = apiResponse.data.filter(item => item.status === 'active');
                    break;
                case 'totalDigitalBoards':
                    title = 'All Digital Boards';
                    apiResponse = await api.get('/devices', { params: { device_type: 'digital_board' } });
                    items = apiResponse.data.filter(item => item.status === 'active');
                    break;
                case 'totalPointers':
                    title = 'All Pointers';
                    apiResponse = await api.get('/devices', { params: { device_type: 'pointer' } });
                    items = apiResponse.data.filter(item => item.status === 'active');
                    break;
                case 'totalProjectors':
                    title = 'All Projectors';
                    apiResponse = await api.get('/devices', { params: { device_type: 'projector' } });
                    items = apiResponse.data.filter(item => item.status === 'active');
                    break;
                case 'totalCPUs':
                    title = 'All CPUs';
                    apiResponse = await api.get('/devices', { params: { device_type: 'cpu' } });
                    items = apiResponse.data.filter(item => item.status === 'active');
                    break;
                case 'totalMice':
                    title = 'All Mice';
                    apiResponse = await api.get('/devices', { params: { device_type: 'mouse' } });
                    items = apiResponse.data.filter(item => item.status === 'active');
                    break;
                case 'totalKeyboards':
                    title = 'All Keyboards';
                    apiResponse = await api.get('/devices', { params: { device_type: 'keyboard' } });
                    items = apiResponse.data.filter(item => item.status === 'active');
                    break;
                case 'totalFaculty':
                    title = 'All Faculty';
                    apiResponse = await api.get('/faculty'); // faculty endpoint doesn't return debug info
                    items = apiResponse.data;
                    break;
                case 'devices_by_lab':
                    title = `Devices in ${filter.lab_name}`;
                    apiResponse = await api.get('/devices', { params: { lab_id: filter.lab_id } });
                    items = apiResponse.data.filter(item => item.status === 'active');
                    break;
                case 'systems_by_status': // Special case for Systems by Status click
                    title = `Computers: ${filter.status}`;
                    apiResponse = await api.get('/devices', {
                        params: {
                            device_type: ['laptop', 'desktop', 'server', 'monitor'],
                            status: filter.status === 'Active' ? 'active' : 'dead_stock',
                        }
                    });
                    items = apiResponse.data;
                    break;
                default:
                    title = 'Details';
                    items = [];
            }
            setModalContent({ title, items });
            setModalVisible(true);
        } catch (err) {
            window.alert('Failed to fetch details.');
        }
    }, []); // Consider adding api to dependency array if it changes

    const handleCloseModal = () => {
        setModalVisible(false);
        setModalContent({ title: '', items: [] });
    };

    if (loading) return <div>Loading dashboard...</div>;

    const summaryCards = [
        { label: 'Total Computers', value: stats.totalComputers, icon: MonitorDot, color: 'blue', type: 'totalComputers' },
        { label: 'Total Printers', value: stats.totalPrinters, icon: Printer, color: 'purple', type: 'totalPrinters' },
        { label: 'Total Digital Boards', value: stats.totalDigitalBoards, icon: Presentation, color: 'pink', type: 'totalDigitalBoards' },
        { label: 'Total Pointers', value: stats.totalPointers, icon: MousePointer2, color: 'red', type: 'totalPointers' },
        { label: 'Total Projectors', value: stats.totalProjectors, icon: ProjectorIcon, color: 'yellow', type: 'totalProjectors' },
        { label: 'Total CPUs', value: stats.totalCPUs, icon: Cpu, color: 'teal', type: 'totalCPUs' },
        { label: 'Total Mice', value: stats.totalMice, icon: Mouse, color: 'orange', type: 'totalMice' },
        { label: 'Total Keyboards', value: stats.totalKeyboards, icon: Keyboard, color: 'indigo', type: 'totalKeyboards' }
    ];

    // Build the computersByStatus array from the stats object
    const computersByStatus = stats.computersByStatus ? [
        { status: 'Active', count: stats.computersByStatus.active || 0, type: 'systems_by_status' },
        { status: 'Dead Stock', count: stats.computersByStatus.dead_stock || 0, type: 'systems_by_status' },
    ] : [];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {summaryCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleCardClick(card.type)}
                    >
                        <div className={`w-12 h-12 bg-${card.color}-50 rounded-lg flex items-center justify-center mb-4`}>
                            <card.icon size={24} className={`text-${card.color}-500`} />
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">{card.value}</div>
                        <div className="text-sm text-gray-600">{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Devices by Lab</h3>
                    <div className="space-y-3">
                        {devicesByLab.map((item) => (
                            <div
                                key={item.lab}
                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleCardClick('devices_by_lab', { lab_id: item.lab_id, lab_name: item.lab })}
                            >
                                <span className="text-gray-700">{item.lab}</span>
                                <span className="font-semibold text-blue-600">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Systems by Status</h3>
                    <div className="space-y-3">
                        {computersByStatus.map((item) => (
                            <div
                                key={item.status}
                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleCardClick('systems_by_status', { status: item.status })}
                            >
                                <span className="text-gray-700">{item.status}</span>
                                <span className={`font-semibold ${item.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {modalVisible && (
                <InfoModal
                    title={modalContent.title}
                    items={modalContent.items}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default Dashboard;