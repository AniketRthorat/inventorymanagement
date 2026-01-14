import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatString = (str) => {
    if (!str || str === 'N/A') return str;
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatDeviceType = (type) => {
    if (!type) return 'N/A';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const InfoModal = ({ title, items, onClose }) => {
    const navigate = useNavigate();
    if (!items) {
        return null;
    }

    const renderItem = (item) => {
        // Check if it's a device item
        if (item.device_name && item.device_type) {
            return (
                <li key={item.device_id || item.id} className="p-4 bg-gray-50 rounded-md mb-3 flex flex-col text-sm text-gray-700">
                    <div className="flex mb-1">
                        <div className="w-1/3">{formatDeviceType(item.device_type)}</div>
                        <div className="w-1/3 font-medium">{formatString(item.device_name)}</div>
                        <div className="w-1/3">{formatString(item.lab_location)}</div>
                    </div>
                    <button
                        onClick={() => navigate(`/devices/${item.device_id}`, { state: { from: window.location.pathname, label: title } })}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-left font-medium"
                    >
                        View Details →
                    </button>
                </li>
            );
        }
        // Check if it's a lab item
        if (item.lab_name) {
            return (
                <li key={item.lab_id} className="p-4 bg-gray-50 rounded-md mb-3">
                    <div className="font-bold text-lg mb-2 text-gray-800">{formatString(item.lab_name)}</div>
                    <div className="text-sm text-gray-700 space-y-1">
                        <div className="flex">
                            <div className="w-1/3 font-semibold text-gray-600">Location:</div>
                            <div className="w-2/3">{formatString(item.location)}</div>
                        </div>
                        <div className="flex">
                            <div className="w-1/3 font-semibold text-gray-600">Capacity:</div>
                            <div className="w-2/3">{item.capacity || 'N/A'}</div>
                        </div>
                    </div>
                </li>
            );
        }
        // Check if it's a faculty item
        if (item.name) {
            return (
                <li key={item.faculty_id} className="p-4 bg-gray-50 rounded-md mb-3">
                    <div className="font-bold text-lg mb-2 text-gray-800">{formatString(item.name)}</div>
                    <div className="text-sm text-gray-700 space-y-1">
                        <div className="flex">
                            <div className="w-1/3 font-semibold text-gray-600">Email:</div>
                            <div className="w-2/3">{item.email || 'N/A'}</div>
                        </div>
                        <div className="flex">
                            <div className="w-1/3 font-semibold text-gray-600">Department:</div>
                            <div className="w-2/3">{formatString(item.department)}</div>
                        </div>
                    </div>
                </li>
            );
        }
        // Fallback for any other type of item
        return (
            <li key={item.id || Math.random()} className="p-4 bg-gray-50 rounded-md mb-3">
                <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto text-xs">
                    {JSON.stringify(item, null, 2)}
                </pre>
            </li>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                    {items.length > 0 ? (
                        <>
                            <div className="flex font-bold text-gray-700 border-b pb-2 mb-2 sticky top-0 bg-white z-10 px-6 pt-6">
                                <div className="w-1/3">Type</div>
                                <div className="w-1/3">Device Name</div>
                                <div className="w-1/3">Location</div>
                            </div>
                            <ul className="space-y-4 px-6 pb-6">
                                {items.map(renderItem)}
                            </ul>
                        </>
                    ) : (
                        <p className="text-center text-gray-500 p-6">No items to display.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
