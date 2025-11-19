import React, { useState } from 'react';
import { Monitor, Package, X, Plus } from 'lucide-react';

const Labs = ({ labs, setLabs, setSelectedLab }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLab, setNewLab] = useState({
    name: '',
    location: '',
    computers: 0,
    otherInventory: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLab({ ...newLab, [name]: value });
  };

  const handleAddLab = () => {
    setLabs([
      ...labs,
      {
        id: labs.length + 1,
        ...newLab,
      },
    ]);
    setIsModalOpen(false);
    setNewLab({
      name: '',
      location: '',
      computers: 0,
      otherInventory: 0,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Laboratory Inventory</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Add Lab
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {labs.map((lab) => (
          <div
            key={lab.id}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedLab(lab)}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{lab.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{lab.location}</p>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Monitor size={18} className="text-blue-500" />
                <span className="text-gray-700">{lab.computers} Computers</span>
              </div>
              <div className="flex items-center gap-2">
                <Package size={18} className="text-purple-500" />
                <span className="text-gray-700">{lab.otherInventory} Other Items</span>
              </div>
            </div>
            <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
              View Lab Inventory
            </button>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-1/3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add New Lab</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Lab Name"
                value={newLab.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={newLab.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddLab}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Lab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Labs;
