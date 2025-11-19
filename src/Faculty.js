import React, { useState } from 'react';
import { Users, X, Plus } from 'lucide-react';

const Faculty = ({ faculty, computers, setFaculty }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    designation: '',
    email: '',
    mobile: '',
    location: '',
    systemId: null,
  });

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setNewFaculty({ ...newFaculty, [name]: value });
  };

  const handleAddFaculty = () => {
    setFaculty([
      ...faculty,
      {
        id: faculty.length + 1,
        ...newFaculty,
      },
    ]);
    setIsModalOpen(false);
    setNewFaculty({
      name: '',
      designation: '',
      email: '',
      mobile: '',
      location: '',
      systemId: null,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Faculty Members</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Add Faculty
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {faculty.map((fac) => {
          const assignedSystem = computers.find((c) => c.id === fac.systemId);
          return (
            <div
              key={fac.id}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users size={32} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{fac.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{fac.designation}</p>
                  <p className="text-sm text-gray-600 mb-1">{fac.email}</p>
                  <p className="text-sm text-gray-600 mb-1">{fac.mobile}</p>
                  <p className="text-sm text-gray-600 mb-2">{fac.location}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-blue-500" />
                    <span className="text-gray-700">
                      {assignedSystem ? assignedSystem.name : 'No system assigned'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-1/3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add New Faculty</h3>
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
                placeholder="Name"
                value={newFaculty.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="designation"
                placeholder="Designation"
                value={newFaculty.designation}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newFaculty.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="mobile"
                placeholder="Mobile No."
                value={newFaculty.mobile}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={newFaculty.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddFaculty}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Faculty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;