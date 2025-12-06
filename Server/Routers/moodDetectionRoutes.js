const express = require('express');
const moodDetectionRouter = express.Router();
const { analyzeMood, getMoodHistory, getCurrentMood } = require('../Controllers/MoodDetectionController');
const { isAuthenticated } = require('../Middleware/authMiddleware');

// All routes require authentication
moodDetectionRouter.use(isAuthenticated);

// POST /api/mood-detection/analyze - Analyze mood from image
moodDetectionRouter.post('/analyze', analyzeMood);

// GET /api/mood-detection/history - Get mood history
moodDetectionRouter.get('/history', getMoodHistory);

// GET /api/mood-detection/current - Get current (latest) mood
moodDetectionRouter.get('/current', getCurrentMood);

module.exports = moodDetectionRouter;
