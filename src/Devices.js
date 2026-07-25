import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Monitor, Printer as PrinterIcon, Laptop, ChevronRight, Edit2, Trash2, Users, Server, Keyboard, Mouse, Projector, Cpu, Presentation, MousePointer2, MonitorDot, Mic, Usb, Cable, ScanLine, Plug, Router, Network, HardDrive, Webcam, QrCode, Download, Wrench } from 'lucide-react';
import { useNavigate, useParams, Routes, Route, useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import api, { API_BASE_URL } from './api';
import AddInvoiceModal from './AddInvoiceModal';
import { encodeDeviceId } from './utils/qrUtils';

const AddDeviceForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const labIdFromQuery = queryParams.get('labId');
    const facultyIdFromQuery = queryParams.get('facultyId');

    const [labs, setLabs] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [centralStoreLabId, setCentralStoreLabId] = useState(null);
    const [error, setError] = useState(null);
    const [newDevice, setNewDevice] = useState({
        device_name: '',
        device_type: 'laptop',
        status: 'active',
        lab_id: labIdFromQuery || null,
        faculty_id: facultyIdFromQuery || null,
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

    useEffect(() => {
        fetchLabsAndFacultyAndHodCabin();
    }, []);

    const fetchLabsAndFacultyAndHodCabin = async () => {
        try {
            const [labsResponse, facultyResponse, hodCabinResponse] = await Promise.all([
                api.get('/labs'),
                api.get('/faculty'),
                api.get('/central-store-lab-id')
            ]);
            const fetchedCentralStoreLabId = hodCabinResponse.data.hodCabinLabId;
            const filteredLabs = labsResponse.data.filter(lab => lab.lab_id !== fetchedCentralStoreLabId);

            setLabs(filteredLabs);
            setFaculty(facultyResponse.data);
            setCentralStoreLabId(fetchedCentralStoreLabId);
        } catch (err) {
            console.error('Error fetching labs, faculty or Central Store ID:', err);
        }
    };

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
            // Client-side validation for PDF size
            if (newDevice.invoice_pdf && newDevice.invoice_pdf.size > 500 * 1024) { // 500KB limit
                alert('Invoice PDF size cannot exceed 500KB.');
                return;
            }

            const formData = new FormData();
            Object.keys(newDevice).forEach(key => {
                if (key === 'invoice_pdf' && newDevice[key]) {
                    formData.append(key, newDevice[key]);
                } else if (newDevice[key] !== null && newDevice[key] !== '' && key !== 'lab_location') { // Exclude lab_location
                    formData.append(key, newDevice[key]);
                }
            });

            await api.post('/devices', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (labIdFromQuery) {
                navigate(`/labs/${labIdFromQuery}`);
            } else if (facultyIdFromQuery) {
                navigate(`/faculty/${facultyIdFromQuery}`);
            }
            else {
                navigate('/devices');
            }
        } catch (err) {
            const backendError = err.response && err.response.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : 'An unexpected error occurred.';
            const errorMessage = `Failed to add device: ${backendError}`;
            setError(errorMessage);
            window.alert(errorMessage);
            console.error('Error adding device:', err.response ? err.response.data : err);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-2xl p-8 w-11/12 md:w-3/4 lg:w-2/3 mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Add New Device</h3>
                <button
                    onClick={() => navigate(labIdFromQuery ? `/labs/${labIdFromQuery}` : facultyIdFromQuery ? `/faculty/${facultyIdFromQuery}` : '/devices')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
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
                    <label htmlFor="invoice_pdf" className="text-sm font-medium text-gray-700 mb-1">Upload Invoice Bill (Max 500KB)</label>
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
                    <option value="defective_stock">Defective Stock</option>
                </select>
                {!labIdFromQuery && !facultyIdFromQuery && (
                    <>
                        <select name="lab_id" value={newDevice.lab_id || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">Assign to Lab (Optional)</option>
                            {centralStoreLabId && (
                                <option value={centralStoreLabId}>Assign to Central Store</option>
                            )}
                            {labs.map(lab => (
                                <option key={`lab-${lab.lab_id}`} value={lab.lab_id}>{lab.lab_name}</option>
                            ))}
                        </select>

                        <select name="faculty_id" value={newDevice.faculty_id || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">Assign to Faculty (Optional)</option>
                            {faculty.map(fac => (
                                <option key={`faculty-${fac.faculty_id}`} value={fac.faculty_id}>{fac.faculty_name}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={handleAddDevice} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Add Device
                </button>
            </div>
        </div >
    );
};



// DeviceList component to display all devices
const DeviceList = () => {
    const [devices, setDevices] = useState([]);
    const [labs, setLabs] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterLabId, setFilterLabId] = useState('');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDevices();
        fetchLabsAndFaculty();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await api.get('/devices', { params: { status: 'active' } });
            setDevices(response.data);
        } catch (err) {
            setError('Failed to fetch devices.');
            console.error('Error fetching devices:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInvoiceAdded = () => {
        fetchDevices();
    };

    const fetchLabsAndFaculty = async () => {
        try {
            const [labsResponse, facultyResponse] = await Promise.all([
                api.get('/labs'),
                api.get('/faculty'),
            ]);
            setLabs(labsResponse.data);
            setFaculty(facultyResponse.data);
        } catch (err) {
            console.error('Error fetching labs or faculty:', err);
        }
    };

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'desktop':
                return <MonitorDot size={20} />;
            case 'laptop':
                return <Laptop size={20} />;
            case 'printer':
                return <PrinterIcon size={20} />;
            case 'mouse':
                return <Mouse size={20} />;
            case 'keyboard':
                return <Keyboard size={20} />;
            case 'monitor':
                return <Monitor size={20} />;
            case 'server':
                return <Server size={20} />;
            case 'digital_board':
                return <Presentation size={20} />;
            case 'pointer':
                return <MousePointer2 size={20} />;
            case 'projector':
                return <Projector size={20} />;
            case 'cpu':
                return <Cpu size={20} />;
            case 'collar_mic':
                return <Mic size={20} />;
            case 'pendrive':
                return <Usb size={20} />;
            case 'hdmi_cable':
            case 'lan_cable':
                return <Cable size={20} />;
            case 'scanner':
                return <ScanLine size={20} />;
            case 'extension_board':
                return <Plug size={20} />;
            case 'router':
                return <Router size={20} />;
            case 'switch':
                return <Network size={20} />;
            case 'hard_disk':
            case 'ssd':
                return <HardDrive size={20} />;
            case 'webcam':
                return <Webcam size={20} />;
            default:
                return <Monitor size={20} />;
        }
    };

    const filteredDevices = devices.filter(device => {
        const query = searchQuery.toLowerCase();
        const lab = labs.find(l => l.lab_id === device.lab_id);
        const facultyMember = faculty.find(f => f.faculty_id === device.faculty_id);
        const assetTag = encodeDeviceId(device.device_id).toLowerCase();

        const matchesSearch = (
            device.device_name.toLowerCase().includes(query) ||
            device.device_type.toLowerCase().includes(query) ||
            (device.company && device.company.toLowerCase().includes(query)) ||
            (device.cpu && device.cpu.toLowerCase().includes(query)) ||
            (device.ip_generation && device.ip_generation.toLowerCase().includes(query)) ||
            (device.invoice_number && device.invoice_number.toLowerCase().includes(query)) ||
            (lab && lab.lab_name.toLowerCase().includes(query)) ||
            (facultyMember && facultyMember.faculty_name.toLowerCase().includes(query)) ||
            assetTag.includes(query)
        );

        const matchesType = filterType === '' || device.device_type === filterType;
        const matchesLab = filterLabId === '' || device.lab_id === parseInt(filterLabId);

        return matchesSearch && matchesType && matchesLab;
    });

    if (loading) return <div>Loading devices...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by Name, Model Name, Tag (e.g. CSE-), or Lab..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Monitor size={18} className="text-gray-400" />
                        </div>
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm min-w-[150px]"
                    >
                        <option value="">All Types</option>
                        <option value="desktop">Desktop</option>
                        <option value="laptop">Laptop</option>
                        <option value="monitor">Monitor</option>
                        <option value="cpu">CPU</option>
                        <option value="mouse">Mouse</option>
                        <option value="keyboard">Keyboard</option>
                        <option value="printer">Printer</option>
                        <option value="server">Server</option>
                        <option value="digital_board">Digital Board</option>
                        <option value="pointer">Pointer</option>
                        <option value="projector">Projector</option>
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

                    <select
                        value={filterLabId}
                        onChange={(e) => setFilterLabId(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm min-w-[150px]"
                    >
                        <option value="">All Locations</option>
                        {labs.map(lab => (
                            <option key={lab.lab_id} value={lab.lab_id}>{lab.lab_name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={() => navigate('/devices/add')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add New Device
                    </button>
                    <button
                        onClick={() => setIsInvoiceModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add Invoice
                    </button>
                </div>
            </div>
            <div className="flex justify-between items-center mb-3 px-1">
                {searchQuery.trim() || filterType || filterLabId ? (
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {filteredDevices.length} {filteredDevices.length === 1 ? 'Result' : 'Results'} found
                    </span>
                ) : (
                    <span className="text-xs text-gray-500 font-medium">
                        Total Devices: {devices.length}
                    </span>
                )}
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                                <th className="px-3 py-4 text-left text-sm font-semibold text-gray-700">Company</th>
                                <th className="px-3 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                                <th className="px-3 py-4 text-left text-sm font-semibold text-gray-700">Model Name</th>
                                <th className="px-3 py-4 text-left text-sm font-semibold text-gray-700">IP Generation</th>
                                <th className="px-3 py-4 text-left text-sm font-semibold text-gray-700">Storage</th>
                                <th className="px-3 py-4 text-left text-sm font-semibold text-gray-700">RAM</th>
                                <th className="px-3 py-4 text-left text-sm font-semibold text-gray-700">Invoice #</th>
                                <th className="px-3 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-3 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDevices.map((device, index) => {
                                const assignedLab = labs.find(lab => lab.lab_id === device.lab_id);
                                const assignedFaculty = faculty.find(fac => fac.faculty_id === device.faculty_id);
                                return (
                                    <tr key={device.device_id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-2">
                                                {getDeviceIcon(device.device_type)}
                                                {device.device_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 font-medium">{device.device_name}</td>
                                        <td className="px-3 py-4 text-gray-600 text-sm">{device.company || 'N/A'}</td>
                                        <td className="px-3 py-4 text-gray-600 text-sm">{assignedLab ? assignedLab.lab_name : 'N/A'}</td>
                                        <td className="px-3 py-4 text-gray-600 text-sm">{device.cpu || 'N/A'}</td>
                                        <td className="px-3 py-4 text-gray-600 text-sm">{device.ip_generation || 'N/A'}</td>
                                        <td className="px-3 py-4 text-gray-600 text-sm">{device.storage ? `${device.storage} GB` : 'N/A'}</td>
                                        <td className="px-3 py-4 text-gray-600 text-sm">{device.ram ? `${device.ram} GB` : 'N/A'}</td>
                                        <td className="px-3 py-4 text-gray-600 text-sm">{device.invoice_number || 'N/A'}</td>
                                        <td className="px-3 py-4">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${device.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {device.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4">
                                            <button
                                                onClick={() => navigate(`/devices/${device.device_id}`)}
                                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-xs flex items-center gap-1"
                                            >
                                                <Edit2 size={12} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddInvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                onInvoiceAdded={handleInvoiceAdded}
            />
        </div>
    );
};

// DeviceDetail component to display details of a single device
const DeviceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;
    const fromLabel = location.state?.label;

    const [device, setDevice] = useState(null);
    const [labs, setLabs] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [isReassignLabModalOpen, setIsReassignLabModalOpen] = useState(false);
    const [isDefectiveStockModalOpen, setIsDefectiveStockModalOpen] = useState(false);
    const [isDefectiveStockPartsModalOpen, setIsDefectiveStockPartsModalOpen] = useState(false);
    const [defectiveStockParts, setDefectiveStockParts] = useState({
        mouse: false,
        keyboard: false,
        cpu: false,
        monitor: false,
    });
    const [defectiveStockRemark, setDefectiveStockRemark] = useState('');
    const [editedDevice, setEditedDevice] = useState(null);
    const [reassignFacultyId, setReassignFacultyId] = useState('');
    const [reassignLabId, setReassignLabId] = useState('');
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [maintenanceLogsLoading, setMaintenanceLogsLoading] = useState(true);

    const fetchDeviceDetails = useCallback(async () => {
        try {
            const response = await api.get(`/devices/${id}`);
            setDevice(response.data);
            setEditedDevice(response.data); // Initialize editedDevice
        } catch (err) {
            setError('Failed to fetch device details.');
            console.error('Error fetching device details:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchMaintenanceLogs = useCallback(async () => {
        try {
            setMaintenanceLogsLoading(true);
            const response = await api.get(`/devices/${id}/maintenance`);
            setMaintenanceLogs(response.data);
        } catch (err) {
            console.error('Error fetching maintenance logs:', err);
        } finally {
            setMaintenanceLogsLoading(false);
        }
    }, [id]);

    const fetchLabsAndFacultyAndHodCabin = useCallback(async () => {
        try {
            const [labsResponse, facultyResponse] = await Promise.all([
                api.get('/labs'),
                api.get('/faculty')
            ]);
            setLabs(labsResponse.data);
            setFaculty(facultyResponse.data);
        } catch (err) {
            console.error('Error fetching labs or faculty:', err);
        }
    }, []);

    useEffect(() => {
        fetchDeviceDetails();
        fetchLabsAndFacultyAndHodCabin();
        fetchMaintenanceLogs();
    }, [fetchDeviceDetails, fetchLabsAndFacultyAndHodCabin, fetchMaintenanceLogs]);

    useEffect(() => {
        if (isEditModalOpen) {
            fetchLabsAndFacultyAndHodCabin();
        }
    }, [isEditModalOpen, fetchLabsAndFacultyAndHodCabin]);

    useEffect(() => {
        if (isDefectiveStockModalOpen) {
            fetchLabsAndFacultyAndHodCabin();
        }
    }, [isDefectiveStockModalOpen, fetchLabsAndFacultyAndHodCabin]);

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDevice({ ...editedDevice, [name]: value });
    };

    const handleUpdateDevice = async () => {
        setError(null);
        try {
            const payload = {
                ...editedDevice,
                ram: editedDevice.ram ? parseInt(editedDevice.ram) : null,
                storage: editedDevice.storage ? parseInt(editedDevice.storage) : null,
                ink_levels: editedDevice.ink_levels ? parseInt(editedDevice.ink_levels) : null,
                display_size: editedDevice.display_size ? parseFloat(editedDevice.display_size) : null,
            };
            await api.put(`/devices/${id}`, payload);
            setIsEditModalOpen(false);
            fetchDeviceDetails(); // Refresh details
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update device.');
            console.error('Error updating device:', err);
        }
    };

    const handleDeleteDevice = async () => {
        if (window.confirm('Are you sure you want to delete this device?')) {
            try {
                await api.delete(`/devices/${id}`);
                navigate(from || '/devices'); // Redirect to origin or devices list after deletion
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete device.');
                console.error('Error deleting device:', err);
            }
        }
    };

    const handleDeleteMaintenanceLog = async (logId) => {
        if (window.confirm('Are you sure you want to delete this maintenance log? This action cannot be undone.')) {
            try {
                await api.delete(`/devices/${id}/maintenance/${logId}`);
                fetchMaintenanceLogs(); // Refresh the list
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete maintenance log.');
                console.error('Error deleting maintenance log:', err);
            }
        }
    };

    const handleReassignDevice = async () => {
        setError(null);
        try {
            await api.put(`/devices/${id}/reassign`, { faculty_id: parseInt(reassignFacultyId) });
            setIsReassignModalOpen(false);
            fetchDeviceDetails(); // Refresh details
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reassign device.');
            console.error('Error reassigning device:', err);
        }
    };

    const handleReassignDeviceToLab = async () => {
        setError(null);
        try {
            await api.put(`/devices/${id}/reassign-lab`, { lab_id: parseInt(reassignLabId) });
            setIsReassignLabModalOpen(false);
            fetchDeviceDetails(); // Refresh details
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reassign device to lab.');
            console.error('Error reassigning device to lab:', err);
        }
    };

    const handleMarkAsDefectiveStock = async () => {
        if (!defectiveStockRemark) {
            setError('Remark is required to mark a device as defective stock.');
            return;
        }
        try {
            await api.put(`/devices/${id}/deadstock`, { remark: defectiveStockRemark });
            setIsDefectiveStockModalOpen(false);
            setDefectiveStockRemark('');
            fetchDeviceDetails(); // Refresh details
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark device as defective stock.');
            console.error('Error marking device as defective stock:', err);
        }
    };

    const handleOpenDefectiveStockModal = useCallback(() => {
        if (device.device_type === 'desktop') {
            setIsDefectiveStockPartsModalOpen(true);
        } else {
            setIsDefectiveStockModalOpen(true);
        }
    }, [device, setIsDefectiveStockPartsModalOpen, setIsDefectiveStockModalOpen]);

    const handleDefectiveStockPartsChange = (e) => {
        const { name, checked } = e.target;
        setDefectiveStockParts(prev => ({ ...prev, [name]: checked }));
    };

    const handleMarkPartsAsDefectiveStock = async () => {
        const parts = Object.keys(defectiveStockParts).filter(part => defectiveStockParts[part]);
        if (parts.length === 0) {
            setError('Please select at least one part to mark as defective stock.');
            return;
        }
        if (!defectiveStockRemark) {
            setError('Remark is required.');
            return;
        }

        try {
            await api.put(`/devices/${id}/deadstock-parts`, { parts, remark: defectiveStockRemark });
            setIsDefectiveStockPartsModalOpen(false);
            setDefectiveStockRemark('');
            setDefectiveStockParts({ mouse: false, keyboard: false, cpu: false, monitor: false });
            fetchDeviceDetails(); // Refresh details
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark parts as defective stock.');
            console.error('Error marking parts as defective stock:', err);
        }
    };

    const downloadQRCode = async () => {
        const element = document.getElementById("qr-label-container");
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    scale: 3, // High quality
                    backgroundColor: "#ffffff",
                    useCORS: true
                });
                
                const pngUrl = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.href = pngUrl;
                downloadLink.download = `Label_${encodeDeviceId(device.device_id)}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } catch (err) {
                console.error("Error generating label image:", err);
            }
        }
    };


    if (loading) return <div>Loading device details...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!device) return <div>Device not found.</div>;

    const assignedLab = labs.find(lab => lab.lab_id === device.lab_id);
    const assignedFaculty = faculty.find(fac => fac.faculty_id === device.faculty_id);

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'desktop':
                return <MonitorDot size={40} />;
            case 'laptop':
                return <Laptop size={40} />;
            case 'printer':
                return <PrinterIcon size={40} />;
            case 'mouse':
                return <Mouse size={40} />;
            case 'keyboard':
                return <Keyboard size={40} />;
            case 'monitor':
                return <Monitor size={40} />;
            case 'server':
                return <Server size={40} />;
            case 'digital_board':
                return <Presentation size={40} />;
            case 'pointer':
                return <MousePointer2 size={40} />;
            case 'projector':
                return <Projector size={40} />;
            case 'cpu':
                return <Cpu size={40} />;
            case 'collar_mic':
                return <Mic size={40} />;
            case 'pendrive':
                return <Usb size={40} />;
            case 'hdmi_cable':
            case 'lan_cable':
                return <Cable size={40} />;
            case 'scanner':
                return <ScanLine size={40} />;
            case 'extension_board':
                return <Plug size={40} />;
            case 'router':
                return <Router size={40} />;
            case 'switch':
                return <Network size={40} />;
            case 'hard_disk':
            case 'ssd':
                return <HardDrive size={40} />;
            case 'webcam':
                return <Webcam size={40} />;
            default:
                return <Monitor size={40} />;
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
                <ChevronRight size={16} className="text-gray-400" />
                {from ? (
                    <>
                        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate(from.split('/').slice(0, -1).join('/'))}>
                            {from.includes('/labs/') ? 'Labs' : 'Faculty'}
                        </span>
                        <ChevronRight size={16} className="text-gray-400" />
                        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate(from)}>
                            {fromLabel || (from.includes('/labs/') ? 'Lab Details' : 'Faculty Details')}
                        </span>
                    </>
                ) : (
                    <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/devices')}>Devices</span>
                )}
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-800 font-medium">{device.device_name}</span>
            </div>

            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {getDeviceIcon(device.device_type)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{device.device_name}</h2>
                        <p className="text-gray-600 mb-1">Type: {device.device_type}</p>
                        <p className="text-gray-600 mb-1">Company: {device.company}</p>
                        <p className="text-gray-600 mb-1">Labels: {device.labels}</p>
                        <p className="text-sm text-gray-600 mb-1">Status: {device.status}</p>
                        <p className="text-sm text-gray-600 mb-1">Model Name: {device.cpu}</p>
                        <p className="text-sm text-gray-600 mb-1">IP Generation: {device.ip_generation}</p>
                        <p className="text-sm text-gray-600 mb-1">RAM: {device.ram} GB</p>
                        <p className="text-sm text-gray-600 mb-1">Storage: {device.storage} GB</p>
                        <p className="text-sm text-gray-600 mb-1">Display Size: {device.display_size} inches</p>
                        {device.device_type === 'printer' && (
                            <p className="text-sm text-gray-600 mb-1">Ink Levels: {device.ink_levels}%</p>
                        )}
                        <p className="text-sm text-gray-600 mb-1">Last Maintenance: {device.last_maintenance_date}</p>
                        <p className="text-sm text-gray-600 mb-1">Assigned Lab: {assignedLab ? assignedLab.lab_name : 'N/A'}</p>
                        <p className="text-sm text-gray-600">Assigned Faculty: {assignedFaculty ? assignedFaculty.faculty_name : 'N/A'}</p>
                        <p className="text-sm text-gray-600">Invoice Number: {device.invoice_number}</p>
                        {device.invoice_pdf && (
                            <a href={`${API_BASE_URL}devices/${device.device_id}/invoice`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
                                Download Invoice
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={() => setIsEditModalOpen(true)} className="flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                        <Edit2 size={18} />
                        Edit Device Details
                    </button>
                    <button onClick={() => setIsQRModalOpen(true)} className="flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium">
                        <QrCode size={18} />
                        Generate QR Code
                    </button>
                    <button onClick={() => setIsReassignModalOpen(true)} className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                        <Users size={18} />
                        Reassign to Faculty
                    </button>
                    <button onClick={() => setIsReassignLabModalOpen(true)} className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm">
                        <Users size={18} />
                        Reassign to Lab
                    </button>
                    <button onClick={handleOpenDefectiveStockModal} className="flex items-center justify-center gap-2 py-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium text-sm">
                        <Trash2 size={18} />
                        Mark as Defective
                    </button>
                    <button onClick={handleDeleteDevice} className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm">
                        <Trash2 size={18} />
                        Delete Device
                    </button>
                </div>
            </div>

            {/* Maintenance History Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mt-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Wrench size={16} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Maintenance History</h3>
                    {maintenanceLogs.length > 0 && (
                        <span className="ml-auto px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            {maintenanceLogs.length} records
                        </span>
                    )}
                </div>

                {maintenanceLogsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                ) : maintenanceLogs.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Wrench size={22} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No maintenance records yet.</p>
                        <p className="text-gray-400 text-xs mt-1">Records appear here when a lab assistant logs maintenance via QR code.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {maintenanceLogs.map((log, idx) => (
                            <div key={log.log_id || idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-700 font-bold text-sm">
                                            {log.assistant_name?.charAt(0)?.toUpperCase() || 'L'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="font-semibold text-gray-800 text-sm">{log.assistant_name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {log.maintenance_date ? new Date(log.maintenance_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteMaintenanceLog(log.log_id)}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{log.changes_made}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isQRModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Device QR Label</h3>
                            <button onClick={() => setIsQRModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="p-8 flex flex-col items-center">
                            <div id="qr-label-container" className="bg-white border-2 border-gray-200 p-6 rounded-xl flex flex-col items-center text-center shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{assignedLab ? assignedLab.lab_name : 'SGI INVENTORY'}</p>
                                <p className="text-lg font-black text-blue-600 mb-4">{encodeDeviceId(device.device_id)}</p>
                                
                                <div className="bg-white p-2 border border-gray-100 rounded-lg mb-4">
                                    <QRCodeCanvas
                                        id="qr-canvas"
                                        value={`http://sgideadstock.sginstitute.in/?device=${encodeDeviceId(device.device_id)}`}
                                        size={180}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                </div>
                                
                                <p className="text-sm font-semibold text-gray-800 mb-1">{device.device_name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">SCAN FOR DEVICE DETAILS</p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button 
                                onClick={downloadQRCode}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                            >
                                <Download size={18} />
                                Download PNG
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Device Modal */}
            {isEditModalOpen && editedDevice && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-11/12 md:w-3/4 lg:w-2/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Edit Device</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select name="device_type" value={editedDevice.device_type ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
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
                            <input type="text" name="device_name" placeholder="Device Name" value={editedDevice.device_name ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="company" placeholder="Company" value={editedDevice.company ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="labels" placeholder="Labels (comma-separated)" value={editedDevice.labels ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="lab_location" placeholder="Lab Location" value={editedDevice.lab_location ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            {(editedDevice.device_type === 'desktop' || editedDevice.device_type === 'laptop') && (
                                <>
                                    <input type="number" name="ram" placeholder="RAM (GB)" value={editedDevice.ram ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <input type="number" name="storage" placeholder="Storage (GB)" value={editedDevice.storage ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <input type="text" name="cpu" placeholder="CPU" value={editedDevice.cpu ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <input type="text" name="ip_generation" placeholder="IP Generation" value={editedDevice.ip_generation ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <input type="number" name="display_size" placeholder="Display Size (inches)" value={editedDevice.display_size ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </>
                            )}
                            {editedDevice.device_type === 'printer' && (
                                <input type="number" name="ink_levels" placeholder="Ink Levels (for printers)" value={editedDevice.ink_levels ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            )}
                            <input type="date" name="last_maintenance_date" placeholder="Last Maintenance Date" value={editedDevice.last_maintenance_date ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <select name="status" value={editedDevice.status ?? ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="active">Active</option>
                                <option value="defective_stock">Defective Stock</option>
                            </select>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={handleUpdateDevice} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Update Device
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reassign Device Modal */}
            {isReassignModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-11/12 md:w-1/2 lg:w-1/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Reassign Device to Faculty</h3>
                            <button onClick={() => setIsReassignModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <select name="reassignFacultyId" value={reassignFacultyId} onChange={(e) => setReassignFacultyId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="">Select Faculty to Reassign</option>
                                {faculty.map(fac => (
                                    <option key={`reassign-fac-${fac.faculty_id}`} value={fac.faculty_id}>{fac.faculty_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={handleReassignDevice} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Reassign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reassign to Lab Modal */}
            {isReassignLabModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-11/12 md:w-1/2 lg:w-1/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Reassign to Lab</h3>
                            <button onClick={() => setIsReassignLabModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <select name="reassignLabId" value={reassignLabId} onChange={(e) => setReassignLabId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="">Select Lab to Reassign</option>
                                {labs.map(lab => (
                                    <option key={`reassign-lab-${lab.lab_id}`} value={lab.lab_id}>{lab.lab_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={handleReassignDeviceToLab} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Reassign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mark as Defective Stock Modal */}
            {isDefectiveStockModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-11/12 md:w-1/2 lg:w-1/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Mark as Defective Stock</h3>
                            <button onClick={() => setIsDefectiveStockModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <textarea
                                name="defectiveStockRemark"
                                placeholder="Enter remark for marking as defective stock..."
                                value={defectiveStockRemark}
                                onChange={(e) => setDefectiveStockRemark(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={handleMarkAsDefectiveStock} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mark Parts as Defective Stock Modal (for Desktops) */}
            {isDefectiveStockPartsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity_30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-11/12 md:w-1/2 lg:w-1/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Mark Desktop Parts as Defective Stock</h3>
                            <button onClick={() => setIsDefectiveStockPartsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p>Select the defective parts from this desktop set to move to defective stock.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.keys(defectiveStockParts).map(part => (
                                    <label key={part} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name={part}
                                            checked={defectiveStockParts[part]}
                                            onChange={handleDefectiveStockPartsChange}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="capitalize">{part}</span>
                                    </label>
                                ))}
                            </div>
                            <textarea
                                name="defectiveStockRemark"
                                placeholder="Enter remark for these parts..."
                                value={defectiveStockRemark}
                                onChange={(e) => setDefectiveStockRemark(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={handleMarkPartsAsDefectiveStock} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Devices component to handle routing
const Devices = () => {
    return (
        <Routes>
            <Route path="/" element={<DeviceList />} />
            <Route path="/add" element={<AddDeviceForm />} />
            <Route path=":id" element={<DeviceDetail />} />
        </Routes>
    );
};

export default Devices;
