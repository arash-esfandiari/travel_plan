// src/routes/authRoutes.js
const express = require('express');// Import the Express framework
const router = express.Router();// Create a new router instance
const { signup, login, getMe } = require('../controllers/authController');// Import the controller functions for authentication
const { signupValidator, loginValidator } = require('../validators/authValidators');// Import the validation middleware for signup and login
const validateRequest = require('../middleware/validateRequest');// Import the middleware to validate the request
const authMiddleware = require('../middleware/authMiddleware');// Import the authentication middleware to protect routes

// Define the route for user signup
// POST /auth/signup
// Apply the signupValidator and validateRequest middleware before calling the signup controller
router.post('/signup', signupValidator, validateRequest, signup);

// Define the route for user login
// POST /auth/login
// Apply the loginValidator and validateRequest middleware before calling the login controller
router.post('/login', loginValidator, validateRequest, login);

// Define the route to get the authenticated user's information
// GET /auth/me (requires token)
// Apply the authMiddleware to protect the route before calling the getMe controller
router.get('/me', authMiddleware, getMe);

// Export the router to be used in other parts of the application
module.exports = router;