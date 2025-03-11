// backend/src/routes/tripRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip
} = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');
const { createTripValidator } = require('../validators/tripValidators');
const validateRequest = require('../middleware/validateRequest');

const multer = require('multer');
const path = require('path');

// Configure multer storage (saving to disk in an "uploads" folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this folder exists at the root of your backend
    },
    filename: function (req, file, cb) {
        // Use original file name prefixed with a timestamp for uniqueness
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// All routes here require auth
router.use(authMiddleware);

// GET /trips
router.get('/', getAllTrips);

// GET /trips/:tripId
router.get('/:tripId', getTripById);

// POST /trips – note the addition of upload.single('image')
router.post('/', upload.single('image'), createTripValidator, validateRequest, createTrip);

// PUT /trips/:tripId
router.put('/:tripId', upload.single('image'), createTripValidator, validateRequest, updateTrip);

// DELETE /trips/:tripId
router.delete('/:tripId', deleteTrip);

module.exports = router;