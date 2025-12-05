// inventory-management/src/Reports.js
import React, { useRef, useState } from 'react';
import { Download, FileText, Monitor, Users, Trash2, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import jsPDF from 'jspdf';
import Report from './Report';
import api from './api';

const Reports = () => {
    const navigate = useNavigate();
    // reportRef is still used by PDF export
    const reportRef = useRef(); 
    const [reportData, setReportData] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePrint = () => {
        document.body.classList.add('printing-report');
        window.print();
        document.body.classList.remove('printing-report');
    };

    const handleExportPdf = () => {
        if (!reportData) {
            console.error('No report data to export.');
            return;
        }

        const doc = new jsPDF();
        let yPos = 10; // Initial Y position
        const margin = 10;
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(18);
        doc.text(selectedReport.title, margin, yPos);
        yPos += 10;

        // Add Summary
        if (reportData.summary) {
            doc.setFontSize(12);
            doc.text('Summary:', margin, yPos);
            yPos += 7;
            Object.entries(reportData.summary).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, margin + 5, yPos);
                yPos += 7;
            });
            yPos += 10; // Add some space after summary
        }

        // Add Table
        if (reportData.tableData && reportData.columns) {
            const headers = reportData.columns.map(col => col.Header);
            const columnAccessors = reportData.columns.map(col => col.accessor);
            const columnWidth = (doc.internal.pageSize.getWidth() - 2 * margin) / headers.length;
            const rowHeight = 7;

            // Draw table headers
            doc.setFontSize(10);
            doc.setFillColor(200, 200, 200); // Grey background for headers
            doc.rect(margin, yPos, doc.internal.pageSize.getWidth() - 2 * margin, rowHeight, 'F');
            headers.forEach((header, index) => {
                doc.text(header, margin + (index * columnWidth) + 2, yPos + 5);
            });
            yPos += rowHeight;

            // Draw table body
            reportData.tableData.forEach((row, rowIndex) => {
                if (yPos + rowHeight > pageHeight - margin) { // Check for new page
                    doc.addPage();
                    yPos = margin;
                    doc.setFontSize(10);
                    doc.setFillColor(200, 200, 200);
                    doc.rect(margin, yPos, doc.internal.pageSize.getWidth() - 2 * margin, rowHeight, 'F');
                    headers.forEach((header, index) => {
                        doc.text(header, margin + (index * columnWidth) + 2, yPos + 5);
                    });
                    yPos += rowHeight;
                }

                columnAccessors.forEach((accessor, colIndex) => {
                    const cellText = String(row[accessor] || '');
                    doc.text(cellText, margin + (colIndex * columnWidth) + 2, yPos + 5);
                });
                yPos += rowHeight;
            });
        }
        
        doc.save(`${selectedReport.title.replace(/\s/g, '_')}.pdf`);
    };


    const generateReport = async (report) => {
        try {
            if (report.title === 'Complete Inventory Report') {
                const response = await api.get(report.endpoint);
                const { devices, labs, faculty } = response.data;

                const reportSummary = {
                    'Total Devices': devices.length,
                    'Total Labs': labs.length,
                    'Total Faculty': faculty.length,
                    'Active Devices': devices.filter(d => d.status === 'active').length,
                    'Dead Stock Devices': devices.filter(d => d.status === 'dead_stock').length,
                };

                const reportColumns = [
                    { Header: 'ID', accessor: 'device_id' },
                    { Header: 'Name', accessor: 'device_name' },
                    { Header: 'Type', accessor: 'device_type' },
                    { Header: 'Status', accessor: 'status' },
                    { Header: 'Lab', accessor: 'lab_name' },
                    { Header: 'Assigned To', accessor: 'faculty_name' },
                    { Header: 'Storage (GB)', accessor: 'storage' },
                    { Header: 'RAM (GB)', accessor: 'ram' },
                ];

                const reportTableData = devices.map(device => {
                    const assignedLab = labs.find(l => l.lab_id === device.lab_id);
                    const assignedFaculty = faculty.find(f => f.faculty_id === device.faculty_id);
                    return {
                        ...device,
                        lab_name: assignedLab ? assignedLab.lab_name : 'N/A',
                        faculty_name: assignedFaculty ? assignedFaculty.faculty_name : 'N/A',
                    };
                });

                setReportData({
                    summary: reportSummary,
                    tableData: reportTableData,
                    columns: reportColumns,
                });

            } else if (report.title === 'Lab-wise Report') {
                const response = await api.get(report.endpoint);
                const { labs: labsWithDevices } = response.data;

                const reportSummary = {
                    'Total Labs': labsWithDevices.length,
                    'Total Devices Across Labs': labsWithDevices.reduce((sum, lab) => sum + lab.devices.length, 0),
                };

                const reportColumns = [
                    { Header: 'Lab Name', accessor: 'lab_name' },
                    { Header: 'Device Name', accessor: 'device_name' },
                    { Header: 'Type', accessor: 'device_type' },
                    { Header: 'Status', accessor: 'status' },
                ];

                const reportTableData = [];
                labsWithDevices.forEach(lab => {
                    lab.devices.forEach(device => {
                        reportTableData.push({
                            lab_name: lab.lab_name,
                            device_name: device.device_name,
                            device_type: device.device_type,
                            status: device.status,
                        });
                    });
                });

                setReportData({
                    summary: reportSummary,
                    tableData: reportTableData,
                    columns: reportColumns,
                });

            } else if (report.title === 'Faculty Inventory Report') {
                const response = await api.get(report.endpoint);
                const { faculty: facultyWithDevices } = response.data;

                const reportSummary = {
                    'Total Faculty Members': facultyWithDevices.length,
                    'Total Devices Assigned to Faculty': facultyWithDevices.reduce((sum, fac) => sum + fac.devices.length, 0),
                };

                const reportColumns = [
                    { Header: 'Faculty Name', accessor: 'faculty_name' },
                    { Header: 'Department', accessor: 'department' },
                    { Header: 'Email', accessor: 'email' },
                    { Header: 'Device Name', accessor: 'device_name' },
                    { Header: 'Type', accessor: 'device_type' },
                    { Header: 'Status', accessor: 'status' },
                ];

                const reportTableData = [];
                facultyWithDevices.forEach(fac => {
                    if (fac.devices.length > 0) {
                        fac.devices.forEach(device => {
                            reportTableData.push({
                                faculty_name: fac.faculty_name,
                                department: fac.department,
                                email: fac.email,
                                device_name: device.device_name,
                                device_type: device.device_type,
                                status: device.status,
                            });
                        });
                    } else {
                        reportTableData.push({
                            faculty_name: fac.faculty_name,
                            department: fac.department,
                            email: fac.email,
                            device_name: 'N/A',
                            device_type: 'N/A',
                            status: 'N/A',
                        });
                    }
                });

                setReportData({
                    summary: reportSummary,
                    tableData: reportTableData,
                    columns: reportColumns,
                });

            } else if (report.title === 'Dead Stock Report') {
                const response = await api.get(report.endpoint);
                const { deadStockDevices } = response.data;

                const reportSummary = {
                    'Total Dead Stock Devices': deadStockDevices.length,
                };

                const reportColumns = [
                    { Header: 'ID', accessor: 'device_id' },
                    { Header: 'Name', accessor: 'device_name' },
                    { Header: 'Type', accessor: 'device_type' },
                    { Header: 'Company', accessor: 'company' },
                    { Header: 'Status', accessor: 'status' },
                ];

                const reportTableData = deadStockDevices.map(device => ({
                    device_id: device.device_id,
                    device_name: device.device_name,
                    device_type: device.device_type,
                    company: device.company,
                    status: device.status,
                }));

                setReportData({
                    summary: reportSummary,
                    tableData: reportTableData,
                    columns: reportColumns,
                });

            } else if (report.title === 'System Status Report') {
                const response = await api.get(report.endpoint);
                const { statusSummary, typeStatusData } = response.data;

                const reportColumns = [
                    { Header: 'Device Type', accessor: 'device_type' },
                    { Header: 'Total', accessor: 'total' },
                    { Header: 'Active', accessor: 'active' },
                    { Header: 'Dead Stock', accessor: 'dead_stock' },
                ];

                setReportData({
                    summary: statusSummary,
                    tableData: typeStatusData,
                    columns: reportColumns,
                });

            } else {
                console.error('Unknown report type:', report.title);
                setReportData(null); // Clear previous report data
            }
            setSelectedReport(report);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error generating report:', err);
            // Optionally set an error state to display to the user
            setReportData(null); // Clear previous report data on error
            setIsModalOpen(false); // Close modal on error
            setSelectedReport(null); // Clear selected report
        }
        };
    
    
        const reportTypes = [
            {
                title: 'Complete Inventory Report',
                description: 'Comprehensive report of all department inventory',
                icon: FileText,
                endpoint: '/reports/complete-inventory',
            },
            {
                title: 'Lab-wise Report',
                description: 'Detailed inventory breakdown by laboratory',
                icon: Monitor,
                endpoint: '/reports/lab-wise',
            },
            {
                title: 'Faculty Inventory Report',
                description: 'Systems and equipment assigned to faculty members',
                icon: Users,
                endpoint: '/reports/faculty-inventory',
            },
            {
                title: 'Dead Stock Report',
                description: 'List of all non-functional and retired equipment',
                icon: Trash2,
                endpoint: '/reports/dead-stock',
            },
            {
                title: 'System Status Report',
                description: 'Overview of system health and maintenance status',
                icon: Monitor,
                endpoint: '/reports/system-status',
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
                                    onClick={() => { setIsModalOpen(false); }}
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
