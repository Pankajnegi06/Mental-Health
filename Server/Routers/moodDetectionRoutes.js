const express = require('express');
const router = express.Router();
const { analyzeMood, getMoodHistory, getCurrentMood } = require('../Controllers/MoodDetectionController');
const { isAuthenticated } = require('../Middleware/authMiddleware');

// All routes require authentication
router.use(isAuthenticated);

// POST /api/mood-detection/analyze - Analyze mood from image
router.post('/analyze', analyzeMood);

// GET /api/mood-detection/history - Get mood history
router.get('/history', getMoodHistory);

// GET /api/mood-detection/current - Get current (latest) mood
router.get('/current', getCurrentMood);

module.exports = router;
