// inventory-management/src/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => sessionStorage.getItem('jwtToken'));
    const [userRole, setUserRole] = useState(() => sessionStorage.getItem('userRole') || 'admin');
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    useEffect(() => {
        if (token) {
            sessionStorage.setItem('jwtToken', token);
            sessionStorage.setItem('userRole', userRole);
            setIsAuthenticated(true);
        } else {
            sessionStorage.removeItem('jwtToken');
            sessionStorage.removeItem('userRole');
            setIsAuthenticated(false);
        }
    }, [token, userRole]);

    const login = (newToken, role = 'admin') => {
        setUserRole(role);
        setToken(newToken);
    };

    const logout = () => {
        setToken(null);
        setUserRole('admin');
    };

    return (
        <AuthContext.Provider value={{ token, userRole, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
