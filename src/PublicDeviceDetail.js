import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Monitor, Laptop, Printer, Mouse, Keyboard, Smartphone, Cpu,
    Box, AlertCircle, MapPin, User, ChevronLeft, Wrench, CheckCircle,
    Clock, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import api from './api';
import { useAuth } from './AuthContext';

const PublicDeviceDetail = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, userRole, logout } = useAuth();
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Maintenance modal state
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    const [changesMade, setChangesMade] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Issue modal state
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [studentClass, setStudentClass] = useState('');
    const [studentDiv, setStudentDiv] = useState('');
    const [studentRollNo, setStudentRollNo] = useState('');
    const [selectedLabId, setSelectedLabId] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [labs, setLabs] = useState([]);
    const [issueSubmitLoading, setIssueSubmitLoading] = useState(false);
    const [issueSubmitSuccess, setIssueSubmitSuccess] = useState(false);
    const [issueSubmitError, setIssueSubmitError] = useState(null);

    // Maintenance history state
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    const fetchDevice = async () => {
        try {
            const response = await api.get(`public/devices/${code}`);
            setDevice(response.data);
            if (response.data?.lab_id) {
                setSelectedLabId(response.data.lab_id.toString());
            }
        } catch (err) {
            setError(err.response?.data || 'Failed to fetch device details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMaintenanceLogs = async () => {
        try {
            setLogsLoading(true);
            const response = await api.get(`public/devices/${code}/maintenance`);
            setMaintenanceLogs(response.data);
        } catch (err) {
            console.error('Error fetching maintenance logs:', err);
        } finally {
            setLogsLoading(false);
        }
    };

    const fetchLabs = async () => {
        try {
            const response = await api.get('labs');
            setLabs(response.data);
        } catch (err) {
            console.error('Error fetching labs:', err);
        }
    };

    useEffect(() => {
        fetchDevice();
        fetchMaintenanceLogs();
        fetchLabs();
    }, [code]);



    // Automatically open maintenance modal if redirected from login with action=log_maintenance
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const action = params.get('action');
        if (device && action === 'log_maintenance' && isAuthenticated && (userRole === 'assistant' || userRole === 'admin')) {
            setIsMaintenanceModalOpen(true);
        }
    }, [device, location.search, isAuthenticated, userRole]);

    const handleMaintenanceSubmit = async () => {
        setSubmitError(null);
        const activeAssistantName = (device?.assistant_name || 'Lab Assistant').trim();
        if (!activeAssistantName) {
            setSubmitError('Respective lab assistant name is not assigned.');
            return;
        }
        if (!changesMade.trim()) {
            setSubmitError('Please describe the changes you made.');
            return;
        }

        setSubmitLoading(true);
        try {
            await api.post(`public/devices/${code}/maintenance`, {
                assistant_name: activeAssistantName,
                changes_made: changesMade.trim(),
            });
            // Refresh device (to get updated last_maintenance_date) and logs
            await Promise.all([fetchDevice(), fetchMaintenanceLogs()]);
            setIsMaintenanceModalOpen(false);
            setChangesMade('');
            setShowHistory(true); // Auto-expand history after logging
            window.alert('Maintenance logged successfully!');
            logout(); // Clear session
            navigate(`/device/${code}`);
        } catch (err) {
            setSubmitError(err.response?.data?.error || 'Failed to save maintenance log. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (submitLoading) return;
        setIsMaintenanceModalOpen(false);
        setSubmitSuccess(false);
        setSubmitError(null);
        setChangesMade('');
        logout(); // Clear session
        navigate(`/device/${code}`);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const getDeviceIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'desktop': return <Monitor className="w-12 h-12 text-blue-500" />;
            case 'laptop': return <Laptop className="w-12 h-12 text-blue-500" />;
            case 'printer': return <Printer className="w-12 h-12 text-blue-500" />;
            case 'mouse': return <Mouse className="w-12 h-12 text-blue-500" />;
            case 'keyboard': return <Keyboard className="w-12 h-12 text-blue-500" />;
            case 'cpu': return <Cpu className="w-12 h-12 text-blue-500" />;
            default: return <Box className="w-12 h-12 text-blue-500" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium shadow-sm hover:bg-blue-600 transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="bg-blue-500 p-6 flex flex-col items-center text-white">
                    <div className="bg-white p-4 rounded-full shadow-inner mb-4">
                        {getDeviceIcon(device.device_type)}
                    </div>
                    <h1 className="text-2xl font-bold text-center">{device.device_name}</h1>
                    <span className="mt-1 px-3 py-1 bg-blue-400 bg-opacity-50 rounded-full text-sm font-medium">
                        {code}
                    </span>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status & Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Type</p>
                            <p className="text-gray-800 font-medium capitalize">{device.device_type}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-sm font-bold ${
                                device.status === 'active' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                                {device.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <MapPin className="text-blue-500 w-5 h-5" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                                <p className="text-gray-800 font-medium">{device.lab_name || 'Not Assigned'}</p>
                            </div>
                        </div>

                        {device.company && (
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <Box className="text-blue-500 w-5 h-5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Company</p>
                                    <p className="text-gray-800 font-medium">{device.company}</p>
                                </div>
                            </div>
                        )}

                        {/* Specifications */}
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Specifications</p>
                            <div className="grid grid-cols-1 gap-y-2 text-sm text-gray-700">
                                {device.cpu && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">CPU</span>
                                        <span className="font-medium">{device.cpu}</span>
                                    </div>
                                )}
                                {device.ram && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">RAM</span>
                                        <span className="font-medium">{device.ram} GB</span>
                                    </div>
                                )}
                                {device.storage && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">Storage</span>
                                        <span className="font-medium">{device.storage} GB</span>
                                    </div>
                                )}
                                {device.display_size && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">Display Size</span>
                                        <span className="font-medium">{device.display_size}"</span>
                                    </div>
                                )}
                                {device.ip_generation && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">IP Generation</span>
                                        <span className="font-medium">{device.ip_generation}</span>
                                    </div>
                                )}
                                {device.last_maintenance_date && (
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-500">Last Maint.</span>
                                        <span className="font-medium text-green-600">{formatDate(device.last_maintenance_date)}</span>
                                    </div>
                                )}
                                {device.invoice_number && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Invoice #</span>
                                        <span className="font-medium">{device.invoice_number}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Report Issue Button */}
                        <button
                            id="report-issue-btn"
                            onClick={() => setIsIssueModalOpen(true)}
                            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100"
                        >
                            <AlertCircle size={18} />
                            Report an Issue
                        </button>

                        {/* Maintenance Button */}
                        <button
                            id="log-maintenance-btn"
                            onClick={() => {
                                if (isAuthenticated && (userRole === 'assistant' || userRole === 'admin')) {
                                    setIsMaintenanceModalOpen(true);
                                } else {
                                    navigate(`/login?redirect=${encodeURIComponent(`/device/${code}?action=log_maintenance`)}`);
                                }
                            }}
                            className="w-full py-3 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2 border border-green-200"
                        >
                            <Wrench size={18} />
                            Log Maintenance
                        </button>

                        {/* Maintenance History Section */}
                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                            <button
                                id="toggle-history-btn"
                                onClick={() => setShowHistory(prev => !prev)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                                    <Clock size={15} className="text-blue-500" />
                                    Maintenance History
                                    {maintenanceLogs.length > 0 && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                            {maintenanceLogs.length}
                                        </span>
                                    )}
                                </div>
                                {showHistory ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                            </button>

                            {showHistory && (
                                <div className="divide-y divide-gray-100">
                                    {logsLoading ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 size={20} className="animate-spin text-blue-400" />
                                        </div>
                                    ) : maintenanceLogs.length === 0 ? (
                                        <p className="text-center text-gray-400 text-sm py-6">No maintenance records yet.</p>
                                    ) : (
                                        maintenanceLogs.map((log, idx) => (
                                            <div key={log.log_id || idx} className="px-4 py-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <User size={13} className="text-green-700" />
                                                        </div>
                                                        <span className="font-semibold text-gray-800 text-sm">{log.assistant_name}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{formatDate(log.maintenance_date)}</span>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-600 pl-9 leading-relaxed">{log.changes_made}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    <p className="text-center text-xs text-gray-400 mb-4">
                        SGI Inventory Management System
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <ChevronLeft size={18} />
                        Back to System
                    </button>
                </div>
            </div>

            {/* Maintenance Modal */}
            {isMaintenanceModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

                        {/* Modal Header */}
                        <div className="bg-green-500 px-6 py-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <Wrench size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Log Maintenance</h2>
                                    <p className="text-green-100 text-xs">{device.device_name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {submitSuccess ? (
                                /* Success State */
                                <div className="flex flex-col items-center py-6 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle size={36} className="text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Logged!</h3>
                                    <p className="text-gray-500 text-sm">Maintenance record saved and date updated successfully.</p>
                                </div>
                            ) : (
                                /* Form */
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Lab Location
                                        </label>
                                        <input
                                            type="text"
                                            value={device ? device.lab_name : 'N/A'}
                                            readOnly
                                            className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-gray-500 text-sm cursor-not-allowed font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Device Number
                                        </label>
                                        <input
                                            type="text"
                                            value={code || 'N/A'}
                                            readOnly
                                            className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-gray-500 text-sm cursor-not-allowed font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Lab Assistent Name
                                        </label>
                                        <input
                                            type="text"
                                            value={device ? (device.assistant_name || 'Not Assigned') : 'Loading...'}
                                            readOnly
                                            className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-gray-500 text-sm cursor-not-allowed font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Changes / Work Done <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="changes-made-input"
                                            placeholder="Describe what was fixed or serviced, e.g. Replaced RAM, Cleaned fan, Updated drivers..."
                                            value={changesMade}
                                            onChange={e => setChangesMade(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm resize-none"
                                            disabled={submitLoading}
                                        />
                                    </div>

                                    {submitError && (
                                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-red-600 text-sm">{submitError}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            id="cancel-maintenance-btn"
                                            onClick={handleCloseModal}
                                            disabled={submitLoading}
                                            className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all text-sm shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            id="submit-maintenance-btn"
                                            onClick={handleMaintenanceSubmit}
                                            disabled={submitLoading}
                                            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 shadow-sm"
                                        >
                                            {submitLoading ? (
                                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                            ) : (
                                                <><CheckCircle size={16} /> Save Log</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Issue Reporting Modal */}
            {isIssueModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-red-600 px-6 py-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <AlertCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Report an Issue</h2>
                                    <p className="text-red-100 text-xs">{device.device_name} ({code})</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {issueSubmitSuccess ? (
                                /* Success State */
                                <div className="flex flex-col items-center py-6 text-center">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle size={36} className="text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Submitted!</h3>
                                    <p className="text-gray-500 text-sm">Issue has been successfully reported to the Lab Assistant.</p>
                                </div>
                            ) : (
                                /* Form */
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                System Number
                                            </label>
                                            <input
                                                type="text"
                                                value={device.device_name}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm outline-none cursor-not-allowed"
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Lab Location <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={selectedLabId}
                                                onChange={e => setSelectedLabId(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                                                disabled={issueSubmitLoading}
                                            >
                                                <option value="">Select Lab</option>
                                                {labs.map(lab => (
                                                    <option key={lab.lab_id} value={lab.lab_id}>
                                                        {lab.lab_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Class <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. TY"
                                                value={studentClass}
                                                onChange={e => setStudentClass(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                                                disabled={issueSubmitLoading}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Division <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. A"
                                                value={studentDiv}
                                                onChange={e => setStudentDiv(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                                                disabled={issueSubmitLoading}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Roll No <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 45"
                                                value={studentRollNo}
                                                onChange={e => setStudentRollNo(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                                                disabled={issueSubmitLoading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Describe the Issue <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            placeholder="Explain what is not working (e.g. Mouse left-click broken, Monitor showing no display...)"
                                            value={issueDescription}
                                            onChange={e => setIssueDescription(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none"
                                            disabled={issueSubmitLoading}
                                        />
                                    </div>

                                    {issueSubmitError && (
                                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-red-600 text-sm">{issueSubmitError}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => {
                                                setIsIssueModalOpen(false);
                                                setIssueSubmitError(null);
                                            }}
                                            disabled={issueSubmitLoading}
                                            className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all text-sm shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setIssueSubmitError(null);
                                                if (!studentClass.trim()) {
                                                    setIssueSubmitError('Please enter your class.');
                                                    return;
                                                }
                                                if (!studentDiv.trim()) {
                                                    setIssueSubmitError('Please enter your division.');
                                                    return;
                                                }
                                                if (!studentRollNo.trim()) {
                                                    setIssueSubmitError('Please enter your roll number.');
                                                    return;
                                                }
                                                if (!selectedLabId) {
                                                    setIssueSubmitError('Please select a lab.');
                                                    return;
                                                }
                                                if (!issueDescription.trim()) {
                                                    setIssueSubmitError('Please describe the issue.');
                                                    return;
                                                }

                                                setIssueSubmitLoading(true);
                                                try {
                                                    await api.post(`public/devices/${code}/issues`, {
                                                        lab_id: parseInt(selectedLabId, 10),
                                                        student_class: studentClass.trim(),
                                                        student_div: studentDiv.trim(),
                                                        student_roll_no: studentRollNo.trim(),
                                                        description: issueDescription.trim()
                                                    });
                                                    setIssueSubmitSuccess(true);
                                                    setTimeout(() => {
                                                        setIsIssueModalOpen(false);
                                                        setIssueSubmitSuccess(false);
                                                        setStudentClass('');
                                                        setStudentDiv('');
                                                        setStudentRollNo('');
                                                        setIssueDescription('');
                                                    }, 2000);
                                                } catch (err) {
                                                    setIssueSubmitError(err.response?.data?.error || 'Failed to submit issue report. Please try again.');
                                                } finally {
                                                    setIssueSubmitLoading(false);
                                                }
                                            }}
                                            disabled={issueSubmitLoading}
                                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 shadow-sm"
                                        >
                                            {issueSubmitLoading ? (
                                                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                                            ) : (
                                                <><CheckCircle size={16} /> Submit Report</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicDeviceDetail;
