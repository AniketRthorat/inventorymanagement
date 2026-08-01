import React, { useState, useEffect, useCallback } from 'react';
import { Users, X, Plus, ChevronRight, Monitor, Printer, Edit2, Trash2, Building2, ArrowLeft, Search, QrCode } from 'lucide-react';
import { useNavigate, useParams, Routes, Route } from 'react-router-dom';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import api from './api';

// DepartmentList Component: Main view displaying departments with option to add department and navigate into them
const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to fetch departments.');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) {
      alert('Please enter a department name.');
      return;
    }
    setError(null);
    try {
      await api.post('/departments', { department_name: newDeptName.trim() });
      setIsDeptModalOpen(false);
      setNewDeptName('');
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data || 'Failed to add department. It may already exist.');
      console.error('Error adding department:', err);
    }
  };

  const handleDeleteDepartment = async (e, dept) => {
    e.stopPropagation(); // Don't navigate into department when clicking delete
    if (!dept.department_id) {
      alert('Cannot delete this system department directly.');
      return;
    }
    if (dept.faculty_count > 0) {
      alert(`Cannot delete department "${dept.department_name}" because it still has ${dept.faculty_count} faculty member(s). Please reassign or delete the faculty first.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete department "${dept.department_name}"?`)) {
      try {
        await api.delete(`/departments/${dept.department_id}`);
        fetchDepartments();
      } catch (err) {
        alert(err.response?.data || 'Failed to delete department.');
      }
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-4 text-gray-600">Loading departments...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-800 font-medium">Departments</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Departments</h2>
          <p className="text-sm text-gray-500 mt-1">Select a department to view or manage its faculty members Deadstock.</p>
        </div>
        <button
          onClick={() => setIsDeptModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Department Cards Grid */}
      {filteredDepartments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Building2 size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">No departments found</h3>
          <p className="text-sm text-gray-500 mt-1">Click "Add Department" to create your first department.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <div
              key={dept.department_id || dept.department_name}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between group"
              onClick={() => navigate(`/faculty/department/${encodeURIComponent(dept.department_name)}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 size={24} />
                </div>
                {dept.department_id && (
                  <button
                    onClick={(e) => handleDeleteDepartment(e, dept)}
                    title="Delete Department"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {dept.department_name}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-2">
                  <Users size={16} className="text-gray-400" />
                  <span>{dept.faculty_count} {dept.faculty_count === 1 ? 'Faculty Member' : 'Faculty Members'}</span>
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-blue-600">
                <span>View Faculty Members</span>
                <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-30 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-800">Add New Department</h3>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDepartment}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// DepartmentFacultyList Component: Display faculty belonging to a specific department
const DepartmentFacultyList = () => {
  const { deptName } = useParams();
  const decodedDept = decodeURIComponent(deptName || '');
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    faculty_name: '',
    email: '',
    department: decodedDept,
    location: '',
  });
  const navigate = useNavigate();

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const fetchFacultyInDepartment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty?department=${encodeURIComponent(decodedDept)}`);
      setFaculty(response.data);
    } catch (err) {
      setError('Failed to fetch department faculty.');
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  }, [decodedDept]);

  useEffect(() => {
    fetchFacultyInDepartment();
    setNewFaculty((prev) => ({ ...prev, department: decodedDept }));
  }, [decodedDept, fetchFacultyInDepartment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFaculty({ ...newFaculty, [name]: value });
  };

  const handleAddFaculty = async () => {
    if (!newFaculty.faculty_name.trim()) {
      alert('Please enter faculty name.');
      return;
    }

    const allowedDomainsRegex = /^[\w.-]+@(sgipolytechnic\.in|sginstitute\.in)$/;
    if (!allowedDomainsRegex.test(newFaculty.email)) {
      alert('Invalid email domain. Only @sgipolytechnic.in or @sginstitute.in are allowed.');
      return;
    }

    try {
      await api.post('/faculty', {
        ...newFaculty,
        department: decodedDept, // Ensure fixed department
      });
      setIsModalOpen(false);
      setNewFaculty({
        faculty_name: '',
        email: '',
        department: decodedDept,
        location: '',
      });
      fetchFacultyInDepartment();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Failed to add faculty member.');
      console.error('Error adding faculty:', err);
    }
  };

  const encodeDeviceId = (id) => `CSE-${String(id).padStart(4, '0')}`;

  const generateBulkQR = async () => {
    if (!faculty || faculty.length === 0) return;
    setIsGeneratingPDF(true);

    try {
      const res = await api.get('/devices');
      const allDevices = res.data || [];
      const facultyIdSet = new Set(faculty.map((f) => f.faculty_id));
      const deptDevices = allDevices.filter((d) => d.faculty_id && facultyIdSet.has(d.faculty_id));

      if (deptDevices.length === 0) {
        alert('No assigned devices/systems found for faculty members in this department.');
        return;
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const labelWidth = 85;
      const labelHeight = 50;
      const marginX = 12;
      const marginY = 15;
      const spacingX = 6;
      const spacingY = 5;
      const labelsPerRow = 2;
      const labelsPerCol = 5;
      const labelsPerPage = labelsPerRow * labelsPerCol;

      const sortedDevices = [...deptDevices].sort((a, b) => a.device_id - b.device_id);

      const originUrl = window.location.origin.includes('localhost')
        ? 'http://sgideadstock.sginstitute.in'
        : window.location.origin;

      for (let i = 0; i < sortedDevices.length; i++) {
        if (i > 0 && i % labelsPerPage === 0) {
          doc.addPage();
        }

        const device = sortedDevices[i];
        const pageIndex = i % labelsPerPage;
        const col = pageIndex % labelsPerRow;
        const row = Math.floor(pageIndex / labelsPerRow);

        const x = marginX + col * (labelWidth + spacingX);
        const y = marginY + row * (labelHeight + spacingY);

        doc.setDrawColor(220);
        doc.rect(x, y, labelWidth, labelHeight);

        // Department Title
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.setFont('helvetica', 'bold');
        doc.text((decodedDept || 'DEPARTMENT').toUpperCase(), x + labelWidth / 2, y + 6, { align: 'center' });

        // Device Tag ID (e.g. CSE-0425)
        const tag = encodeDeviceId(device.device_id);
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'bold');
        doc.text(tag, x + labelWidth / 2, y + 13, { align: 'center' });

        // QR Code Image
        const qrValue = `${originUrl}/?device=${tag}`;
        const qrDataUrl = await QRCode.toDataURL(qrValue, { margin: 1, width: 200 });
        doc.addImage(qrDataUrl, 'PNG', x + (labelWidth - 25) / 2, y + 16, 25, 25);

        // Device Name (No faculty name)
        doc.setFontSize(8);
        doc.setTextColor(50);
        doc.setFont('helvetica', 'normal');
        doc.text(device.device_name, x + labelWidth / 2, y + 45, { align: 'center' });

        // Footer Note
        doc.setFontSize(6);
        doc.setTextColor(180);
        doc.setFont('helvetica', 'normal');
        doc.text('SCAN FOR DEVICE DETAILS', x + labelWidth / 2, y + 48, { align: 'center' });
      }

      doc.save(`${decodedDept}_Device_QR_Labels.pdf`);
    } catch (err) {
      console.error('Error generating bulk device QR PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading faculty members...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/faculty')}>Faculty</span>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-800 font-medium">{decodedDept}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faculty')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            title="Back to Departments"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{decodedDept}</h2>
            <p className="text-sm text-gray-500">{faculty.length} {faculty.length === 1 ? 'Faculty Member' : 'Faculty Members'} assigned to this department</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateBulkQR}
            disabled={isGeneratingPDF || faculty.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm font-medium"
          >
            <QrCode size={18} />
            {isGeneratingPDF ? 'Generating PDF...' : 'Generate Bulk QR'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={18} />
            Add Faculty to Department
          </button>
        </div>
      </div>

      {/* Faculty Members Grid */}
      {faculty.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Users size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">No faculty members in this department</h3>
          <p className="text-sm text-gray-500 mt-1">Click "Add Faculty to Department" to assign a faculty member under {decodedDept}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculty.map((fac) => (
            <div
              key={fac.faculty_id}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
              onClick={() => navigate(`/faculty/${fac.faculty_id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
                  <Users size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">{fac.faculty_name}</h3>
                  <p className="text-sm text-blue-600 font-medium truncate mb-1">{fac.department}</p>
                  <p className="text-xs text-gray-500 truncate mb-1">{fac.email}</p>
                  <p className="text-xs text-gray-500 truncate">{fac.location || 'Location not set'}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end text-xs font-medium text-blue-600">
                View Details & Inventory &rarr;
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-30 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Add Faculty Member</h3>
                <p className="text-xs text-gray-500">Department: <span className="font-semibold text-blue-600">{decodedDept}</span></p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name *</label>
                <input
                  type="text"
                  name="faculty_name"
                  placeholder="e.g. Dr. John Doe"
                  value={newFaculty.faculty_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (@sgipolytechnic.in or @sginstitute.in) *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john.doe@sginstitute.in"
                  value={newFaculty.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={decodedDept}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cabin / Office Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Building A, Room 204"
                  value={newFaculty.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFaculty}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedFaculty, setEditedFaculty] = useState(null);

  const fetchFacultyDetails = useCallback(async () => {
    try {
      const response = await api.get(`/faculty/${id}`);
      setFacultyMember(response.data);
      setEditedFaculty(response.data);
    } catch (err) {
      setError('Failed to fetch faculty details.');
      console.error('Error fetching faculty details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAssignedDevices = useCallback(async () => {
    try {
      const response = await api.get(`/devices?faculty_id=${id}`);
      setAssignedDevices(response.data);
    } catch (err) {
      setError('Failed to fetch assigned devices.');
      console.error('Error fetching assigned devices:', err);
    }
  }, [id]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/departments');
      setDepartmentsList(res.data);
    } catch (e) {
      console.error('Error fetching departments list:', e);
    }
  }, []);

  useEffect(() => {
    fetchFacultyDetails();
    fetchAssignedDevices();
    fetchDepartments();
  }, [id, fetchFacultyDetails, fetchAssignedDevices, fetchDepartments]);

  const handleDeleteFaculty = async () => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await api.delete(`/faculty/${id}`);
        if (facultyMember?.department) {
          navigate(`/faculty/department/${encodeURIComponent(facultyMember.department)}`);
        } else {
          navigate('/faculty');
        }
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
      fetchFacultyDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update faculty member.');
      console.error('Error updating faculty member:', err);
    }
  };

  const generateSingleDeviceQR = async (device) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const labelWidth = 85;
      const labelHeight = 50;
      const x = 12;
      const y = 15;

      doc.setDrawColor(220);
      doc.rect(x, y, labelWidth, labelHeight);

      // Department Title
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.setFont('helvetica', 'bold');
      doc.text((facultyMember?.department || 'FACULTY DEVICE').toUpperCase(), x + labelWidth / 2, y + 6, { align: 'center' });

      // Device Tag ID (e.g. CSE-0425)
      const tag = `CSE-${String(device.device_id).padStart(4, '0')}`;
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.text(tag, x + labelWidth / 2, y + 13, { align: 'center' });

      // QR Code Image
      const originUrl = window.location.origin.includes('localhost')
        ? 'http://sgideadstock.sginstitute.in'
        : window.location.origin;
      const qrValue = `${originUrl}/?device=${tag}`;
      const qrDataUrl = await QRCode.toDataURL(qrValue, { margin: 1, width: 200 });
      doc.addImage(qrDataUrl, 'PNG', x + (labelWidth - 25) / 2, y + 16, 25, 25);

      // Device Name
      doc.setFontSize(8);
      doc.setTextColor(50);
      doc.setFont('helvetica', 'normal');
      doc.text(device.device_name, x + labelWidth / 2, y + 45, { align: 'center' });

      // Footer Note
      doc.setFontSize(6);
      doc.setTextColor(180);
      doc.setFont('helvetica', 'normal');
      doc.text('SCAN FOR DEVICE DETAILS', x + labelWidth / 2, y + 48, { align: 'center' });

      doc.save(`${tag}_Device_QR_Label.pdf`);
    } catch (err) {
      console.error('Error generating device QR PDF:', err);
      alert('Failed to generate QR PDF.');
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading faculty details...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!facultyMember) return <div className="p-4 text-gray-600">Faculty member not found.</div>;

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/faculty')}>Faculty</span>
        {facultyMember.department && (
          <>
            <ChevronRight size={16} className="text-gray-400" />
            <span
              className="cursor-pointer hover:text-blue-600"
              onClick={() => navigate(`/faculty/department/${encodeURIComponent(facultyMember.department)}`)}
            >
              {facultyMember.department}
            </span>
          </>
        )}
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-800 font-medium">{facultyMember.faculty_name}</span>
      </div>

      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Users size={48} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{facultyMember.faculty_name}</h2>
            <p className="text-base text-blue-600 font-medium mb-1">{facultyMember.department}</p>
            <p className="text-sm text-gray-600 mb-1">{facultyMember.email}</p>
            <p className="text-sm text-gray-600 mb-1">{facultyMember.location || 'No location set'}</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Assigned Inventory</h3>
          {assignedDevices.length > 0 ? (
            assignedDevices.map((device) => (
              <div key={device.device_id} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {device.device_type === 'computer' ? (
                      <Monitor size={24} className="text-blue-600" />
                    ) : (
                      <Printer size={24} className="text-purple-600" />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-800">{device.device_name}</h4>
                      <p className="text-sm text-gray-600">{device.configuration}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      device.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {device.status}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() =>
                      navigate(`/devices/${device.device_id}`, {
                        state: { from: `/faculty/${id}`, label: facultyMember.faculty_name },
                      })
                    }
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    View Full Details
                  </button>
                  <button
                    onClick={() => generateSingleDeviceQR(device)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    <QrCode size={16} />
                    Generate QR
                  </button>
                </div>
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
            onClick={() => navigate(`/devices/add?facultyId=${id}`)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            <Plus size={18} />
            Assign Device
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Edit2 size={18} />
            Edit Faculty Details
          </button>
          <button
            onClick={handleDeleteFaculty}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            <Trash2 size={18} />
            Delete Faculty
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-30 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Edit Faculty Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="faculty_name"
                  value={editedFaculty.faculty_name}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editedFaculty.email}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                {departmentsList.length > 0 ? (
                  <select
                    name="department"
                    value={editedFaculty.department}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">Select Department</option>
                    {departmentsList.map((d) => (
                      <option key={d.department_id || d.department_name} value={d.department_name}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="department"
                    value={editedFaculty.department}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editedFaculty.location || ''}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateFaculty}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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

// Main Faculty component with sub-routes
const Faculty = () => {
  return (
    <Routes>
      <Route path="/" element={<DepartmentList />} />
      <Route path="/department/:deptName" element={<DepartmentFacultyList />} />
      <Route path="/:id" element={<FacultyDetail />} />
    </Routes>
  );
};

export default Faculty;