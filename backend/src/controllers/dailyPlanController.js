const dailyPlanModel = require('../models/dailyPlanModel');

exports.getDailyPlans = async (req, res) => {
    try {
        const { tripId } = req.params;
        const plans = await dailyPlanModel.getDailyPlansByTrip(tripId);
        return res.json(plans);
    } catch (error) {
        console.error('Get daily plans error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.createDailyPlan = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { plan_date, category, title, description } = req.body;
        const newPlan = await dailyPlanModel.createDailyPlan(tripId, plan_date, category, title, description);
        return res.status(201).json(newPlan);
    } catch (error) {
        console.error('Create daily plan error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.updateDailyPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const { plan_date, category, title, description } = req.body;
        const updatedPlan = await dailyPlanModel.updateDailyPlan(planId, plan_date, category, title, description);
        if (!updatedPlan) {
            return res.status(404).json({ error: 'Daily plan not found' });
        }
        return res.json(updatedPlan);
    } catch (error) {
        console.error('Update daily plan error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteDailyPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const deleted = await dailyPlanModel.deleteDailyPlan(planId);
        if (!deleted) {
            return res.status(404).json({ error: 'Daily plan not found' });
        }
        return res.json({ message: 'Daily plan deleted successfully' });
    } catch (error) {
        console.error('Delete daily plan error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};