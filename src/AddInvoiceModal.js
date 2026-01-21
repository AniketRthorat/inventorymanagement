import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import api from './api';

const AddInvoiceModal = ({ isOpen, onClose, onInvoiceAdded }) => {
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoicePdf, setInvoicePdf] = useState(null);
    const [devices, setDevices] = useState([]);
    const [labs, setLabs] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [centralStoreLabId, setCentralStoreLabId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const [devicesResponse, labsResponse, centralStoreResponse] = await Promise.all([
                api.get('/devices'),
                api.get('/labs'),
                api.get('/central-store-lab-id')
            ]);
            const fetchedDevices = devicesResponse.data;
            const fetchedLabs = labsResponse.data;
            const fetchedCentralStoreLabId = centralStoreResponse.data.hodCabinLabId;

            setDevices(fetchedDevices);
            setLabs(fetchedLabs);
            setCentralStoreLabId(fetchedCentralStoreLabId);
        } catch (err) {
            setError('Failed to fetch data.');
            console.error('Error fetching data:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 1024 * 1024) {
            setError('Invoice PDF size cannot exceed 1MB.');
            setInvoicePdf(null);
        } else {
            setError(null);
            setInvoicePdf(file);
        }
    };

    const handleDeviceSelection = (deviceId) => {
        setSelectedDevices(prevSelected =>
            prevSelected.includes(deviceId)
                ? prevSelected.filter(id => id !== deviceId)
                : [...prevSelected, deviceId]
        );
    };

    const handleSelectAll = (labId) => {
        const devicesInLab = devices.filter(d => d.lab_id === labId).map(d => d.device_id);
        const allSelected = devicesInLab.every(id => selectedDevices.includes(id));

        if (allSelected) {
            setSelectedDevices(prevSelected => prevSelected.filter(id => !devicesInLab.includes(id)));
        } else {
            setSelectedDevices(prevSelected => [...new Set([...prevSelected, ...devicesInLab])]);
        }
    };


    const handleSubmit = async () => {
        if (!invoiceNumber || !invoicePdf || selectedDevices.length === 0) {
            setError('Please fill all fields and select at least one device.');
            return;
        }

        // Client-side validation for PDF size (1MB limit)
        if (invoicePdf.size > 1024 * 1024) {
            setError('Invoice PDF size cannot exceed 1MB.');
            return;
        }

        const formData = new FormData();
        formData.append('invoice_number', invoiceNumber);
        formData.append('invoice_pdf', invoicePdf);
        formData.append('device_ids', JSON.stringify(selectedDevices));

        try {
            await api.post('invoices', formData);
            onInvoiceAdded();
            onClose();
        } catch (err) {
            const backendError = err.response && err.response.data ?
                (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) :
                'An unexpected error occurred.';
            setError(`Failed to add invoice: ${backendError}`);
            console.error('Error adding invoice:', err.response ? err.response.data : err);
        }
    };

    if (!isOpen) {
        return null;
    }

    const devicesByLab = labs.map(lab => ({
        ...lab,
        devices: devices.filter(device => device.lab_id === lab.lab_id),
    }));

    const otherDevices = devices.filter(d => !d.lab_id || !labs.some(l => l.lab_id === d.lab_id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-11/12 md:w-1/2 lg:w-2/3">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Add New Invoice</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Invoice Number"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <div>
                        <label htmlFor="invoice-pdf-upload" className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <Upload size={18} />
                            <span>{invoicePdf ? invoicePdf.name : 'Upload Invoice PDF (Max 1MB)'}</span>
                        </label>
                        <input
                            id="invoice-pdf-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Devices
                        </label>
                        <div className="w-full h-64 overflow-y-auto border border-gray-300 rounded-lg p-2">
                            {devicesByLab.map(lab => (
                                <div key={lab.lab_id} className="mb-4">
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id={`lab-${lab.lab_id}`}
                                            checked={lab.devices.length > 0 && lab.devices.every(d => selectedDevices.includes(d.device_id))}
                                            onChange={() => handleSelectAll(lab.lab_id)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <label htmlFor={`lab-${lab.lab_id}`} className="ml-2 font-semibold text-gray-800 cursor-pointer select-none">
                                            {lab.lab_name}
                                        </label>
                                    </div>
                                    <div className="ml-6">
                                        {lab.devices.map(device => (
                                            <div key={device.device_id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`device-${device.device_id}`}
                                                    value={device.device_id}
                                                    checked={selectedDevices.includes(device.device_id)}
                                                    onChange={() => handleDeviceSelection(device.device_id)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                />
                                                <label htmlFor={`device-${device.device_id}`} className="ml-2 text-gray-700 cursor-pointer select-none">
                                                    {device.device_name} ({device.device_type})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {otherDevices.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id="lab-others"
                                            checked={otherDevices.length > 0 && otherDevices.every(d => selectedDevices.includes(d.device_id))}
                                            onChange={() => {
                                                const ids = otherDevices.map(d => d.device_id);
                                                const allSelected = ids.every(id => selectedDevices.includes(id));
                                                if (allSelected) {
                                                    setSelectedDevices(prev => prev.filter(id => !ids.includes(id)));
                                                } else {
                                                    setSelectedDevices(prev => [...new Set([...prev, ...ids])]);
                                                }
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <label htmlFor="lab-others" className="ml-2 font-semibold text-gray-800 cursor-pointer select-none">Others (Unmapped)</label>
                                    </div>
                                    <div className="ml-6">
                                        {otherDevices.map(device => (
                                            <div key={device.device_id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`device-${device.device_id}`}
                                                    value={device.device_id}
                                                    checked={selectedDevices.includes(device.device_id)}
                                                    onChange={() => handleDeviceSelection(device.device_id)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                />
                                                <label htmlFor={`device-${device.device_id}`} className="ml-2 text-gray-700 cursor-pointer select-none">
                                                    {device.device_name} ({device.device_type})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Add Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddInvoiceModal;
