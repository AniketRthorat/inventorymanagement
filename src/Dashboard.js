// inventory-management/src/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Users, Printer, HardDrive, X, Cpu, Presentation, MousePointer2, Projector as ProjectorIcon } from 'lucide-react'; // Import X for close button
import api from './api'; // Import the API client

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalLabs: 0,
        totalFaculty: 0,
        totalDevices: 0,
        totalComputers: 0,
        totalPrinters: 0,
        computersByStatus: {}, // Initialize with an empty object
    });
    const [computersByLab, setComputersByLab] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            console.log('Fetching dashboard data...');
            try {
                // Fetch stats
                const statsResponse = await api.get('/dashboard');
                setStats(statsResponse.data);
                console.log('Dashboard stats fetched:', statsResponse.data);

                // Fetch labs and devices to calculate computers by lab
                const [labsResponse, devicesResponse] = await Promise.all([
                    api.get('/labs'),
                    api.get('/devices'), // Fetch all devices, then filter
                ]);
                console.log('Labs fetched:', labsResponse.data);
                console.log('Devices fetched:', devicesResponse.data);

                const labs = labsResponse.data;
                const devices = devicesResponse.data;

                const labCounts = labs.map(lab => {
                    const count = devices.filter(device => device.lab_id === lab.lab_id).length;
                    return { lab: lab.lab_name, count, lab_id: lab.lab_id }; // Add lab_id
                });

                setComputersByLab(labCounts);
                console.log('Computers by lab calculated:', labCounts);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
                console.log('Dashboard loading state set to false.');
            }
        };

        fetchDashboardData();
    }, []);

    const handleCardClick = useCallback(async (type, filter = {}) => {
        setModalLoading(true);
        setModalError(null);
        setModalContent([]);
        try {
            let response;
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
                    items = apiResponse.data;
                    break;
                case 'totalPrinters':
                    title = 'All Printers';
                    apiResponse = await api.get('/devices', { params: { device_type: 'printer' } });
                    items = apiResponse.data;
                    break;
                case 'totalDigitalBoards':
                    title = 'All Digital Boards';
                    apiResponse = await api.get('/devices', { params: { device_type: 'digital_board' } });
                    items = apiResponse.data;
                    break;
                case 'totalPointers':
                    title = 'All Pointers';
                    apiResponse = await api.get('/devices', { params: { device_type: 'pointer' } });
                    items = apiResponse.data;
                    break;
                case 'totalProjectors':
                    title = 'All Projectors';
                    apiResponse = await api.get('/devices', { params: { device_type: 'projector' } });
                    items = apiResponse.data;
                    break;
                case 'totalCPUs':
                    title = 'All CPUs';
                    apiResponse = await api.get('/devices', { params: { device_type: 'cpu' } });
                    items = apiResponse.data;
                    break;
                case 'totalLabs':
                    title = 'All Labs';
                    response = await api.get('/labs'); // labs endpoint doesn't return debug info
                    items = response.data;
                    break;
                case 'totalFaculty':
                    title = 'All Faculty';
                    response = await api.get('/faculty'); // faculty endpoint doesn't return debug info
                    items = response.data;
                    break;
                case 'systems_by_lab': // Special case for Systems by Lab click
                    title = `Devices in ${filter.lab_name}`;
                    apiResponse = await api.get('/devices', { params: { lab_id: filter.lab_id } });
                    items = apiResponse.data;
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

            setModalTitle(title);
            setModalContent(items);
            setIsModalOpen(true);
        } catch (err) {
            setModalError('Failed to fetch details.');
            console.error('Error fetching modal details:', err);
        } finally {
            setModalLoading(false);
        }
    }, []); // Consider adding api to dependency array if it changes

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const summaryCards = [
        { label: 'Total Computers', value: stats.totalComputers, icon: Monitor, color: 'blue', type: 'totalComputers' },
        { label: 'Total Printers', value: stats.totalPrinters, icon: Printer, color: 'purple', type: 'totalPrinters' },
        { label: 'Total Digital Boards', value: stats.totalDigitalBoards, icon: Presentation, color: 'pink', type: 'totalDigitalBoards' },
        { label: 'Total Pointers', value: stats.totalPointers, icon: MousePointer2, color: 'red', type: 'totalPointers' },
        { label: 'Total Projectors', value: stats.totalProjectors, icon: ProjectorIcon, color: 'yellow', type: 'totalProjectors' },
        { label: 'Total CPUs', value: stats.totalCPUs, icon: Cpu, color: 'teal', type: 'totalCPUs' },
        { label: 'Total Labs', value: stats.totalLabs, icon: HardDrive, color: 'green', type: 'totalLabs' }
    ];

    // Build the computersByStatus array from the stats object
    const computersByStatus = stats.computersByStatus ? [
        { status: 'Active', count: stats.computersByStatus.active || 0, type: 'systems_by_status' },
        { status: 'Dead Stock', count: stats.computersByStatus.dead_stock || 0, type: 'systems_by_status' },
    ] : [];

    // Helper to render modal content based on type
    const renderModalContent = (type, items) => {
        if (!items || items.length === 0) return <p>No items to display.</p>;

        switch (type) {
            case 'totalComputers':
            case 'totalPrinters':
            case 'totalDigitalBoards': // Add this case
            case 'totalPointers':    // Add this case
            case 'totalProjectors':  // Add this case
            case 'totalCPUs':        // Add this case
            case 'systems_by_lab':
            case 'systems_by_status':
                return (
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Location</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.device_id} className="border-b border-gray-200">
                                    <td className="px-4 py-2">{item.device_name}</td>
                                    <td className="px-4 py-2">{item.device_type}</td>
                                    <td className="px-4 py-2">{item.lab_location || 'N/A'}</td>
                                    <td className="px-4 py-2">{item.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'totalLabs':
                return (
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2">Lab Name</th>
                                <th className="px-4 py-2">Location</th>
                                <th className="px-4 py-2">Capacity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.lab_id} className="border-b border-gray-200">
                                    <td className="px-4 py-2">{item.lab_name}</td>
                                    <td className="px-4 py-2">{item.location || 'N/A'}</td>
                                    <td className="px-4 py-2">{item.capacity || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'totalFaculty':
                return (
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.faculty_id} className="border-b border-gray-200">
                                    <td className="px-4 py-2">{item.faculty_name}</td>
                                    <td className="px-4 py-2">{item.email}</td>
                                    <td className="px-4 py-2">{item.department || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default:
                return <p>Unknown content type.</p>;
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
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

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Systems by Lab</h3>
                    <div className="space-y-3">
                        {computersByLab.map((item) => (
                            <div
                                key={item.lab}
                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleCardClick('systems_by_lab', { lab_id: item.lab_id })} // lab_id not directly in item
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-1/2 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">{modalTitle}</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        {modalLoading && <p>Loading...</p>}
                        {modalError && <p style={{ color: 'red' }}>{modalError}</p>}
                        {!modalLoading && !modalError && (
                            renderModalContent(
                                modalTitle.includes('Computers') || modalTitle.includes('Printers') || modalTitle.includes('Digital Boards') || modalTitle.includes('Pointers') || modalTitle.includes('Projectors') || modalTitle.includes('CPUs') || modalTitle.startsWith('Devices in') || modalTitle.startsWith('Computers:')
                                ? 'totalComputers' // All these types render a device table
                                : (modalTitle === 'All Labs' ? 'totalLabs' : 'totalFaculty'), // Other types render specific tables
                                modalContent
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
