// inventory-management/src/Reports.js
import React, { useRef, useState } from 'react';
import { Download, FileText, Monitor, Users, Trash2, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Report from './Report';
import api from './api';

const Reports = () => {
    const navigate = useNavigate();
    // reportRef is still used by PDF export
    const reportRef = useRef();
    const [reportData, setReportData] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [labsList, setLabsList] = useState([]);
    const [isLabSelectionModalOpen, setIsLabSelectionModalOpen] = useState(false);

    const formatDeviceType = (type) => {
        if (!type) return 'N/A';
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatString = (str) => {
        if (!str || str === 'N/A') return str;
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handlePrint = () => {
        document.body.classList.add('printing-report');
        window.print();
        document.body.classList.remove('printing-report');
    };

    const handleExportPdf = () => {
        if (!reportData || !selectedReport) return;

        try {
            const doc = new jsPDF();

            // Add Title
            doc.setFontSize(20);
            doc.text(selectedReport.title, 14, 22);

            // Add generated date
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

            let yPos = 40;

            // Add Summary Section
            if (reportData.summary) {
                doc.setFontSize(14);
                doc.text("Summary", 14, yPos);
                yPos += 10;

                doc.setFontSize(12);
                Object.entries(reportData.summary).forEach(([key, value]) => {
                    doc.text(`${key}: ${value}`, 14, yPos);
                    yPos += 7;
                });
                yPos += 10;
            }

            // Prepare table data
            const tableHeaders = reportData.columns.map(col => col.Header);
            const tableBody = reportData.tableData.map(row =>
                reportData.columns.map(col => row[col.accessor])
            );

            // Add Table
            autoTable(doc, {
                head: [tableHeaders],
                body: tableBody,
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
                styles: { fontSize: 10 },
            });

            doc.save(`${selectedReport.title.replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            window.alert('Failed to generate PDF. Please try again.');
        }
    };


    const generateReport = async (report) => {
        try {
            if (report.title === 'Complete Inventory Report') {
                const response = await api.get(report.endpoint);
                const { devices, labs, faculty } = response.data;

                // Filter only active devices to match dashboard counts
                const activeDevices = devices.filter(d => d.status === 'active');

                const reportSummary = {
                    'Total Devices': activeDevices.length,
                    'Total Labs': labs.length,
                };

                const reportColumns = [
                    { Header: 'Sr.No', accessor: 'sr_no' },
                    { Header: 'Name', accessor: 'device_name' },
                    { Header: 'Type', accessor: 'device_type' },
                    { Header: 'Status', accessor: 'status' },
                    { Header: 'Lab', accessor: 'lab_name' },
                    { Header: 'Assigned To', accessor: 'faculty_name' },
                    { Header: 'Storage (GB)', accessor: 'storage' },
                    { Header: 'RAM (GB)', accessor: 'ram' },
                ];

                const reportTableData = activeDevices.map((device, index) => {
                    const assignedLab = labs.find(l => l.lab_id === device.lab_id);
                    const assignedFaculty = faculty.find(f => f.faculty_id === device.faculty_id);
                    return {
                        sr_no: index + 1, // Sequential number starting from 1
                        ...device,
                        device_name: formatString(device.device_name),
                        device_type: formatDeviceType(device.device_type),
                        lab_name: assignedLab ? formatString(assignedLab.lab_name) : 'N/A',
                        faculty_name: assignedFaculty ? formatString(assignedFaculty.faculty_name) : 'N/A',
                    };
                });

                setReportData({
                    summary: reportSummary,
                    tableData: reportTableData,
                    columns: reportColumns,
                });

            } else if (report.title === 'Lab-wise Report') {
                const labsResponse = await api.get('/labs');
                setLabsList(labsResponse.data);
                setSelectedReport(report);
                setIsLabSelectionModalOpen(true);
                return; // Don't open the main modal yet

            } else if (report.title === 'Faculty Inventory Report') {
                const response = await api.get(report.endpoint);
                const { faculty: facultyWithDevices } = response.data;

                const reportSummary = {
                    'Total Devices Assigned to Faculty': facultyWithDevices.reduce((sum, fac) => sum + fac.devices.length, 0),
                };

                const reportColumns = [
                    { Header: 'Sr.No', accessor: 'sr_no' },
                    { Header: 'Faculty Name', accessor: 'faculty_name' },
                    { Header: 'Department', accessor: 'department' },
                    { Header: 'Email', accessor: 'email' },
                    { Header: 'Device Name', accessor: 'device_name' },
                    { Header: 'Type', accessor: 'device_type' },
                    { Header: 'Status', accessor: 'status' },
                ];

                let counter = 1;
                const reportTableData = [];
                facultyWithDevices.forEach(fac => {
                    if (fac.devices.length > 0) {
                        fac.devices.forEach(device => {
                            reportTableData.push({
                                sr_no: counter++,
                                faculty_name: formatString(fac.faculty_name),
                                department: formatString(fac.department),
                                email: fac.email,
                                device_name: formatString(device.device_name),
                                device_type: formatDeviceType(device.device_type),
                                status: device.status,
                            });
                        });
                    } else {
                        reportTableData.push({
                            sr_no: counter++,
                            faculty_name: formatString(fac.faculty_name),
                            department: formatString(fac.department),
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
                    { Header: 'Sr.No', accessor: 'sr_no' },
                    { Header: 'Name', accessor: 'device_name' },
                    { Header: 'Type', accessor: 'device_type' },
                    { Header: 'Company', accessor: 'company' },
                    { Header: 'Status', accessor: 'status' },
                ];

                const reportTableData = deadStockDevices.map((device, index) => ({
                    sr_no: index + 1,
                    device_name: formatString(device.device_name),
                    device_type: formatDeviceType(device.device_type),
                    company: formatString(device.company),
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
                    { Header: 'Sr.No', accessor: 'sr_no' },
                    { Header: 'Device Type', accessor: 'device_type' },
                    { Header: 'Total', accessor: 'total' },
                    { Header: 'Active', accessor: 'active' },
                    { Header: 'Dead Stock', accessor: 'dead_stock' },
                ];

                const reportTableData = typeStatusData.map((item, index) => ({
                    sr_no: index + 1,
                    ...item,
                    device_type: formatDeviceType(item.device_type),
                }));

                setReportData({
                    summary: statusSummary,
                    tableData: reportTableData,
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


    const handleLabSelect = async (labId) => {
        try {
            const response = await api.get(`/devices?lab_id=${labId}`);
            const devices = response.data.filter(d => d.status === 'active');
            const lab = labsList.find(l => l.lab_id === parseInt(labId));

            // Sort devices by name
            const sortedDevices = [...devices].sort((a, b) =>
                a.device_name.localeCompare(b.device_name)
            );

            const reportSummary = {
                'Lab Name': lab ? formatString(lab.lab_name) : 'Unknown',
                'Total Devices': sortedDevices.length,
            };

            const reportColumns = [
                { Header: 'Sr.No', accessor: 'sr_no' },
                { Header: 'Device Name', accessor: 'device_name' },
                { Header: 'Type', accessor: 'device_type' },
                { Header: 'Company', accessor: 'company' },
                { Header: 'RAM (GB)', accessor: 'ram' },
                { Header: 'Status', accessor: 'status' },
            ];

            const reportTableData = sortedDevices.map((device, index) => ({
                sr_no: index + 1,
                ...device,
                device_name: formatString(device.device_name),
                device_type: formatDeviceType(device.device_type),
            }));

            setReportData({
                summary: reportSummary,
                tableData: reportTableData,
                columns: reportColumns,
            });
            setIsLabSelectionModalOpen(false);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error fetching lab devices:', err);
            window.alert('Failed to fetch lab devices');
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

            {isLabSelectionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Select Lab</h3>
                            <button
                                onClick={() => setIsLabSelectionModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {labsList.map((lab) => (
                                <button
                                    key={lab.lab_id}
                                    onClick={() => handleLabSelect(lab.lab_id)}
                                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-gray-700"
                                >
                                    {lab.lab_name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
