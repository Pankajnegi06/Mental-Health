const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  mood: {
    type: String,
    required: true,
    enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'anxious', 'angry', 'tired'],
  },
  intensity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const sleepEntrySchema = new mongoose.Schema({
  duration: { // in hours
    type: Number,
    min: 0,
    max: 24
  },
  quality: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: String,
  date: {
    type: Date,
    required: true
  }
});

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['exercise', 'meditation', 'social', 'work', 'hobby', 'other'],
    required: true
  },
  duration: Number, // in minutes
  description: String,
  moodBefore: Number,
  moodAfter: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  // Free-form journal entry
  content: {
    type: String,
    required: true
  },
  // AI-generated sentiment analysis
  sentiment: {
    score: { type: Number, min: -1, max: 1 }, // -1 (negative) to 1 (positive)
    magnitude: { type: Number, min: 0 }, // How strong the emotion is
    emotions: [{
      name: String, // e.g., 'joy', 'sadness', 'anger'
      score: { type: Number, min: 0, max: 1 }
    }],
    keywords: [{
      text: String,
      relevance: { type: Number, min: 0, max: 1 }
    }]
  },
  // Track multiple mood entries per day
  moodEntries: [moodEntrySchema],
  // Track sleep data
  sleep: sleepEntrySchema,
  // Track activities
  activities: [activitySchema],
  // Track physical symptoms
  symptoms: [{
    type: String,
    enum: ['headache', 'fatigue', 'nausea', 'dizziness', 'pain', 'other']
  }],
  // Track stress level (1-10)
  stressLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  // Track energy level (1-10)
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  // Track social interactions
  socialInteractions: [{
    type: String,
    enum: ['family', 'friends', 'colleagues', 'strangers', 'online']
  }],
  // Track self-care activities
  selfCare: [{
    type: String,
    enum: ['exercise', 'meditation', 'therapy', 'hobby', 'reading', 'other']
  }],
  // Track medication and supplements
  medications: [{
    name: String,
    dosage: String,
    taken: Boolean
  }],
  // Track gratitude (3 things)
  gratitude: [String],
  // Track goals for the day
  goals: [{
    description: String,
    completed: Boolean
  }],
  // Track water intake (in ml)
  waterIntake: {
    type: Number,
    min: 0
  },
  // Track exercise
  exercise: {
    type: {
      type: String,
      enum: ['cardio', 'strength', 'flexibility', 'balance', 'other']
    },
    duration: Number, // in minutes
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    notes: String
  },
  // Track meals
  meals: [{
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack']
    },
    description: String,
    moodBefore: Number,
    moodAfter: Number,
    timestamp: Date
  }],
  // Track location data
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number], // [longitude, latitude]
    name: String
  },
  // Track weather data
  weather: {
    temperature: Number, // in Celsius
    conditions: String, // e.g., 'sunny', 'rainy', 'cloudy'
    humidity: Number, // percentage
    pressure: Number // in hPa
  },
  // Track device data
  device: {
    type: String, // e.g., 'mobile', 'desktop', 'tablet'
    os: String, // e.g., 'iOS', 'Android', 'Windows', 'macOS'
    appVersion: String
  },
  // Track custom tags
  tags: [String]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
journalSchema.index({ user: 1, date: 1 });
journalSchema.index({ 'moodEntries.mood': 1 });
journalSchema.index({ 'activities.type': 1 });
journalSchema.index({ 'sentiment.score': 1 });

// Virtual for average mood of the day
journalSchema.virtual('averageMood').get(function() {
  if (!this.moodEntries || this.moodEntries.length === 0) return null;
  const sum = this.moodEntries.reduce((acc, entry) => acc + entry.intensity, 0);
  return sum / this.moodEntries.length;
});

// Pre-save hook to ensure only one journal entry per user per day
journalSchema.pre('save', async function(next) {
  if (this.isNew) {
    const startOfDay = new Date(this.date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(this.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingEntry = await this.constructor.findOne({
      user: this.user,
      date: { $gte: startOfDay, $lte: endOfDay },
      _id: { $ne: this._id }
    });
    
    if (existingEntry) {
      throw new Error('Only one journal entry allowed per day');
    }
  }
  next();
});

// Add text index for full-text search
journalSchema.index({
  content: 'text',
  'moodEntries.notes': 'text',
  'activities.description': 'text',
  gratitude: 'text',
  'goals.description': 'text',
  'meals.description': 'text',
  tags: 'text'
});

module.exports = mongoose.model('Journal', journalSchema);