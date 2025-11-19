import React, { useState, useEffect } from 'react';
import { Home, Monitor, Users, Trash2, Briefcase, FileText, Search, User, Printer, HardDrive, Package, Edit2, X, ChevronRight, Filter, Download } from 'lucide-react';

// Add Tailwind CSS
const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
if (!document.querySelector('link[href*="tailwind"]')) {
  document.head.appendChild(style);
}

// Initial Data
const initialLabs = [
  { id: 1, name: 'Data Science Lab', location: 'Block A - 201', computers: 30, otherInventory: 5 },
  { id: 2, name: 'Programming Lab 1', location: 'Block A - 202', computers: 25, otherInventory: 3 },
  { id: 3, name: 'Programming Lab 2', location: 'Block A - 203', computers: 25, otherInventory: 3 },
  { id: 4, name: 'Network Lab', location: 'Block B - 101', computers: 20, otherInventory: 8 }
];

const initialComputers = [
  { id: 1, labId: 1, name: 'PC-01', model: 'Dell OptiPlex 7090', status: 'Active', cpu: 'Intel i7-11700', ram: '16GB DDR4', storage: '512GB SSD', os: 'Windows 11 Pro', serial: 'DL2024-001', facultyId: null },
  { id: 2, labId: 1, name: 'PC-02', model: 'Dell OptiPlex 7090', status: 'Active', cpu: 'Intel i7-11700', ram: '16GB DDR4', storage: '512GB SSD', os: 'Windows 11 Pro', serial: 'DL2024-002', facultyId: null },
  { id: 3, labId: 1, name: 'PC-03', model: 'HP ProDesk 600', status: 'Faulty', cpu: 'Intel i5-10500', ram: '8GB DDR4', storage: '256GB SSD', os: 'Windows 10 Pro', serial: 'HP2023-015', facultyId: null },
  { id: 4, labId: 2, name: 'PC-01', model: 'Lenovo ThinkCentre', status: 'Active', cpu: 'Intel i5-11400', ram: '8GB DDR4', storage: '512GB SSD', os: 'Windows 11 Pro', serial: 'LN2024-008', facultyId: null },
  { id: 5, labId: null, name: 'Faculty-PC-01', model: 'Dell Latitude 7420', status: 'Active', cpu: 'Intel i7-1185G7', ram: '16GB DDR4', storage: '512GB NVMe SSD', os: 'Windows 11 Pro', serial: 'DL2024-F001', facultyId: 1 },
  { id: 6, labId: null, name: 'Faculty-PC-02', model: 'HP EliteBook 840', status: 'Active', cpu: 'Intel i5-1135G7', ram: '8GB DDR4', storage: '256GB SSD', os: 'Windows 11 Pro', serial: 'HP2024-F002', facultyId: 2 },
  { id: 7, labId: null, name: 'HOD-PC', model: 'Dell Precision 5560', status: 'Active', cpu: 'Intel i9-11950H', ram: '32GB DDR4', storage: '1TB NVMe SSD', os: 'Windows 11 Pro', serial: 'DL2024-HOD', facultyId: null }
];

const initialFaculty = [
  { id: 1, name: 'Dr. Rajesh Kumar', cabin: 'Faculty Cabin 1', contact: 'rajesh.k@dept.edu', systemId: 5 },
  { id: 2, name: 'Prof. Anita Sharma', cabin: 'Faculty Cabin 2', contact: 'anita.s@dept.edu', systemId: 6 },
  { id: 3, name: 'Dr. Vikram Singh', cabin: 'Faculty Cabin 3', contact: 'vikram.s@dept.edu', systemId: null },
  { id: 4, name: 'Prof. Meera Patel', cabin: 'Faculty Cabin 4', contact: 'meera.p@dept.edu', systemId: null }
];

const initialDeadStock = [
  { id: 1, name: 'PC-OLD-15', serial: 'HP2019-045', issue: 'Motherboard failure', dateAdded: '2024-09-15', previousLocation: 'Programming Lab 1', type: 'Computer' },
  { id: 2, name: 'Printer-LJ-03', serial: 'HP-LJ-2020-03', issue: 'Drum unit damaged', dateAdded: '2024-10-22', previousLocation: 'Data Science Lab', type: 'Printer' }
];

const initialPrinters = [
  { id: 1, labId: 1, name: 'Printer-01', model: 'HP LaserJet Pro M404', status: 'Active' },
  { id: 2, labId: 2, name: 'Printer-01', model: 'Canon imageCLASS', status: 'Active' },
  { id: 3, labId: null, name: 'HOD-Printer', model: 'HP LaserJet Pro M454', status: 'Active' }
];

const hodInventory = [
  { type: 'Computer', name: 'HOD-PC', details: 'Dell Precision 5560' },
  { type: 'Printer', name: 'HOD-Printer', details: 'HP LaserJet Pro M454' },
  { type: 'UPS', name: 'APC Smart-UPS 1500VA', details: '1500VA/900W' },
  { type: 'Table', name: 'Executive Desk', details: 'Wooden, L-shaped' },
  { type: 'Chair', name: 'Executive Chair', details: 'Ergonomic, leather' }
];

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedComputer, setSelectedComputer] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [labs, setLabs] = useState(initialLabs);
  const [computers, setComputers] = useState(initialComputers);
  const [faculty, setFaculty] = useState(initialFaculty);
  const [deadStock, setDeadStock] = useState(initialDeadStock);
  const [printers, setPrinters] = useState(initialPrinters);
  const [activeLabTab, setActiveLabTab] = useState('computers');
  const [deadStockFilter, setDeadStockFilter] = useState('All');

  const totalComputers = computers.filter(c => c.status !== 'Dead Stock').length;
  const totalPrinters = printers.length;
  const totalLabs = labs.length;
  const totalFaculty = faculty.length;

  const moveToDeadStock = (computer, reason) => {
    const lab = labs.find(l => l.id === computer.labId);
    const assignedFaculty = faculty.find(f => f.systemId === computer.id);
    
    const deadStockItem = {
      id: deadStock.length + 1,
      name: computer.name,
      serial: computer.serial,
      issue: reason,
      dateAdded: new Date().toISOString().split('T')[0],
      previousLocation: assignedFaculty ? assignedFaculty.cabin : (lab ? lab.name : 'HOD Cabin'),
      type: 'Computer'
    };

    setDeadStock([...deadStock, deadStockItem]);
    setComputers(computers.filter(c => c.id !== computer.id));
    setSelectedComputer(null);
  };

  const Sidebar = () => {
    const menuItems = [
      { icon: Home, label: 'Home', view: 'home' },
      { icon: Monitor, label: 'Labs', view: 'labs' },
      { icon: Users, label: 'Faculty', view: 'faculty' },
      { icon: Trash2, label: 'Dead Stock', view: 'deadstock' },
      { icon: Briefcase, label: 'HOD Cabin', view: 'hod' },
      { icon: FileText, label: 'Reports', view: 'reports' }
    ];

    return (
      <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Inventory System</h1>
        </div>
        <nav className="flex-1 p-4">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                setCurrentView(item.view);
                setSelectedLab(null);
                setSelectedComputer(null);
                setSelectedFaculty(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                currentView === item.view
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  };

  const TopBar = () => (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 left-64 right-0 flex items-center justify-between px-6 z-10">
      <div className="text-lg font-semibold text-gray-800">
        Computer Science Department
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer">
          <User size={20} className="text-blue-600" />
        </div>
      </div>
    </div>
  );

  const Breadcrumb = ({ items }) => (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
          <span className={index === items.length - 1 ? 'text-gray-800 font-medium' : 'cursor-pointer hover:text-blue-600'}
                onClick={() => item.onClick && item.onClick()}>
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  const HomePage = () => {
    const summaryCards = [
      { label: 'Total Computers', value: totalComputers, icon: Monitor, color: 'blue' },
      { label: 'Total Printers', value: totalPrinters, icon: Printer, color: 'purple' },
      { label: 'Total Labs', value: totalLabs, icon: HardDrive, color: 'green' },
      { label: 'Total Faculty', value: totalFaculty, icon: Users, color: 'orange' }
    ];

    const computersByLab = labs.map(lab => ({
      lab: lab.name,
      count: computers.filter(c => c.labId === lab.id).length
    }));

    const computersByStatus = [
      { status: 'Active', count: computers.filter(c => c.status === 'Active').length },
      { status: 'Faulty', count: computers.filter(c => c.status === 'Faulty').length }
    ];

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Download size={18} />
            Print Report
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className={`w-12 h-12 bg-${card.color}-50 rounded-lg flex items-center justify-center mb-4`}>
                <card.icon size={24} className={`text-${card.color}-500`} />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{card.value}</div>
              <div className="text-sm text-gray-600">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Systems by Lab</h3>
            <div className="space-y-3">
              {computersByLab.map((item) => (
                <div key={item.lab} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{item.lab}</span>
                  <span className="font-semibold text-blue-600">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Systems by Status</h3>
            <div className="space-y-3">
              {computersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{item.status}</span>
                  <span className={`font-semibold ${item.status === 'Active' ? 'text-green-600' : 'text-orange-600'}`}>
                    {item.count}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Dead Stock</span>
                <span className="font-semibold text-red-600">{deadStock.filter(d => d.type === 'Computer').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LabsListPage = () => (
    <div>
      <Breadcrumb items={[{ label: 'Home', onClick: () => setCurrentView('home') }, { label: 'Labs' }]} />
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Laboratory Inventory</h2>
      <div className="grid grid-cols-2 gap-6">
        {labs.map((lab) => (
          <div key={lab.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => setSelectedLab(lab)}>
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
    </div>
  );

  const LabInventoryPage = () => {
    const labComputers = computers.filter(c => c.labId === selectedLab.id);
    const labPrinters = printers.filter(p => p.labId === selectedLab.id);

    const displayItems = activeLabTab === 'computers' ? labComputers : labPrinters;

    return (
      <div>
        <Breadcrumb items={[
          { label: 'Home', onClick: () => setCurrentView('home') },
          { label: 'Labs', onClick: () => setSelectedLab(null) },
          { label: selectedLab.name }
        ]} />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{selectedLab.name}</h2>
            <p className="text-gray-600">{selectedLab.location}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Download size={18} />
            Export Lab Report
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveLabTab('computers')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeLabTab === 'computers' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            Computers ({labComputers.length})
          </button>
          <button
            onClick={() => setActiveLabTab('printers')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeLabTab === 'printers' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            Printers ({labPrinters.length})
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <div
              key={item.id}
              onClick={() => activeLabTab === 'computers' && setSelectedComputer(item)}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                item.status === 'Active' ? 'bg-green-50' : 'bg-orange-50'
              }`}>
                {activeLabTab === 'computers' ? (
                  <Monitor size={24} className={item.status === 'Active' ? 'text-green-600' : 'text-orange-600'} />
                ) : (
                  <Printer size={24} className="text-purple-600" />
                )}
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">{item.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{item.model}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SystemDetailDrawer = () => {
    if (!selectedComputer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 z-20 flex justify-end" onClick={() => setSelectedComputer(null)}>
        <div className="w-[500px] bg-white h-full shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="text-xl font-semibold text-gray-800">System Details</h3>
            <button onClick={() => setSelectedComputer(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor size={40} className="text-blue-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-800 mb-1">{selectedComputer.name}</h4>
              <p className="text-gray-600">{selectedComputer.model}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Status</span>
                <span className={`font-semibold ${
                  selectedComputer.status === 'Active' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {selectedComputer.status}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">CPU</span>
                <span className="font-medium text-gray-800">{selectedComputer.cpu}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">RAM</span>
                <span className="font-medium text-gray-800">{selectedComputer.ram}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium text-gray-800">{selectedComputer.storage}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Operating System</span>
                <span className="font-medium text-gray-800">{selectedComputer.os}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Serial Number</span>
                <span className="font-medium text-gray-800">{selectedComputer.serial}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Location</span>
                <span className="font-medium text-gray-800">
                  {selectedComputer.labId ? labs.find(l => l.id === selectedComputer.labId)?.name : 
                   selectedComputer.facultyId ? faculty.find(f => f.systemId === selectedComputer.id)?.cabin : 'HOD Cabin'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                <Edit2 size={18} />
                Edit System
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Move this system to Dead Stock?')) {
                    moveToDeadStock(selectedComputer, 'Manually moved to dead stock');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium">
                <Trash2 size={18} />
                Move to Dead Stock
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FacultyListPage = () => (
    <div>
      <Breadcrumb items={[{ label: 'Home', onClick: () => setCurrentView('home') }, { label: 'Faculty' }]} />
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Faculty Members</h2>
      <div className="grid grid-cols-2 gap-6">
        {faculty.map((fac) => {
          const assignedSystem = computers.find(c => c.id === fac.systemId);
          return (
            <div
              key={fac.id}
              onClick={() => setSelectedFaculty(fac)}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={32} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{fac.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{fac.cabin}</p>
                  <p className="text-sm text-gray-600 mb-3">{fac.contact}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Monitor size={16} className="text-blue-500" />
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
    </div>
  );

  const FacultyDetailPage = () => {
    const assignedSystem = computers.find(c => c.id === selectedFaculty.systemId);

    return (
      <div>
        <Breadcrumb items={[
          { label: 'Home', onClick: () => setCurrentView('home') },
          { label: 'Faculty', onClick: () => setSelectedFaculty(null) },
          { label: selectedFaculty.name }
        ]} />

        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={48} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{selectedFaculty.name}</h2>
              <p className="text-gray-600 mb-1">{selectedFaculty.cabin}</p>
              <p className="text-sm text-gray-600">{selectedFaculty.contact}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Assigned Inventory</h3>
            
            {assignedSystem ? (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Monitor size={24} className="text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{assignedSystem.name}</h4>
                      <p className="text-sm text-gray-600">{assignedSystem.model}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    assignedSystem.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {assignedSystem.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">CPU:</span>
                    <span className="ml-2 font-medium text-gray-800">{assignedSystem.cpu}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">RAM:</span>
                    <span className="ml-2 font-medium text-gray-800">{assignedSystem.ram}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Storage:</span>
                    <span className="ml-2 font-medium text-gray-800">{assignedSystem.storage}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">OS:</span>
                    <span className="ml-2 font-medium text-gray-800">{assignedSystem.os}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedComputer(assignedSystem)}
                  className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                  View Full Details
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                <Monitor size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No system assigned</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              <Edit2 size={18} />
              Edit Faculty Details
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
              <Monitor size={18} />
              Reassign System
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeadStockPage = () => {
    const filteredDeadStock = deadStockFilter === 'All' 
      ? deadStock 
      : deadStock.filter(item => item.type === deadStockFilter);

    return (
      <div>
        <Breadcrumb items={[{ label: 'Home', onClick: () => setCurrentView('home') }, { label: 'Dead Stock' }]} />
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Dead Stock Inventory</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Download size={18} />
            Export Report
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-600" />
            <span className="text-gray-700 font-medium">Filter by Type:</span>
            <div className="flex gap-2">
              {['All', 'Computer', 'Printer'].map((type) => (
                <button
                  key={type}
                  onClick={() => setDeadStockFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    deadStockFilter === type 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {type}
                </button>
              ))}
            </div>
            <span className="ml-auto text-gray-600">
              Total Items: <span className="font-semibold text-gray-800">{filteredDeadStock.length}</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Item Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Serial Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Issue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Previous Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeadStock.map((item, index) => (
                <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                      {item.type === 'Computer' ? <Monitor size={14} /> : <Printer size={14} />}
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{item.serial}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{item.issue}</td>
                  <td className="px-6 py-4 text-gray-700">{item.previousLocation}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{item.dateAdded}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDeadStock.length === 0 && (
            <div className="py-12 text-center">
              <Trash2 size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No dead stock items found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const HODCabinPage = () => (
    <div>
      <Breadcrumb items={[{ label: 'Home', onClick: () => setCurrentView('home') }, { label: 'HOD Cabin' }]} />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">HOD Cabin Inventory</h2>
          <p className="text-gray-600">Head of Department Office Equipment</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="space-y-4">
        {hodInventory.map((item, index) => {
          const IconComponent = item.type === 'Computer' ? Monitor : 
                               item.type === 'Printer' ? Printer : 
                               item.type === 'UPS' ? HardDrive : Package;
          
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconComponent size={28} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-gray-600">{item.details}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2">
                    <Edit2 size={16} />
                    Edit
                  </button>
                  {(item.type === 'Computer' || item.type === 'Printer') && (
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2">
                      <Trash2 size={16} />
                      Replace
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
            <div className="text-sm text-gray-600">Computer</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
            <div className="text-sm text-gray-600">Printer</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
            <div className="text-sm text-gray-600">UPS</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">2</div>
            <div className="text-sm text-gray-600">Furniture</div>
          </div>
        </div>
      </div>
    </div>
  );

  const ReportsPage = () => {
    const reportTypes = [
      { 
        title: 'Complete Inventory Report', 
        description: 'Comprehensive report of all department inventory',
        icon: FileText,
        items: totalComputers + totalPrinters + hodInventory.length
      },
      { 
        title: 'Lab-wise Report', 
        description: 'Detailed inventory breakdown by laboratory',
        icon: Monitor,
        items: totalLabs
      },
      { 
        title: 'Faculty Inventory Report', 
        description: 'Systems and equipment assigned to faculty members',
        icon: Users,
        items: totalFaculty
      },
      { 
        title: 'Dead Stock Report', 
        description: 'List of all non-functional and retired equipment',
        icon: Trash2,
        items: deadStock.length
      },
      { 
        title: 'System Status Report', 
        description: 'Overview of system health and maintenance status',
        icon: Monitor,
        items: computers.length
      },
      { 
        title: 'HOD Cabin Report', 
        description: 'Inventory assigned to Head of Department',
        icon: Briefcase,
        items: hodInventory.length
      }
    ];

    return (
      <div>
        <Breadcrumb items={[{ label: 'Home', onClick: () => setCurrentView('home') }, { label: 'Reports' }]} />
        
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reports & Analytics</h2>
          <p className="text-gray-600">Generate and export inventory reports</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {reportTypes.map((report, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <report.icon size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold text-blue-600">{report.items}</span> items included
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  <Download size={16} />
                  Export PDF
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Quick Export</h3>
              <p className="text-sm text-gray-600">Export all inventory data in various formats</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200">
                Export as Excel
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200">
                Export as CSV
              </button>
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (selectedComputer) return null;

    if (currentView === 'home') return <HomePage />;
    if (currentView === 'labs') {
      if (selectedLab) return <LabInventoryPage />;
      return <LabsListPage />;
    }
    if (currentView === 'faculty') {
      if (selectedFaculty) return <FacultyDetailPage />;
      return <FacultyListPage />;
    }
    if (currentView === 'deadstock') return <DeadStockPage />;
    if (currentView === 'hod') return <HODCabinPage />;
    if (currentView === 'reports') return <ReportsPage />;
    
    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      <div className="ml-64 mt-16 p-8">
        {renderMainContent()}
      </div>
      <SystemDetailDrawer />
    </div>
  );
}

export default App;