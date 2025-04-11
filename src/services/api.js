// src/services/api.js
import axios from 'axios'; // Import the axios library for making HTTP requests

// Define the base URL for the API, using an environment variable if available, or defaulting to 'http://localhost:5001'
const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

// Create an axios instance with the base URL
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token in the Authorization header of each request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Retrieve the token from local storage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // If a token is found, add it to the Authorization header
        }
        return config; // Return the modified config
    },
    (error) => Promise.reject(error) // Handle any errors that occur during the request setup
);

export default api; // Export the configured axios instance for use in other parts of the application