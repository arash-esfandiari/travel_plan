// src/services/tripSplitService.js
import api from './api';

// User trips API
export const getUserParticipatingTrips = async () => {
    const response = await api.get('/api/trip-split/user/trips');
    return response.data;
};

// Participants API
export const addParticipant = async (tripId, participantData) => {
    const response = await api.post(`/api/trip-split/trips/${tripId}/participants`, participantData);
    return response.data;
};

export const getParticipants = async (tripId) => {
    const response = await api.get(`/api/trip-split/trips/${tripId}/participants`);
    return response.data;
};

export const removeParticipant = async (tripId, userId) => {
    const response = await api.delete(`/api/trip-split/trips/${tripId}/participants/${userId}`);
    return response.data;
};

// Expenses API
export const createExpense = async (tripId, expenseData) => {
    const response = await api.post(`/api/trip-split/trips/${tripId}/expenses`, expenseData);
    return response.data;
};

export const getExpenses = async (tripId) => {
    const response = await api.get(`/api/trip-split/trips/${tripId}/expenses`);
    return response.data;
};

export const updateExpense = async (expenseId, expenseData) => {
    const response = await api.put(`/api/trip-split/expenses/${expenseId}`, expenseData);
    return response.data;
};

export const deleteExpense = async (expenseId) => {
    const response = await api.delete(`/api/trip-split/expenses/${expenseId}`);
    return response.data;
};

// Settlements API
export const getSettlements = async (tripId) => {
    const response = await api.get(`/api/trip-split/trips/${tripId}/settlements`);
    return response.data;
};

export const calculateSettlements = async (tripId) => {
    const response = await api.post(`/api/trip-split/trips/${tripId}/settlements/calculate`);
    return response.data;
};

export const markSettlementPaid = async (settlementId) => {
    const response = await api.put(`/api/trip-split/settlements/${settlementId}/paid`);
    return response.data;
}; 