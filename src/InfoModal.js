import React from 'react';
import { X } from 'lucide-react';

const InfoModal = ({ title, items, onClose }) => {
    if (!items) {
        return null;
    }

    const renderItem = (item) => {
        // Check if it's a device item
        if (item.device_name && item.device_type) {
            return (
                <li key={item.device_id || item.id} className="p-4 bg-gray-50 rounded-md mb-3 flex text-sm text-gray-700">
                    <div className="w-1/3">{item.device_type || 'N/A'}</div>
                    <div className="w-1/3">{item.device_name || 'N/A'}</div>
                    <div className="w-1/3">{item.lab_location || 'N/A'}</div>
                </li>
            );
        }
        // Check if it's a lab item
        if (item.lab_name) {
            return (
                <li key={item.lab_id} className="p-4 bg-gray-50 rounded-md mb-3">
                    <div className="font-bold text-lg mb-2 text-gray-800">{item.lab_name}</div>
                    <div className="text-sm text-gray-700 space-y-1">
                        <div className="flex">
                            <div className="w-1/3 font-semibold text-gray-600">Location:</div>
                            <div className="w-2/3">{item.location || 'N/A'}</div>
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
                    <div className="font-bold text-lg mb-2 text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-700 space-y-1">
                        <div className="flex">
                            <div className="w-1/3 font-semibold text-gray-600">Email:</div>
                            <div className="w-2/3">{item.email || 'N/A'}</div>
                        </div>
                        <div className="flex">
                            <div className="w-1/3 font-semibold text-gray-600">Department:</div>
                            <div className="w-2/3">{item.department || 'N/A'}</div>
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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {items.length > 0 ? (
                        <>
                            <div className="flex font-bold text-gray-700 border-b pb-2 mb-2">
                                <div className="w-1/3">Type</div>
                                <div className="w-1/3">Device Name</div>
                                <div className="w-1/3">Location</div>
                            </div>
                            <ul className="space-y-4">
                                {items.map(renderItem)}
                            </ul>
                        </>
                    ) : (
                        <p className="text-center text-gray-500">No items to display.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
