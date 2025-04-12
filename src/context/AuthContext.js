import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser({ userId: decodedToken.userId, email: decodedToken.email });
            } catch (error) {
                console.error('Error decoding token:', error);
                setUser(null);
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token); // Save the token to localStorage
        const decodedToken = jwtDecode(token); // Decode the token
        setUser({ userId: decodedToken.userId, email: decodedToken.email }); // Update the user state
    };

    const logout = () => {
        localStorage.removeItem('token'); // Remove the token from localStorage
        setUser(null); // Clear the user state
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};