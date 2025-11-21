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
        totalDeadStock: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await api.get('/dashboard');
                setStats(response.data);
            } catch (err) {
                setError('Failed to fetch dashboard statistics.');
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const summaryCards = [
        { label: 'Total Computers', value: stats.totalComputers, icon: Monitor, color: 'blue' },
        { label: 'Total Printers', value: stats.totalPrinters, icon: Printer, color: 'purple' },
        { label: 'Total Labs', value: stats.totalLabs, icon: HardDrive, color: 'green' },
        { label: 'Total Faculty', value: stats.totalFaculty, icon: Users, color: 'orange' }
    ];

    // Placeholder for actual data from backend for charts/graphs
    // These will need to be fetched from the backend as well, or derived from other data
    const computersByLab = [
        { lab: 'Data Science Lab', count: 30 },
        { lab: 'Programming Lab 1', count: 25 },
        { lab: 'Programming Lab 2', count: 25 },
        { lab: 'Network Lab', count: 20 }
    ];

    const computersByStatus = [
        { status: 'Active', count: stats.totalComputers - stats.totalDeadStock },
        { status: 'Dead Stock', count: stats.totalDeadStock }
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Download size={18} />
                    Print Report
                </button>
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
