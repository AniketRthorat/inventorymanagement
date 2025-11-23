import React, { useState, useEffect } from 'react';
import { Monitor, Package, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLab, setNewLab] = useState({
    lab_name: '',
    location: '',
    capacity: '',
  });
  const navigate = useNavigate();
  const [hodCabinLabId, setHodCabinLabId] = useState(null); // New state for HOD Cabin Lab ID

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const [labsResponse, hodCabinResponse] = await Promise.all([
        api.get('/labs'),
        api.get('/hod-cabin-lab-id') // Fetch HOD Cabin Lab ID
      ]);
      const fetchedHodCabinLabId = hodCabinResponse.data.hodCabinLabId;
      setHodCabinLabId(fetchedHodCabinLabId);
      
      // Filter out the HOD Cabin lab from the general labs list
      const filteredLabs = labsResponse.data.filter(lab => lab.lab_id !== fetchedHodCabinLabId);
      setLabs(filteredLabs);
    } catch (err) {
      setError('Failed to fetch labs.');
      console.error('Error fetching labs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLab({ ...newLab, [name]: value });
  };

  const handleAddLab = async () => {
    setError(null);
    try {
      await api.post('/labs', newLab);
      setIsModalOpen(false);
      setNewLab({
        lab_name: '',
        location: '',
        capacity: '',
      });
      fetchLabs(); // Refresh the list of labs
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lab.');
      console.error('Error adding lab:', err);
    }
  };

  if (loading) return <div>Loading labs...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="grid grid-cols-2 gap-6">
        {labs.map((lab) => (
          <div
            key={lab.lab_id}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/labs/${lab.lab_id}`)} // Navigate to lab detail page
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{lab.lab_name}</h3>
            <p className="text-sm text-gray-600 mb-4">{lab.location}</p>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Monitor size={18} className="text-blue-500" />
                <span className="text-gray-700">{lab.capacity || 0} Capacity</span> {/* Display capacity */}
              </div>
              {/* <div className="flex items-center gap-2">
                <Package size={18} className="text-purple-500" />
                <span className="text-gray-700">X Other Items</span>
              </div> */}
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
                name="lab_name"
                placeholder="Lab Name"
                value={newLab.lab_name}
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
              <input
                type="number"
                name="capacity"
                placeholder="Capacity"
                value={newLab.capacity}
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