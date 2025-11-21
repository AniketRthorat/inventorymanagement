import React, { useState, useEffect } from 'react';
import { Plus, X, Monitor, Printer as PrinterIcon, Laptop, ChevronRight, Edit2, Trash2, Users } from 'lucide-react';
import { useNavigate, useParams, Routes, Route } from 'react-router-dom';
import api from './api';

// DeviceList component to display all devices
const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [labs, setLabs] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    device_name: '',
    device_type: 'computer', // Default to computer
    configuration: '',
    status: 'active', // Default status
    lab_id: null,
    faculty_id: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();
    fetchLabsAndFaculty();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
    } catch (err) {
      setError('Failed to fetch devices.');
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabsAndFaculty = async () => {
    try {
      const labsResponse = await api.get('/labs');
      setLabs(labsResponse.data);
      const facultyResponse = await api.get('/faculty');
      setFaculty(facultyResponse.data);
    } catch (err) {
      console.error('Error fetching labs or faculty:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDevice({ ...newDevice, [name]: value });
  };

  const handleAddDevice = async () => {
    setError(null);
    try {
      // Ensure lab_id and faculty_id are numbers or null
      const payload = {
        ...newDevice,
        lab_id: newDevice.lab_id ? parseInt(newDevice.lab_id) : null,
        faculty_id: newDevice.faculty_id ? parseInt(newDevice.faculty_id) : null,
      };
      await api.post('/devices', payload);
      setIsModalOpen(false);
      setNewDevice({
        device_name: '',
        device_type: 'computer',
        configuration: '',
        status: 'active',
        lab_id: null,
        faculty_id: null,
      });
      fetchDevices(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add device.');
      console.error('Error adding device:', err);
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'computer':
        return <Monitor size={20} />;
      case 'laptop': // Assuming 'laptop' is a device_type
        return <Laptop size={20} />;
      case 'printer':
        return <PrinterIcon size={20} />;
      default:
        return null;
    }
  };

  if (loading) return <div>Loading devices...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">All Devices</h2>
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assigned To</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Configuration</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => {
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
                  <td className="px-6 py-4 text-gray-600 text-sm">{assignedLab ? assignedLab.lab_name : 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{assignedFaculty ? assignedFaculty.faculty_name : 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{device.configuration}</td>
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
          <div className="bg-white rounded-lg shadow-2xl p-8 w-1/3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add New Device</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <select
                name="device_type"
                value={newDevice.device_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="computer">Computer</option>
                <option value="laptop">Laptop</option>
                <option value="printer">Printer</option>
              </select>
              <input
                type="text"
                name="device_name"
                placeholder="Device Name"
                value={newDevice.device_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                name="configuration"
                placeholder="Configuration (e.g., CPU, RAM, Storage)"
                value={newDevice.configuration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                name="status"
                value={newDevice.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="faulty">Faulty</option>
                <option value="dead_stock">Dead Stock</option>
              </select>
              <select
                name="lab_id"
                value={newDevice.lab_id || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Assign to Lab (Optional)</option>
                {labs.map(lab => (
                  <option key={`lab-${lab.lab_id}`} value={lab.lab_id}>{lab.lab_name}</option>
                ))}
              </select>
              <select
                name="faculty_id"
                value={newDevice.faculty_id || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Assign to Faculty (Optional)</option>
                {faculty.map(fac => (
                  <option key={`faculty-${fac.faculty_id}`} value={fac.faculty_id}>{fac.faculty_name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddDevice}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [editedDevice, setEditedDevice] = useState(null);
    const [reassignFacultyId, setReassignFacultyId] = useState('');

    useEffect(() => {
        fetchDeviceDetails();
        fetchLabsAndFaculty();
    }, [id]);

    const fetchDeviceDetails = async () => {
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
    };

    const fetchLabsAndFaculty = async () => {
        try {
            const labsResponse = await api.get('/labs');
            setLabs(labsResponse.data);
            const facultyResponse = await api.get('/faculty');
            setFaculty(facultyResponse.data);
        } catch (err) {
            console.error('Error fetching labs or faculty:', err);
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

    const handleDeselectDevice = async () => {
        if (window.confirm('Are you sure you want to deselect this device from its current assignment?')) {
            try {
                await api.put(`/devices/${id}/deselect`);
                fetchDeviceDetails(); // Refresh details
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to deselect device.');
                console.error('Error deselecting device:', err);
            }
        }
    };

    const handleMarkAsDeadStock = async () => {
        if (window.confirm('Are you sure you want to mark this device as dead stock?')) {
            try {
                await api.put(`/devices/${id}/deadstock`);
                fetchDeviceDetails(); // Refresh details
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to mark device as dead stock.');
                console.error('Error marking device as dead stock:', err);
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
          case 'computer':
            return <Monitor size={40} />;
          case 'laptop':
            return <Laptop size={40} />;
          case 'printer':
            return <PrinterIcon size={40} />;
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
                        <p className="text-sm text-gray-600 mb-1">Status: {device.status}</p>
                        <p className="text-sm text-gray-600 mb-1">Configuration: {device.configuration}</p>
                        <p className="text-sm text-gray-600 mb-1">Assigned Lab: {assignedLab ? assignedLab.lab_name : 'N/A'}</p>
                        <p className="text-sm text-gray-600">Assigned Faculty: {assignedFaculty ? assignedFaculty.faculty_name : 'N/A'}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                        <Edit2 size={18} />
                        Edit Device Details
                    </button>
                    <button
                        onClick={() => setIsReassignModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                        <Users size={18} />
                        Reassign Device
                    </button>
                    <button
                        onClick={handleDeselectDevice}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors font-medium">
                        <X size={18} />
                        Deselect Device
                    </button>
                    <button
                        onClick={handleMarkAsDeadStock}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium">
                        <Trash2 size={18} />
                        Mark as Dead Stock
                    </button>
                    <button
                        onClick={handleDeleteDevice}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                        <Trash2 size={18} />
                        Delete Device
                    </button>
                </div>
            </div>

            {/* Edit Device Modal */}
            {isEditModalOpen && editedDevice && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-1/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Edit Device</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <select
                                name="device_type"
                                value={editedDevice.device_type}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="computer">Computer</option>
                                <option value="laptop">Laptop</option>
                                <option value="printer">Printer</option>
                            </select>
                            <input
                                type="text"
                                name="device_name"
                                placeholder="Device Name"
                                value={editedDevice.device_name}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <textarea
                                name="configuration"
                                placeholder="Configuration (e.g., CPU, RAM, Storage)"
                                value={editedDevice.configuration}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <select
                                name="status"
                                value={editedDevice.status}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="active">Active</option>
                                <option value="faulty">Faulty</option>
                                <option value="dead_stock">Dead Stock</option>
                            </select>
                            <select
                                name="lab_id"
                                value={editedDevice.lab_id || ''}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Assign to Lab (Optional)</option>
                                {labs.map(lab => (
                                    <option key={`lab-${lab.lab_id}`} value={lab.lab_id}>{lab.lab_name}</option>
                                ))}
                            </select>
                            <select
                                name="faculty_id"
                                value={editedDevice.faculty_id || ''}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Assign to Faculty (Optional)</option>
                                {faculty.map(fac => (
                                    <option key={`faculty-${fac.faculty_id}`} value={fac.faculty_id}>{fac.faculty_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleUpdateDevice}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
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
                            <button
                                onClick={() => setIsReassignModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <select
                                name="reassignFacultyId"
                                value={reassignFacultyId}
                                onChange={(e) => setReassignFacultyId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Select Faculty to Reassign</option>
                                {faculty.map(fac => (
                                    <option key={`reassign-fac-${fac.faculty_id}`} value={fac.faculty_id}>{fac.faculty_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleReassignDevice}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Reassign
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