import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Home, Monitor, Users, Trash2, Briefcase, FileText, Search, User, Printer, HardDrive, Package, Edit2, X, ChevronRight, Filter, Download, LogOut } from 'lucide-react';

import { useAuth } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import Labs from './Labs'; // Existing component, will be updated later
import LabsRoutes from './LabsRoutes'; // Import LabsRoutes
import LabDetail from './LabDetail'; // Import LabDetail
import Faculty from './Faculty'; // Existing component, will be updated later
import Devices from './Devices'; // Existing component, will be updated later
import Reports from './Reports'; // Import Reports
import DeadStock from './DeadStock'; // Import DeadStock
import HODCabin from './HODCabin'; // Import HODCabin

// Add Tailwind CSS (keep this as it's a global styling setup)
const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
if (!document.querySelector('link[href*="tailwind"]')) {
  document.head.appendChild(style);
}

function App() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google OAuth callback token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwtToken', token);
      }
      navigate('/dashboard'); // Redirect to dashboard after setting token
    }
  }, [location, navigate]);

  const Sidebar = () => {
    const menuItems = [
      { icon: Home, label: 'Home', path: '/dashboard' },
      { icon: Monitor, label: 'Labs', path: '/labs' },
      { icon: Users, label: 'Faculty', path: '/faculty' },
      { icon: Package, label: 'Devices', path: '/devices' },
      { icon: Trash2, label: 'Dead Stock', path: '/deadstock' }, // Added Dead Stock
      { icon: Briefcase, label: 'HOD Cabin', path: '/hod' }, // Added HOD Cabin
      { icon: FileText, label: 'Reports', path: '/reports' } // Added Reports
    ];

    return (
      <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Inventory System</h1>
        </div>
        <nav className="flex-1 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                location.pathname.startsWith(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
             >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
            <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
            </button>
        </div>
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
            className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer">
          <User size={20} className="text-blue-600" />
        </div>
      </div>
    </div>
  );

  // If not authenticated, only render the login page
  if (!isAuthenticated) {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            {/* Any other path when not authenticated should redirect to login */}
            <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      <div className="ml-64 mt-16 p-8">
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/labs/*" element={<PrivateRoute><LabsRoutes /></PrivateRoute>} /> {/* Use LabsRoutes for nested routes */}
          <Route path="/faculty/*" element={<PrivateRoute><Faculty /></PrivateRoute>} />
          <Route path="/devices/*" element={<PrivateRoute><Devices /></PrivateRoute>} />
          <Route path="/deadstock" element={<PrivateRoute><DeadStock /></PrivateRoute>} /> {/* Dead Stock route */}
          <Route path="/hod" element={<PrivateRoute><HODCabin /></PrivateRoute>} /> {/* HOD Cabin route */}
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} /> {/* Reports route */}
          <Route path="/*" element={<Navigate to="/dashboard" />} /> {/* Default private route */}
        </Routes>
      </div>
    </div>
  );
}

export default App;