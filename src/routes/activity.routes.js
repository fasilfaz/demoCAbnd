const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');

// Create a new activity record
router.post('/', activityController.createActivity);

// Get recent activities
router.get('/recent', activityController.getRecentActivities);

// Get activities for a specific entity
router.get('/:entityType/:entityId', activityController.getEntityActivities);

module.exports = router;