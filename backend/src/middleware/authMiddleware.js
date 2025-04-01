// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const header = req.headers.authorization; // Get the Authorization header from the request
        if (!header) {
            return res.status(401).json({ error: 'No token provided' }); // If no header is present, respond with a 401 status
        }

        const token = header.split(' ')[1]; // Extract the token from the header ("Bearer <token>")
        if (!token) {
            return res.status(401).json({ error: 'Invalid token format' }); // If the token format is invalid, respond with a 401 status
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret key
        req.user = decoded; // Attach the decoded token payload to the request object (e.g., { userId, email, iat, exp })
        next(); // Call next() to pass control to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ error: 'Token is invalid or expired' }); // If token verification fails, respond with a 401 status
    }
};