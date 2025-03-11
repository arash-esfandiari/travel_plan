// src/services/itineraryService.js
import api from './api';

// Get all itinerary items for a trip
export const getItinerary = async (tripId) => {
    const response = await api.get(`/trips/${tripId}/itinerary`);
    return response.data; // e.g. [{ id, type, title, ... }, ...]
};

// Create a new itinerary item
export const createItineraryItem = async (tripId, itemData) => {
    const response = await api.post(`/trips/${tripId}/itinerary`, itemData);
    return response.data;
};

// Update an itinerary item
export const updateItineraryItem = async (tripId, itemId, itemData) => {
    const response = await api.put(`/trips/${tripId}/itinerary/${itemId}`, itemData);
    return response.data;
};

// Delete an itinerary item
export const deleteItineraryItem = async (tripId, itemId) => {
    const response = await api.delete(`/trips/${tripId}/itinerary/${itemId}`);
    return response.data;
};