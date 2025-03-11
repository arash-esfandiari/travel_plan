// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = header.split(' ')[1]; // "Bearer <token>"
        if (!token) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, email, iat, exp }
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token is invalid or expired' });
    }
};