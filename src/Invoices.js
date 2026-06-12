import React, { useState, useEffect } from 'react';
import { FileText, Eye, Package, ExternalLink, Trash2, Edit, X, Upload, AlertCircle, Loader2 } from 'lucide-react';
import api from './api';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [error, setError] = useState(null);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editInvoiceNumber, setEditInvoiceNumber] = useState('');
    const [editInvoicePdf, setEditInvoicePdf] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/invoices');
            setInvoices(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch invoices.');
            setLoading(false);
            console.error('Error fetching invoices:', err);
        }
    };

    const fetchInvoiceDetails = async (invoiceNumber) => {
        try {
            // First clear current selection to show immediate response if needed, 
            // but better to just set a mini loading state for the detail pane
            setLoadingPdf(true);

            // 1. Fetch metadata (number, devices, etc) - This is FAST
            const response = await api.get(`/invoices/${invoiceNumber}`);
            setSelectedInvoice(response.data);

            // 2. Fetch PDF blob - This might be SLOW
            try {
                const pdfResponse = await api.get(`/invoices/${invoiceNumber}/pdf`);
                setSelectedInvoice(prev => ({
                    ...prev,
                    invoice_pdf: pdfResponse.data.invoice_pdf
                }));
            } catch (pdfErr) {
                console.error('Error fetching PDF:', pdfErr);
            } finally {
                setLoadingPdf(false);
            }
        } catch (err) {
            console.error('Error fetching invoice details:', err);
            setLoadingPdf(false);
        }
    };

    const handleDeleteInvoice = async (invoiceNumber) => {
        if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This will unmap all devices and delete the PDF.`)) {
            return;
        }

        try {
            await api.delete(`/invoices/${invoiceNumber}`);
            alert('Invoice deleted successfully');
            setSelectedInvoice(null);
            fetchInvoices();
        } catch (err) {
            console.error('Error deleting invoice:', err);
            alert('Failed to delete invoice');
        }
    };

    const openEditModal = () => {
        setEditInvoiceNumber(selectedInvoice.invoice_number);
        setEditInvoicePdf(null);
        setIsEditModalOpen(true);
    };

    const handleUpdateInvoice = async () => {
        if (!editInvoiceNumber) {
            alert('Invoice number is required');
            return;
        }

        try {
            setIsUpdating(true);
            const formData = new FormData();
            formData.append('invoice_number', editInvoiceNumber);
            if (editInvoicePdf) {
                formData.append('invoice_pdf', editInvoicePdf);
            }

            await api.put(`/invoices/${selectedInvoice.invoice_number}`, formData);
            alert('Invoice updated successfully');
            setIsEditModalOpen(false);
            fetchInvoices();
            fetchInvoiceDetails(editInvoiceNumber);
        } catch (err) {
            console.error('Error updating invoice:', err);
            alert('Failed to update invoice');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="p-8 italic text-gray-500">Loading invoices...</div>;
    if (error) return <div className="p-8 text-red-500 border border-red-200 bg-red-50 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        {error}
    </div>;

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)]">
            {/* Sidebar / List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col text-sm md:text-base">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FileText size={20} className="text-blue-500" />
                        Invoices
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {invoices.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No invoices found.</div>
                    ) : (
                        invoices.map((inv) => (
                            <button
                                key={inv.invoice_number}
                                onClick={() => fetchInvoiceDetails(inv.invoice_number)}
                                className={`w-full p-4 border-b border-gray-50 text-left transition-colors hover:bg-blue-50/30 ${selectedInvoice?.invoice_number === inv.invoice_number ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                            >
                                <div className="font-semibold text-gray-900">{inv.invoice_number}</div>
                                <div className="text-xs text-gray-500 flex justify-between mt-1">
                                    <span>{inv.device_count} devices</span>
                                    <span>{new Date(inv.updated_at).toLocaleDateString()}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Content / Detail */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {selectedInvoice ? (
                    <>
                        {/* Detail Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{selectedInvoice.invoice_number}</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Updated on {new Date(selectedInvoice.updated_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={openEditModal}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                    title="Edit Invoice"
                                >
                                    <Edit size={18} />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteInvoice(selectedInvoice.invoice_number)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-red-100 text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                                    title="Delete Invoice"
                                >
                                    <Trash2 size={18} />
                                    <span>Delete</span>
                                </button>
                                <div className="ml-2 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-medium flex items-center gap-2 shadow-inner">
                                    <Package size={18} />
                                    {selectedInvoice.devices ? selectedInvoice.devices.length : 0} Devices
                                </div>
                            </div>
                        </div>

                        {/* Detail Content (Device List + PDF) */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Device List Pane - Shows IMMEDIATELY after metadata fetch */}
                            <div className="w-1/2 p-6 border-r border-gray-100 overflow-y-auto bg-gray-50/30">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Mapped Devices</h3>
                                <div className="space-y-3">
                                    {selectedInvoice.devices && selectedInvoice.devices.length > 0 ? (
                                        selectedInvoice.devices.map((device) => (
                                            <div key={device.device_id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm transition-transform hover:scale-[1.01]">
                                                <div className="font-medium text-gray-900">{device.device_name}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                                    <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{device.device_type}</span>
                                                    <span className={`px-2 py-0.5 rounded border ${device.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                        {device.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-dashed border-gray-200">
                                            <Package size={32} className="mx-auto mb-2 opacity-20" />
                                            <p>No devices mapped to this invoice number.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PDF Viewer Pane - Shows loading state or PDF */}
                            <div className="w-1/2 flex flex-col bg-gray-100 relative">
                                {loadingPdf ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-blue-600 bg-white/80 absolute inset-0 z-20">
                                        <Loader2 size={40} className="animate-spin mb-2" />
                                        <p className="font-medium text-sm">Loading PDF preview...</p>
                                    </div>
                                ) : null}

                                {selectedInvoice.invoice_pdf ? (
                                    <div className="flex-1 flex flex-col">
                                        <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center z-10">
                                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <Eye size={16} /> Invoice PDF
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const linkSource = `data:application/pdf;base64,${selectedInvoice.invoice_pdf}`;
                                                    const downloadLink = document.createElement("a");
                                                    downloadLink.href = linkSource;
                                                    downloadLink.download = `Invoice_${selectedInvoice.invoice_number}.pdf`;
                                                    downloadLink.click();
                                                }}
                                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 font-medium transition-colors"
                                            >
                                                <ExternalLink size={14} /> Download
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <iframe
                                                src={`data:application/pdf;base64,${selectedInvoice.invoice_pdf}#toolbar=0`}
                                                width="100%"
                                                height="100%"
                                                className="border-none"
                                                title="Invoice PDF"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    !loadingPdf && (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50">
                                            <FileText size={48} className="mb-4 opacity-10" />
                                            <p className="font-medium">No PDF available for this invoice.</p>
                                            <p className="text-sm mt-1">You can upload one by clicking "Edit".</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center bg-gray-50/30">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-gray-100">
                            <FileText size={40} className="text-gray-200" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Select an Invoice</h3>
                        <p className="max-w-xs mt-3 text-gray-500 leading-relaxed">
                            Choose an invoice from the list on the left to view its details, download the PDF, or manage its mapping.
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Edit size={20} className="text-blue-500" />
                                Edit Invoice
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Number</label>
                                <input
                                    type="text"
                                    value={editInvoiceNumber}
                                    onChange={(e) => setEditInvoiceNumber(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                                    placeholder="Enter invoice number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice PDF (Optional)</label>
                                <div className="relative group">
                                    <label className="flex items-center justify-center gap-3 px-4 py-8 border-2 border-dashed border-gray-200 group-hover:border-blue-300 rounded-2xl cursor-pointer bg-gray-50 transition-all">
                                        <div className="text-center">
                                            <Upload size={32} className="mx-auto mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            <span className="text-sm font-medium text-gray-600 block">
                                                {editInvoicePdf ? editInvoicePdf.name : 'Click to upload a new PDF'}
                                            </span>
                                            <span className="text-xs text-gray-400 mt-1 block">Max size: 500KB</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file && file.size > 500 * 1024) {
                                                    alert('PDF size cannot exceed 500KB');
                                                    return;
                                                }
                                                setEditInvoicePdf(file);
                                            }}
                                        />
                                    </label>
                                </div>
                                {selectedInvoice.invoice_pdf && !editInvoicePdf && (
                                    <p className="mt-2 text-xs text-blue-600 flex items-center gap-1 font-medium">
                                        <AlertCircle size={14} />
                                        Keeping existing PDF. Upload to replace.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-5 py-2 text-gray-600 font-semibold rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateInvoice}
                                disabled={isUpdating}
                                className={`px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUpdating ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
