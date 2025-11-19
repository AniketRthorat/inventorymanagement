import React, { useState } from 'react';
import { Plus, X, Monitor, Printer as PrinterIcon, Laptop } from 'lucide-react';

const Devices = ({ devices, setDevices, labs, faculty }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    type: 'Computer',
    name: '',
    location: '',
    config: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDevice({ ...newDevice, [name]: value });
  };

  const handleAddDevice = () => {
    const locationMap = {};
    labs.forEach(lab => {
      locationMap[lab.id] = lab.name;
    });
    faculty.forEach(f => {
      locationMap[f.id] = f.location;
    });

    const newDeviceWithId = {
      id: devices.length + 1,
      ...newDevice,
      locationName: locationMap[newDevice.location] || 'N/A',
    };

    setDevices([...devices, newDeviceWithId]);
    setIsModalOpen(false);
    setNewDevice({
      type: 'Computer',
      name: '',
      location: '',
      config: '',
    });
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Computer':
        return <Monitor size={20} />;
      case 'Laptop':
        return <Laptop size={20} />;
      case 'Printer':
        return <PrinterIcon size={20} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">All Devices</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Add New Device
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Configuration</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2">
                    {getDeviceIcon(device.type)}
                    {device.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-800 font-medium">{device.name}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{device.locationName}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{device.config}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-1/3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add New Device</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <select
                name="type"
                value={newDevice.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Computer">Computer</option>
                <option value="Laptop">Laptop</option>
                <option value="Printer">Printer</option>
              </select>
              <input
                type="text"
                name="name"
                placeholder="Device Name"
                value={newDevice.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                name="location"
                value={newDevice.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Location</option>
                {labs.map(lab => (
                  <option key={`lab-${lab.id}`} value={lab.id}>{lab.name}</option>
                ))}
                {faculty.map(f => (
                  <option key={`faculty-${f.id}`} value={f.id}>{f.location}</option>
                ))}
              </select>
              <textarea
                name="config"
                placeholder="Configuration (e.g., CPU, RAM, Storage)"
                value={newDevice.config}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddDevice}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
