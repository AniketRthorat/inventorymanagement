import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Check, ChevronRight, X, Trash2 } from 'lucide-react';
import api from './api';
import { useAuth } from './AuthContext';

const CountdownTimer = ({ reportedAt }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isEscalated, setIsEscalated] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            try {
                const utcString = reportedAt.replace(' ', 'T') + 'Z';
                const reportedTime = new Date(utcString).getTime();
                const limitMs = 48 * 60 * 60 * 1000;
                const elapsedMs = Date.now() - reportedTime;
                const remainingMs = limitMs - elapsedMs;

                if (remainingMs <= 0) {
                    setTimeLeft('Escalated (> 48h)');
                    setIsEscalated(true);
                    return;
                }

                const hours = Math.floor(remainingMs / (1000 * 60 * 60));
                const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

                setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
                setIsEscalated(false);
            } catch (err) {
                setTimeLeft('Error parsing time');
            }
        };

        calculateTimeLeft();
        const intervalId = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(intervalId);
    }, [reportedAt]);

    return (
        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
            isEscalated ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
            {timeLeft}
        </span>
    );
};

const IssuesPage = () => {
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const [pendingIssues, setPendingIssues] = useState([]);
    const [resolvedIssues, setResolvedIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resolveModalOpen, setResolveModalOpen] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [actionTaken, setActionTaken] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [issueIdToDelete, setIssueIdToDelete] = useState(null);

    const fetchIssues = async () => {
        try {
            setError(null);
            const [pendingRes, resolvedRes] = await Promise.all([
                api.get('issues/pending'),
                api.get('issues/resolved')
            ]);
            setPendingIssues(pendingRes.data || []);
            setResolvedIssues(resolvedRes.data || []);
        } catch (err) {
            console.error('Error fetching issues:', err);
            setError('Failed to fetch issues. Please reload.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleResolveClick = (issueId) => {
        setSelectedIssueId(issueId);
        setActionTaken('');
        setResolveModalOpen(true);
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        if (!actionTaken.trim()) {
            window.alert('Please enter the action taken to resolve the issue.');
            return;
        }
        try {
            await api.put(`issues/${selectedIssueId}/resolve`, { action_taken: actionTaken });
            setResolveModalOpen(false);
            await fetchIssues(); // Refresh lists
        } catch (err) {
            console.error('Error resolving issue:', err);
            window.alert('Failed to resolve issue. Please try again.');
        }
    };

    const handleDeleteClick = (issueId) => {
        setIssueIdToDelete(issueId);
        setDeleteModalOpen(true);
    };

    const confirmDeleteIssue = async () => {
        try {
            await api.delete(`issues/${issueIdToDelete}`);
            setDeleteModalOpen(false);
            await fetchIssues(); // Refresh lists
        } catch (err) {
            console.error('Error deleting issue:', err);
            window.alert('Failed to delete issue. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-500 text-sm">Loading issues...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard')}>Home</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-800 font-medium">Issues</span>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-800">Issues Tracking</h2>
                <p className="text-gray-600 mt-1">Track and resolve hardware, system, and lab issues reported by students.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Pending Issues Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="text-red-500" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Pending Issues</h3>
                        {pendingIssues.length > 0 && (
                            <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                {pendingIssues.length}
                            </span>
                        )}
                    </div>
                </div>

                {pendingIssues.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No pending issues currently.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-4 py-3">Device & Student</th>
                                    <th className="px-4 py-3">Lab & Assistant</th>
                                    <th className="px-4 py-3">Issue Description</th>
                                    <th className="px-4 py-3">Deadline</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                {pendingIssues.map(issue => {
                                    return (
                                        <tr key={issue.issue_id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-gray-900">{issue.device_name || 'N/A'}</div>
                                                <div className="text-xs text-gray-500 font-normal">
                                                    Class {issue.student_class}/{issue.student_div} (Roll {issue.student_roll_no})
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="text-gray-900">{issue.lab_name || 'N/A'}</div>
                                                <div className="text-xs font-semibold text-blue-600">
                                                    Assistant: {issue.assistant_name || 'None Assigned'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 break-words whitespace-pre-wrap max-w-sm">
                                                {issue.description}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <CountdownTimer reportedAt={issue.reported_at} />
                                            </td>
                                            <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                                                <button
                                                    onClick={() => handleResolveClick(issue.issue_id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-bold border border-green-200"
                                                >
                                                    <Check size={14} />
                                                    Resolve
                                                </button>
                                                {userRole === 'admin' && (
                                                    <button
                                                        onClick={() => handleDeleteClick(issue.issue_id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold border border-red-200"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Solved Issues Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Solved Issues</h3>
                        {resolvedIssues.length > 0 && (
                            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                {resolvedIssues.length}
                            </span>
                        )}
                    </div>
                </div>

                {resolvedIssues.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No solved issues yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-4 py-3">Device & Student</th>
                                    <th className="px-4 py-3">Lab Location</th>
                                    <th className="px-4 py-3">Issue Description</th>
                                    <th className="px-4 py-3">Action Taken</th>
                                    <th className="px-4 py-3">Timeline</th>
                                    <th className="px-4 py-3 text-right">Solved By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                {resolvedIssues.map(issue => {
                                    const reportedDate = new Date(issue.reported_at.replace(' ', 'T') + 'Z');
                                    const resolvedDate = new Date(issue.resolved_at.replace(' ', 'T') + 'Z');
                                    return (
                                        <tr key={issue.issue_id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-gray-900">{issue.device_name || 'N/A'}</div>
                                                <div className="text-xs text-gray-500 font-normal">
                                                    Class {issue.student_class}/{issue.student_div} (Roll {issue.student_roll_no})
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-900 font-medium">
                                                {issue.lab_name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3.5 break-words whitespace-pre-wrap max-w-xs">
                                                {issue.description}
                                            </td>
                                            <td className="px-4 py-3.5 break-words text-green-700 font-semibold whitespace-pre-wrap max-w-sm">
                                                {issue.action_taken || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-gray-500 space-y-1">
                                                <div><strong>Reported:</strong> {reportedDate.toLocaleString('en-IN')}</div>
                                                <div className="text-green-600 font-medium"><strong>Solved:</strong> {resolvedDate.toLocaleString('en-IN')}</div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-3">
                                                <span className="inline-block text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                    {issue.assistant_name || 'N/A'}
                                                </span>
                                                {userRole === 'admin' && (
                                                    <button
                                                        onClick={() => handleDeleteClick(issue.issue_id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold border border-red-200"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Resolve Issue Modal */}
            {resolveModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                            <h3 className="text-lg font-bold text-gray-800">Resolve Issue #{selectedIssueId}</h3>
                            <button
                                onClick={() => setResolveModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleResolveSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="actionTaken" className="block text-sm font-medium text-gray-700 mb-1">
                                    Action Taken to Resolve Issue <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="actionTaken"
                                    rows="4"
                                    required
                                    value={actionTaken}
                                    onChange={(e) => setActionTaken(e.target.value)}
                                    placeholder="Describe the steps taken (e.g. replaced keyboard, reinstalled RAM, fixed connection...)"
                                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setResolveModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                                >
                                    Submit & Resolve
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-600 mb-4">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Reported Issue?</h3>
                        <p className="text-sm text-gray-500 mb-6 text-center">
                            Are you sure you want to delete this reported issue? This action cannot be undone and will permanently remove it.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteIssue}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssuesPage;
