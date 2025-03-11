const { body } = require('express-validator');

exports.createTripValidator = [
    body('trip_name').notEmpty().withMessage('Trip name is required'),
    body('start_date')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Start date must be in yyyy-MM-dd format'),
    body('end_date')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('End date must be in yyyy-MM-dd format')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.start_date)) {
                throw new Error('End date must be after start date');
            }
            return true;
        })
];