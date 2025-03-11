// src/models/itineraryModel.js
const pool = require('../config/db');

module.exports = {
    // Get all itinerary items for a trip
    getItineraryForTrip: async (tripId) => {
        const text = `SELECT * FROM itinerary_items WHERE trip_id = $1 ORDER BY start_time`;
        const { rows } = await pool.query(text, [tripId]);
        return rows;
    },

    // Create an itinerary item
    createItem: async (tripId, type, title, startTime, endTime, location, cost, notes) => {
        const text = `
      INSERT INTO itinerary_items (
        trip_id, type, title, start_time, end_time, location, cost, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
        const values = [tripId, type, title, startTime, endTime, location, cost, notes];
        const { rows } = await pool.query(text, values);
        return rows[0];
    },

    // Update an itinerary item
    updateItem: async (itemId, type, title, startTime, endTime, location, cost, notes) => {
        const text = `
      UPDATE itinerary_items
      SET type = $1, title = $2, start_time = $3, end_time = $4,
          location = $5, cost = $6, notes = $7
      WHERE id = $8
      RETURNING *
    `;
        const values = [type, title, startTime, endTime, location, cost, notes, itemId];
        const { rows } = await pool.query(text, values);
        return rows[0];
    },

    // Delete an itinerary item
    deleteItem: async (itemId) => {
        const text = `
      DELETE FROM itinerary_items
      WHERE id = $1
      RETURNING id
    `;
        const { rows } = await pool.query(text, [itemId]);
        return rows[0];
    },
};