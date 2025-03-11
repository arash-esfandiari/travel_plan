// src/services/authService.js
import api from './api';

// Sign up a new user
export const signup = async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data; // e.g., { message: "User created" }
};

// Log in and retrieve token
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // response.data might contain { token: 'JWT_TOKEN' }
    return response.data;
};

// Optional: Fetch current user profile
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// (Optional) Log out if your backend supports an invalidate-token endpoint
export const logout = async () => {
    await api.post('/auth/logout');
    // Usually you just remove the token from localStorage on the client side:
    localStorage.removeItem('token');
};