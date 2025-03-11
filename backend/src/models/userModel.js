// src/models/userModel.js
const pool = require('../config/db');

module.exports = {
    // Create a new user
    createUser: async (name, email, hashedPassword) => {
        const text = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, created_at
    `;
        const values = [name, email, hashedPassword];
        const result = await pool.query(text, values);
        return result.rows[0];
    },

    // Find user by email
    findByEmail: async (email) => {
        const text = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(text, [email]);
        return result.rows[0];
    },

    // Find user by id
    findById: async (id) => {
        const text = `SELECT id, name, email, created_at FROM users WHERE id = $1`;
        const result = await pool.query(text, [id]);
        return result.rows[0];
    }
};