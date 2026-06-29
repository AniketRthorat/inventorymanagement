import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Home, Monitor, Users, Trash2, Briefcase, FileText, User, Package, LogOut, AlertCircle } from 'lucide-react';

import { useAuth } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import LabsRoutes from './LabsRoutes'; // Import LabsRoutes
import Faculty from './Faculty'; // Existing component, will be updated later
import Devices from './Devices'; // Existing component, will be updated later
import Reports from './Reports'; // Import Reports
import DefectiveStock from './DefectiveStock'; // Import DefectiveStock
import CentralStore from './CentralStore'; // Import CentralStore
import Invoices from './Invoices'; // Import Invoices
import PublicDeviceDetail from './PublicDeviceDetail'; // Import the new public device detail page
import LabAssistantDashboard from './LabAssistantDashboard'; // Import Lab Assistant Dashboard
import IssuesPage from './IssuesPage'; // Import Issues Page

// Add Tailwind CSS (keep this as it's a global styling setup)
const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
if (!document.querySelector('link[href*="tailwind"]')) {
  document.head.appendChild(style);
}

function App() {
  const { isAuthenticated, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle post-login redirection if redirect param is present
  useEffect(() => {
    const redirectParam = new URLSearchParams(location.search).get('redirect');
    if (isAuthenticated && location.pathname === '/login' && redirectParam) {
      navigate(decodeURIComponent(redirectParam), { replace: true });
    }
  }, [isAuthenticated, location.pathname, location.search, navigate]);

  // Handle Google OAuth callback token and QR Redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const deviceCode = params.get('device');

    if (token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwtToken', token);
      }
      navigate('/dashboard'); // Redirect to dashboard after setting token
    } else if (deviceCode) {
      navigate(`/device/${deviceCode}`); // Handle redirect from backend
    }
  }, [location, navigate]);

  const Sidebar = () => {
    const menuItems = userRole === 'assistant'
      ? [
          { icon: Home, label: 'Home', path: '/dashboard' },
          { icon: FileText, label: 'Reported Issues', path: '/assistant-dashboard' },
          { icon: AlertCircle, label: 'Issues History', path: '/issues' }
        ]
      : [
          { icon: Home, label: 'Home', path: '/dashboard' },
          { icon: Monitor, label: 'Labs', path: '/labs' },
          { icon: Users, label: 'Faculty', path: '/faculty' },
          { icon: Package, label: 'All Devices', path: '/devices' },
          { icon: Trash2, label: 'Defective Stock', path: '/defective-stock' },
          { icon: Briefcase, label: 'Central Store', path: '/central-store' },
          { icon: FileText, label: 'Invoices', path: '/invoices' },
          { icon: FileText, label: 'Reports', path: '/reports' },
          { icon: AlertCircle, label: 'Issues', path: '/issues' }
        ];

    return (
      <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">SGI Inventory System</h1>
        </div>
        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            // Determine if this item should be highlighted based on current path or navigation origin
            const originPath = location.state?.from;
            const isHighlighted = originPath
              ? originPath.startsWith(item.path)
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${isHighlighted
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
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

  const TopBar = ({ logout }) => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentDateTime(new Date());
      }, 1000); // Update every second

      return () => clearInterval(timer);
    }, []);

    const formattedDate = currentDateTime.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedTime = currentDateTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const userName = userRole === 'assistant' ? "Lab Assistant" : "Admin User"; // Dynamic user name

    return (
      <div className="h-16 bg-white border-b border-gray-200 fixed top-0 left-64 right-0 flex items-center justify-between px-6 z-10">
        <div className="text-lg font-semibold text-gray-800">
          Computer Science & Engineering Department
        </div>
        <div className="flex items-center gap-4">
          <div className="text-gray-600 text-sm">
            <span className="font-medium">{formattedDate}</span>
            <span className="ml-2">{formattedTime}</span>
          </div>
          <div className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <span className="font-medium text-gray-800">{userName}</span>
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
                <button
                  onClick={logout}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // If not authenticated, only render the login page or public device view
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/device/:code" element={<PublicDeviceDetail />} />
        {/* Any other path when not authenticated should redirect to login */}
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const isDevicePage = location.pathname.startsWith('/device/');

  if (isDevicePage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
        <Routes>
          {userRole === 'assistant' ? (
            <Route path="/device/:code" element={<PublicDeviceDetail />} />
          ) : (
            <Route path="/device/:code" element={<PublicDeviceDetail />} />
          )}
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar logout={logout} />
      <div className="ml-64 mt-16 p-8">
        <Routes>
          {userRole === 'assistant' ? (
            <>
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/assistant-dashboard" element={<PrivateRoute><LabAssistantDashboard /></PrivateRoute>} />
              <Route path="/issues" element={<PrivateRoute><IssuesPage /></PrivateRoute>} />
              <Route path="/*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/labs/*" element={<PrivateRoute><LabsRoutes /></PrivateRoute>} />
              <Route path="/faculty/*" element={<PrivateRoute><Faculty /></PrivateRoute>} />
              <Route path="/devices/*" element={<PrivateRoute><Devices /></PrivateRoute>} />
              <Route path="/defective-stock" element={<PrivateRoute><DefectiveStock /></PrivateRoute>} />
              <Route path="/central-store" element={<PrivateRoute><CentralStore /></PrivateRoute>} />
              <Route path="/invoices" element={<PrivateRoute><Invoices /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              <Route path="/issues" element={<PrivateRoute><IssuesPage /></PrivateRoute>} />
              <Route path="/*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;
