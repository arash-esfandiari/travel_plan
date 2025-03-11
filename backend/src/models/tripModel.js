const pool = require('../config/db');

module.exports = {
    // Get all trips for a user
    getUserTrips: async (userId) => {
        const text = `SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC`;
        const { rows } = await pool.query(text, [userId]);
        return rows;
    },

    // Get single trip by ID
    getTripById: async (tripId) => {
        const text = `SELECT * FROM trips WHERE id = $1`;
        const { rows } = await pool.query(text, [tripId]);
        return rows[0];
    },

    // Create a new trip – now includes image_url
    createTrip: async (userId, tripName, startDate, endDate, description, imageUrl, recommendations) => {
        const text = `
      INSERT INTO trips (user_id, trip_name, start_date, end_date, description, image_url, recommendations)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const values = [userId, tripName, startDate, endDate, description, imageUrl, recommendations];
        const { rows } = await pool.query(text, values);
        return rows[0];
    },

    // Update an existing trip
    updateTrip: async (tripId, tripName, startDate, endDate, description, imageUrl = null) => {
        let text;
        let values;
        if (imageUrl) {
            text = `
            UPDATE trips
            SET trip_name = $1, start_date = $2, end_date = $3, description = $4, image_url = $5
            WHERE id = $6
            RETURNING *
          `;
            values = [tripName, startDate, endDate, description, imageUrl, tripId];
        } else {
            text = `
            UPDATE trips
            SET trip_name = $1, start_date = $2, end_date = $3, description = $4
            WHERE id = $5
            RETURNING *
          `;
            values = [tripName, startDate, endDate, description, tripId];
        }
        const { rows } = await pool.query(text, values);
        return rows[0];
    },
    // Delete a trip
    deleteTrip: async (tripId) => {
        const text = `
      DELETE FROM trips
      WHERE id = $1
      RETURNING id
    `;
        const { rows } = await pool.query(text, [tripId]);
        return rows[0];
    },
};