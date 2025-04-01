// src/controllers/authController.js
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for creating and verifying JWTs
const userModel = require('../models/userModel'); // Import the user model

// Signup controller
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body; // Extract name, email, and password from the request body

        // Check if user already exists
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use.' }); // If user exists, respond with a 400 status
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash the password with bcrypt

        // Create user
        const newUser = await userModel.createUser(name, email, hashedPassword); // Create a new user in the database

        return res.status(201).json({
            message: 'User created successfully',
            user: newUser // Respond with the newly created user
        });
    } catch (error) {
        console.error('Signup error:', error); // Log any errors
        return res.status(500).json({ error: 'Server error' }); // Respond with a 500 status for server errors
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body; // Extract email and password from the request body

        // Find user
        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' }); // If user is not found, respond with a 400 status
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password); // Compare the provided password with the stored hashed password
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' }); // If passwords do not match, respond with a 400 status
        }

        // Create JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email }, // Payload
            process.env.JWT_SECRET, // Secret key
            { expiresIn: '30d' } // Token expiration time
        );

        return res.json({ token }); // Respond with the generated token
    } catch (error) {
        console.error('Login error:', error); // Log any errors
        return res.status(500).json({ error: 'Server error' }); // Respond with a 500 status for server errors
    }
};

// Get current user controller
exports.getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userId); // Find the user by ID from the request object
        if (!user) {
            return res.status(404).json({ error: 'User not found' }); // If user is not found, respond with a 404 status
        }
        return res.json({ user }); // Respond with the user data
    } catch (error) {
        console.error('Get me error:', error); // Log any errors
        return res.status(500).json({ error: 'Server error' }); // Respond with a 500 status for server errors
    }
};