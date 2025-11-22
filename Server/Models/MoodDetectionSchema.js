const mongoose = require('mongoose');

const MoodDetectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  detectedMood: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'anxious', 'angry', 'neutral', 'surprised', 'fearful', 'excited', 'tired', 'stressed'],
    index: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  secondaryEmotions: [{
    emotion: String,
    confidence: Number
  }],
  facialIndicators: {
    type: String,
    default: ''
  },
  aiRecommendations: {
    activities: [String],
    tips: [String],
    summary: String
  },
  context: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
MoodDetectionSchema.index({ userId: 1, timestamp: -1 });

// Method to get mood history for a user
MoodDetectionSchema.statics.getMoodHistory = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    userId,
    timestamp: { $gte: startDate }
  }).sort({ timestamp: -1 });
};

// Method to get latest mood for a user
MoodDetectionSchema.statics.getLatestMood = async function(userId) {
  return this.findOne({ userId }).sort({ timestamp: -1 });
};

module.exports = mongoose.model('MoodDetection', MoodDetectionSchema);
