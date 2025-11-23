// inventory-management/src/HODCabin.js
import React, { useState, useEffect } from 'react';
import { Briefcase, Monitor, Printer, Package, ChevronRight, Download, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './api'; // Import api
import jsPDF from 'jspdf'; // Import jsPDF

const HODCabin = () => {
    const navigate = useNavigate();
    const [hodDevices, setHodDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHodDevices();
    }, []);

    const fetchHodDevices = async () => {
        try {
            setLoading(true);
            const hodCabinLabIdResponse = await api.get('/hod-cabin-lab-id');
            const hodCabinLabId = hodCabinLabIdResponse.data.hodCabinLabId;
            const response = await api.get(`/devices?lab_id=${hodCabinLabId}`);
            setHodDevices(response.data);
        } catch (err) {
            setError('Failed to fetch HOD Cabin devices.');
            console.error('Error fetching HOD Cabin devices:', err);
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'computer':
                return <Monitor size={28} className="text-blue-600" />;
            case 'laptop':
                return <Monitor size={28} className="text-blue-600" />;
            case 'printer':
                return <Printer size={28} className="text-blue-600" />;
            default:
                return <Package size={28} className="text-blue-600" />;
        }
    };

    const handleExportPdf = () => {
        console.log('PDF generation started for HOD Cabin report');
        if (!hodDevices || hodDevices.length === 0) {
            console.error('No devices in HOD Cabin to export.');
            return;
        }

        const doc = new jsPDF();
        let yPos = 10;
        const margin = 10;
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(18);
        doc.text('HOD Cabin Inventory Report', margin, yPos);
        yPos += 10;

        // Summary
        doc.setFontSize(12);
        doc.text('Summary:', margin, yPos);
        yPos += 7;
        doc.text(`Total Devices: ${hodDevices.length}`, margin + 5, yPos);
        yPos += 10;

        // Table Data
        const headers = ['Name', 'Type', 'Status'];
        const columnAccessors = ['device_name', 'device_type', 'status'];
        const columnWidth = (doc.internal.pageSize.getWidth() - 2 * margin) / headers.length;
        const rowHeight = 7;

        // Draw table headers
        doc.setFontSize(10);
        doc.setFillColor(200, 200, 200);
        doc.rect(margin, yPos, doc.internal.pageSize.getWidth() - 2 * margin, rowHeight, 'F');
        headers.forEach((header, index) => {
            doc.text(header, margin + (index * columnWidth) + 2, yPos + 5);
        });
        yPos += rowHeight;

        // Draw table body
        hodDevices.forEach((device, rowIndex) => {
            if (yPos + rowHeight > pageHeight - margin) {
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
                const cellText = String(device[accessor] || '');
                doc.text(cellText, margin + (colIndex * columnWidth) + 2, yPos + 5);
            });
            yPos += rowHeight;
        });

        console.log('PDF generated successfully, attempting save');
        doc.save('HOD_Cabin_Inventory.pdf');
        console.log('PDF saved');
    };

    if (loading) return <div>Loading HOD Cabin inventory...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-800 font-medium">HOD Cabin</span>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">HOD Cabin Inventory</h2>
                    <p className="text-gray-600">Head of Department Office Equipment</p>
                </div>
                <button
                    onClick={handleExportPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            <div className="space-y-4">
                {hodDevices.length > 0 ? (
                    hodDevices.map((item) => (
                        <div key={item.device_id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {getDeviceIcon(item.device_type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-semibold text-gray-800">{item.device_name}</h3>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                            {item.device_type}
                                        </span>
                                    </div>
                                    <p className="text-gray-600">{item.configuration}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/devices/${item.device_id}`)}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2">
                                        <Edit2 size={16} />
                                        View/Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-gray-600">
                        <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
                        No devices found in HOD Cabin.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HODCabin;
