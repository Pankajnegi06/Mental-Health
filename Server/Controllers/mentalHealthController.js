const Journal = require('../Models/JournalSchema');
const User = require('../Models/Schema');
const mongoose = require('mongoose');
const { generateInsights } = require('../Services/GroqService');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Helper function to analyze sentiment using a simple algorithm (can be replaced with a more sophisticated NLP service)
const analyzeSentiment = async (text) => {
  try {
    // In a production environment, you would call an NLP API here
    // This is a simplified version for demonstration
    const positiveWords = ['happy', 'joy', 'excited', 'great', 'good', 'well', 'awesome', 'amazing'];
    const negativeWords = ['sad', 'angry', 'upset', 'bad', 'terrible', 'awful', 'worst'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    const wordScores = {};
    
    words.forEach(word => {
      if (positiveWords.includes(word)) {
        score += 1;
        wordScores[word] = (wordScores[word] || 0) + 1;
      } else if (negativeWords.includes(word)) {
        score -= 1;
        wordScores[word] = (wordScores[word] || 0) - 1;
      }
    });
    
    // Normalize score to -1 to 1 range
    const normalizedScore = Math.max(-1, Math.min(1, score / 10));
    
    // Simple emotion detection
    const emotions = [];
    if (normalizedScore > 0.3) {
      emotions.push({ name: 'joy', score: normalizedScore });
    } else if (normalizedScore < -0.3) {
      emotions.push({ name: 'sadness', score: -normalizedScore });
    } else {
      emotions.push({ name: 'neutral', score: 1 });
    }
    
    // Extract keywords (top 5 most relevant words)
    const keywords = Object.entries(wordScores)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 5)
      .map(([text]) => ({
        text,
        relevance: Math.min(1, Math.abs(wordScores[text]) / 2 + 0.5) // Normalize to 0.5-1.0
      }));
    
    return {
      score: normalizedScore,
      magnitude: Math.abs(normalizedScore),
      emotions,
      keywords
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      score: 0,
      magnitude: 0,
      emotions: [{ name: 'neutral', score: 0.5 }],
      keywords: []
    };
  }
};

// Create or update a journal entry
const createOrUpdateJournalEntry = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated and user ID is in req.user
    const { date, content, moodEntries, sleep, activities, ...otherFields } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({
        status: 0,
        message: 'Journal content is required'
      });
    }
    
    // Analyze sentiment from journal content
    const sentiment = await analyzeSentiment(content);
    
    // Check if entry already exists for this date
    const entryDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(entryDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(entryDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    let journalEntry = await Journal.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Prepare journal data
    const journalData = {
      user: userId,
      date: entryDate,
      content,
      sentiment,
      moodEntries,
      sleep,
      activities,
      ...otherFields,
      updatedAt: new Date()
    };
    
    if (journalEntry) {
      // Update existing entry
      journalEntry = await Journal.findByIdAndUpdate(
        journalEntry._id,
        { $set: journalData },
        { new: true, runValidators: true }
      );
    } else {
      // Create new entry
      journalEntry = new Journal(journalData);
      await journalEntry.save();
    }
    
    // Update user's latest mood if mood entries exist
    if (moodEntries && moodEntries.length > 0) {
      const latestMood = moodEntries[moodEntries.length - 1];
      await User.findByIdAndUpdate(userId, {
        $set: {
          'mood.currentMood': latestMood.mood,
          'mood.lastUpdated': new Date()
        }
      });
    }
    
    res.status(201).json({
      status: 1,
      message: 'Journal entry saved successfully',
      data: journalEntry
    });
    
  } catch (error) {
    console.error('Error saving journal entry:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to save journal entry',
      error: error.message
    });
  }
};

// Get journal entries with filters
const getJournalEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, mood, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    
    const query = { user: userId };
    
    // Apply date filters
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    
    // Apply mood filter
    if (mood) {
      query['moodEntries.mood'] = mood;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination and sorting
    const [entries, total] = await Promise.all([
      Journal.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Journal.countDocuments(query)
    ]);
    
    // Calculate mood statistics
    const moodStats = await Journal.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $unwind: '$moodEntries' },
      { 
        $group: {
          _id: '$moodEntries.mood',
          count: { $sum: 1 },
          avgIntensity: { $avg: '$moodEntries.intensity' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Calculate mood trends over time
    const moodTrends = await Journal.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $unwind: '$moodEntries' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          avgMood: { $avg: '$moodEntries.intensity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: 30 } // Last 30 days
    ]);
    
    res.json({
      status: 1,
      data: {
        entries,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          moodDistribution: moodStats,
          moodTrends
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to fetch journal entries',
      error: error.message
    });
  }
};

// Get journal entry by ID
const getJournalEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const entry = await Journal.findOne({ _id: id, user: userId });
    
    if (!entry) {
      return res.status(404).json({
        status: 0,
        message: 'Journal entry not found'
      });
    }
    
    res.json({
      status: 1,
      data: entry
    });
    
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to fetch journal entry',
      error: error.message
    });
  }
};

// Delete journal entry
const deleteJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const entry = await Journal.findOneAndDelete({ _id: id, user: userId });
    
    if (!entry) {
      return res.status(404).json({
        status: 0,
        message: 'Journal entry not found or you do not have permission to delete it'
      });
    }
    
    res.json({
      status: 1,
      message: 'Journal entry deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to delete journal entry',
      error: error.message
    });
  }
};

// Get mood statistics
const getMoodStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));
    
    console.log('getMoodStatistics called');
    console.log('User ID:', userId);
    console.log('Date Threshold:', dateThreshold);

    const matchCount = await Journal.countDocuments({
        user: userId,
        date: { $gte: dateThreshold }
    });
    console.log('Matching documents count:', matchCount);
    
    const stats = await Journal.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: dateThreshold }
        } 
      },
      { $unwind: '$moodEntries' },
      {
        $group: {
          _id: {
            mood: '$moodEntries.mood',
            week: { $week: '$date' },
            year: { $year: '$date' }
          },
          count: { $sum: 1 },
          avgIntensity: { $avg: '$moodEntries.intensity' }
        }
      },
      {
        $group: {
          _id: '$_id.mood',
          weeklyData: {
            $push: {
              week: { $concat: [
                { $toString: '$_id.year' },
                '-W',
                { $cond: [
                  { $lt: ['$_id.week', 10] },
                  { $concat: ['0', { $toString: '$_id.week' }] },
                  { $toString: '$_id.week' }
                ]}
              ]},
              count: '$count',
              avgIntensity: { $round: ['$avgIntensity', 2] }
            }
          },
          totalCount: { $sum: '$count' },
          overallAvgIntensity: { $avg: '$avgIntensity' }
        }
      },
      {
        $project: {
          _id: 0,
          mood: '$_id',
          weeklyData: 1,
          totalCount: 1,
          overallAvgIntensity: { $round: ['$overallAvgIntensity', 2] }
        }
      },
      { $sort: { totalCount: -1 } }
    ]);
    
    // Calculate mood trends
    const moodTrends = await Journal.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: dateThreshold }
        } 
      },
      { $unwind: '$moodEntries' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d %H:%M', date: '$moodEntries.timestamp' }
          },
          avgMood: { $avg: '$moodEntries.intensity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Calculate mood correlations with activities
    const activityCorrelations = await Journal.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: dateThreshold },
          'activities.type': { $exists: true, $ne: [] }
        } 
      },
      { $unwind: '$activities' },
      {
        $group: {
          _id: '$activities.type',
          avgMoodAfter: { $avg: '$activities.moodAfter' },
          avgMoodBefore: { $avg: '$activities.moodBefore' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          activity: '$_id',
          moodChange: { $subtract: ['$avgMoodAfter', '$avgMoodBefore'] },
          count: 1,
          avgMoodAfter: 1
        }
      },
      { $sort: { moodChange: -1, avgMoodAfter: -1, count: -1 } }
    ]);
    
    res.json({
      status: 1,
      data: {
        moodStats: stats,
        moodTrends,
        activityCorrelations
      }
    });
    
  } catch (error) {
    console.error('Error fetching mood statistics:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to fetch mood statistics',
      error: error.message
    });
  }
};

// Add mood entry to a journal
const addMoodEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, mood, intensity, notes } = req.body;
    
    if (!mood || !intensity) {
      return res.status(400).json({
        status: 0,
        message: 'Mood and intensity are required'
      });
    }
    
    const entryDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(entryDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(entryDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log('addMoodEntry called');
    console.log('User ID:', userId);
    console.log('Entry Date:', entryDate);

    // Find or create journal entry for this date
    let journalEntry = await Journal.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    console.log('Existing journal entry found:', !!journalEntry);
    
    const moodEntry = {
      mood,
      intensity: parseInt(intensity),
      notes,
      timestamp: new Date()
    };
    
    if (journalEntry) {
      // Add mood entry to existing journal
      journalEntry.moodEntries.push(moodEntry);
      await journalEntry.save();
    } else {
      // Create new journal entry with this mood
      journalEntry = new Journal({
        user: userId,
        date: entryDate,
        content: notes || `Mood entry: ${mood}`,
        moodEntries: [moodEntry]
      });
      await journalEntry.save();
    }
    
    // Update user's latest mood
    await User.findByIdAndUpdate(userId, {
      $set: {
        'mood.currentMood': mood,
        'mood.lastUpdated': new Date()
      }
    });
    
    res.status(201).json({
      status: 1,
      message: 'Mood entry added successfully',
      data: moodEntry
    });
    
  } catch (error) {
    console.error('Error adding mood entry:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to add mood entry',
      error: error.message
    });
  }
};

// Get intelligent insights
const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch recent journals for analysis
    const journals = await Journal.find({ user: userId })
      .sort({ date: -1 })
      .limit(20) // Analyze last 20 entries
      .lean();

    // Calculate basic stats for context
    const stats = await Journal.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$moodEntries' },
      { 
        $group: {
          _id: null,
          avgMood: { $avg: '$moodEntries.intensity' },
          totalEntries: { $sum: 1 }
        }
      }
    ]);

    const userStats = stats[0] || { avgMood: 0, totalEntries: 0 };

    // Generate AI insights
    const insights = await generateInsights(journals, userStats);

    res.json({
      status: 1,
      data: {
        insights,
        stats: {
          totalEntries: userStats.totalEntries,
          avgMood: Math.round(userStats.avgMood * 10) / 10
        }
      }
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
};

// Get mood data by location for mood map analytics
const getMoodMapData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 90 } = req.query;
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));
    
    // Get journals with location data
    const journalsWithLocation = await Journal.find({
      user: userId,
      date: { $gte: dateThreshold },
      'location.coordinates': { $exists: true, $ne: [] },
      'moodEntries': { $exists: true, $ne: [] }
    }).select('location moodEntries date');
    
    // Process location and mood data
    const locationMoodData = journalsWithLocation.map(journal => {
      const avgMood = journal.moodEntries.length > 0
        ? journal.moodEntries.reduce((sum, entry) => sum + entry.intensity, 0) / journal.moodEntries.length
        : 5;
      
      const mostCommonMood = journal.moodEntries.length > 0
        ? journal.moodEntries.reduce((acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            return acc;
          }, {})
        : {};
      
      const dominantMood = Object.keys(mostCommonMood).length > 0
        ? Object.keys(mostCommonMood).reduce((a, b) => 
            mostCommonMood[a] > mostCommonMood[b] ? a : b, 'neutral'
          )
        : 'neutral';
      
      return {
        location: {
          coordinates: journal.location.coordinates,
          name: journal.location.name || 'Unknown Location'
        },
        mood: dominantMood,
        avgIntensity: avgMood,
        date: journal.date,
        entryCount: journal.moodEntries.length
      };
    });
    
    // Group by location (round coordinates to reduce precision for clustering)
    const locationGroups = {};
    locationMoodData.forEach(entry => {
      if (entry.location.coordinates && entry.location.coordinates.length >= 2) {
        // Round to 2 decimal places for clustering (approximately 1km precision)
        const lat = Math.round(entry.location.coordinates[1] * 100) / 100;
        const lng = Math.round(entry.location.coordinates[0] * 100) / 100;
        const key = `${lat},${lng}`;
        
        if (!locationGroups[key]) {
          locationGroups[key] = {
            coordinates: [lng, lat],
            name: entry.location.name,
            moods: [],
            avgIntensity: 0,
            entryCount: 0,
            dates: []
          };
        }
        
        locationGroups[key].moods.push(entry.mood);
        locationGroups[key].avgIntensity += entry.avgIntensity;
        locationGroups[key].entryCount += entry.entryCount;
        locationGroups[key].dates.push(entry.date);
      }
    });
    
    // Calculate averages and determine dominant mood for each location
    const processedLocations = Object.values(locationGroups).map(group => {
      const avgIntensity = group.moods.length > 0 ? group.avgIntensity / group.moods.length : 0;
      const moodCounts = group.moods.reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {});
      const dominantMood = Object.keys(moodCounts).length > 0
        ? Object.keys(moodCounts).reduce((a, b) => 
            moodCounts[a] > moodCounts[b] ? a : b, 'neutral'
          )
        : 'neutral';
      
      return {
        coordinates: group.coordinates,
        name: group.name || 'Unknown Location',
        dominantMood,
        avgIntensity: Math.round(avgIntensity * 10) / 10,
        entryCount: group.entryCount,
        firstSeen: new Date(Math.min(...group.dates.map(d => new Date(d)))),
        lastSeen: new Date(Math.max(...group.dates.map(d => new Date(d))))
      };
    });
    
    res.json({
      status: 1,
      data: {
        locations: processedLocations,
        totalLocations: processedLocations.length,
        totalEntries: locationMoodData.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching mood map data:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to fetch mood map data',
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  createOrUpdateJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  deleteJournalEntry,
  getMoodStatistics,
  addMoodEntry,
  getInsights,
  getMoodMapData
};
