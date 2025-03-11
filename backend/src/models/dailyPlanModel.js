const pool = require('../config/db');

module.exports = {
    // Get all daily plans for a given trip, ordered by plan_date
    getDailyPlansByTrip: async (tripId) => {
        const text = `SELECT * FROM daily_plans WHERE trip_id = $1 ORDER BY plan_date ASC`;
        const { rows } = await pool.query(text, [tripId]);
        return rows;
    },

    // Create a new daily plan entry
    createDailyPlan: async (tripId, plan_date, category, title, description) => {
        const text = `
      INSERT INTO daily_plans (trip_id, plan_date, category, title, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [tripId, plan_date, category, title, description];
        const { rows } = await pool.query(text, values);
        return rows[0];
    },

    // Update an existing daily plan entry
    updateDailyPlan: async (planId, plan_date, category, title, description) => {
        const text = `
      UPDATE daily_plans
      SET plan_date = $1, category = $2, title = $3, description = $4
      WHERE id = $5
      RETURNING *
    `;
        const values = [plan_date, category, title, description, planId];
        const { rows } = await pool.query(text, values);
        return rows[0];
    },

    // Delete a daily plan entry
    deleteDailyPlan: async (planId) => {
        const text = `DELETE FROM daily_plans WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(text, [planId]);
        return rows[0];
    },
};