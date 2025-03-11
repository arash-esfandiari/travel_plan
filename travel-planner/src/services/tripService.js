// src/services/tripService.js
import api from './api';

// Get all trips for the logged-in user
export const getTrips = async () => {
    const response = await api.get('/trips');
    // response.data = [{ id, trip_name, start_date, end_date, ... }, ...]
    return response.data;
};

// Get details of a single trip
export const getTripById = async (tripId) => {
    const response = await api.get(`/trips/${tripId}`);
    // response.data could be an object with trip + itinerary, depending on your backend
    return response.data;
};

// Create a new trip
export const createTrip = async (tripData) => {
    const response = await api.post('/trips', tripData);
    return response.data;
};

// Update a trip
export const updateTrip = async (tripId, tripData) => {
    const response = await api.put(`/trips/${tripId}`, tripData);
    return response.data;
};


// Delete a trip
export const deleteTrip = async (tripId) => {
    const response = await api.delete(`/trips/${tripId}`);
    return response.data;
};

