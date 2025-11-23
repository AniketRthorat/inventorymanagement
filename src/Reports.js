// inventory-management/src/Reports.js
import React, { useRef, useState } from 'react';
import { Download, FileText, Monitor, Users, Trash2, Briefcase, ChevronRight, Printer, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Report from './Report';

const Reports = () => {
    const navigate = useNavigate();
    const reportRef = useRef();
    const [reportData, setReportData] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePrint = useReactToPrint({
        content: () => reportRef.current,
    });

    const handleExportPdf = () => {
        if (!reportRef.current) return;
        html2canvas(reportRef.current).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'px', 'a4');
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            pdf.save(`${selectedReport.title.replace(/\s/g, '_')}.pdf`);
        });
    };

    const generateReport = (report) => {
        // In a real application, you would fetch this data from the backend
        const mockData = {
            summary: {
                'Total Items': 120,
                'Active Items': 110,
                'Dead Stock': 10,
                'Total Value': '$150,000',
            },
            columns: [
                { Header: 'ID', accessor: 'id' },
                { Header: 'Name', accessor: 'name' },
                { Header: 'Type', accessor: 'type' },
                { Header: 'Status', accessor: 'status' },
                { Header: 'Location', accessor: 'location' },
            ],
            tableData: [
                { id: 1, name: 'Dell XPS 15', type: 'Laptop', status: 'Active', location: 'Lab 1' },
                { id: 2, name: 'HP LaserJet Pro', type: 'Printer', status: 'Active', location: 'Faculty Room' },
                { id: 3, name: 'Old Desktop', type: 'Desktop', status: 'Dead Stock', location: 'Storage' },
            ],
        };
        setReportData(mockData);
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const reportTypes = [
        {
            title: 'Complete Inventory Report',
            description: 'Comprehensive report of all department inventory',
            icon: FileText,
        },
        {
            title: 'Lab-wise Report',
            description: 'Detailed inventory breakdown by laboratory',
            icon: Monitor,
        },
        {
            title: 'Faculty Inventory Report',
            description: 'Systems and equipment assigned to faculty members',
            icon: Users,
        },
        {
            title: 'Dead Stock Report',
            description: 'List of all non-functional and retired equipment',
            icon: Trash2,
        },
        {
            title: 'System Status Report',
            description: 'Overview of system health and maintenance status',
            icon: Monitor,
        },
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
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => generateReport(report)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                                <Download size={16} />
                                Generate Report
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-4/5 h-4/5 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">{selectedReport.title}</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <Report ref={reportRef} data={reportData} title={selectedReport.title} />
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={handleExportPdf} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Export PDF
                            </button>
                            <button onClick={handlePrint} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
