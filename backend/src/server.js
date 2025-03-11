require('dotenv').config();// Load environment variables from a .env file into process.env
const express = require('express');// Import the Express framework
const cors = require('cors');// Import the CORS middleware to enable Cross-Origin Resource Sharing
const path = require('path')
const authRoutes = require('./routes/authRoutes');// Import the authentication routes
const tripRoutes = require('./routes/tripRoutes');// Import the trip routes
const dailyPlanRoutes = require('./routes/dailyPlanRoutes');// Import the daily plan routes

const app = express(); // Create an instance of an Express application

// Use the CORS middleware to allow cross-origin requests
app.use(cors());
// Use the JSON middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Mount the authentication routes at the /auth path
app.use('/auth', authRoutes);
// Mount the trip routes at the /trips path
app.use('/trips', tripRoutes);
// Mount daily plan routes under /trips/:tripId/daily-plans
app.use('/trips/:tripId/daily-plans', dailyPlanRoutes);

// Handle 404 errors for any routes that don't match the above
app.use((req, res, next) => {
    // Respond with a 404 status code and a JSON error message
    return res.status(404).json({ error: 'Not found' });
});

// Global error handler to catch any errors that occur in the app
app.use((err, req, res, next) => {
    // Log the error to the console
    console.error('Global error handler:', err);
    // Respond with a 500 status code and a JSON error message
    return res.status(500).json({ error: 'Something went wrong' });
});

// Define the port the server will listen on, defaulting to 5001 if not specified in environment variables
const PORT = process.env.PORT || 5001;

// Start the server and listen on the specified port
app.listen(PORT, () => {
    // Log a message to the console indicating the server is running
    console.log(`Server running on port ${PORT}`);
});
