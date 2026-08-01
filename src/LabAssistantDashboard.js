import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, MapPin, Monitor, User, Check, X } from 'lucide-react';
import api from './api';

const formatReporterInfo = (issue) => {
    if (!issue) return 'N/A';
    const isFaculty = issue.student_class?.toLowerCase() === 'faculty' || issue.student_div?.toLowerCase() === 'faculty';
    if (isFaculty) {
        const name = issue.student_roll_no && issue.student_roll_no !== 'Faculty' && issue.student_roll_no !== 'Staff'
            ? issue.student_roll_no
            : 'Faculty Member';
        return `${name} (Faculty)`;
    }
    return `Class ${issue.student_class}/${issue.student_div} (Roll ${issue.student_roll_no})`;
};


const CountdownTimer = ({ reportedAt }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isLowTime, setIsLowTime] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            try {
                // SQLite timestamps are UTC. Convert 'YYYY-MM-DD HH:MM:SS' to ISO UTC string
                const utcString = reportedAt.replace(' ', 'T') + 'Z';
                const reportedTime = new Date(utcString).getTime();
                const limitMs = 48 * 60 * 60 * 1000; // 48 hours
                const elapsedMs = Date.now() - reportedTime;
                const remainingMs = limitMs - elapsedMs;

                if (remainingMs <= 0) {
                    setTimeLeft('Time Expired / Escalated');
                    setIsLowTime(true);
                    return;
                }

                const hours = Math.floor(remainingMs / (1000 * 60 * 60));
                const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

                // Highlight red if less than 12 hours remaining
                if (hours < 12) {
                    setIsLowTime(true);
                } else {
                    setIsLowTime(false);
                }

                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } catch (err) {
                setTimeLeft('Error parsing time');
            }
        };

        calculateTimeLeft();
        const intervalId = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(intervalId);
    }, [reportedAt]);

    return (
        <span className={`inline-flex items-center gap-1.5 font-mono px-3 py-1 rounded-full text-xs font-bold ${
            isLowTime ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
        }`}>
            <Clock size={12} />
            {timeLeft}
        </span>
    );
};

const LabAssistantDashboard = () => {
    const [issues, setIssues] = useState([]);
    const [resolvedIssues, setResolvedIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [resolveModalOpen, setResolveModalOpen] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [actionTaken, setActionTaken] = useState('');

    const fetchIssues = async () => {
        try {
            setError(null);
            const [activeRes, resolvedRes] = await Promise.all([
                api.get('issues/lab-assistant'),
                api.get('issues/resolved')
            ]);
            setIssues(activeRes.data || []);
            setResolvedIssues(resolvedRes.data || []);
        } catch (err) {
            console.error('Error fetching lab assistant issues:', err);
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
        setActionLoading(selectedIssueId);
        try {
            await api.put(`issues/${selectedIssueId}/resolve`, { action_taken: actionTaken });
            setResolveModalOpen(false);
            await fetchIssues(); // Refresh lists
        } catch (err) {
            console.error('Error resolving issue:', err);
            window.alert('Failed to resolve issue. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const utcString = dateStr.replace(' ', 'T') + 'Z';
            return new Date(utcString).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-500 text-sm">Loading reported issues...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Lab Assistant Dashboard</h2>
                <p className="text-gray-600 mt-1">Manage and resolve issues reported in your assigned labs within the 48-hour limit.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {issues.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={36} className="text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">All clear!</h3>
                    <p className="text-gray-500 max-w-md mx-auto text-sm">No pending issues reported in the last 48 hours. Keep up the good work!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {issues.map(issue => (
                        <div key={issue.issue_id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                            {/* Card Header */}
                            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <Monitor size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{issue.device_name || 'Unknown Device'}</h4>
                                        <span className="text-xs text-gray-400">Issue #{issue.issue_id}</span>
                                    </div>
                                </div>
                                <CountdownTimer reportedAt={issue.reported_at} />
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-4 flex-grow">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin size={14} className="text-gray-400" />
                                        <span><strong>Lab:</strong> {issue.lab_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <User size={14} className="text-gray-400" />
                                        <span><strong>Reporter:</strong> {formatReporterInfo(issue)}</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                                    <p className="text-xs font-semibold text-red-700 uppercase mb-1">Issue Description</p>
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{issue.description}</p>
                                </div>

                                <div className="text-xs text-gray-400 flex flex-col gap-1">
                                    <span><strong>Reported At:</strong> {formatDate(issue.reported_at)}</span>
                                    <span><strong>Responsible Assistant:</strong> <span className="text-gray-700 font-semibold">{issue.assistant_name || 'No Assistant Assigned'}</span></span>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => handleResolveClick(issue.issue_id)}
                                    disabled={actionLoading === issue.issue_id}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-75"
                                >
                                    {actionLoading === issue.issue_id ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                    ) : (
                                        <Check size={16} />
                                    )}
                                    Resolve Issue
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Solved Issues Section */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">Solved Issues</h3>
                    {resolvedIssues.length > 0 && (
                        <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            {resolvedIssues.length}
                        </span>
                    )}
                </div>

                {resolvedIssues.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm text-gray-500 text-sm">
                        No resolved issues yet.
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-5 py-3.5">Device & Student</th>
                                        <th className="px-5 py-3.5">Lab Location</th>
                                        <th className="px-5 py-3.5">Issue Description</th>
                                        <th className="px-5 py-3.5">Action Taken</th>
                                        <th className="px-5 py-3.5">Timeline</th>
                                        <th className="px-5 py-3.5 text-right">Solved By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                    {resolvedIssues.map(issue => (
                                        <tr key={issue.issue_id} className="hover:bg-gray-50/50">
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-gray-900">{issue.device_name || 'N/A'}</div>
                                                <div className="text-xs text-gray-500 font-normal">
                                                    {formatReporterInfo(issue)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-900">
                                                {issue.lab_name || 'N/A'}
                                            </td>
                                            <td className="px-5 py-4 max-w-xs break-words whitespace-pre-wrap">
                                                {issue.description}
                                            </td>
                                            <td className="px-5 py-4 break-words text-green-700 font-semibold whitespace-pre-wrap max-w-sm">
                                                {issue.action_taken || 'N/A'}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-500 space-y-1">
                                                <div><strong>Reported:</strong> {formatDate(issue.reported_at)}</div>
                                                <div className="text-green-600 font-medium"><strong>Solved:</strong> {formatDate(issue.resolved_at)}</div>
                                            </td>
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <span className="inline-block text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                    {issue.assistant_name || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                                    disabled={actionLoading === selectedIssueId}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-75"
                                >
                                    {actionLoading === selectedIssueId && (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                    )}
                                    Submit & Resolve
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabAssistantDashboard;
