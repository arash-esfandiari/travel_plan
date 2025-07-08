import api from './api';

export const getDailyPlans = async (tripId) => {
    const response = await api.get(`/api/trips/${tripId}/daily-plans`);
    return response.data;
};

export const createDailyPlan = async (tripId, plan_date, category, title, description) => {
    const response = await api.post(`/api/trips/${tripId}/daily-plans`, { plan_date, category, title, description });
    return response.data;
};

export const updateDailyPlan = async (tripId, planId, planData) => {
    const response = await api.put(`/api/trips/${tripId}/daily-plans/${planId}`, planData);
    return response.data;
};

export const deleteDailyPlan = async (tripId, planId) => {
    const response = await api.delete(`/api/trips/${tripId}/daily-plans/${planId}`);
    return response.data;
};