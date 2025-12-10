const express = require('express');
const router = express.Router();
const mentalHealthController = require('../Controllers/mentalHealthController');
const { isAuthenticated } = require('../Middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Journal Entries
router.post('/journal', mentalHealthController.createOrUpdateJournalEntry);
router.get('/journal', mentalHealthController.getJournalEntries);
router.get('/journal/:id', mentalHealthController.getJournalEntryById);
router.delete('/journal/:id', mentalHealthController.deleteJournalEntry);

// Mood Tracking
router.post('/mood', mentalHealthController.addMoodEntry);
router.get('/mood/stats', mentalHealthController.getMoodStatistics);

// Insights and Analytics
router.get('/insights', mentalHealthController.getInsights);
router.get('/mood-map', mentalHealthController.getMoodMapData);

module.exports = router;
