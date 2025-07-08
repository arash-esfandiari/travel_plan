// src/services/tripService.js
import api from './api';

// Get all trips for the logged-in user
export const getTrips = async () => {
    const response = await api.get('/api/trips');
    // response.data = [{ id, trip_name, start_date, end_date, ... }, ...]
    return response.data;
};

// Get details of a single trip
export const getTripById = async (tripId) => {
    console.log('tripService: Fetching trip details for ID:', tripId);
    try {
        const response = await api.get(`/api/trips/${tripId}`);
        console.log('tripService: Trip details fetched:', response.data);
        return response.data;
    } catch (error) {
        console.error('tripService: Error fetching trip details:', error.response || error);
        throw error;
    }
};

// Create a new trip from question flow data
export const createTripFromQuestionFlow = async (questionFlowData) => {
    console.log('tripService: Creating trip with data:', questionFlowData);
    try {
        const response = await api.post('/api/trips', questionFlowData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('tripService: Trip created successfully. Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('tripService: Error creating trip:', error.response || error);
        console.error('tripService: Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

// Create a new trip (legacy method)
export const createTrip = async (tripData) => {
    const response = await api.post('/api/trips', tripData, {
        headers: {
            'Content-Type': 'application/json', // Use JSON instead of multipart/form-data
        },
    });
    return response.data;
};

// Update a trip
export const updateTrip = async (tripId, tripData) => {
    const response = await api.put(`/api/trips/${tripId}`, tripData);
    return response.data;
};

// Delete a trip
export const deleteTrip = async (tripId) => {
    const response = await api.delete(`/api/trips/${tripId}`);
    return response.data;
};
