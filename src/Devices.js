import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Monitor, Printer as PrinterIcon, Laptop, ChevronRight, Edit2, Trash2, Users, Server, Keyboard, Mouse, Projector, Cpu, Presentation, MousePointer2 } from 'lucide-react';
import { useNavigate, useParams, Routes, Route } from 'react-router-dom';
import api from './api';

// DeviceList component to display all devices
const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [labs, setLabs] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [hodCabinLabId, setHodCabinLabId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDevice, setNewDevice] = useState({
    device_name: '',
    device_type: 'laptop',
    status: 'active',
    lab_id: null,
    faculty_id: null,
    ram: '',
    storage: '',
    cpu: '',
    ip_generation: '',
    last_maintenance_date: '',
    ink_levels: '',
    display_size: '',
    lab_location: '',
    company: '',
    labels: '',
    invoice_number: '',
    invoice_pdf: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      fetchLabsAndFacultyAndHodCabin();
    }
  }, [isModalOpen]);

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

  const fetchLabsAndFacultyAndHodCabin = async () => {
    try {
      const [labsResponse, facultyResponse, hodCabinResponse] = await Promise.all([
        api.get('/labs'),
        api.get('/faculty'),
        api.get('/hod-cabin-lab-id')
      ]);
      const fetchedHodCabinLabId = hodCabinResponse.data.hodCabinLabId;
      const filteredLabs = labsResponse.data.filter(lab => lab.lab_id !== fetchedHodCabinLabId);
      
      setLabs(filteredLabs);
      setFaculty(facultyResponse.data);
      setHodCabinLabId(fetchedHodCabinLabId);
    } catch (err) {
      console.error('Error fetching labs, faculty or HOD Cabin ID:', err);
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

        setIsModalOpen(false);
        setNewDevice({
            device_name: '',
            device_type: 'laptop',
            status: 'active',
            lab_id: null,
            faculty_id: null,
            ram: '',
            storage: '',
            cpu: '',
            gpu: '',
            last_maintenance_date: '',
            ink_levels: '',
            display_size: '',
            lab_location: '',
            company: '',
            labels: '',
            invoice_number: '',
            invoice_pdf: null,
        });
        fetchDevices(); // Refresh the list
    } catch (err) {
        const errorMessage = 'Failed to add device. Please fill all mandatory fields.';
        setError(errorMessage);
        window.alert(errorMessage);
        console.error('Error adding device:', err);
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'desktop':
        return <Monitor size={20} />;
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
      default:
        return null;
    }
  };

  const filteredDevices = devices.filter(device => {
    const query = searchQuery.toLowerCase();
    return (
      device.device_name.toLowerCase().includes(query) ||
      device.device_type.toLowerCase().includes(query) ||
      (device.company && device.company.toLowerCase().includes(query))
    );
  });

  if (loading) return <div>Loading devices...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search by Type, Name, or Company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Monitor size={20} className="text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Add New Device
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Company</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assigned To</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Storage</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">RAM</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Invoice #</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
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
                  <td className="px-6 py-4 text-gray-600 text-sm">{device.company}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{assignedLab ? assignedLab.lab_name : 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{assignedFaculty ? assignedFaculty.faculty_name : 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{device.storage} GB</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{device.ram} GB</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{device.invoice_number}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        device.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                        {device.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/devices/${device.device_id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add New Device</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              </select>
              <input type="text" name="device_name" placeholder="Device Name" value={newDevice.device_name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="text" name="company" placeholder="Company" value={newDevice.company} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="text" name="labels" placeholder="Labels (comma-separated)" value={newDevice.labels} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="text" name="lab_location" placeholder="Lab Location" value={newDevice.lab_location} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
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
              <select name="lab_id" value={newDevice.lab_id || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Assign to Lab (Optional)</option>
                {hodCabinLabId && (
                  <option value={hodCabinLabId}>Assign to HOD Cabin</option>
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
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleAddDevice} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// DeviceDetail component to display details of a single device
const DeviceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState(null);
    const [labs, setLabs] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [hodCabinLabId, setHodCabinLabId] = useState(null); // New state for HOD Cabin Lab ID
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [isDeadStockModalOpen, setIsDeadStockModalOpen] = useState(false);
    const [isDeadStockPartsModalOpen, setIsDeadStockPartsModalOpen] = useState(false);
    const [deadStockParts, setDeadStockParts] = useState({
        mouse: false,
        keyboard: false,
        cpu: false,
        monitor: false,
    });
    const [deadStockRemark, setDeadStockRemark] = useState('');
    const [editedDevice, setEditedDevice] = useState(null);
    const [reassignFacultyId, setReassignFacultyId] = useState('');

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

    useEffect(() => {
        fetchDeviceDetails();
    }, [fetchDeviceDetails]);

    useEffect(() => {
        if (isReassignModalOpen) {
            fetchLabsAndFacultyAndHodCabin();
        }
    }, [isReassignModalOpen]);

    const fetchLabsAndFacultyAndHodCabin = async () => {
        try {
            const [labsResponse, facultyResponse, hodCabinResponse] = await Promise.all([
                api.get('/labs'),
                api.get('/faculty'),
                api.get('/hod-cabin-lab-id')
            ]);
            const fetchedHodCabinLabId = hodCabinResponse.data.hodCabinLabId;
            const filteredLabs = labsResponse.data.filter(lab => lab.lab_id !== fetchedHodCabinLabId);
            
            setLabs(filteredLabs);
            setFaculty(facultyResponse.data);
            setHodCabinLabId(fetchedHodCabinLabId);
        } catch (err) {
            console.error('Error fetching labs, faculty or HOD Cabin ID:', err);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDevice({ ...editedDevice, [name]: value });
    };

    const handleUpdateDevice = async () => {
        setError(null);
        try {
            const payload = {
                ...editedDevice,
                lab_id: editedDevice.lab_id ? parseInt(editedDevice.lab_id) : null,
                faculty_id: editedDevice.faculty_id ? parseInt(editedDevice.faculty_id) : null,
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
                navigate('/devices'); // Redirect to devices list after deletion
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete device.');
                console.error('Error deleting device:', err);
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

    const handleMarkAsDeadStock = async () => {
        if (!deadStockRemark) {
            setError('Remark is required to mark a device as dead stock.');
            return;
        }
        try {
            await api.put(`/devices/${id}/deadstock`, { remark: deadStockRemark });
            setIsDeadStockModalOpen(false);
            setDeadStockRemark('');
            fetchDeviceDetails(); // Refresh details
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark device as dead stock.');
            console.error('Error marking device as dead stock:', err);
        }
    };

    const handleOpenDeadStockModal = useCallback(() => {
        if (device.device_type === 'desktop') {
            setIsDeadStockPartsModalOpen(true);
        } else {
            setIsDeadStockModalOpen(true);
        }
    }, [device, setIsDeadStockPartsModalOpen, setIsDeadStockModalOpen]);

    const handleDeadStockPartsChange = (e) => {
        const { name, checked } = e.target;
        setDeadStockParts(prev => ({ ...prev, [name]: checked }));
    };

    const handleMarkPartsAsDeadStock = async () => {
        const parts = Object.keys(deadStockParts).filter(part => deadStockParts[part]);
        if (parts.length === 0) {
            setError('Please select at least one part to mark as dead stock.');
            return;
        }
        if (!deadStockRemark) {
            setError('Remark is required.');
            return;
        }

        try {
            await api.put(`/devices/${id}/deadstock-parts`, { parts, remark: deadStockRemark });
            setIsDeadStockPartsModalOpen(false);
            setDeadStockRemark('');
            setDeadStockParts({ mouse: false, keyboard: false, cpu: false, monitor: false });
            fetchDeviceDetails(); // Refresh details
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark parts as dead stock.');
            console.error('Error marking parts as dead stock:', err);
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
            return <Monitor size={40} />;
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
          default:
            return null;
        }
      };

    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/devices')}>Devices</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-800 font-medium">{device.device_name}</span>
            </div>

            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-6 mb-8">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {getDeviceIcon(device.device_type)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{device.device_name}</h2>
                        <p className="text-gray-600 mb-1">Type: {device.device_type}</p>
                        <p className="text-gray-600 mb-1">Company: {device.company}</p>
                        <p className="text-gray-600 mb-1">Labels: {device.labels}</p>
                        <p className="text-sm text-gray-600 mb-1">Status: {device.status}</p>
                        <p className="text-sm text-gray-600 mb-1">CPU: {device.cpu}</p>
                        <p className="text-sm text-gray-600 mb-1">IP Generation: {device.ip_generation}</p>
                        <p className="text-sm text-gray-600 mb-1">RAM: {device.ram} GB</p>
                        <p className="text-sm text-gray-600 mb-1">Storage: {device.storage} GB</p>
                        <p className="text-sm text-gray-600 mb-1">Display Size: {device.display_size} inches</p>
                        <p className="text-sm text-gray-600 mb-1">Ink Levels: {device.ink_levels}%</p>
                        <p className="text-sm text-gray-600 mb-1">Last Maintenance: {device.last_maintenance_date}</p>
                        <p className="text-sm text-gray-600 mb-1">Assigned Lab: {assignedLab ? assignedLab.lab_name : 'N/A'}</p>
                        <p className="text-sm text-gray-600">Assigned Faculty: {assignedFaculty ? assignedFaculty.faculty_name : 'N/A'}</p>
                        <p className="text-sm text-gray-600">Invoice Number: {device.invoice_number}</p>
                        {device.invoice_pdf && (
                            <a href={`http://localhost:8787/api/devices/${device.device_id}/invoice`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
                                Download Invoice
                            </a>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={() => setIsEditModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                        <Edit2 size={18} />
                        Edit Device Details
                    </button>
                    <button onClick={() => setIsReassignModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                        <Users size={18} />
                        Reassign Device
                    </button>
                    <button onClick={() => setIsDeadStockModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium">
                        <Trash2 size={18} />
                        Mark as Dead Stock
                    </button>
                    <button onClick={handleDeleteDevice} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                        <Trash2 size={18} />
                        Delete Device
                    </button>
                </div>
            </div>

            {/* Edit Device Modal */}
            {isEditModalOpen && editedDevice && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-2/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Edit Device</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <select name="device_type" value={editedDevice.device_type} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="laptop">Laptop</option>
                                <option value="desktop">Desktop</option>
                                <option value="mouse">Mouse</option>
                                <option value="keyboard">Keyboard</option>
                                <option value="monitor">Monitor</option>
                                <option value="printer">Printer</option>
                                <option value="server">Server</option>
                            </select>
                            <input type="text" name="device_name" placeholder="Device Name" value={editedDevice.device_name} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="company" placeholder="Company" value={editedDevice.company} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="labels" placeholder="Labels (comma-separated)" value={editedDevice.labels} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="lab_location" placeholder="Lab Location" value={editedDevice.lab_location} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            {(editedDevice.device_type === 'desktop' || editedDevice.device_type === 'laptop') && (
                                <>
                                    <input type="number" name="ram" placeholder="RAM (GB)" value={editedDevice.ram} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <input type="number" name="storage" placeholder="Storage (GB)" value={editedDevice.storage} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <input type="text" name="cpu" placeholder="CPU" value={editedDevice.cpu} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <input type="text" name="ip_generation" placeholder="IP Generation" value={editedDevice.ip_generation} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <input type="number" name="display_size" placeholder="Display Size (inches)" value={editedDevice.display_size} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </>
                            )}
                            {editedDevice.device_type === 'printer' && (
                                <input type="number" name="ink_levels" placeholder="Ink Levels (for printers)" value={editedDevice.ink_levels} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            )}
                            <input type="date" name="last_maintenance_date" placeholder="Last Maintenance Date" value={editedDevice.last_maintenance_date} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <select name="status" value={editedDevice.status} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="active">Active</option>
                                <option value="dead_stock">Dead Stock</option>
                            </select>
                            <select name="lab_id" value={editedDevice.lab_id || ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={editedDevice.faculty_id}>
                                <option value="">Assign to Lab (Optional)</option>
                                {hodCabinLabId && (
                                    <option value={hodCabinLabId}>Assign to HOD Cabin</option>
                                )}
                                {labs.map(lab => (
                                    <option key={`lab-${lab.lab_id}`} value={lab.lab_id}>{lab.lab_name}</option>
                                ))}
                            </select>
                            <select name="faculty_id" value={editedDevice.faculty_id || ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={editedDevice.lab_id || device.faculty_id !== null}>
                                <option value="">Assign to Faculty (Optional)</option>
                                {faculty.map(fac => (
                                    <option key={`faculty-${fac.faculty_id}`} value={fac.faculty_id}>{fac.faculty_name}</option>
                                ))}
                            </select>
                            {device.faculty_id !== null && (
                                <p className="text-xs text-gray-500 col-span-2">This device is already assigned. Please "Deselect Device" first to re-assign.</p>
                            )}
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
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-1/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Reassign Device</h3>
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

            {/* Mark as Dead Stock Modal */}
            {isDeadStockModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-1/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Mark as Dead Stock</h3>
                            <button onClick={() => setIsDeadStockModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <textarea
                                name="deadStockRemark"
                                placeholder="Enter remark for marking as dead stock..."
                                value={deadStockRemark}
                                onChange={(e) => setDeadStockRemark(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={handleMarkAsDeadStock} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mark Parts as Dead Stock Modal (for Desktops) */}
            {isDeadStockPartsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-1/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Mark Desktop Parts as Dead Stock</h3>
                            <button onClick={() => setIsDeadStockPartsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p>Select the defective parts from this desktop set to move to dead stock.</p>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(deadStockParts).map(part => (
                                    <label key={part} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name={part}
                                            checked={deadStockParts[part]}
                                            onChange={handleDeadStockPartsChange}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="capitalize">{part}</span>
                                    </label>
                                ))}
                            </div>
                            <textarea
                                name="deadStockRemark"
                                placeholder="Enter remark for these parts..."
                                value={deadStockRemark}
                                onChange={(e) => setDeadStockRemark(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={handleMarkPartsAsDeadStock} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
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
            <Route path=":id" element={<DeviceDetail />} />
        </Routes>
    );
};

export default Devices;