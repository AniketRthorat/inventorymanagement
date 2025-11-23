// inventory-management/src/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Home, Monitor, Users, Printer, HardDrive, Download } from 'lucide-react';
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

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats
                const statsResponse = await api.get('/dashboard');
                setStats(statsResponse.data);

                // Fetch labs and devices to calculate computers by lab
                const [labsResponse, devicesResponse] = await Promise.all([
                    api.get('/labs'),
                    api.get('/devices'),
                ]);

                const labs = labsResponse.data;
                const devices = devicesResponse.data;

                const labCounts = labs.map(lab => {
                    const count = devices.filter(device => device.lab_id === lab.lab_id).length;
                    return { lab: lab.lab_name, count };
                });

                setComputersByLab(labCounts);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const summaryCards = [
        { label: 'Total Computers', value: stats.totalComputers, icon: Monitor, color: 'blue' },
        { label: 'Total Printers', value: stats.totalPrinters, icon: Printer, color: 'purple' },
        { label: 'Total Labs', value: stats.totalLabs, icon: HardDrive, color: 'green' },
        { label: 'Total Faculty', value: stats.totalFaculty, icon: Users, color: 'orange' }
    ];

    // Build the computersByStatus array from the stats object
    const computersByStatus = stats.computersByStatus ? [
        { status: 'Active', count: stats.computersByStatus.active || 0 },
        { status: 'Dead Stock', count: stats.computersByStatus.dead_stock || 0 },
    ] : [];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
                {summaryCards.map((card) => (
                    <div key={card.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
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
                            <div key={item.lab} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
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
                            <div key={item.status} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <span className="text-gray-700">{item.status}</span>
                                <span className={`font-semibold ${item.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
