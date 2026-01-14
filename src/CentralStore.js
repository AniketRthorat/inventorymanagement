// inventory-management/src/CentralStore.js
import React, { useState, useEffect } from 'react';
import { Briefcase, Monitor, Printer, Package, ChevronRight, Download, Edit2, Plus, X, Mic, Usb, Cable, ScanLine, Plug, Router, Network, HardDrive, Webcam } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './api'; // Import api
import jsPDF from 'jspdf'; // Import jsPDF

const AddDeviceModal = ({ isOpen, onClose, centralStoreLabId, onDeviceAdded }) => {
    const [newDevice, setNewDevice] = useState({
        device_name: '',
        device_type: 'laptop',
        status: 'active',
        lab_id: centralStoreLabId,
        ram: '',
        storage: '',
        cpu: '',
        ip_generation: '',
        last_maintenance_date: '',
        ink_levels: '',
        display_size: '',
        company: '',
        labels: '',
        invoice_number: '',
        invoice_pdf: null,
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        // Update lab_id in newDevice state if centralStoreLabId changes
        setNewDevice(prev => ({ ...prev, lab_id: centralStoreLabId }));
    }, [centralStoreLabId]);


    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'invoice_pdf') {
            setNewDevice({ ...newDevice, invoice_pdf: files[0] });
        } else {
            setNewDevice({ ...newDevice, [name]: value });
        }
    };

    const handleAddDevice = async () => {
        setError(null);
        try {
            if (!newDevice.device_name || !newDevice.device_type || !newDevice.status) {
                const errorMessage = 'Please fill all mandatory fields.';
                window.alert(errorMessage);
                return;
            }
            if (newDevice.invoice_pdf && newDevice.invoice_pdf.size > 1024 * 1024) { // 1MB limit
                setError('Invoice PDF size cannot exceed 1MB.');
                return;
            }

            const formData = new FormData();
            Object.keys(newDevice).forEach(key => {
                if (key === 'invoice_pdf' && newDevice[key]) {
                    formData.append(key, newDevice[key]);
                } else if (newDevice[key] !== null && newDevice[key] !== '') {
                    formData.append(key, newDevice[key]);
                }
            });

            await api.post('/devices', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onDeviceAdded(); // Refresh the device list
            onClose(); // Close the modal
        } catch (err) {
            const backendError = err.response && err.response.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : 'An unexpected error occurred.';
            const errorMessage = `Failed to add device: ${backendError}`;
            setError(errorMessage);
            window.alert(errorMessage);
            console.error('Error adding device:', err.response ? err.response.data : err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-11/12 md:w-3/4 lg:w-2/3 mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Add New Device to Central Store</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select name="device_type" value={newDevice.device_type} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="laptop">Laptop</option>
                        <option value="desktop">Desktop</option>
                        <option value="mouse">Mouse</option>
                        <option value="keyboard">Keyboard</option>
                        <option value="monitor">Monitor</option>
                        <option value="printer">Printer</option>
                        <option value="server">Server</option>
                        <option value="digital_board">Digital Board</option>
                        <option value="pointer">Pointer</option>
                        <option value="projector">Projector</option>
                        <option value="cpu">CPU</option>
                        <option value="collar_mic">Collar Mic with Speaker</option>
                        <option value="pendrive">Pendrive</option>
                        <option value="hdmi_cable">HDMI Cable</option>
                        <option value="scanner">Scanner</option>
                        <option value="extension_board">Extension Board</option>
                        <option value="router">Router</option>
                        <option value="switch">Switch</option>
                        <option value="lan_cable">LAN Cable</option>
                        <option value="hard_disk">Hard Disk</option>
                        <option value="ssd">SSD</option>
                        <option value="webcam">Webcam</option>
                    </select>
                    <input type="text" name="device_name" placeholder="Device Name" value={newDevice.device_name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    <input type="text" name="company" placeholder="Company" value={newDevice.company} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    <input type="text" name="labels" placeholder="Labels (comma-separated)" value={newDevice.labels} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    <input type="text" name="invoice_number" placeholder="Invoice Number" value={newDevice.invoice_number} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    <div className="flex flex-col">
                        <label htmlFor="invoice_pdf" className="text-sm font-medium text-gray-700 mb-1">Upload Invoice Bill (Max 1MB)</label>
                        <input type="file" id="invoice_pdf" name="invoice_pdf" onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    {(newDevice.device_type === 'desktop' || newDevice.device_type === 'laptop') && (
                        <>
                            <input type="number" name="ram" placeholder="RAM (GB)" value={newDevice.ram} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <input type="number" name="storage" placeholder="Storage (GB)" value={newDevice.storage} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="cpu" placeholder="CPU" value={newDevice.cpu} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="ip_generation" placeholder="IP Generation" value={newDevice.ip_generation} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <input type="number" name="display_size" placeholder="Display Size (inches)" value={newDevice.display_size} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </>
                    )}
                    {newDevice.device_type === 'printer' && (
                        <input type="number" name="ink_levels" placeholder="Ink Levels (for printers)" value={newDevice.ink_levels} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    )}
                    <input type="date" name="last_maintenance_date" placeholder="Last Maintenance Date" value={newDevice.last_maintenance_date} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    <select name="status" value={newDevice.status} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="active">Active</option>
                        <option value="dead_stock">Dead Stock</option>
                    </select>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={handleAddDevice} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Add Device
                    </button>
                </div>
            </div>
        </div>
    );
};


const CentralStore = () => {
    const navigate = useNavigate();
    const [centralStoreDevices, setCentralStoreDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [centralStoreLabId, setCentralStoreLabId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);


    useEffect(() => {
        fetchCentralStoreDevices();
    }, []);

    const fetchCentralStoreDevices = async () => {
        try {
            setLoading(true);
            const centralStoreLabIdResponse = await api.get('/central-store-lab-id');
            const fetchedCentralStoreLabId = centralStoreLabIdResponse.data.hodCabinLabId;
            setCentralStoreLabId(fetchedCentralStoreLabId);
            const response = await api.get(`/devices?lab_id=${fetchedCentralStoreLabId}`);
            setCentralStoreDevices(response.data);
        } catch (err) {
            setError('Failed to fetch Central Store devices.');
            console.error('Error fetching Central Store devices:', err);
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
            case 'collar_mic':
                return <Mic size={28} className="text-blue-600" />;
            case 'pendrive':
                return <Usb size={28} className="text-blue-600" />;
            case 'hdmi_cable':
            case 'lan_cable':
                return <Cable size={28} className="text-blue-600" />;
            case 'scanner':
                return <ScanLine size={28} className="text-blue-600" />;
            case 'extension_board':
                return <Plug size={28} className="text-blue-600" />;
            case 'router':
                return <Router size={28} className="text-blue-600" />;
            case 'switch':
                return <Network size={28} className="text-blue-600" />;
            case 'hard_disk':
            case 'ssd':
                return <HardDrive size={28} className="text-blue-600" />;
            case 'webcam':
                return <Webcam size={28} className="text-blue-600" />;
            default:
                return <Package size={28} className="text-blue-600" />;
        }
    };

    const handleExportPdf = () => {
        console.log('PDF generation started for Central Store report');
        if (!centralStoreDevices || centralStoreDevices.length === 0) {
            console.error('No devices in Central Store to export.');
            return;
        }

        const doc = new jsPDF();
        let yPos = 10;
        const margin = 10;
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(18);
        doc.text('Central Store Inventory Report', margin, yPos);
        yPos += 10;

        // Summary
        doc.setFontSize(12);
        doc.text('Summary:', margin, yPos);
        yPos += 7;
        doc.text(`Total Devices: ${centralStoreDevices.length}`, margin + 5, yPos);
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
        centralStoreDevices.forEach((device, rowIndex) => {
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
        doc.save('Central_Store_Inventory.pdf');
        console.log('PDF saved');
    };

    if (loading) return <div>Loading Central Store inventory...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-800 font-medium">Central Store</span>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Central Store Inventory</h2>
                    <p className="text-gray-600">Department Central Storage and Equipment</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Plus size={18} />
                        Add New Device
                    </button>
                    <button
                        onClick={handleExportPdf}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            <AddDeviceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                centralStoreLabId={centralStoreLabId}
                onDeviceAdded={fetchCentralStoreDevices}
            />


            <div className="space-y-4">
                {centralStoreDevices.length > 0 ? (
                    centralStoreDevices.map((item) => (
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
                        No devices found in Central Store.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CentralStore;
