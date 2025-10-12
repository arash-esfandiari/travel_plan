import api from './api';

export const getDailyPlans = async (tripId) => {
    const response = await api.get(`/api/trips/${tripId}/daily-plans`);
    return response.data;
};

export const createDailyPlan = async (tripId, plan_date, category, title, description) => {
    const response = await api.post(`/api/trips/${tripId}/daily-plans`, { plan_date, category, title, description });
    return response.data;
};

export const createBulkDailyPlans = async (tripId, plans) => {
    try {
        console.log('🌐 API: Creating bulk daily plans', {
            tripId,
            plansCount: plans.length,
            endpoint: `/api/trips/${tripId}/daily-plans/bulk`,
            plans
        });

        const response = await api.post(`/api/trips/${tripId}/daily-plans/bulk`, { plans });

        console.log('✅ API: Bulk creation successful', {
            status: response.status,
            dataCount: response.data?.length,
            data: response.data
        });

        return response.data;
    } catch (error) {
        console.error('❌ API: Bulk creation failed', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            tripId,
            plansCount: plans.length
        });
        throw error;
    }
};

export const updateDailyPlan = async (tripId, planId, planData) => {
    const response = await api.put(`/api/trips/${tripId}/daily-plans/${planId}`, planData);
    return response.data;
};

export const deleteDailyPlan = async (tripId, planId) => {
    const response = await api.delete(`/api/trips/${tripId}/daily-plans/${planId}`);
    return response.data;
};