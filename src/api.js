// inventory-management/src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8787/api'; // Assuming backend runs on 8787

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized errors, e.g., redirect to login
            console.error('Unauthorized access - redirecting to login');
            // You might want to trigger a logout action here
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
