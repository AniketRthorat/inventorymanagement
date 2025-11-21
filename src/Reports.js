// inventory-management/src/Reports.js
import React from 'react';
import { Download, FileText, Monitor, Users, Trash2, Briefcase, ChevronRight, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
    const navigate = useNavigate();

    const reportTypes = [
        {
            title: 'Complete Inventory Report',
            description: 'Comprehensive report of all department inventory',
            icon: FileText,
            // items: totalComputers + totalPrinters + hodInventory.length // Placeholder
        },
        {
            title: 'Lab-wise Report',
            description: 'Detailed inventory breakdown by laboratory',
            icon: Monitor,
            // items: totalLabs // Placeholder
        },
        {
            title: 'Faculty Inventory Report',
            description: 'Systems and equipment assigned to faculty members',
            icon: Users,
            // items: totalFaculty // Placeholder
        },
        {
            title: 'Dead Stock Report',
            description: 'List of all non-functional and retired equipment',
            icon: Trash2,
            // items: deadStock.length // Placeholder
        },
        {
            title: 'System Status Report',
            description: 'Overview of system health and maintenance status',
            icon: Monitor,
            // items: computers.length // Placeholder
        },
        // {
        //     title: 'HOD Cabin Report',
        //     description: 'Inventory assigned to Head of Department',
        //     icon: Briefcase,
        //     // items: hodInventory.length // Placeholder
        // }
    ];

    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-800 font-medium">Reports</span>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reports & Analytics</h2>
                <p className="text-gray-600">Generate and export inventory reports</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {reportTypes.map((report, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <report.icon size={24} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">{report.title}</h3>
                                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                                {/* <div className="text-sm text-gray-700">
                                    <span className="font-semibold text-blue-600">{report.items}</span> items included
                                </div> */}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                                <Download size={16} />
                                Export PDF
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                <Printer size={16} />
                                Print
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Quick Export</h3>
                        <p className="text-sm text-gray-600">Export all inventory data in various formats</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200">
                            Export as Excel
                        </button>
                        <button className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200">
                            Export as CSV
                        </button>
                        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                            Export as PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
