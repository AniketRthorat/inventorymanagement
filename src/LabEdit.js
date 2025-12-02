// inventory-management/src/LabEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';

const LabEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [labName, setLabName] = useState('');
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(null);

    useEffect(() => {
        const fetchLab = async () => {
            try {
                const response = await api.get(`/labs/${id}`);
                const labData = response.data;
                setLabName(labData.lab_name);
                setLocation(labData.location || '');
                setCapacity(labData.capacity || '');
            } catch (err) {
                setError('Failed to load lab details.');
                console.error('Error fetching lab for edit:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLab();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);
        try {
            await api.put(`/labs/${id}`, { lab_name: labName, location, capacity: parseInt(capacity, 10) });
            setSubmitMessage({ type: 'success', text: 'Lab updated successfully!' });
            setTimeout(() => navigate(`/labs/${id}`), 1500); // Redirect back to lab details after a short delay
        } catch (err) {
            setSubmitMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update lab.' });
            console.error('Error updating lab:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-8">Loading lab details for editing...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Lab: {labName}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="labName" className="block text-sm font-medium text-gray-700">Lab Name</label>
                    <input
                        type="text"
                        id="labName"
                        value={labName}
                        onChange={(e) => setLabName(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
                    <input
                        type="number"
                        id="capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/labs/${id}`)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Lab'}
                    </button>
                </div>
                {submitMessage && (
                    <p className={`mt-4 text-center ${submitMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {submitMessage.text}
                    </p>
                )}
            </form>
        </div>
    );
};

export default LabEdit;