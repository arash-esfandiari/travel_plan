const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams so we have access to tripId from parent route
const {
    getDailyPlans,
    createDailyPlan,
    updateDailyPlan,
    deleteDailyPlan
} = require('../controllers/dailyPlanController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

// Apply auth middleware to all daily plan routes
router.use(authMiddleware);

// Validation for daily plan inputs
const dailyPlanValidators = [
    body('plan_date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Plan date must be in yyyy-MM-dd format'),
    body('category').notEmpty().withMessage('Category is required'),
    body('title').notEmpty().withMessage('Title is required')
];

router.get('/', getDailyPlans);
router.post('/', dailyPlanValidators, validateRequest, createDailyPlan);
router.put('/:planId', dailyPlanValidators, validateRequest, updateDailyPlan);
router.delete('/:planId', deleteDailyPlan);

module.exports = router;