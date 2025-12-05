import React, { useState, useEffect, useCallback } from 'react';
import { Users, X, Plus, ChevronRight, Monitor, Printer, Edit2, Trash2 } from 'lucide-react';
import { useNavigate, useParams, Routes, Route } from 'react-router-dom';
import api from './api';

// FacultyList component to display all faculty members
const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    faculty_name: '',
    email: '',
    department: '',
    location: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/faculty');
      setFaculty(response.data);
    } catch (err) {
      setError('Failed to fetch faculty members.');
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFaculty({ ...newFaculty, [name]: value });
  };

  const handleAddFaculty = async () => {
    setError(null);

    // Frontend email domain validation
    const allowedDomainsRegex = /^[\w.-]+@(sgipolytechnic\.in|sgiinstitute\.in)$/;
    if (!allowedDomainsRegex.test(newFaculty.email)) {
      alert('Invalid email domain. Only @sgipolytechnic.in or @sgiinstitute.in are allowed.');
      return;
    }

    try {
      await api.post('/faculty', newFaculty);
      setIsModalOpen(false);
      setNewFaculty({
        faculty_name: '',
        email: '',
        department: '',
        location: '',
      });
      fetchFaculty(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || 'This email address already exists. Please try another one.');
      console.error('Error adding faculty:', err);
    }
  };

  if (loading) return <div>Loading faculty members...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Faculty Members</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Add Faculty
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="grid grid-cols-2 gap-6">
        {faculty.map((fac) => (
          <div
            key={fac.faculty_id}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate(`/faculty/${fac.faculty_id}`)} // Navigate to faculty detail page
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users size={32} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{fac.faculty_name}</h3>
                <p className="text-sm text-gray-600 mb-1">{fac.department}</p>
                <p className="text-sm text-gray-600 mb-1">{fac.email}</p>
                <p className="text-sm text-gray-600 mb-1">{fac.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-1/3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add New Faculty</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                name="faculty_name"
                placeholder="Name"
                value={newFaculty.faculty_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newFaculty.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={newFaculty.department}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={newFaculty.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddFaculty}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Faculty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// FacultyDetail component to display details of a single faculty member
const FacultyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [facultyMember, setFacultyMember] = useState(null);
    const [assignedDevices, setAssignedDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedFaculty, setEditedFaculty] = useState(null);

    useEffect(() => {
        fetchFacultyDetails();
        fetchAssignedDevices();
    }, [id, fetchFacultyDetails, fetchAssignedDevices]);

    const fetchFacultyDetails = useCallback(async () => {
        try {
            const response = await api.get(`/faculty/${id}`);
            setFacultyMember(response.data);
            setEditedFaculty(response.data); // Initialize editedFaculty
        } catch (err) {
            setError('Failed to fetch faculty details.');
            console.error('Error fetching faculty details:', err);
        } finally {
            setLoading(false);
        }
    }, [api, id]);

    const fetchAssignedDevices = useCallback(async () => {
        try {
            const response = await api.get(`/devices?faculty_id=${id}`);
            setAssignedDevices(response.data);
        } catch (err) {
            setError('Failed to fetch assigned devices.');
            console.error('Error fetching assigned devices:', err);
        }
    }, [api, id]);

    const handleDeleteFaculty = async () => {
        if (window.confirm('Are you sure you want to delete this faculty member?')) {
            try {
                await api.delete(`/faculty/${id}`);
                navigate('/faculty');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete faculty member.');
                console.error('Error deleting faculty member:', err);
            }
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditedFaculty({ ...editedFaculty, [name]: value });
    };

    const handleUpdateFaculty = async () => {
        setError(null);
        try {
            await api.put(`/faculty/${id}`, editedFaculty);
            setIsEditModalOpen(false);
            fetchFacultyDetails(); // Refresh details
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update faculty member.');
            console.error('Error updating faculty member:', err);
        }
    };

    if (loading) return <div>Loading faculty details...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!facultyMember) return <div>Faculty member not found.</div>;

    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/faculty')}>Faculty</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-800 font-medium">{facultyMember.faculty_name}</span>
            </div>

            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-6 mb-8">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users size={48} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{facultyMember.faculty_name}</h2>
                        <p className="text-gray-600 mb-1">{facultyMember.department}</p>
                        <p className="text-sm text-gray-600 mb-1">{facultyMember.email}</p>
                        <p className="text-sm text-gray-600 mb-1">{facultyMember.location}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Assigned Inventory</h3>
                    {assignedDevices.length > 0 ? (
                        assignedDevices.map(device => (
                            <div key={device.device_id} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {device.device_type === 'computer' ? <Monitor size={24} className="text-blue-600" /> : <Printer size={24} className="text-purple-600" />}
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{device.device_name}</h4>
                                            <p className="text-sm text-gray-600">{device.configuration}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        device.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {device.status}
                                    </span>
                                </div>
                                <button
                                    onClick={() => navigate(`/devices/${device.device_id}`)}
                                    className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                    View Full Details
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                            <Monitor size={32} className="text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">No system assigned</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                        <Edit2 size={18} />
                        Edit Faculty Details
                    </button>
                    <button
                        onClick={handleDeleteFaculty}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                        <Trash2 size={18} />
                        Delete Faculty
                    </button>
                </div>
            </div>

            {isEditModalOpen && editedFaculty && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-1/3">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Edit Faculty</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="faculty_name"
                                placeholder="Name"
                                value={editedFaculty.faculty_name}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={editedFaculty.email}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                                type="text"
                                name="department"
                                placeholder="Department"
                                value={editedFaculty.department}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                                type="text"
                                name="location"
                                placeholder="Location"
                                value={editedFaculty.location}
                                onChange={handleEditInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleUpdateFaculty}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Update Faculty
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Faculty component to handle routing
const Faculty = () => {
    return (
        <Routes>
            <Route path="/" element={<FacultyList />} />
            <Route path=":id" element={<FacultyDetail />} />
        </Routes>
    );
};

export default Faculty;