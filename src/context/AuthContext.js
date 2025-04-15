import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrected import for jwtDecode

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser({
                    userId: decodedToken.userId,
                    email: decodedToken.email,
                    username: decodedToken.username, // Added username
                    first_name: decodedToken.first_name, // Added first_name
                    last_name: decodedToken.last_name, // Added last_name
                });
            } catch (error) {
                console.error('Error decoding token:', error);
                setUser(null);
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token); // Save the token to localStorage
        const decodedToken = jwtDecode(token); // Decode the token
        setUser({
            userId: decodedToken.userId,
            email: decodedToken.email,
            username: decodedToken.username, // Added username
            firstName: decodedToken.first_name, // Added first_name
            lastName: decodedToken.last_name, // Added last_name
        });
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